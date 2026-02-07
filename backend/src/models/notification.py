from __future__ import annotations
from typing import TYPE_CHECKING, Optional, Literal
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Index

if TYPE_CHECKING:
    pass

NotificationType = Literal["due_soon", "overdue", "streak", "task_completed", "general"]


class NotificationBase(SQLModel):
    type: str = Field(max_length=32)
    title: str = Field(max_length=255)
    message: str = Field(max_length=1000)
    task_id: Optional[str] = Field(default=None, foreign_key="tasks.id", max_length=64)
    read: bool = Field(default=False)


class Notification(NotificationBase, table=True):  # type: ignore
    __tablename__ = "notifications"  # type: ignore
    __table_args__ = (
        Index("ix_notifications_user_created", "user_id", "created_at"),
        Index("ix_notifications_user_read", "user_id", "read", "created_at"),
    )
    id: str = Field(
        default_factory=lambda: str(__import__("uuid").uuid4()),
        primary_key=True,
        max_length=64,
    )
    user_id: str = Field(foreign_key="users.id", max_length=64, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), index=True
    )


class NotificationCreate(SQLModel):
    user_id: str
    type: str
    title: str
    message: str
    task_id: Optional[str] = None


class NotificationResponse(SQLModel):
    id: str
    type: str
    title: str
    message: str
    task_id: Optional[str]
    read: bool
    created_at: datetime


class NotificationListResponse(SQLModel):
    notifications: list[NotificationResponse]
    next_cursor: Optional[str]
    total_count: int
