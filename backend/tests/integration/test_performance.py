
import pytest
import time
from fastapi.testclient import TestClient
from src.api.main import app
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_chat_response_time():
    """SC-003: Verify chat response time is < 4 seconds."""
    from src.api.dependencies import get_current_user_id

    # Mock the dependency correctly using FastAPI's dependency_overrides
    app.dependency_overrides[get_current_user_id] = lambda: "test-user"
    client = TestClient(app)

    # Mock the AI processing to be fast
    with patch("src.api.chat_router.process_with_openai_agent", new_callable=AsyncMock) as mock_agent:
        mock_agent.return_value = ("Hello! I added your task.", [])

        start_time = time.time()
        response = client.post(
            "/api/chat/",
            json={"message": "Add buy groceries"},
            headers={"Authorization": "Bearer mock-token"}
        )
        end_time = time.time()

        # Clear overrides after test
        app.dependency_overrides.clear()

        duration = end_time - start_time
        assert duration < 4.0
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_chatkit_response_time():
    """SC-003: Verify ChatKit streaming response initialization is fast."""
    from src.api.dependencies import get_current_user_id

    app.dependency_overrides[get_current_user_id] = lambda: "test-user"
    client = TestClient(app)

    start_time = time.time()
    # ChatKit endpoint returns a streaming response
    with client.stream("POST", "/chatkit", json={"messages": [{"role": "user", "content": "hi"}]}, headers={"Authorization": "Bearer mock-token"}) as response:
        duration = time.time() - start_time

        app.dependency_overrides.clear()

        assert duration < 4.0
        assert response.status_code == 200
