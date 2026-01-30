
import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from unittest.mock import patch, MagicMock, AsyncMock

@pytest.mark.asyncio
async def test_unauthorized_chat():
    """T031R: Verify chat rejects requests without valid JWT."""
    client = TestClient(app)

    # No Authorization header
    response = client.post("/api/chat/", json={"message": "hello"})
    assert response.status_code == 401
    assert "Bearer token required" in response.json()["detail"]

@pytest.mark.asyncio
async def test_invalid_token_chat():
    """T031R: Verify chat rejects invalid tokens."""
    client = TestClient(app)

    # Invalid token format
    response = client.post(
        "/api/chat/",
        json={"message": "hello"},
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401
    assert "Invalid or expired token" in response.json()["detail"]

@pytest.mark.asyncio
async def test_task_not_found_friendly_error():
    """T030G: Verify MCP tool returns friendly message when task not found."""
    from src.mcp.server import complete_task
    from fastmcp.server.context import Context

    # Mock context with authenticated user
    mock_ctx = MagicMock(spec=Context)
    mock_ctx.get_state.side_effect = lambda key: "test-user" if key == "user_id" else "test-req"

    # Use a non-existent task ID
    # We need to mock the TaskService inside the tool call or the DB session
    with patch("src.mcp.server.Session") as mock_session_class:
        mock_session = mock_session_class.return_value.__enter__.return_value

        # Mock TaskService to return None
        with patch("src.mcp.server.TaskService") as mock_service_class:
            mock_service = mock_service_class.return_value
            mock_service.get_task_by_id = AsyncMock(return_value=None)
            mock_service.get_user_tasks = AsyncMock(return_value=[]) # 0 tasks total

            result = await complete_task.fn(task_id="999", ctx=mock_ctx)

            assert result["success"] is False
            assert "I couldn't find task '999' in your list" in result["message"]
            assert "You have 0 tasks total" in result["message"]
