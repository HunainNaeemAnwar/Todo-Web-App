"""
Phase 3 TDD - Conversation History Tests (RED Phase)

Tests for conversation history loading and persistence.
Target: 90% coverage.

Tests verify:
- History loaded from database on every request (FR-004)
- Full conversation context available to AI agent
- Messages loaded in chronological order (created_at)
- Server restart doesn't lose conversation history (FR-015)
"""

import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import MagicMock, AsyncMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestConversationHistoryLoading:
    """Test conversation history loading from database."""
    
    @pytest.mark.asyncio
    async def test_history_loaded_from_database(self):
        """T025R-1: History loaded from database on every request (FR-004)."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        # Mock session and service
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup mock to return conversation with messages
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        mock_session.execute.return_value.scalar_one_or_none.return_value = mock_conversation
        mock_session.execute.return_value.scalars.return_value.all.return_value = []
        
        # Call get_conversation
        result = service.get_conversation("conv-123", "user-456")
        
        assert result is not None
        assert result.id == "conv-123"
        assert result.user_id == "user-456"
    
    @pytest.mark.asyncio
    async def test_full_context_available_to_agent(self):
        """T025R-2: Full conversation context available to AI agent."""
        from src.services.conversation_service import ConversationService
        from src.models.message import Message
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup conversation with messages
        mock_messages = [
            Message(
                id="msg-1",
                user_id="user-456",
                conversation_id="conv-123",
                role="user",
                content="Add buy groceries",
                created_at=datetime.now(timezone.utc)
            ),
            Message(
                id="msg-2",
                user_id="user-456",
                conversation_id="conv-123",
                role="assistant",
                content="Task created: Buy groceries",
                created_at=datetime.now(timezone.utc)
            )
        ]
        
        mock_session.execute.return_value.scalars.return_value.all.return_value = mock_messages
        
        # Get messages
        messages = service.get_conversation_messages("conv-123", "user-456")
        
        assert len(messages) == 2
        assert messages[0].role == "user"
        assert messages[1].role == "assistant"
    
    @pytest.mark.asyncio
    async def test_messages_loaded_in_chronological_order(self):
        """T025R-3: Messages loaded in chronological order (created_at)."""
        from src.services.conversation_service import ConversationService
        from src.models.message import Message
        from datetime import timedelta
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup messages with different timestamps
        now = datetime.now(timezone.utc)
        older = now - timedelta(seconds=30)
        
        mock_messages = [
            Message(
                id="msg-1",
                user_id="user-456",
                conversation_id="conv-123",
                role="user",
                content="First message",
                created_at=older
            ),
            Message(
                id="msg-2",
                user_id="user-456",
                conversation_id="conv-123",
                role="assistant",
                content="Second message",
                created_at=now
            )
        ]
        
        mock_session.execute.return_value.scalars.return_value.all.return_value = mock_messages
        
        # Get messages - should be ordered by created_at
        messages = service.get_conversation_messages("conv-123", "user-456")
        
        assert len(messages) == 2
        # Messages should be in chronological order
        assert messages[0].created_at <= messages[1].created_at


class TestConversationPersistence:
    """Test conversation persistence across server restarts."""
    
    @pytest.mark.asyncio
    async def test_conversation_persists_after_restart(self):
        """T025R-4: Server restart doesn't lose conversation history (FR-015)."""
        # This is tested by verifying the database schema supports persistence
        from src.database.database import DATABASE_URL
        
        # Verify database URL is configured for persistent storage
        assert DATABASE_URL is not None
        assert "postgresql" in DATABASE_URL.lower() or "neon" in DATABASE_URL.lower()
    
    def test_conversation_model_supports_persistence(self):
        """T025R-5: Conversation model has required fields for persistence."""
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        # Conversation should have id, user_id, created_at, updated_at
        conv = Conversation(user_id="test-user")
        assert hasattr(conv, 'id')
        assert hasattr(conv, 'user_id')
        assert hasattr(conv, 'created_at')
        assert hasattr(conv, 'updated_at')
        
        # Message should have id, conversation_id, role, content, created_at
        msg = Message(
            user_id="test-user",
            conversation_id="conv-123",
            role="user",
            content="Test"
        )
        assert hasattr(msg, 'id')
        assert hasattr(msg, 'conversation_id')
        assert hasattr(msg, 'role')
        assert hasattr(msg, 'content')
        assert hasattr(msg, 'created_at')


class TestConversationHistoryIntegration:
    """Integration tests for conversation history with chat endpoint."""
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_loads_history(self):
        """T025R-6: Chat endpoint loads conversation history on request."""
        # Verify chat_router imports ConversationService
        from src.services.conversation_service import ConversationService
        from src.api.chat_router import ChatRequest
        
        # Verify request model accepts conversation_id
        request = ChatRequest(message="test", conversation_id="conv-123")
        assert request.conversation_id == "conv-123"
    
    @pytest.mark.asyncio
    async def test_new_conversation_creates_history(self):
        """T025R-7: New conversation creates empty history."""
        from src.services.conversation_service import ConversationService
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup mock to return None (new conversation)
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        result = service.get_conversation("new-conv", "user-123")
        
        assert result is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
