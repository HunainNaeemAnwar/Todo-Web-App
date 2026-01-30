
import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from datetime import datetime, timezone
import json
import uuid

from src.api.chatkit_router import router
from src.services.conversation_service import ConversationService
from src.models.conversation import Conversation
from src.models.message import Message

# Mock dependencies
def override_get_current_user_id():
    return "test-user-id"

def override_get_session():
    return Mock()

@pytest.fixture
def client():
    from src.api.main import app
    from src.api.dependencies import get_current_user_id
    from src.database.database import get_session

    # Use function objects as keys for dependency overrides
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    app.dependency_overrides[get_session] = override_get_session
    return TestClient(app)

@pytest.mark.asyncio
class TestChatKitRouterComprehensive:

    async def test_chatkit_health(self, client):
        """Test health check endpoint."""
        response = client.get("/chatkit/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "service": "chatkit"}

    async def test_chatkit_session(self, client):
        """Test session creation endpoint."""
        with patch.dict("os.environ", {"CHATKIT_DOMAIN_KEY": "test-key"}):
            # Add auth token
            response = client.post("/chatkit/session", headers={"Authorization": "Bearer valid_token"})
            assert response.status_code == 200
            data = response.json()
            assert data["domain_key"] == "test-key"
            assert "client_secret" in data
            assert data["expires_in"] == 3600

    async def test_process_chatkit_message_welcome(self):
        """Test welcome message when no messages provided."""
        from src.api.chatkit_router import process_chatkit_message

        mock_request = Mock()
        mock_request.body = AsyncMock(return_value=json.dumps({"messages": []}))

        gen = process_chatkit_message(mock_request, "test-user", Mock())
        events = []
        async for event in gen:
            events.append(event)

        assert len(events) == 1
        assert "Hello! I'm your AI task assistant" in events[0]

    async def test_process_chatkit_message_invalid_last_message(self):
        """Test error when last message is invalid."""
        from src.api.chatkit_router import process_chatkit_message

        mock_request = Mock()
        payload = {
            "messages": [{"role": "user", "content": None}]
        }
        mock_request.body = AsyncMock(return_value=json.dumps(payload))

        gen = process_chatkit_message(mock_request, "test-user", Mock())
        events = []
        async for event in gen:
            events.append(event)

        assert len(events) == 1
        assert "I didn't receive a valid message" in events[0]

    async def test_process_chatkit_message_success(self):
        """Test successful message processing."""
        from src.api.chatkit_router import process_chatkit_message

        # Setup mocks
        mock_session = Mock()
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation = Conversation(id="conv-id", user_id="test-user")
        mock_message = Message(id="msg-1", role="user", content="Hi", created_at=datetime.now(timezone.utc))

        mock_conversation_service.get_or_create_conversation.return_value = mock_conversation
        mock_conversation_service.get_conversation_messages.return_value = [mock_message]

        mock_request = Mock()
        payload = {
            "messages": [{"role": "user", "content": "Hi"}],
            "threadId": "conv-id"
        }
        mock_request.body = AsyncMock(return_value=json.dumps(payload))
        mock_request.headers.get.return_value = "Bearer token"

        # Mock OpenAI/Gemini/Agent stuff
        with patch("src.api.chatkit_router.ConversationService", return_value=mock_conversation_service):
            with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
                with patch("src.api.chatkit_router.AsyncOpenAI"):
                    with patch("src.api.chatkit_router.Runner") as mock_runner:
                        mock_result = Mock()
                        mock_result.final_output = "AI Response"
                        mock_runner.run = AsyncMock(return_value=mock_result)

                        gen = process_chatkit_message(mock_request, "test-user", mock_session)
                        events = []
                        async for event in gen:
                            events.append(event)

                        # Verify we get the AI response event and thread ID event
                        assert any("AI Response" in e for e in events)
                        assert any("conv-id" in e for e in events)

                        # Verify service calls
                        mock_conversation_service.add_message.assert_called()

    async def test_process_chatkit_message_no_api_key(self):
        """Test error when API key missing."""
        from src.api.chatkit_router import process_chatkit_message

        mock_request = Mock()
        payload = {"messages": [{"role": "user", "content": "Hi"}]}
        mock_request.body = AsyncMock(return_value=json.dumps(payload))
        mock_request.headers.get.return_value = "Bearer token"

        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation_service.get_or_create_conversation.return_value = Conversation(id="c1", user_id="u1")

        with patch("src.api.chatkit_router.ConversationService", return_value=mock_conversation_service):
            with patch.dict("os.environ", {}, clear=True): # Ensure no key
                gen = process_chatkit_message(mock_request, "test-user", Mock())
                events = []
                async for event in gen:
                    events.append(event)

                assert any("GEMINI_API_KEY environment variable not set" in e for e in events)

    async def test_process_chatkit_message_exception(self):
        """Test top-level exception handling."""
        from src.api.chatkit_router import process_chatkit_message

        mock_request = Mock()
        mock_request.body = AsyncMock(side_effect=Exception("Major Error"))

        gen = process_chatkit_message(mock_request, "test-user", Mock())
        events = []
        async for event in gen:
            events.append(event)

        assert any("I'm having trouble processing your request" in e for e in events)
