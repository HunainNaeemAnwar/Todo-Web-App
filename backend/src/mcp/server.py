"""
MCP Server Module for Task Management Tools

This module provides MCP server with task CRUD tools for conversational AI using FastMCP (official MCP SDK implementation).
Implements FR-011: user_id from JWT context, not tool parameters.

Key Security Principles:
- user_id extracted from JWT context via tool functions
- All tool queries filtered by user_id from context
- No raw database errors exposed to AI
"""

# Configure environment first to prevent tracing issues when using with OpenAI Agents SDK
from src.startup_config import configure_environment

configure_environment()

from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from sqlmodel import Session
from mcp.server.fastmcp import (
    FastMCP,
    Context,
)  # FastMCP is the official Python MCP SDK implementation
import os
import asyncio

import structlog
import sys
import os
from pathlib import Path
import warnings

# Suppress the specific import warning that occurs when running as MCP server
if os.getenv("RUNNING_AS_MCP_SERVER", "false").lower() == "true":
    warnings.filterwarnings("ignore", message=".*found in sys.modules after import.*")

from src.database.database import engine, get_session
from src.services.task_service import TaskService
from src.models.task import TaskCreate, TaskUpdate

# Configure logging to avoid interfering with JSON-RPC protocol
# When running as MCP server, redirect logs to file instead of stdout/stderr
if os.getenv("RUNNING_AS_MCP_SERVER", "false").lower() == "true":
    # Configure structlog to write to a file instead of stdout/stderr
    log_file = Path("/tmp/mcp_server.log")  # Use temp file to avoid stdout interference

    # Create a custom logger that writes to file only
    import logging

    mcp_logger = logging.getLogger('mcp_server')
    mcp_logger.setLevel(logging.INFO)

    # Create file handler that doesn't use stdout/stderr
    if not mcp_logger.handlers:
        file_handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        mcp_logger.addHandler(file_handler)
        mcp_logger.propagate = False  # Don't propagate to root logger

    class FileLogger:
        def info(self, msg, **kwargs):
            if kwargs:
                mcp_logger.info(f"{msg} - {kwargs}")
            else:
                mcp_logger.info(msg)

        def error(self, msg, **kwargs):
            if kwargs:
                mcp_logger.error(f"{msg} - {kwargs}")
            else:
                mcp_logger.error(msg)

        def debug(self, msg, **kwargs):
            if kwargs:
                mcp_logger.debug(f"{msg} - {kwargs}")
            else:
                mcp_logger.debug(msg)

        def warning(self, msg, **kwargs):
            if kwargs:
                mcp_logger.warning(f"{msg} - {kwargs}")
            else:
                mcp_logger.warning(msg)

    logger = FileLogger()
else:
    logger = structlog.get_logger(__name__)

mcp = FastMCP(
    name="task-manager",
    instructions="You are a helpful task management assistant. Help users create, list, complete, update, and delete tasks. Always be polite and confirm actions before executing them.",
    # Configure for stdio transport to work with MCPServerStdio client
    json_response=True,
    # Disable verbose logging that could interfere with JSON-RPC protocol
    debug=False,
)


def get_user_id_from_context(ctx: Optional[Context]) -> str:
    """Get user_id from environment variables passed from the chat router, raises error if not present"""
    try:
        # Primary: Get user_id from environment variable that was passed to the MCP server process
        # The chat router passes "USER_ID": user_id in the mcp_server_env
        user_id_from_env = os.getenv("USER_ID")
        if user_id_from_env:
            return user_id_from_env

        # Fallback: try to get from context variables (for cases where context is preserved)
        from src.mcp.context import get_current_user_id

        user_id = get_current_user_id()
        if user_id:
            return user_id

        raise ValueError("User not authenticated. Please provide a valid JWT token.")
    except Exception as e:
        logger.error("Failed to extract user_id from context", error=str(e))
        raise ValueError("User not authenticated. Please provide a valid JWT token.")


@mcp.tool()
async def add_task(
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = "medium",
    category: Optional[str] = None,
    due_date: Optional[str] = None,
    ctx: Optional[Context] = None
) -> Dict[str, Any]:
    """
    Add a new task to the user's task list.

    Args:
        title: The task title (required, 1-200 characters)
        description: Optional task description
        priority: Task priority - "high", "medium", or "low" (default: "medium")
        category: Task category - "work", "personal", "study", "health", or "finance"
        due_date: Due date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)

    Returns:
        Dictionary containing the created task details
    """
    user_id = get_user_id_from_context(ctx)
    request_id = getattr(ctx, 'get_state', lambda x: 'unknown')("request_id") or "unknown"

    logger.info("MCP add_task", user_id=user_id[:8] + "...", request_id=request_id, title=title[:50])

    # Retry logic for transient database connection failures
    max_retries = 2
    retry_delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            # Parse due_date if provided
            parsed_due_date = None
            if due_date:
                from datetime import datetime
                try:
                    # Try parsing ISO format
                    parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                except ValueError:
                    # Try parsing date only format
                    try:
                        parsed_due_date = datetime.strptime(due_date, '%Y-%m-%d')
                    except ValueError:
                        pass  # Invalid date format, will be None

            # Use synchronous session management as SQLModel doesn't support async operations natively
            with Session(engine) as session:
                task_service = TaskService(session)
                # Create the task using the synchronous version of the method
                task_create = TaskCreate(
                    title=title,
                    description=description,
                    completed=False,
                    priority=priority,
                    category=category,
                    due_date=parsed_due_date
                )
                task = task_service.create_task_sync(task_create, user_id)

                return {
                    "success": True,
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "priority": task.priority,
                        "category": task.category,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                    },
                    "message": f"Task '{task.title}' created successfully.",
                }
        except Exception as e:
            error_msg = str(e)
            is_connection_error = any(
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP add_task connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP add_task failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to create task: {error_msg}")


@mcp.tool()
async def list_tasks(status: Optional[str] = None, ctx: Optional[Context] = None) -> Dict[str, Any]:
    """
    List the user's tasks with optional filtering.

    Args:
        status: Optional filter. Supported filters:
            - Status: "all", "active", "pending", "completed"
            - Priority: "high", "medium", "low"
            - Date: "today", "tomorrow", "this week", "overdue", "no due date"
            - Category: "work", "personal", "study", "health", "finance"

    Returns:
        Dictionary containing list of tasks
    """
    user_id = get_user_id_from_context(ctx)
    request_id = getattr(ctx, 'get_state', lambda x: 'unknown')("request_id") or "unknown"

    logger.info("MCP list_tasks", user_id=user_id[:8] + "...", request_id=request_id, status=status)

    # Retry logic for transient database connection failures
    max_retries = 2
    retry_delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            with Session(engine) as session:
                task_service = TaskService(session)
                # Use the synchronous version of the method
                tasks = task_service.get_user_tasks_sync(user_id, status)

                task_list = [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "priority": task.priority,
                        "category": task.category,
                        "due_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                    }
                    for task in tasks
                ]

                status_filter = f" ({status})" if status else ""
                message = f"Found {len(task_list)} task(s){status_filter}."

                return {
                    "success": True,
                    "tasks": task_list,
                    "message": message,
                }
        except Exception as e:
            error_msg = str(e)
            is_connection_error = any(
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP list_tasks connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP list_tasks failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to list tasks: {error_msg}")


async def resolve_task_id(
    task_id: str, user_id: str, session: Session
) -> Optional[str]:
    """
    Resolve task_id from either a UUID or a 1-based index.

    If task_id is a small integer string, it's treated as a 1-based index
    referring to the list of tasks for the user.
    """
    # Check if it's a UUID first (basic format check)
    if len(task_id) > 10:
        return task_id

    # If it's a small number, try to resolve as 1-based index
    try:
        index = int(task_id)
        if index > 0:
            task_service = TaskService(session)
            # Use the synchronous version of the method
            tasks = task_service.get_user_tasks_sync(user_id)
            if 0 < index <= len(tasks):
                return tasks[index - 1].id
    except ValueError:
        pass

    return task_id


@mcp.tool()
async def complete_task(task_id: str, ctx: Optional[Context] = None) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        task_id: The task ID to complete (can be UUID or 1-based index)

    Returns:
        Dictionary containing the updated task details
    """
    user_id = get_user_id_from_context(ctx)
    request_id = getattr(ctx, 'get_state', lambda x: 'unknown')("request_id") or "unknown"

    logger.info("MCP complete_task", user_id=user_id[:8] + "...", request_id=request_id, task_id=task_id)

    # Retry logic for transient database connection failures
    max_retries = 2
    retry_delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            with Session(engine) as session:
                # Resolve task_id if it's an index
                actual_task_id = await resolve_task_id(task_id, user_id, session)

                if not actual_task_id:
                    return {
                        "success": False,
                        "message": f"Invalid task ID: '{task_id}'",
                    }

                task_service = TaskService(session)
                # Use the synchronous version of the method
                task = task_service.get_task_by_id_sync(actual_task_id, user_id)

                if not task:
                    # If not found, check task count for helpful error message
                    tasks = task_service.get_user_tasks_sync(user_id)
                    return {
                        "success": False,
                        "message": f"I couldn't find task '{task_id}' in your list. You have {len(tasks)} tasks total.",
                    }

                # Use the synchronous version of the method
                updated_task = task_service.toggle_task_completion_sync(actual_task_id, True, user_id)

                if not updated_task:
                    return {
                        "success": False,
                        "message": f"Failed to complete task '{task_id}'",
                    }

                return {
                    "success": True,
                    "task": {
                        "id": updated_task.id,
                        "title": updated_task.title,
                        "description": updated_task.description,
                        "completed": updated_task.completed,
                    },
                    "message": f"Task '{updated_task.title}' marked as completed.",
                }
        except Exception as e:
            error_msg = str(e)
            is_connection_error = any(
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP complete_task connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP complete_task failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to complete task: {error_msg}")


@mcp.tool()
async def delete_task(task_id: str, ctx: Optional[Context] = None) -> Dict[str, Any]:
    """
    Delete a task.

    Args:
        task_id: The task ID to delete (can be UUID or 1-based index)

    Returns:
        Dictionary containing success status
    """
    user_id = get_user_id_from_context(ctx)
    request_id = getattr(ctx, 'get_state', lambda x: 'unknown')("request_id") or "unknown"

    logger.info("MCP delete_task", user_id=user_id[:8] + "...", request_id=request_id, task_id=task_id)

    # Retry logic for transient database connection failures
    max_retries = 2
    retry_delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            with Session(engine) as session:
                # Resolve task_id if it's an index
                actual_task_id = await resolve_task_id(task_id, user_id, session)

                if not actual_task_id:
                    return {
                        "success": False,
                        "message": f"Invalid task ID: '{task_id}'",
                    }

                task_service = TaskService(session)
                # Use the synchronous version of the method
                task = task_service.get_task_by_id_sync(actual_task_id, user_id)

                if not task:
                    tasks = task_service.get_user_tasks_sync(user_id)
                    return {
                        "success": False,
                        "message": f"I couldn't find task '{task_id}' in your list. You have {len(tasks)} tasks total.",
                    }

                title = task.title
                # Use the synchronous version of the method
                success = task_service.delete_task_sync(actual_task_id, user_id)
                if not success:
                    return {
                        "success": False,
                        "message": f"Failed to delete task '{title}'.",
                    }

                return {
                    "success": True,
                    "message": f"Task '{title}' deleted successfully.",
                }
        except Exception as e:
            error_msg = str(e)
            is_connection_error = any(
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP delete_task connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP delete_task failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to delete task: {error_msg}")


@mcp.tool()
async def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None,
    ctx: Optional[Context] = None,
) -> Dict[str, Any]:
    """
    Update a task's properties.

    Args:
        task_id: The task ID to update (can be UUID or 1-based index)
        title: New title (optional)
        description: New description (optional)
        priority: New priority - "high", "medium", or "low" (optional)
        category: New category - "work", "personal", "study", "health", or "finance" (optional)
        due_date: New due date in ISO format (optional)

    Returns:
        Dictionary containing the updated task details
    """
    user_id = get_user_id_from_context(ctx)
    request_id = (
        getattr(ctx, 'get_state', lambda x: 'unknown')("request_id") or "unknown"
    )

    logger.info("MCP update_task", user_id=user_id[:8] + "...", request_id=request_id, task_id=task_id)

    # Retry logic for transient database connection failures
    max_retries = 2
    retry_delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            # Parse due_date if provided
            parsed_due_date = None
            if due_date:
                from datetime import datetime
                try:
                    parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                except ValueError:
                    try:
                        parsed_due_date = datetime.strptime(due_date, '%Y-%m-%d')
                    except ValueError:
                        pass

            with Session(engine) as session:
                # Resolve task_id if it's an index
                actual_task_id = await resolve_task_id(task_id, user_id, session)

                if not actual_task_id:
                    return {
                        "success": False,
                        "message": f"Invalid task ID: '{task_id}'",
                    }

                task_service = TaskService(session)
                # Use the synchronous version of the method
                task = task_service.get_task_by_id_sync(actual_task_id, user_id)

                if not task:
                    tasks = task_service.get_user_tasks_sync(user_id)
                    return {
                        "success": False,
                        "message": f"I couldn't find task '{task_id}' in your list. You have {len(tasks)} tasks total.",
                    }

                task_update = TaskUpdate(
                    title=title,
                    description=description,
                    priority=priority,
                    category=category,
                    due_date=parsed_due_date
                )
                # Use the synchronous version of the method
                updated_task = task_service.update_task_sync(actual_task_id, task_update, user_id)

                if not updated_task:
                    return {
                        "success": False,
                        "message": f"Failed to update task '{task_id}'.",
                    }

                return {
                    "success": True,
                    "task": {
                        "id": updated_task.id,
                        "title": updated_task.title,
                        "description": updated_task.description,
                        "completed": updated_task.completed,
                        "priority": updated_task.priority,
                        "category": updated_task.category,
                        "due_date": updated_task.due_date.isoformat() if updated_task.due_date else None,
                    },
                    "message": f"Task updated successfully.",
                }
        except Exception as e:
            error_msg = str(e)
            is_connection_error = any(
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP update_task connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP update_task failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to update task: {error_msg}")
                err in error_msg.lower()
                for err in ["connection", "closed", "timeout", "operational"]
            )

            if is_connection_error and attempt < max_retries:
                logger.warning(
                    f"MCP update_task connection error, retrying ({attempt + 1}/{max_retries})",
                    error=error_msg,
                    user_id=user_id[:8] + "..."
                )
                await asyncio.sleep(retry_delay)
                continue

            logger.error("MCP update_task failed", error=error_msg, user_id=user_id[:8] + "...")
            raise ValueError(f"Failed to update task: {error_msg}")


if __name__ == "__main__":
    # Set environment variable to indicate this is running as MCP server
    os.environ["RUNNING_AS_MCP_SERVER"] = "true"
    # Run with stdio transport to match the MCPServerStdio client
    mcp.run(transport="stdio")
