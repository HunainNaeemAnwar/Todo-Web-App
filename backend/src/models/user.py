from __future__ import annotations
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

if TYPE_CHECKING:
    pass


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(default="", max_length=255)
    is_active: bool = Field(default=True)


class User(UserBase, table=True):  # type: ignore
    __tablename__ = "users"  # type: ignore
    id: str = Field(
        default_factory=lambda: str(__import__("uuid").uuid4()),
        primary_key=True,
        max_length=64,
    )
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(UserBase):
    password: str


class UserUpdate(SQLModel):
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None


class UserResponse(SQLModel):
    id: str
    email: str
    name: str = ""
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
