"""
Phase 3 TDD - ConversationService Tests (GREEN Phase)

Tests for the ConversationService implementation.
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from typing import List

from src.models.conversation import Conversation
from src.models.message import Message
from src.services.conversation_service import ConversationService


class TestConversationService:
    """Test cases for ConversationService"""
    
    def test_create_conversation_returns_new_conversation(self):
        """Test: create_conversation() returns new conversation with user_id"""
        from sqlmodel import Session
        from unittest.mock import MagicMock
        
        mock_session = MagicMock(spec=Session)
        service = ConversationService(mock_session)
        user_id = str(uuid.uuid4())
        
        conversation = service.create_conversation(user_id)
        
        assert conversation.user_id == user_id
        assert conversation.id is not None
        assert conversation.created_at is not None
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()
    
    def test_get_conversation_returns_none_for_nonexistent(self):
        """Test: get_conversation() returns None for non-existent ID"""
        from sqlmodel import Session
        from sqlmodel import select
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        user_id = str(uuid.uuid4())
        nonexistent_id = str(uuid.uuid4())
        
        conversation = service.get_conversation(nonexistent_id, user_id)
        
        assert conversation is None
        mock_session.execute.assert_called_once()
    
    def test_get_conversation_returns_only_if_user_matches(self):
        """Test: get_conversation() returns conversation only if user_id matches"""
        from sqlmodel import Session
        from sqlmodel import select
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        user_id = str(uuid.uuid4())
        other_user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        
        conversation = service.get_conversation(conversation_id, other_user_id)
        
        assert conversation is None
    
    def test_get_conversation_messages_returns_ordered_by_created_at(self):
        """Test: get_conversation_messages() returns messages ordered by created_at"""
        from sqlmodel import Session
        from sqlmodel import select
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalars.return_value.all.return_value = []
        
        service = ConversationService(mock_session)
        user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        
        messages = service.get_conversation_messages(conversation_id, user_id)
        
        assert isinstance(messages, list)
        mock_session.execute.assert_called_once()
    
    def test_add_message_creates_message_with_role_and_content(self):
        """Test: add_message() creates message with correct role and content"""
        from sqlmodel import Session
        from sqlmodel import select
        
        mock_session = MagicMock(spec=Session)
        
        user_id = str(uuid.uuid4())
        mock_conversation = Conversation(
            id=str(uuid.uuid4()),
            user_id=user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_session.execute.return_value.scalar_one_or_none.return_value = mock_conversation
        
        service = ConversationService(mock_session)
        conversation_id = str(uuid.uuid4())
        content = "Add buy groceries"
        
        message = service.add_message(conversation_id, user_id, "user", content)
        
        assert message is not None
        assert message.conversation_id == conversation_id
        assert message.user_id == user_id
        assert message.role == "user"
        assert message.content == content
        mock_session.add.assert_called()
        mock_session.commit.assert_called()
    
    def test_add_message_returns_none_for_nonexistent_conversation(self):
        """Test: add_message() returns None if conversation doesn't exist"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = service.add_message(conversation_id, user_id, "user", "test")
        
        assert message is None
    
    def test_update_conversation_timestamp(self):
        """Test: update_conversation_timestamp() updates updated_at"""
        from sqlmodel import Session
        from datetime import timedelta
        
        mock_session = MagicMock(spec=Session)
        
        original_time = datetime.now(timezone.utc) - timedelta(seconds=10)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        mock_conversation = Conversation(
            id=conversation_id,
            user_id=user_id,
            created_at=original_time,
            updated_at=original_time
        )
        mock_session.execute.return_value.scalar_one_or_none.return_value = mock_conversation
        
        service = ConversationService(mock_session)
        
        result = service.update_conversation_timestamp(conversation_id, user_id)
        
        assert result is True
        assert mock_conversation.updated_at >= original_time
        mock_session.commit.assert_called_once()
    
    def test_update_conversation_timestamp_returns_false_for_nonexistent(self):
        """Test: update_conversation_timestamp() returns False if not found"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        result = service.update_conversation_timestamp(conversation_id, user_id)
        
        assert result is False


class TestConversationServiceIsolation:
    """Test cases for ConversationService user isolation"""
    
    def test_user_cannot_access_other_user_conversation(self):
        """Test: User cannot access another user's conversation"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        owner_id = str(uuid.uuid4())
        other_user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        
        conversation = service.get_conversation(conversation_id, other_user_id)
        
        assert conversation is None
    
    def test_user_cannot_add_message_to_other_conversation(self):
        """Test: User cannot add message to another user's conversation"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        owner_id = str(uuid.uuid4())
        other_user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        
        message = service.add_message(conversation_id, other_user_id, "user", "test")
        
        assert message is None
        mock_session.add.assert_not_called()
    
    def test_conversation_exists_returns_true_for_owner(self):
        """Test: conversation_exists() returns True for conversation owner"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        mock_conversation = Conversation(
            id=conversation_id,
            user_id=user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_session.execute.return_value.scalar_one_or_none.return_value = mock_conversation
        
        service = ConversationService(mock_session)
        
        result = service.conversation_exists(conversation_id, user_id)
        
        assert result is True
    
    def test_conversation_exists_returns_false_for_non_owner(self):
        """Test: conversation_exists() returns False for non-owner"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        result = service.conversation_exists(conversation_id, user_id)
        
        assert result is False


class TestConversationServiceIntegration:
    """Integration tests for ConversationService with real session"""
    
    def test_create_and_get_conversation(self):
        """Test: Create a conversation and retrieve it"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user_id = str(uuid.uuid4())
            
            created = service.create_conversation(user_id)
            assert created.id is not None
            assert created.user_id == user_id
            
            retrieved = service.get_conversation(created.id, user_id)
            assert retrieved is not None
            assert retrieved.id == created.id
    
    def test_add_and_get_messages(self):
        """Test: Add messages and retrieve them in order"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user_id = str(uuid.uuid4())
            
            conversation = service.create_conversation(user_id)
            
            msg1 = service.add_message(conversation.id, user_id, "user", "First message")
            msg2 = service.add_message(conversation.id, user_id, "assistant", "Second message")
            msg3 = service.add_message(conversation.id, user_id, "user", "Third message")
            
            messages = service.get_conversation_messages(conversation.id, user_id)
            
            assert len(messages) == 3
            assert messages[0].id == msg1.id
            assert messages[1].id == msg2.id
            assert messages[2].id == msg3.id
    
    def test_user_isolation(self):
        """Test: User cannot access another user's conversations"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user1_id = str(uuid.uuid4())
            user2_id = str(uuid.uuid4())
            
            conversation = service.create_conversation(user1_id)
            
            retrieved_by_user1 = service.get_conversation(conversation.id, user1_id)
            assert retrieved_by_user1 is not None
            
            retrieved_by_user2 = service.get_conversation(conversation.id, user2_id)
            assert retrieved_by_user2 is None
    
    def test_get_user_conversations(self):
        """Test: get_user_conversations() returns user's conversations"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user_id = str(uuid.uuid4())
            
            conv1 = service.create_conversation(user_id)
            conv2 = service.create_conversation(user_id)
            conv3 = service.create_conversation(user_id)
            
            conversations = service.get_user_conversations(user_id)
            
            assert len(conversations) == 3
            ids = [c.id for c in conversations]
            assert conv1.id in ids
            assert conv2.id in ids
            assert conv3.id in ids
    
    def test_get_user_conversations_with_limit_and_offset(self):
        """Test: get_user_conversations() respects limit and offset"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user_id = str(uuid.uuid4())
            
            for i in range(5):
                service.create_conversation(user_id)
            
            conversations = service.get_user_conversations(user_id, limit=2, offset=1)
            assert len(conversations) == 2
    
    def test_delete_conversation(self):
        """Test: delete_conversation() removes conversation and messages"""
        from sqlmodel import create_engine, Session
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        engine = create_engine("sqlite:///:memory:")
        Conversation.metadata.create_all(engine)
        Message.metadata.create_all(engine)
        
        with Session(engine) as session:
            service = ConversationService(session)
            user_id = str(uuid.uuid4())
            
            conversation = service.create_conversation(user_id)
            service.add_message(conversation.id, user_id, "user", "Test message")
            
            result = service.delete_conversation(conversation.id, user_id)
            assert result is True
            
            retrieved = service.get_conversation(conversation.id, user_id)
            assert retrieved is None
    
    def test_delete_conversation_returns_false_for_nonexistent(self):
        """Test: delete_conversation() returns False for non-existent conversation"""
        from sqlmodel import Session
        
        mock_session = MagicMock(spec=Session)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        service = ConversationService(mock_session)
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        result = service.delete_conversation(conversation_id, user_id)
        assert result is False


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
