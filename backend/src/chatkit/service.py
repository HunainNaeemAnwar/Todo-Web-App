"""ChatKit service layer for managing conversations and messages"""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, AsyncIterator
from sqlmodel import Session

import structlog
from agents import Agent, Runner, set_default_openai_client
from agents.models.openai_chatcompletions import OpenAIChatCompletionsModel
from openai import AsyncOpenAI
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.store import Store
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    Page,
    UserMessageItem,
    AssistantMessageItem,
    UserMessageTextContent,
    AssistantMessageContent,
    InferenceOptions,
)
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter

from src.services.conversation_service import ConversationService
from src.models.message import Message as DBMessage

logger = structlog.get_logger(__name__)


def create_model():
    """
    Factory function to create the AI model for ChatKit.

    Uses Gemini via OpenAI-compatible endpoint with chat completions API.
    Configure via environment variables:
    - GEMINI_API_KEY: Your Gemini API key
    - GEMINI_MODEL: Model name (default: gemini-2.5-flash)

    Returns:
        OpenAIChatCompletionsModel: Model instance configured for Gemini
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    if not gemini_api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable must be set. "
            "Get your API key from: https://aistudio.google.com/apikey"
        )

    # Create AsyncOpenAI client with Gemini endpoint
    client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    # Set as default client for all agents
    set_default_openai_client(client)

    # Create OpenAIChatCompletionsModel for compatibility with Gemini
    # This uses /chat/completions endpoint instead of /responses
    model = OpenAIChatCompletionsModel(model=gemini_model, openai_client=client)

    logger.info(
        "Model factory initialized",
        provider="gemini",
        model=gemini_model,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_type="chat_completions",
    )

    return model


class ConversationStore(Store[dict]):
    """Bridge between ChatKit Store and our DB-backed ConversationService"""

    def __init__(self, session: Session, user_id: str):
        self.service = ConversationService(session)
        self.user_id = user_id

    def generate_thread_id(self, context: dict) -> str:
        return str(uuid.uuid4())

    def generate_item_id(
        self, item_type: str, thread: ThreadMetadata, context: dict
    ) -> str:
        return str(uuid.uuid4())

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        conv = self.service.get_conversation(thread_id, self.user_id)
        if not conv:
            conv = self.service.create_conversation(self.user_id)
            # Ensure the ID matches what ChatKit expects
            conv.id = thread_id
            self.service.session.add(conv)
            self.service.session.commit()
            self.service.session.refresh(conv)

        return ThreadMetadata(id=conv.id, created_at=conv.created_at, metadata={})

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        # Our service handles creation; updates are usually timestamps
        self.service.update_conversation_timestamp(thread.id, self.user_id)

    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        db_messages = self.service.get_conversation_messages(thread_id, self.user_id)

        # Convert DB models to ChatKit ThreadItems
        items: list[
            ThreadItem
        ] = []  # Explicitly type as list[ThreadItem] for union types
        for msg in db_messages:
            # Use specific message types based on role with correct schema
            item: ThreadItem  # Declare union type variable
            if msg.role == "user":
                item = UserMessageItem(
                    id=msg.id,
                    thread_id=thread_id,
                    type="user_message",
                    content=[
                        UserMessageTextContent(type="input_text", text=msg.content)
                    ],
                    created_at=msg.created_at,
                    inference_options=InferenceOptions(),  # Required field
                )
            elif msg.role == "assistant":
                item = AssistantMessageItem(
                    id=msg.id,
                    thread_id=thread_id,
                    type="assistant_message",
                    content=[
                        AssistantMessageContent(type="output_text", text=msg.content)
                    ],
                    created_at=msg.created_at,
                )
            else:
                # Skip unknown roles
                continue

            items.append(item)

        # Basic pagination
        return Page(data=items, has_more=False)

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        # Check if it's a message we should persist
        if hasattr(item, "role") and hasattr(item, "content"):
            content_text = ""
            if isinstance(item.content, list):  # type: ignore
                content_text = "".join(
                    [c.text for c in item.content if hasattr(c, "text")]  # type: ignore
                )
            else:
                content_text = str(item.content)  # type: ignore

            self.service.add_message(thread_id, self.user_id, item.role, content_text)  # type: ignore

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        await self.add_thread_item(thread_id, item, context)

    async def load_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> ThreadItem:
        # Implementation for single item load if needed by SDK
        raise NotImplementedError()

    async def delete_thread_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> None:
        pass  # Optional cleanup

    async def load_threads(
        self,
        limit: int,
        after: Optional[str],
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        """Load multiple threads for a user with retry logic for connection failures"""
        import asyncio

        max_retries = 2
        retry_delay = 0.5

        for attempt in range(max_retries + 1):
            try:
                conversations = self.service.get_user_conversations(self.user_id)

                # Convert to ThreadMetadata
                threads = [
                    ThreadMetadata(id=conv.id, created_at=conv.created_at, metadata={})
                    for conv in conversations
                ]

                # Apply pagination if needed
                if after:
                    # Find index of 'after' thread and slice from there
                    after_idx = next(
                        (i for i, t in enumerate(threads) if t.id == after), -1
                    )
                    if after_idx != -1:
                        threads = threads[after_idx + 1 :]

                if limit and len(threads) > limit:
                    threads = threads[:limit]

                return Page(data=threads, has_more=False)

            except Exception as e:
                error_msg = str(e)
                is_connection_error = any(
                    err in error_msg.lower()
                    for err in ["connection", "closed", "timeout", "operational"]
                )

                if is_connection_error and attempt < max_retries:
                    logger.warning(
                        f"load_threads connection error, retrying ({attempt + 1}/{max_retries})",
                        error=error_msg,
                        user_id=self.user_id[:8] + "...",
                    )
                    await asyncio.sleep(retry_delay)
                    # Force connection pool to refresh
                    self.service.session.close()
                    continue

                logger.error(
                    "load_threads failed",
                    error=error_msg,
                    user_id=self.user_id[:8] + "...",
                )
                # Return empty page on error to prevent complete failure
                return Page(data=[], has_more=False)

        # Fallback return if loop completes without returning (shouldn't happen)
        return Page(data=[], has_more=False)

    async def delete_thread(self, thread_id: str, context: dict) -> None:
        """Delete a thread (conversation)"""
        # In our implementation, we might soft-delete or archive
        # For now, we'll just log since we don't have a delete method in ConversationService
        print(f"Delete thread {thread_id} requested")

    async def load_attachment(self, attachment_id: str, context: dict):
        """Load an attachment by ID"""
        from chatkit.types import FileAttachment

        # Return proper attachment type as expected by Store interface
        raise NotImplementedError("Attachments not supported in this implementation")

    async def save_attachment(self, attachment, context: dict) -> None:
        """Save an attachment"""
        raise NotImplementedError("Attachments not supported in this implementation")

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        """Delete an attachment"""
        raise NotImplementedError("Attachments not supported in this implementation")


class TaskChatKitServer(ChatKitServer[dict]):
    def __init__(self, data_store: Store, user_id: str):
        super().__init__(data_store)
        self.user_id = user_id

        # Use factory to create model
        self.model = create_model()

        # Setup MCP Server configuration for the agent
        from agents.mcp import MCPServerStdio
        from pathlib import Path

        # Dynamically determine the backend root directory
        current_file = Path(__file__).resolve()
        backend_root = str(current_file.parent.parent.parent)

        # Configure MCP server instance with per-user environment
        self.mcp_server = MCPServerStdio(
            {
                "command": "python3",
                "args": ["-m", "src.mcp.server"],
                "env": {
                    **os.environ,
                    "PYTHONPATH": backend_root,
                    "USER_ID": user_id,
                    "RUNNING_AS_MCP_SERVER": "true",  # Suppress stdout logging that breaks JSON-RPC
                },
            },
            client_session_timeout_seconds=60,  # Increased timeout for database operations with retries
        )

        # Setup Agent with MCP tools - using OpenAIChatCompletionsModel
        self.agent = Agent(
            name="Task Assistant",
            instructions=(
                "You are a helpful task management assistant. Use the available tools to help users manage their todo lists. "
                "Always respond in a friendly, conversational way. Confirm actions taken.\n\n"
                "## Task Creation Guidelines:\n"
                "When creating a task, ALWAYS provide a detailed, descriptive description even if the user only gives you a title. "
                "Your description should:\n"
                "- Expand on the task title with specific, actionable details\n"
                "- Provide context about what needs to be done and why\n"
                "- Include any relevant steps, considerations, or requirements\n"
                "- Be clear and comprehensive so anyone reading it understands the full scope\n"
                "- Use 2-4 sentences that add meaningful information beyond the title\n\n"
                "When creating tasks, also intelligently assign:\n"
                "- **Priority**: 'high' (urgent/important), 'medium' (normal), 'low' (optional/non-urgent)\n"
                "- **Category**: 'work', 'personal', 'study', 'health', or 'finance'\n"
                "- **Due Date**: If the user mentions a deadline or timeframe\n\n"
                "Examples:\n"
                "- 'Buy groceries' → Priority: medium, Category: personal, Description: 'Purchase weekly groceries including fresh vegetables, fruits, dairy products, and pantry staples. Check the refrigerator before shopping to avoid duplicates. Remember to bring reusable bags and check for any sales or coupons.'\n"
                "- 'Fix login bug' → Priority: high, Category: work, Description: 'Investigate and resolve the authentication issue where users are unable to log in with valid credentials. Review the JWT token validation logic, check database connection for user verification, and test with multiple user accounts to ensure the fix works consistently.'\n"
                "- 'Call dentist' → Priority: medium, Category: health, Description: 'Schedule a dental appointment for routine cleaning and checkup. Request an appointment in the next 2-3 weeks, preferably in the morning. Confirm insurance coverage and bring insurance card to the appointment.'\n\n"
                "## Task Filtering:\n"
                "Users can filter tasks using list_tasks with these filters:\n"
                "- **Status**: 'all', 'active', 'pending', 'completed'\n"
                "- **Priority**: 'high', 'medium', 'low'\n"
                "- **Date**: 'today', 'tomorrow', 'this week', 'overdue', 'no due date'\n"
                "- **Category**: 'work', 'personal', 'study', 'health', 'finance'\n\n"
                "When users ask to see specific types of tasks, use the appropriate filter:\n"
                "- 'Show my work tasks' → list_tasks(status='work')\n"
                "- 'What's due today?' → list_tasks(status='today')\n"
                "- 'Show high priority tasks' → list_tasks(status='high')\n"
                "- 'What's overdue?' → list_tasks(status='overdue')\n\n"
                "## Task Management:\n"
                "- If a user asks to mark a task as completed or delete a task, first use list_tasks to find the task ID (use the 1-based index if provided)\n"
                "- When listing tasks, present them in a clear, organized format\n"
                "- Confirm all actions taken and provide helpful feedback"
            ),
            model=self.model,
            mcp_servers=[self.mcp_server],
        )
        self.converter = ThreadItemConverter()

    async def respond(
        self, thread: ThreadMetadata, input: Any, context: dict
    ) -> AsyncIterator:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        try:
            page = await self.store.load_thread_items(
                thread.id, None, 100, "asc", context
            )
            all_items = list(page.data)
            if input:
                all_items.append(input)

            agent_input = await self.converter.to_agent_input(all_items)

            # Build history string for context-aware agent
            history_content = []
            for item in all_items[:-1]:  # Exclude current input
                # Type narrowing: only UserMessageItem and AssistantMessageItem have role
                if isinstance(item, (UserMessageItem, AssistantMessageItem)):
                    if hasattr(item, "content"):
                        if isinstance(item.content, list) and len(item.content) > 0:
                            content_text = (
                                item.content[0].text
                                if hasattr(item.content[0], "text")
                                else str(item.content[0])
                            )
                        else:
                            content_text = str(item.content)
                        # Access role safely after type narrowing
                        role = (
                            "user" if isinstance(item, UserMessageItem) else "assistant"
                        )
                        history_content.append(f"{role}: {content_text}")
                    else:
                        role = (
                            "user" if isinstance(item, UserMessageItem) else "assistant"
                        )
                        history_content.append(f"{role}: {str(item)}")
                # Skip other item types that don't have role attribute

            history_str = "\n".join(history_content)

            # Extract user context from metadata
            user_info = context.get("user_info", {})
            page_context = context.get("page_context", {})

            # Update agent instructions to include history and context
            updated_instructions = (
                (f"{history_str}\n\n" if history_str else "")
                + f"You are a helpful task management assistant for user {user_info.get('name', 'User')}.\n"
                + "Use the available tools to help users manage their todo lists. "
                + "Always respond in a friendly, conversational way. Confirm actions taken.\n\n"
                + "## Task Creation Guidelines:\n"
                + "When creating a task, ALWAYS provide a detailed, descriptive description even if the user only gives you a title. "
                + "Your description should:\n"
                + "- Expand on the task title with specific, actionable details\n"
                + "- Provide context about what needs to be done and why\n"
                + "- Include any relevant steps, considerations, or requirements\n"
                + "- Be clear and comprehensive so anyone reading it understands the full scope\n"
                + "- Use 2-4 sentences that add meaningful information beyond the title\n\n"
                + "When creating tasks, also intelligently assign:\n"
                + "- **Priority**: 'high' (urgent/important), 'medium' (normal), 'low' (optional/non-urgent)\n"
                + "- **Category**: 'work', 'personal', 'study', 'health', or 'finance'\n"
                + "- **Due Date**: If the user mentions a deadline or timeframe (use ISO format YYYY-MM-DD)\n\n"
                + "Examples:\n"
                + "- 'Buy groceries' → Priority: medium, Category: personal, Description: 'Purchase weekly groceries including fresh vegetables, fruits, dairy products, and pantry staples. Check the refrigerator before shopping to avoid duplicates. Remember to bring reusable bags and check for any sales or coupons.'\n"
                + "- 'Fix login bug' → Priority: high, Category: work, Description: 'Investigate and resolve the authentication issue where users are unable to log in with valid credentials. Review the JWT token validation logic, check database connection for user verification, and test with multiple user accounts to ensure the fix works consistently.'\n"
                + "- 'Call dentist' → Priority: medium, Category: health, Description: 'Schedule a dental appointment for routine cleaning and checkup. Request an appointment in the next 2-3 weeks, preferably in the morning. Confirm insurance coverage and bring insurance card to the appointment.'\n\n"
                + "## Task Filtering:\n"
                + "Users can filter tasks using list_tasks with these filters:\n"
                + "- **Status**: 'all', 'active', 'pending', 'completed'\n"
                + "- **Priority**: 'high', 'medium', 'low'\n"
                + "- **Date**: 'today', 'tomorrow', 'this week', 'overdue', 'no due date'\n"
                + "- **Category**: 'work', 'personal', 'study', 'health', 'finance'\n\n"
                + "When users ask to see specific types of tasks, use the appropriate filter:\n"
                + "- 'Show my work tasks' → list_tasks(status='work')\n"
                + "- 'What's due today?' → list_tasks(status='today')\n"
                + "- 'Show high priority tasks' → list_tasks(status='high')\n"
                + "- 'What's overdue?' → list_tasks(status='overdue')\n\n"
                + "## Task Management:\n"
                + "- If a user asks to mark a task as completed or delete a task, first use list_tasks to find the task ID (use the 1-based index if provided)\n"
                + "- When listing tasks, present them in a clear, organized format\n"
                + "- Confirm all actions taken and provide helpful feedback"
            )

            # Create contextual agent with updated instructions that include conversation history
            contextual_agent = Agent(
                name="Task Assistant",
                instructions=updated_instructions,
                model=self.model,  # Use model instance from factory
                mcp_servers=[self.mcp_server],
            )

            from agents.run import RunConfig

            # Run agent with MCP server active
            async with self.mcp_server:
                result = Runner.run_streamed(
                    contextual_agent,
                    agent_input,
                    run_config=RunConfig(
                        tracing_disabled=True  # Disable OpenAI tracing to avoid API key conflicts
                    ),
                )

                async for event in stream_agent_response(agent_context, result):
                    yield event

        except Exception as e:
            # Log the error and let ChatKit handle it
            error_message = str(e)
            logger.error(
                "Error in agent response", error=error_message, user_id=self.user_id
            )

            # Re-raise to let ChatKit's error handling deal with it
            raise
