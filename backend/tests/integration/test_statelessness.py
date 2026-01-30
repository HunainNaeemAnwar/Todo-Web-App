
import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.services.conversation_service import ConversationService
from sqlmodel import Session
from src.database.database import engine
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_conversation_resumption():
    """FR-015: System MUST support resuming conversations after server restart using persisted history."""
    client = TestClient(app)
    user_id = "test-user-123"

    # 1. Create a user, then a conversation and add a message
    from src.models.user import User
    import uuid
    email = f"test-{uuid.uuid4()}@example.com"
    with Session(engine) as session:
        user = User(id=user_id, email=email, name="Test User", hashed_password="pw")
        session.add(user)
        session.commit()

        service = ConversationService(session)
        conv = service.create_conversation(user_id)
        conv_id = conv.id
        service.add_message(conv_id, user_id, "user", "My name is Claude.")
        service.add_message(conv_id, user_id, "assistant", "Nice to meet you, Claude!")

    # 2. Simulate a new request with the same conversation_id
    # We mock the agent to see if it receives the history
    with patch("src.api.dependencies.get_current_user_id", return_value=user_id), \
         patch("src.api.chat_router.process_with_openai_agent", new_callable=AsyncMock) as mock_agent:
        mock_agent.return_value = ("I remember you, Claude!", [])

        response = client.post(
            "/api/chat/",
            json={
                "message": "What is my name?",
                "conversation_id": conv_id
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == conv_id

        # Verify that the history was passed to the agent
        # The history should contain the first 2 messages
        args, kwargs = mock_agent.call_args
        history = args[1]
        assert len(history) == 2
        assert history[0]["content"] == "My name is Claude."
        assert history[1]["content"] == "Nice to meet you, Claude!"
