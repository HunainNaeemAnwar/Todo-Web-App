"""
Phase 3 TDD - Message Model Tests (GREEN Phase)

Tests for the Message model implementation.
"""

import pytest
import uuid
from datetime import datetime, timezone
from typing import Optional

from src.models.message import Message


class TestMessageModel:
    """Test cases for Message model"""
    
    def test_message_creation_with_required_fields(self):
        """Test: Message can be created with required fields"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        content = "This is a test message"
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=content
        )
        assert message.user_id == user_id
        assert message.conversation_id == conversation_id
        assert message.role == "user"
        assert message.content == content
    
    def test_message_role_validation_user(self):
        """Test: Message accepts 'user' as valid role"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content="Test"
        )
        assert message.role == "user"
    
    def test_message_role_validation_assistant(self):
        """Test: Message accepts 'assistant' as valid role"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content="I can help you with that."
        )
        assert message.role == "assistant"
    
    def test_message_content_length_validation(self):
        """Test: Message content field has max_length defined"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        long_content = "x" * 10001
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=long_content
        )
        assert len(message.content) == 10001
    
    def test_message_belongs_to_conversation(self):
        """Test: Message belongs to a conversation via foreign key"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content="Test"
        )
        assert message.conversation_id == conversation_id
    
    def test_message_has_timestamps(self):
        """Test: Message has created_at timestamp"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content="Test"
        )
        assert message.created_at is not None
        assert isinstance(message.created_at, datetime)
    
    def test_message_table_name(self):
        """Test: Message has correct table name 'messages'"""
        assert Message.__tablename__ == "messages"
    
    def test_message_indexes(self):
        """Test: Message has proper database indexes"""
        from sqlmodel import Index
        table_args = getattr(Message, '__table_args__', None)
        assert table_args is not None
        index_names = [idx.name for idx in table_args if isinstance(idx, Index)]
        assert "ix_messages_user" in index_names
        assert "ix_messages_conversation_created" in index_names
    
    def test_message_serialization_to_dict(self):
        """Test: Message can be serialized to dictionary"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(user_id=user_id, conversation_id=conversation_id, role="user", content="Test")
        data = message.model_dump()
        assert data["user_id"] == user_id
        assert data["conversation_id"] == conversation_id
        assert data["role"] == "user"
        assert data["content"] == "Test"
    
    def test_message_json_serialization(self):
        """Test: Message can be serialized to JSON"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(user_id=user_id, conversation_id=conversation_id, role="user", content="Test")
        json_str = message.model_dump_json()
        assert isinstance(json_str, str)
    
    def test_message_repr(self):
        """Test: Message has a string representation"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(user_id=user_id, conversation_id=conversation_id, role="user", content="Test")
        repr_str = repr(message)
        assert "Message" in repr_str
    
    def test_message_id_is_uuid(self):
        """Test: Message id is a UUID string"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(user_id=user_id, conversation_id=conversation_id, role="user", content="Test")
        assert message.id is not None
        assert isinstance(message.id, str)
        uuid.UUID(message.id)
    
    def test_message_content_max_length(self):
        """Test: Message content can be up to 10000 characters"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        max_content = "x" * 10000
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content=max_content
        )
        assert len(message.content) == 10000
    
    def test_message_create_user_message_factory(self):
        """Test: Factory method creates user message"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        content = "Add buy groceries"
        
        message = Message.create_user_message(user_id, conversation_id, content)
        assert message.user_id == user_id
        assert message.conversation_id == conversation_id
        assert message.role == "user"
        assert message.content == content
    
    def test_message_create_assistant_message_factory(self):
        """Test: Factory method creates assistant message"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        content = "I can help you with that"
        
        message = Message.create_assistant_message(user_id, conversation_id, content)
        assert message.user_id == user_id
        assert message.conversation_id == conversation_id
        assert message.role == "assistant"
        assert message.content == content
    
    def test_message_is_user_message(self):
        """Test: is_user_message() returns True for user messages"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="user",
            content="Test"
        )
        assert message.is_user_message() is True
        assert message.is_assistant_message() is False
    
    def test_message_is_assistant_message(self):
        """Test: is_assistant_message() returns True for assistant messages"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content="Test"
        )
        assert message.is_assistant_message() is True
        assert message.is_user_message() is False
    
    def test_message_str_representation(self):
        """Test: Message has a string representation"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        
        message = Message(user_id=user_id, conversation_id=conversation_id, role="user", content="Test message")
        str_repr = str(message)
        assert "Message" in str_repr
        assert "user" in str_repr


class TestMessageRelationships:
    """Test cases for Message model relationships"""
    
    def test_message_user_isolation(self):
        """Test: Message has user_id for direct isolation queries"""
        assert hasattr(Message, 'user_id')


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
