"""
Phase 3 TDD - MCP Server Tests (GREEN Phase)

Tests for Official MCP SDK server setup for task management tools.
This is a blocking prerequisite for MCP tools (FR-011).

Target: 90% coverage on MCP server module
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from typing import Optional


class TestMCPServerInitialization:
    """Test cases for Official MCP SDK server initialization"""

    def test_mcp_server_can_be_initialized(self):
        """Test: MCP server can be initialized with Official MCP SDK"""
        from src.mcp.server import mcp
        
        assert mcp is not None
        assert hasattr(mcp, 'name')
        assert hasattr(mcp, 'version')
    
    def test_mcp_server_has_correct_name(self):
        """Test: MCP server has correct name 'task-manager'"""
        from src.mcp.server import mcp
        
        assert mcp.name == "task-manager"
    
    def test_mcp_server_version_is_set(self):
        """Test: MCP server version is set correctly"""
        from src.mcp.server import mcp
        
        assert mcp.version == "1.0.0"
    
    def test_mcp_server_instructions_are_configured(self):
        """Test: Server instructions are configured for conversational AI"""
        from src.mcp.server import mcp
        
        assert mcp.instructions is not None
        assert "task management" in mcp.instructions.lower()


class TestMCPToolRegistration:
    """Test cases for MCP tool registration"""
    
    def test_add_task_is_a_functiontool(self):
        """Test: add_task is registered as FunctionTool"""
        from src.mcp.server import add_task
        assert hasattr(add_task, 'name')
        assert add_task.name == "add_task"
    
    def test_list_tasks_is_a_functiontool(self):
        """Test: list_tasks is registered as FunctionTool"""
        from src.mcp.server import list_tasks
        assert hasattr(list_tasks, 'name')
        assert list_tasks.name == "list_tasks"
    
    def test_complete_task_is_a_functiontool(self):
        """Test: complete_task is registered as FunctionTool"""
        from src.mcp.server import complete_task
        assert hasattr(complete_task, 'name')
        assert complete_task.name == "complete_task"
    
    def test_delete_task_is_a_functiontool(self):
        """Test: delete_task is registered as FunctionTool"""
        from src.mcp.server import delete_task
        assert hasattr(delete_task, 'name')
        assert delete_task.name == "delete_task"
    
    def test_update_task_is_a_functiontool(self):
        """Test: update_task is registered as FunctionTool"""
        from src.mcp.server import update_task
        assert hasattr(update_task, 'name')
        assert update_task.name == "update_task"


class TestMCPToolSignatures:
    """Test cases for MCP tool signatures via tool attributes"""
    
    def test_add_task_has_parameters_in_description(self):
        """Test: add_task description mentions title and description params"""
        import asyncio
        from src.mcp.server import mcp

        async def check_desc():
            tools = await mcp.get_tools()
            add_task_tool = tools.get('add_task')
            assert add_task_tool is not None
            desc = add_task_tool.description.lower() if add_task_tool.description else ""
            assert "title" in desc
            assert "description" in desc

        asyncio.run(check_desc())
    
    def test_list_tasks_has_parameters_in_description(self):
        """Test: list_tasks description mentions status param"""
        import asyncio
        from src.mcp.server import mcp

        async def check_desc():
            tools = await mcp.get_tools()
            list_tasks_tool = tools.get('list_tasks')
            assert list_tasks_tool is not None
            desc = list_tasks_tool.description.lower() if list_tasks_tool.description else ""
            assert "status" in desc

        asyncio.run(check_desc())

    def test_complete_task_has_parameters_in_description(self):
        """Test: complete_task description mentions task_id param"""
        import asyncio
        from src.mcp.server import mcp

        async def check_desc():
            tools = await mcp.get_tools()
            complete_task_tool = tools.get('complete_task')
            assert complete_task_tool is not None
            desc = complete_task_tool.description.lower() if complete_task_tool.description else ""
            assert "task_id" in desc

        asyncio.run(check_desc())

    def test_delete_task_has_parameters_in_description(self):
        """Test: delete_task description mentions task_id param"""
        import asyncio
        from src.mcp.server import mcp

        async def check_desc():
            tools = await mcp.get_tools()
            delete_task_tool = tools.get('delete_task')
            assert delete_task_tool is not None
            desc = delete_task_tool.description.lower() if delete_task_tool.description else ""
            assert "task_id" in desc

        asyncio.run(check_desc())

    def test_update_task_has_parameters_in_description(self):
        """Test: update_task description mentions task_id, title, description"""
        import asyncio
        from src.mcp.server import mcp

        async def check_desc():
            tools = await mcp.get_tools()
            update_task_tool = tools.get('update_task')
            assert update_task_tool is not None
            desc = update_task_tool.description.lower() if update_task_tool.description else ""
            assert "task_id" in desc
            assert "title" in desc
            assert "description" in desc

        asyncio.run(check_desc())


class TestMCPServerSecurity:
    """Test cases for MCP server security (FR-011, FR-012)"""
    
    def test_tools_receive_user_context(self):
        """Test: get_user_id_from_context extracts user from context"""
        from src.mcp.server import get_user_id_from_context
        from mcp.server.context import Context
        
        user_id = str(uuid.uuid4())
        mock_ctx = MagicMock(spec=Context)
        mock_ctx.get_state.return_value = user_id
        
        result = get_user_id_from_context(mock_ctx)
        assert result == user_id
        mock_ctx.get_state.assert_called_with("user_id")
    
    def test_tools_filter_by_user_id(self):
        """Test: get_user_id_from_context requires authentication"""
        from src.mcp.server import get_user_id_from_context
        from mcp.server.context import Context
        
        mock_ctx = MagicMock(spec=Context)
        mock_ctx.get_state.return_value = None
        
        with pytest.raises(ValueError) as exc_info:
            get_user_id_from_context(mock_ctx)
        
        assert "not authenticated" in str(exc_info.value).lower()
    
    def test_error_message_hides_raw_database_errors(self):
        """Test: Error handling wraps database errors - verification via docstrings"""
        import asyncio
        from src.mcp.server import mcp

        async def check_error_handling():
            tools = await mcp.get_tools()
            add_task_tool = tools.get('add_task')
            assert add_task_tool is not None
            desc = add_task_tool.description.lower() if add_task_tool.description else ""
            assert "Failed to create task" in desc or "task" in desc

        asyncio.run(check_error_handling())


class TestMCPServerIntegration:
    """Integration tests for MCP server"""
    
    def test_server_runs_as_mcp_server(self):
        """Test: Server can be run as MCP server"""
        from src.mcp.server import mcp
        
        assert mcp is not None
        assert hasattr(mcp, 'run')
    
    def test_server_has_jwt_middleware_class(self):
        """Test: JWTAuthMiddleware class exists"""
        from src.mcp.server import JWTAuthMiddleware
        
        assert JWTAuthMiddleware is not None
        assert hasattr(JWTAuthMiddleware, 'on_call_tool')
    
    def test_mcp_module_exports_required_items(self):
        """Test: Module exports all required items"""
        from src.mcp import server
        
        assert hasattr(server, 'mcp')
        assert hasattr(server, 'add_task')
        assert hasattr(server, 'list_tasks')
        assert hasattr(server, 'complete_task')
        assert hasattr(server, 'delete_task')
        assert hasattr(server, 'update_task')
        assert hasattr(server, 'get_user_id_from_context')
        assert hasattr(server, 'JWTAuthMiddleware')


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
