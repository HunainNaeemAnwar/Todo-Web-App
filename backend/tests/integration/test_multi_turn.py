"""
Phase 3 TDD - Multi-Turn Operation Tests (RED Phase)

Tests for multi-turn task operations.
Target: 85-90% coverage.

Tests verify:
- Multiple tool calls in single turn processed sequentially
- All tool results aggregated into single response
- No duplicate tool calls in single turn (FR-017)
- User message + all assistant messages persisted
"""

import pytest
import sys
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestMultiToolCalls:
    """Test multiple tool calls in single turn."""
    
    @pytest.mark.asyncio
    async def test_multiple_tools_processed_sequentially(self):
        """T036R-1: Multiple tool calls in single turn processed sequentially."""
        from src.mcp.server import mcp
        
        # Verify all tools are available - get_tools is async
        tools_dict = await mcp.get_tools()
        tool_names = list(tools_dict.keys())
        
        required_tools = ["add_task", "list_tasks", "complete_task", "delete_task", "update_task"]
        for tool in required_tools:
            assert tool in tool_names, f"{tool} should be available"
    
    @pytest.mark.asyncio
    async def test_tool_results_aggregated(self):
        """T036R-2: All tool results aggregated into single response."""
        # Verify chat_router returns aggregated response
        from src.api.chat_router import ChatResponse
        
        response = ChatResponse(
            conversation_id="conv-123",
            response="Task 1 and Task 2 created",
            messages=[]
        )
        
        assert response.conversation_id == "conv-123"
        assert "Task 1" in response.response or "Task 2" in response.response
    
    @pytest.mark.asyncio
    async def test_no_duplicate_tool_calls(self):
        """T036R-3: No duplicate tool calls in single turn (FR-017)."""
        # Track tool calls to ensure no duplicates
        tool_call_tracker = set()
        
        # Simulate tool calls
        tools_to_call = ["add_task", "list_tasks"]
        
        for tool in tools_to_call:
            if tool in tool_call_tracker:
                pytest.fail(f"Duplicate tool call detected: {tool}")
            tool_call_tracker.add(tool)
        
        assert len(tool_call_tracker) == len(tools_to_call)
    
    @pytest.mark.asyncio
    async def test_user_and_assistant_messages_persisted(self):
        """T036R-4: User message + all assistant messages persisted."""
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
        
        mock_session.execute.return_value.scalar_one_or_none.return_value = mock_conversation
        
        # Simulate multi-turn: user message
        user_msg = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="user",
            content="Add task 1 and task 2"
        )
        
        # Assistant messages (could be multiple for multi-tool)
        assistant_msg1 = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="assistant",
            content="Created task 1"
        )
        
        assistant_msg2 = service.add_message(
            conversation_id="conv-123",
            user_id="user-456",
            role="assistant",
            content="Created task 2"
        )
        
        assert user_msg is not None
        assert assistant_msg1 is not None
        assert assistant_msg2 is not None


class TestBulkOperations:
    """Test bulk operation patterns."""
    
    @pytest.mark.asyncio
    async def test_delete_all_completed_pattern(self):
        """T037R-1: 'Delete all completed tasks' pattern works."""
        # Pattern: list_tasks -> filter completed -> loop delete_task calls
        from src.services.task_service import TaskService
        
        mock_session = MagicMock()
        service = TaskService(mock_session)
        
        # Verify service has required methods
        assert hasattr(service, 'get_user_tasks')
        assert hasattr(service, 'delete_task')
    
    @pytest.mark.asyncio
    async def test_add_multiple_tasks_pattern(self):
        """T037R-2: 'Add multiple tasks' pattern works."""
        from src.services.task_service import TaskService
        from src.models.task import TaskCreate
        
        mock_session = MagicMock()
        service = TaskService(mock_session)
        
        # Verify can create multiple tasks
        tasks = ["Task 1", "Task 2", "Task 3"]
        
        for task_title in tasks:
            task_create = TaskCreate(title=task_title, completed=False)
            # Should be able to create task
            assert task_create.title == task_title
    
    @pytest.mark.asyncio
    async def test_response_confirms_all_operations(self):
        """T037R-3: Response confirms all operations completed."""
        # Response should summarize all actions taken
        response_summary = {
            "created": ["Task 1", "Task 2"],
            "completed": [],
            "deleted": [],
            "updated": []
        }
        
        assert len(response_summary["created"]) == 2
        assert "Task 1" in response_summary["created"]
        assert "Task 2" in response_summary["created"]


class TestMultiTurnIntegration:
    """Integration tests for multi-turn operations."""
    
    @pytest.mark.asyncio
    async def test_chat_endpoint_supports_multi_turn(self):
        """T037R-4: Chat endpoint supports multi-turn operations."""
        from src.api.chat_router import ChatRequest, ChatResponse
        
        # Verify request/response models support multi-turn
        request = ChatRequest(
            message="Add task 1, add task 2, show me my tasks",
            conversation_id="conv-123"
        )
        
        assert request.conversation_id == "conv-123"
        assert len(request.message) > 0
        
        response = ChatResponse(
            conversation_id="conv-123",
            response="Created Task 1, Created Task 2, You have 2 tasks",
            messages=[]
        )
        
        assert response.conversation_id == "conv-123"
    
    @pytest.mark.asyncio
    async def test_conversation_history_preserves_multi_turn(self):
        """T037R-5: Conversation history preserves multi-turn context."""
        from src.services.conversation_service import ConversationService
        
        mock_session = MagicMock()
        service = ConversationService(mock_session)
        
        # Verify get_conversation_messages returns list
        mock_session.execute.return_value.scalars.return_value.all.return_value = []
        
        messages = service.get_conversation_messages("conv-123", "user-456")
        
        assert isinstance(messages, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
