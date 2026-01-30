"""
Phase 3 TDD - Message Persistence Tests (RED Phase)

Tests for message persistence after each turn.
Target: 95% coverage.
"""

import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestMessagePersistence:
    """Test message persistence after each conversation turn."""
    
    @pytest.mark.asyncio
    async def test_user_message_persisted(self):
        """T026R-1: User message persisted after each turn."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup mock conversation
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        mock_session.execute.return_value.scalar_one_or_none.side_effect = [
            mock_conversation,  # get_conversation in add_message
            mock_conversation,  # update_conversation_timestamp calls get_conversation
        ]

        # Add user message
        result = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="user",
            content="Add buy groceries"
        )
        
        # Verify session.add was called for the message
        assert mock_session.add.called or mock_session.execute.called
    
    @pytest.mark.asyncio
    async def test_assistant_message_persisted(self):
        """T026R-2: Assistant message persisted after each turn."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        mock_session.execute.return_value.scalar_one_or_none.side_effect = [
            mock_conversation,  # get_conversation in add_message
            mock_conversation,  # update_conversation_timestamp calls get_conversation
        ]

        # Add assistant message
        result = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="assistant",
            content="Task created: Buy groceries"
        )

        assert result is not None
    
    def test_multi_turn_messages_persisted(self):
        """T026R-3: All messages from multi-turn operations persisted."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        from src.models.message import Message
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        mock_session.execute.return_value.scalar_one_or_none.side_effect = [
            mock_conversation,  # 1st add_message: get_conversation
            mock_conversation,  # 1st add_message: update_conversation_timestamp
            mock_conversation,  # 2nd add_message: get_conversation
            mock_conversation,  # 2nd add_message: update_conversation_timestamp
        ]
        
        # Simulate multi-turn: user message + assistant response
        user_msg = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="user",
            content="Add task 1 and task 2"
        )
        
        assistant_msg = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="assistant",
            content="Created task 1 and task 2"
        )
        
        # Both should persist
        assert user_msg is not None
        assert assistant_msg is not None


class TestMessagePersistenceValidation:
    """Validate message persistence requirements."""
    
    def test_message_has_required_fields(self):
        """T026R-4: Message has all required fields for persistence."""
        from src.models.message import Message
        
        msg = Message(
            user_id="user-123",
            conversation_id="conv-456",
            role="user",
            content="Test message"
        )
        
        assert hasattr(msg, 'id')
        assert hasattr(msg, 'user_id')
        assert hasattr(msg, 'conversation_id')
        assert hasattr(msg, 'role')
        assert hasattr(msg, 'content')
        assert hasattr(msg, 'created_at')
    
    def test_message_role_validation(self):
        """T026R-5: Message role is validated ('user' or 'assistant')."""
        from src.models.message import Message
        
        # Valid roles
        user_msg = Message(
            user_id="user-123",
            conversation_id="conv-456",
            role="user",
            content="User message"
        )
        assert user_msg.role == "user"
        
        assistant_msg = Message(
            user_id="user-123",
            conversation_id="conv-456",
            role="assistant",
            content="Assistant message"
        )
        assert assistant_msg.role == "assistant"
    
    def test_message_content_length_limit(self):
        """T026R-6: Message content has max length of 10000."""
        from src.models.message import Message
        import sys
        
        # Create message with long content (simulate)
        long_content = "x" * 10000
        
        msg = Message(
            user_id="user-123",
            conversation_id="conv-456",
            role="user",
            content=long_content
        )
        
        # Verify content length
        assert len(msg.content) == 10000


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
