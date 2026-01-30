from __future__ import annotations
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Index
from typing import List

if TYPE_CHECKING:
    pass

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):  # type: ignore
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_completed", "user_id", "completed"),
        Index("ix_tasks_user_created", "user_id", "created_at"),
    )
    id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()), primary_key=True, max_length=64)
    user_id: str = Field(foreign_key="users.id", max_length=64, index=True)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
