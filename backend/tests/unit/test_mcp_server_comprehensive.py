
import pytest
from unittest.mock import Mock, patch, AsyncMock
import os
from datetime import datetime

from src.mcp.server import list_tasks, add_task, complete_task, delete_task, update_task
from src.mcp.context import get_current_user_id

@pytest.fixture
def mock_ctx():
    ctx = Mock()
    ctx.request_context = Mock()
    # Mock the request context to return a user_id
    # The actual implementation access ctx.request_context.lifespan_context["user_id"]
    # or similar depending on how Official MCP SDK sets it up, but our context.py helper
    # uses a contextvar.
    return ctx

class TestMCPServerComprehensive:

    def test_server_initialization(self):
        from src.mcp.server import mcp
        assert mcp.name == "task-manager"
        assert mcp.settings.stateless_http is True
        assert mcp.settings.json_response is True

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_list_tasks(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_session = Mock()
        mock_get_session.return_value = mock_session

        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_task = Mock()
        mock_task.id = "task-uuid"
        mock_task.title = "Test Task"
        mock_task.description = "Desc"
        mock_task.completed = False

        # Mock the async method get_user_tasks instead of sync
        mock_service_instance.get_user_tasks = AsyncMock(return_value=[mock_task])

        # Call the tool function directly via .fn
        # Official MCP SDK tools store the original function in .fn
        result = list_tasks.fn(ctx=mock_ctx)

        # Check if result is a coroutine and await it if needed
        import inspect
        if inspect.iscoroutine(result):
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(result)

        # Verify logic
        # Note: The implementation returns a dict with "tasks" key
        assert result["success"] is True
        assert len(result["tasks"]) == 1
        assert result["tasks"][0]["title"] == "Test Task"
        # Check specific field structure based on implementation
        assert result["tasks"][0]["id"] == "task-uuid"

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_add_task(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_task = Mock()
        mock_task.id = "new-uuid"
        mock_task.title = "New Task"
        mock_task.completed = False
        mock_task.created_at = datetime.now()

        # Mock async method
        mock_service_instance.create_task = AsyncMock(return_value=mock_task)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Call via .fn
        result = loop.run_until_complete(add_task.fn(title="New Task", description="Desc", ctx=mock_ctx))

        assert result["success"] is True
        assert result["task"]["title"] == "New Task"
        mock_service_instance.create_task.assert_called()

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_complete_task(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_task = Mock()
        mock_task.id = "task-uuid"
        mock_task.title = "Task To Complete"
        mock_task.completed = True

        mock_service_instance.get_user_tasks = AsyncMock(return_value=[mock_task])
        mock_service_instance.get_task_by_id = AsyncMock(return_value=mock_task)
        mock_service_instance.toggle_task_completion = AsyncMock(return_value=mock_task)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Call via .fn
        result = loop.run_until_complete(complete_task.fn(task_id="task 1", ctx=mock_ctx))

        assert result["success"] is True
        assert "marked as completed" in result["message"]

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_complete_task_invalid_index(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_service_instance.get_user_tasks = AsyncMock(return_value=[])
        mock_service_instance.get_task_by_id = AsyncMock(return_value=None)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Call via .fn
        result = loop.run_until_complete(complete_task.fn(task_id="task 1", ctx=mock_ctx))

        assert result["success"] is False
        assert "couldn't find task" in result["message"]

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_delete_task(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_task = Mock()
        mock_task.id = "task-uuid"
        mock_task.title = "Task To Delete"

        mock_service_instance.get_user_tasks = AsyncMock(return_value=[mock_task])
        mock_service_instance.get_task_by_id = AsyncMock(return_value=mock_task)
        mock_service_instance.delete_task = AsyncMock(return_value=True)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Call via .fn
        result = loop.run_until_complete(delete_task.fn(task_id="task 1", ctx=mock_ctx))

        assert result["success"] is True
        assert "deleted successfully" in result["message"]

    @patch("src.mcp.server.TaskService")
    @patch("src.mcp.server.get_session")
    @patch("src.mcp.server.get_user_id_from_context")
    def test_update_task(self, mock_get_user_id, mock_get_session, mock_task_service, mock_ctx):
        mock_get_user_id.return_value = "test-user-id"
        mock_service_instance = Mock()
        mock_task_service.return_value = mock_service_instance

        mock_task = Mock()
        mock_task.id = "task-uuid"
        mock_task.title = "Old Title"

        mock_updated_task = Mock()
        mock_updated_task.id = "task-uuid"
        mock_updated_task.title = "New Title"
        mock_updated_task.description = "Desc"
        mock_updated_task.completed = False

        mock_service_instance.get_user_tasks = AsyncMock(return_value=[mock_task])
        mock_service_instance.get_task_by_id = AsyncMock(return_value=mock_task)
        mock_service_instance.update_task = AsyncMock(return_value=mock_updated_task)

        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Call via .fn
        result = loop.run_until_complete(update_task.fn(task_id="task 1", title="New Title", ctx=mock_ctx))

        assert result["success"] is True
        assert "updated successfully" in result["message"]
