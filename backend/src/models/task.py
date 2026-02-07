from __future__ import annotations
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Index
from typing import Optional, Literal, TYPE_CHECKING

if TYPE_CHECKING:
    pass


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    priority: Optional[str] = Field(default="medium", max_length=20)
    category: Optional[str] = Field(default=None, max_length=20)
    due_date: Optional[datetime] = Field(default=None)


class Task(TaskBase, table=True):  # type: ignore[call-arg,assignment]
    __tablename__ = "tasks"  # type: ignore[assignment]
    __table_args__ = (
        Index("ix_tasks_user_completed", "user_id", "completed"),
        Index("ix_tasks_user_created", "user_id", "created_at"),
        Index("ix_tasks_user_priority", "user_id", "priority"),
        Index("ix_tasks_user_category", "user_id", "category"),
        Index("ix_tasks_user_due_date", "user_id", "due_date"),
    )
    id: str = Field(
        default_factory=lambda: str(__import__("uuid").uuid4()),
        primary_key=True,
        max_length=64,
    )
    user_id: str = Field(foreign_key="users.id", max_length=64, index=True)
    completed: bool = Field(default=False, index=True)
    completed_at: Optional[datetime] = Field(default=None, index=True)
    priority: Optional[str] = Field(default="medium", max_length=20, index=True)
    category: Optional[str] = Field(default=None, max_length=20, index=True)
    due_date: Optional[datetime] = Field(default=None, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue (has due date, not completed, past due date)."""
        if self.completed or self.due_date is None:
            return False
        return self.due_date < datetime.now(timezone.utc)


def is_task_overdue(task: Task) -> bool:
    """Utility function to check if a task is overdue."""
    if task.completed or task.due_date is None:
        return False
    return task.due_date < datetime.now(timezone.utc)
