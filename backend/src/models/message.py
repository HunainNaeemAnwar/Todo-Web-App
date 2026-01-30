from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Index
import uuid


class Message(SQLModel, table=True):  # type: ignore[call-arg]

    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_user", "user_id"),
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
    )

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=64,
        description="Unique message identifier (UUID)"
    )

    user_id: str = Field(
        max_length=64,
        index=True,
        description="Owner of the message (user isolation)"
    )

    conversation_id: str = Field(
        max_length=64,
        index=True,
        description="Parent conversation identifier"
    )

    role: str = Field(
        max_length=20,
        description="Message role: 'user' or 'assistant'"
    )

    content: str = Field(
        max_length=10000,
        description="Message content (max 10000 characters)"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Message creation timestamp"
    )

    def __repr__(self) -> str:
        return f"<Message(id={self.id[:8]}..., role={self.role})>"

    def __str__(self) -> str:
        content_preview = self.content[:20]
        return f"Message(id={self.id}, role={self.role}, content={content_preview}...)"

    def model_dump(self, **kwargs) -> dict:  # type: ignore[override]
        """Serialize to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def model_dump_json(self, **kwargs) -> str:  # type: ignore[override]
        """Serialize to JSON string"""
        import json
        return json.dumps(self.model_dump())

    @classmethod
    def create_user_message(
        cls,
        user_id: str,
        conversation_id: str,
        content: str
    ) -> "Message":
        """Factory method to create a user message"""
        return cls(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=content
        )

    @classmethod
    def create_assistant_message(
        cls,
        user_id: str,
        conversation_id: str,
        content: str
    ) -> "Message":
        """Factory method to create an assistant message"""
        return cls(
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content=content
        )

    def is_user_message(self) -> bool:
        """Check if this is a user message"""
        return self.role == "user"

    def is_assistant_message(self) -> bool:
        """Check if this is an assistant message"""
        return self.role == "assistant"
