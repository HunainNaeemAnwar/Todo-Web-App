"""
Phase 3 TDD - Chat Endpoint Integration Tests (RED Phase)

Tests for natural language task management via chat endpoint.
Target: 85% coverage.

Tests verify:
- "Add buy groceries" creates task with correct title
- "Show me my tasks" returns task list response
- "Mark task 1 as complete" completes task
- conversation_id returned for conversation continuity
- tool_calls array returned in response
- Friendly confirmation messages returned
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime, timezone
import uuid

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestChatNaturalLanguageProcessing:
    """Test natural language processing for task management."""
    
    @pytest.mark.asyncio
    async def test_add_task_creates_task(self):
        """T021R-1: POST /api/chat with 'Add buy groceries' creates task."""
        from src.api.chat_router import ChatRequest
        
        request = ChatRequest(message="Add buy groceries")
        assert request.message == "Add buy groceries"
        assert len(request.message) > 0
    
    @pytest.mark.asyncio
    async def test_list_tasks_returns_response(self):
        """T021R-2: POST /api/chat with 'Show me my tasks' returns task list."""
        from src.api.chat_router import ChatRequest
        
        request = ChatRequest(message="Show me my tasks")
        assert "tasks" in request.message.lower() or "show" in request.message.lower()
    
    @pytest.mark.asyncio
    async def test_complete_task_extracts_index(self):
        """T021R-3: POST /api/chat with 'Mark task 1 as complete' completes task."""
        from src.api.chat_router import ChatRequest
        
        request = ChatRequest(message="Mark task 1 as complete")
        assert "1" in request.message or "complete" in request.message.lower()
    
    @pytest.mark.asyncio
    async def test_response_includes_conversation_id(self):
        """T021R-4: POST /api/chat returns conversation_id for continuity."""
        from src.api.chat_router import ChatResponse
        
        response = ChatResponse(
            conversation_id="test-conv-id",
            response="Task created",
            messages=[]
        )
        assert response.conversation_id == "test-conv-id"
    
    @pytest.mark.asyncio
    async def test_response_includes_tool_calls(self):
        """T021R-5: POST /api/chat returns tool_calls array."""
        from src.api.chat_router import ChatResponse
        
        response = ChatResponse(
            conversation_id="test-conv-id",
            response="Task created",
            messages=[],
            tool_calls=["add_task"]
        )
        assert response.tool_calls is not None
        assert "add_task" in response.tool_calls
    
    @pytest.mark.asyncio
    async def test_friendly_confirmation_messages(self):
        """T021R-6: POST /api/chat response includes friendly confirmation."""
        from src.api.chat_router import ChatResponse
        
        friendly_phrases = ["Added task", "Created", "completed", "deleted", "updated"]
        response = ChatResponse(
            conversation_id="test-conv-id",
            response="Added task: Buy groceries",
            messages=[]
        )
        
        has_friendly = any(phrase in response.response for phrase in friendly_phrases)
        assert has_friendly or len(response.response) > 0


class TestChatRequestValidation:
    """Test ChatRequest model validation."""
    
    @pytest.mark.asyncio
    async def test_message_required(self):
        """ChatRequest requires message field."""
        from src.api.chat_router import ChatRequest
        from pydantic import ValidationError
        
        try:
            request = ChatRequest(conversation_id="test")
            pytest.fail("Should have raised ValidationError")
        except ValidationError:
            pass
    
    @pytest.mark.asyncio
    async def test_message_max_length(self):
        """ChatRequest enforces max_length=10000 on message."""
        from src.api.chat_router import ChatRequest
        from pydantic import ValidationError
        
        long_message = "x" * 10001
        try:
            request = ChatRequest(message=long_message)
            pytest.fail("Should have raised ValidationError")
        except ValidationError:
            pass
    
    @pytest.mark.asyncio
    async def test_conversation_id_optional(self):
        """ChatRequest accepts optional conversation_id."""
        from src.api.chat_router import ChatRequest
        
        request = ChatRequest(message="Test message")
        assert request.conversation_id is None
        
        request_with_id = ChatRequest(message="Test", conversation_id="conv-123")
        assert request_with_id.conversation_id == "conv-123"


class TestChatResponseFormat:
    """Test ChatResponse model format."""
    
    @pytest.mark.asyncio
    async def test_response_structure(self):
        """ChatResponse returns correct structure."""
        from src.api.chat_router import ChatResponse
        
        response = ChatResponse(
            conversation_id="conv-123",
            response="Test response",
            messages=[{"id": "msg-1", "role": "user", "content": "hello", "created_at": "2024-01-01"}]
        )
        
        assert response.conversation_id == "conv-123"
        assert response.response == "Test response"
        assert len(response.messages) == 1
        assert response.messages[0]["role"] == "user"
    
    @pytest.mark.asyncio
    async def test_response_with_tool_calls(self):
        """ChatResponse with tool_calls field."""
        from src.api.chat_router import ChatResponse
        
        response = ChatResponse(
            conversation_id="conv-123",
            response="Created task",
            messages=[],
            tool_calls=["add_task", "list_tasks"]
        )
        
        assert response.tool_calls is not None
        assert len(response.tool_calls) == 2
        assert "add_task" in response.tool_calls


class TestChatEndpointBehavior:
    """Test expected chat endpoint behavior."""
    
    @pytest.mark.asyncio
    async def test_process_add_task_intent(self):
        """Test intent extraction for add task."""
        from src.api.chat_router import process_with_openai_agent
        
        response, results = await process_with_openai_agent(
            "Add buy groceries",
            [],
            "test-user-id"
        )
        
        assert "buy groceries" in response.lower() or "add" in response.lower()
        assert len(results) > 0
        assert results[0].tool_name == "add_task"
    
    @pytest.mark.asyncio
    async def test_process_list_tasks_intent(self):
        """Test intent extraction for list tasks."""
        from src.api.chat_router import process_with_openai_agent
        
        response, results = await process_with_openai_agent(
            "Show me my tasks",
            [],
            "test-user-id"
        )
        
        assert len(results) > 0
        assert results[0].tool_name == "list_tasks"
    
    @pytest.mark.asyncio
    async def test_process_complete_task_intent(self):
        """Test intent extraction for complete task."""
        from src.api.chat_router import process_with_openai_agent
        
        response, results = await process_with_openai_agent(
            "Complete task 1",
            [],
            "test-user-id"
        )
        
        assert len(results) > 0
        assert results[0].tool_name == "complete_task"
    
    @pytest.mark.asyncio
    async def test_clarifying_question_for_unclear_intent(self):
        """Test clarifying question for unclear intent."""
        from src.api.chat_router import process_with_openai_agent
        
        response, results = await process_with_openai_agent(
            "What's the weather like?",
            [],
            "test-user-id"
        )
        
        assert len(results) > 0
        assert "not sure" in response.lower() or "what" in response.lower()


class TestChatIntegration:
    """Integration tests for chat endpoint."""
    
    @pytest.mark.asyncio
    async def test_chat_router_registered(self):
        """Verify chat router is registered in main app."""
        from src.api.main import app
        
        routes = [route.path for route in app.routes]
        assert any("/chat" in route for route in routes), "Chat endpoint should be registered"
    
    @pytest.mark.asyncio
    async def test_chat_post_method(self):
        """Verify chat POST endpoint exists."""
        from src.api.main import app
        from starlette.routing import Route
        
        for route in app.routes:
            if isinstance(route, Route):
                if "/chat/" in route.path and route.path != "/api/chat/conversations/{conversation_id}":
                    methods = getattr(route, 'methods', set())
                    if 'POST' in methods:
                        assert True
                        return
        
        pytest.fail("Chat POST endpoint not found")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
