from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Index
import uuid


class Conversation(SQLModel, table=True):  # type: ignore[call-arg]

    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_user_created", "user_id", "created_at"),
    )

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=64,
        description="Unique conversation identifier (UUID)"
    )

    user_id: str = Field(
        foreign_key="users.id",
        max_length=64,
        index=True,
        description="Owner of the conversation (user isolation)"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Conversation creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last activity timestamp"
    )

    def __repr__(self) -> str:
        return f"<Conversation(id={self.id[:8]}..., user_id={self.user_id[:8]}...)>"

    def __str__(self) -> str:
        return f"Conversation(id={self.id}, user_id={self.user_id})"

    def model_dump(self, **kwargs) -> dict:  # type: ignore[override]
        """Serialize to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def model_dump_json(self, **kwargs) -> str:  # type: ignore[override]
        """Serialize to JSON string"""
        import json
        return json.dumps(self.model_dump())

    @classmethod
    def create_for_user(cls, user_id: str) -> "Conversation":
        """Factory method to create a new conversation for a user"""
        return cls(user_id=user_id)

    def update_timestamp(self):
        """Update the updated_at timestamp to current time"""
        self.updated_at = datetime.now(timezone.utc)

    def get_message_count(self) -> int:
        """Get the number of messages in this conversation.

        Note: This returns 0 as models should not perform database queries.
        Use ConversationService.get_message_count() for actual count.
        """
        return 0
