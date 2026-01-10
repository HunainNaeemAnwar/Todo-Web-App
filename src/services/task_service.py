"""Task service for managing todo operations."""

import sys
from datetime import datetime
from typing import List

from models.task import Task


# Global tasks list as specified in FR-002 and DS-002
tasks: List[Task] = []
_next_id: int = 1


def add_task(title: str, description: str = "") -> Task:
    """Add a new task to the global tasks list."""
    global _next_id

    title = title.strip()
    if not title:
        raise ValueError("Task title is required")

    # Check for duplicate titles (case-insensitive, trimmed)
    title_normalized = title.lower()
    for task in tasks:
        if task.title.lower() == title_normalized:
            raise ValueError("A task with this title already exists")

    task = Task(
        id=_next_id,
        title=title,
        description=description.strip() if description else "",
        completed=False,
        created_at=datetime.now(),
    )
    tasks.append(task)
    _next_id += 1
    return task


def get_all_tasks() -> List[Task]:
    """Get all tasks from the global tasks list."""
    return tasks.copy()


def get_task_by_id(task_id: int) -> Task:
    """Find a task by its ID."""
    for task in tasks:
        if task.id == task_id:
            return task
    raise ValueError(f"Task with ID {task_id} not found")


def complete_task(task_id: int) -> Task:
    """Mark a task as completed."""
    task = get_task_by_id(task_id)
    task.completed = True
    return task


def update_task(task_id: int, title: str = None, description: str = None) -> Task:
    """Update a task's title and/or description."""
    task = get_task_by_id(task_id)

    if title is not None:
        title = title.strip()
        if not title:
            raise ValueError("Task title cannot be empty")

        # Check for duplicate titles (case-insensitive, trimmed)
        title_normalized = title.lower()
        for existing_task in tasks:
            if existing_task.id != task_id and existing_task.title.lower() == title_normalized:
                raise ValueError("A task with this title already exists")

        task.title = title

    if description is not None:
        task.description = description.strip()

    return task


def delete_task(task_id: int) -> Task:
    """Delete a task from the global tasks list."""
    task = get_task_by_id(task_id)
    tasks.remove(task)
    return task


def format_timestamp(created_at: datetime) -> str:
    """Format a timestamp in natural language."""
    now = datetime.now()
    delta = now - created_at
    total_seconds = int(delta.total_seconds())

    if total_seconds < 60:
        return "Just now"
    elif total_seconds < 3600:
        minutes = total_seconds // 60
        suffix = "s" if minutes != 1 else ""
        return f"{minutes} minute{suffix} ago"
    elif total_seconds < 86400:
        hours = total_seconds // 3600
        suffix = "s" if hours != 1 else ""
        return f"{hours} hour{suffix} ago"
    elif total_seconds < 604800:  # 7 days
        days = total_seconds // 86400
        suffix = "s" if days != 1 else ""
        return f"{days} day{suffix} ago"
    else:
        return created_at.strftime("%Y-%m-%d")
