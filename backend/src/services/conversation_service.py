from typing import List, Optional
from sqlmodel import Session, select, asc, desc
import structlog

from src.models.conversation import Conversation
from src.models.message import Message
from src.models.user import User  # Import User to register foreign key

logger = structlog.get_logger(__name__)


class ConversationService:
    def __init__(self, session: Session):
        self.session = session

    def create_conversation(self, user_id: str) -> Conversation:
        conversation = Conversation(user_id=user_id)
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    def get_or_create_conversation(
        self, conversation_id: Optional[str], user_id: str
    ) -> Conversation:
        """Get an existing conversation or create a new one"""
        if conversation_id:
            conversation = self.get_conversation(conversation_id, user_id)
            if conversation:
                return conversation

        return self.create_conversation(user_id)

    def get_conversation(
        self, conversation_id: str, user_id: str
    ) -> Optional[Conversation]:
        statement = select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
        result = self.session.execute(statement)
        return result.scalar_one_or_none()

    def get_conversation_messages(
        self, conversation_id: str, user_id: str
    ) -> List[Message]:
        statement = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id, Message.user_id == user_id
            )
            .order_by(asc(Message.created_at))  # Use asc function for proper type
        )
        result = self.session.execute(statement)
        return list(result.scalars().all())

    def add_message(
        self, conversation_id: str, user_id: str, role: str, content: str
    ) -> Optional[Message]:
        logger.info(
            "Adding message to database",
            conversation_id=conversation_id,
            user_id=user_id[:8] + "...",
            role=role,
            content_preview=content[:50],
        )
        conversation = self.get_conversation(conversation_id, user_id)
        if conversation is None:
            logger.warning(
                "Conversation not found, cannot add message",
                conversation_id=conversation_id,
            )
            return None

        message = Message(
            user_id=user_id, conversation_id=conversation_id, role=role, content=content
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)

        logger.info(
            "Message saved successfully",
            message_id=message.id[:8] + "...",
            conversation_id=conversation_id,
        )

        self.update_conversation_timestamp(conversation_id, user_id)

        return message

    def update_conversation_timestamp(self, conversation_id: str, user_id: str) -> bool:
        conversation = self.get_conversation(conversation_id, user_id)
        if conversation is None:
            return False

        conversation.update_timestamp()
        self.session.add(conversation)
        self.session.commit()
        return True

    def update_conversation_title(self, conversation_id: str, user_id: str, title: str) -> bool:
        conversation = self.get_conversation(conversation_id, user_id)
        if conversation is None:
            return False

        conversation.title = title
        self.session.add(conversation)
        self.session.commit()
        return True

    def conversation_exists(self, conversation_id: str, user_id: str) -> bool:
        return self.get_conversation(conversation_id, user_id) is not None

    def get_user_conversations(
        self, user_id: str, limit: int = 50, offset: int = 0
    ) -> List[Conversation]:
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
            .limit(limit)
            .offset(offset)
        )
        result = self.session.execute(statement)
        return list(result.scalars().all())

    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        conversation = self.get_conversation(conversation_id, user_id)
        if conversation is None:
            return False

        statement = select(Message).where(
            Message.conversation_id == conversation_id, Message.user_id == user_id
        )
        messages = self.session.execute(statement).scalars().all()
        for message in messages:
            self.session.delete(message)

        self.session.delete(conversation)
        self.session.commit()
        return True
