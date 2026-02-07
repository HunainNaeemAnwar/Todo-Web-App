from __future__ import annotations
from typing import TYPE_CHECKING, Optional
from sqlmodel import SQLModel, Field

if TYPE_CHECKING:
    pass


class NotificationPreferenceBase(SQLModel):
    notify_due_soon: bool = Field(default=True)
    notify_overdue: bool = Field(default=True)
    notify_streaks: bool = Field(default=True)


class NotificationPreference(NotificationPreferenceBase, table=True):  # type: ignore
    __tablename__ = "notification_preferences"  # type: ignore
    user_id: str = Field(primary_key=True, foreign_key="users.id", max_length=64)


class NotificationPreferenceResponse(SQLModel):
    notify_due_soon: bool
    notify_overdue: bool
    notify_streaks: bool


class NotificationPreferenceUpdate(SQLModel):
    notify_due_soon: Optional[bool] = None
    notify_overdue: Optional[bool] = None
    notify_streaks: Optional[bool] = None
