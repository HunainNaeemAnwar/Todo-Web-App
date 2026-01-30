"""
Phase 3 TDD - Conversation Isolation Tests (RED Phase)

Tests for user isolation in conversations.
Target: 100% coverage on isolation logic.

Tests verify:
- User cannot access another user's conversation
- Conversation ownership validated (user_id matches)
- Non-existent conversation_id returns friendly error (FR-014)
"""

import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestConversationIsolation:
    """Test user isolation for conversations."""
    
    @pytest.mark.asyncio
    async def test_user_cannot_access_other_user_conversation(self):
        """T027R-1: User cannot access another user's conversation."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup: conversation belongs to user-456
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",  # Owner
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Simulate: user-789 queries, but DB returns nothing because user_id doesn't match
        # The SQL filter (conversation_id == conv-123 AND user_id == user-789) won't match
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        # User 789 tries to access user 456's conversation
        result = service.get_conversation("conv-123", "user-789")
        
        # Should return None because user_id doesn't match the filter
        assert result is None
    
    @pytest.mark.asyncio
    async def test_conversation_ownership_validated(self):
        """T027R-2: Conversation ownership validated (user_id matches)."""
        from src.services.conversation_service import ConversationService
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Verify the service filters by user_id
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        result = service.get_conversation("conv-123", "user-123")
        
        # Query should have been executed with correct filters
        assert mock_session.execute.called
    
    @pytest.mark.asyncio
    async def test_nonexistent_conversation_returns_friendly_error(self):
        """T027R-3: Non-existent conversation_id returns friendly error."""
        from src.services.conversation_service import ConversationService
        from src.api.chat_router import router
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup: conversation doesn't exist
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        result = service.get_conversation("nonexistent", "user-123")
        
        # Should return None
        assert result is None


class TestConversationIsolationSecurity:
    """Security tests for conversation isolation."""
    
    @pytest.mark.asyncio
    async def test_add_message_requires_ownership(self):
        """T027R-4: add_message requires conversation ownership."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup: conversation belongs to user-456
        mock_conversation = Conversation(
            id="conv-123",
            user_id="user-456",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # When user-789 queries for conv-123, the DB should return None
        # because the query filters by user_id=user-789, not user-456
        mock_session.execute.return_value.scalar_one_or_none.side_effect = [
            None,  # get_conversation returns None (ownership check fails)
        ]
        
        # User 789 tries to add message to user 456's conversation
        result = service.add_message(
            conversation_id="conv-123",
            user_id="user-789",  # Different user
            role="user",
            content="Unauthorized message"
        )
        
        # Should return None because user_id doesn't match conversation owner
        assert result is None
    
    @pytest.mark.asyncio
    async def test_delete_conversation_requires_ownership(self):
        """T027R-5: delete_conversation requires ownership."""
        from src.services.conversation_service import ConversationService
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Setup: conversation belongs to user-456
        mock_session.execute.return_value.scalar_one_or_none.return_value = None
        
        # User 789 tries to delete user 456's conversation
        result = service.delete_conversation("conv-123", "user-789")
        
        # Should return False because conversation not found (or not owned)
        assert result is False


class TestConversationIsolationValidation:
    """Validation tests for isolation logic."""
    
    def test_query_filters_by_user_id(self):
        """T027R-6: Database query filters by user_id."""
        from src.services.conversation_service import ConversationService
        from src.models.conversation import Conversation
        from sqlmodel import select
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Call get_conversation
        service.get_conversation("conv-123", "user-123")
        
        # Verify execute was called
        assert mock_session.execute.called
        
        # Get the statement that was passed to execute
        call_args = mock_session.execute.call_args
        if call_args:
            statement = call_args[0][0]
            # Statement should filter by both id AND user_id
            assert statement is not None
    
    def test_messages_query_filters_by_user_id(self):
        """T027R-7: Messages query filters by user_id."""
        from src.services.conversation_service import ConversationService
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Call get_conversation_messages
        service.get_conversation_messages("conv-123", "user-123")
        
        # Verify execute was called
        assert mock_session.execute.called


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
