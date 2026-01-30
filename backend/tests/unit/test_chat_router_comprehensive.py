
import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi import status
from fastapi.testclient import TestClient
from datetime import datetime, timezone
import uuid

from src.api.chat_router import router, ChatRequest
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
    app.dependency_overrides["src.api.dependencies.get_current_user_id"] = override_get_current_user_id
    app.dependency_overrides["src.database.database.get_session"] = override_get_session
    return TestClient(app)

@pytest.mark.asyncio
class TestChatRouterComprehensive:

    async def test_send_chat_message_new_conversation(self):
        """Test sending a message that creates a new conversation."""
        # Setup mocks
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation = Conversation(
            id="new-conv-id",
            user_id="test-user-id",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        mock_user_message = Message(
            id="msg-1",
            conversation_id="new-conv-id",
            role="user",
            content="Hello",
            created_at=datetime.now(timezone.utc)
        )
        mock_assistant_message = Message(
            id="msg-2",
            conversation_id="new-conv-id",
            role="assistant",
            content="Hi there",
            created_at=datetime.now(timezone.utc)
        )

        mock_conversation_service.create_conversation.return_value = mock_conversation
        mock_conversation_service.add_message.side_effect = [mock_user_message, mock_assistant_message]
        mock_conversation_service.get_conversation_messages.return_value = [mock_user_message, mock_assistant_message]

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            with patch("src.api.chat_router.process_with_openai_agent", new_callable=AsyncMock) as mock_process:
                mock_process.return_value = ("Hi there", [])

                # Create request
                request_data = {"message": "Hello"}

                # We need to simulate the router function call directly since client usage is complex with mocks
                from src.api.chat_router import send_chat_message

                mock_request = Mock()
                mock_request.headers.get.return_value = "Bearer valid_token"

                response = await send_chat_message(
                    ChatRequest(**request_data),
                    mock_request,
                    "test-user-id",
                    Mock()
                )

                # Verify
                assert response.conversation_id == "new-conv-id"
                assert response.response == "Hi there"
                assert len(response.messages) == 2
                mock_conversation_service.create_conversation.assert_called_once()
                mock_process.assert_called_once()

    async def test_send_chat_message_existing_conversation(self):
        """Test sending a message to an existing conversation."""
        # Setup mocks
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation = Conversation(
            id="existing-conv-id",
            user_id="test-user-id"
        )
        mock_user_message = Message(
            id="msg-3", conversation_id="existing-conv-id", role="user", content="Next", created_at=datetime.now(timezone.utc)
        )
        mock_assistant_message = Message(
            id="msg-4", conversation_id="existing-conv-id", role="assistant", content="OK", created_at=datetime.now(timezone.utc)
        )

        mock_conversation_service.get_conversation.return_value = mock_conversation
        mock_conversation_service.add_message.side_effect = [mock_user_message, mock_assistant_message]
        mock_conversation_service.get_conversation_messages.return_value = [mock_user_message, mock_assistant_message]

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            with patch("src.api.chat_router.process_with_openai_agent", new_callable=AsyncMock) as mock_process:
                mock_process.return_value = ("OK", [])

                from src.api.chat_router import send_chat_message

                mock_request = Mock()
                mock_request.headers.get.return_value = "Bearer valid_token"

                response = await send_chat_message(
                    ChatRequest(message="Next", conversation_id="existing-conv-id"),
                    mock_request,
                    "test-user-id",
                    Mock()
                )

                assert response.conversation_id == "existing-conv-id"
                assert response.response == "OK"
                mock_conversation_service.get_conversation.assert_called_once()
                mock_conversation_service.create_conversation.assert_not_called()

    async def test_send_chat_message_conversation_not_found(self):
        """Test sending a message to a non-existent conversation."""
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation_service.get_conversation.return_value = None

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            from src.api.chat_router import send_chat_message
            from fastapi import HTTPException

            mock_request = Mock()
            # Properly mock the header string
            mock_request.headers.get.return_value = "Bearer valid_token"

            with pytest.raises(HTTPException) as exc:
                await send_chat_message(
                    ChatRequest(message="Hello", conversation_id="missing-id"),
                    mock_request,
                    "test-user-id",
                    Mock()
                )

            assert exc.value.status_code == 404
            assert exc.value.detail == "Conversation not found"

    async def test_send_chat_message_ai_error(self):
        """Test handling of AI processing errors."""
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation = Conversation(id="conv-id", user_id="test-user-id")

        mock_conversation_service.create_conversation.return_value = mock_conversation
        mock_conversation_service.add_message.return_value = Message(
            id="msg-1", role="user", content="Hi", created_at=datetime.now(timezone.utc)
        )
        mock_conversation_service.get_conversation_messages.return_value = []

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            with patch("src.api.chat_router.process_with_openai_agent", new_callable=AsyncMock) as mock_process:
                mock_process.side_effect = Exception("AI Error")

                from src.api.chat_router import send_chat_message

                mock_request = Mock()
                mock_request.headers.get.return_value = "Bearer valid_token"

                response = await send_chat_message(
                    ChatRequest(message="Hi"),
                    mock_request,
                    "test-user-id",
                    Mock()
                )

                assert "trouble processing" in response.response
                assert response.tool_calls is None

    async def test_get_conversations(self):
        """Test listing conversations."""
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conv1 = Conversation(
            id="c1", user_id="test-user-id",
            created_at=datetime(2023, 1, 1, tzinfo=timezone.utc),
            updated_at=datetime(2023, 1, 1, tzinfo=timezone.utc)
        )
        mock_conv2 = Conversation(
            id="c2", user_id="test-user-id",
            created_at=datetime(2023, 1, 2, tzinfo=timezone.utc),
            updated_at=datetime(2023, 1, 2, tzinfo=timezone.utc)
        )
        mock_conversation_service.get_user_conversations.return_value = [mock_conv1, mock_conv2]

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            from src.api.chat_router import get_conversations

            response = await get_conversations("test-user-id", Mock())

            assert len(response) == 2
            assert response[0].id == "c1"
            assert response[1].id == "c2"

    async def test_get_conversation_messages(self):
        """Test getting messages for a conversation."""
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation = Conversation(id="c1", user_id="test-user-id")
        mock_msg = Message(
            id="m1", conversation_id="c1", role="user", content="Hi",
            created_at=datetime(2023, 1, 1, tzinfo=timezone.utc)
        )

        mock_conversation_service.get_conversation.return_value = mock_conversation
        mock_conversation_service.get_conversation_messages.return_value = [mock_msg]

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            from src.api.chat_router import get_conversation_messages

            response = await get_conversation_messages("c1", "test-user-id", Mock())

            assert len(response["messages"]) == 1
            assert response["messages"][0]["content"] == "Hi"

    async def test_get_conversation_messages_not_found(self):
        """Test getting messages for a non-existent conversation."""
        mock_conversation_service = Mock(spec=ConversationService)
        mock_conversation_service.get_conversation.return_value = None

        with patch("src.api.chat_router.ConversationService", return_value=mock_conversation_service):
            from src.api.chat_router import get_conversation_messages
            from fastapi import HTTPException

            with pytest.raises(HTTPException) as exc:
                await get_conversation_messages("missing", "test-user-id", Mock())

            assert exc.value.status_code == 404
