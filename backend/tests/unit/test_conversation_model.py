"""
Phase 3 TDD - Conversation Model Tests (GREEN Phase)

Tests for the Conversation model implementation.
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

from src.models.conversation import Conversation


class TestConversationModel:
    """Test cases for Conversation model"""
    
    def test_conversation_creation_with_user_id(self):
        """Test: Conversation can be created with user_id"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        assert conversation.user_id == user_id
        assert conversation.id is not None
        assert isinstance(conversation.id, str)
    
    def test_conversation_timestamp_fields(self):
        """Test: Conversation has created_at and updated_at timestamps"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        assert conversation.created_at is not None
        assert conversation.updated_at is not None
        assert isinstance(conversation.created_at, datetime)
        assert isinstance(conversation.updated_at, datetime)
    
    def test_conversation_serialization_to_dict(self):
        """Test: Conversation can be serialized to dictionary"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        data = conversation.model_dump()
        assert data["user_id"] == user_id
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_conversation_default_values(self):
        """Test: Conversation has correct default values"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        assert conversation.id is not None
        assert len(conversation.id) == 36
        assert conversation.created_at is not None
        assert conversation.updated_at is not None
    
    def test_conversation_table_name(self):
        """Test: Conversation has correct table name"""
        assert Conversation.__tablename__ == "conversations"
    
    def test_conversation_indexes(self):
        """Test: Conversation has proper database indexes"""
        from sqlmodel import Index
        table_args = getattr(Conversation, '__table_args__', None)
        assert table_args is not None
        index_names = [idx.name for idx in table_args if isinstance(idx, Index)]
        assert "ix_conversations_user_created" in index_names
    
    def test_conversation_repr(self):
        """Test: Conversation has a string representation"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        repr_str = repr(conversation)
        assert "Conversation" in repr_str
        assert conversation.id[:8] in repr_str
    
    def test_conversation_equality(self):
        """Test: Two conversations with same ID and all fields are equal"""
        conversation_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        conv1 = Conversation(id=conversation_id, user_id=user_id, created_at=now, updated_at=now)
        conv2 = Conversation(id=conversation_id, user_id=user_id, created_at=now, updated_at=now)
        assert conv1 == conv2
    
    def test_conversation_with_empty_user_id(self):
        """Test: Conversation can be created with empty user_id (validation happens at DB level)"""
        conv = Conversation(user_id="")
        assert conv.user_id == ""
    
    def test_conversation_json_serialization(self):
        """Test: Conversation can be serialized to JSON"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        json_str = conversation.model_dump_json()
        assert isinstance(json_str, str)
        assert user_id in json_str


class TestConversationRelationships:
    """Test cases for Conversation model relationships"""
    
    def test_conversation_belongs_to_user(self):
        """Test: Conversation belongs to a user via foreign key"""
        user_id = str(uuid.uuid4())
        
        conversation = Conversation(user_id=user_id)
        assert conversation.user_id == user_id
    
    def test_conversation_str_representation(self):
        """Test: Conversation has a string representation"""
        user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        conv = Conversation(id=conversation_id, user_id=user_id, created_at=now, updated_at=now)
        str_repr = str(conv)
        assert "Conversation" in str_repr
        assert conversation_id in str_repr
        assert user_id in str_repr
    
    def test_conversation_create_for_user_factory(self):
        """Test: Factory method creates conversation for user"""
        user_id = str(uuid.uuid4())
        
        conv = Conversation.create_for_user(user_id)
        assert conv.user_id == user_id
        assert conv.id is not None
    
    def test_conversation_update_timestamp(self):
        """Test: Update timestamp method updates the timestamp"""
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        conv = Conversation(user_id=user_id, created_at=now, updated_at=now)
        original_updated = conv.updated_at
        
        import time
        time.sleep(0.01)
        
        conv.update_timestamp()
        assert conv.updated_at > original_updated
    
    def test_conversation_get_message_count(self):
        """Test: get_message_count() returns number of messages"""
        user_id = str(uuid.uuid4())
        conversation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        conv = Conversation(id=conversation_id, user_id=user_id, created_at=now, updated_at=now)
        
        count = conv.get_message_count()
        assert isinstance(count, int)
        assert count >= 0


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
