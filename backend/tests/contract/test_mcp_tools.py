"""
MCP Tools Contract Tests (T005G)

Tests to verify MCP tools conform to contracts/mcp-tools.yaml specification.
Part of Phase 3 setup - will be expanded in Phase 4.
"""

import pytest
from src.mcp.server import mcp


class TestMCPToolContracts:
    """Verify MCP tools conform to the specification."""

    @pytest.mark.asyncio
    async def test_mcp_server_has_all_required_tools(self):
        """
        Verify all 5 required MCP tools are registered.
        Per contracts/mcp-tools.yaml: add_task, list_tasks, complete_task, delete_task, update_task
        """
        tools = await mcp.get_tools()
        tool_names = list(tools.keys())

        required_tools = [
            "add_task",
            "list_tasks",
            "complete_task",
            "delete_task",
            "update_task",
        ]

        for tool in required_tools:
            assert tool in tool_names, f"Required tool '{tool}' must be registered"

    @pytest.mark.asyncio
    async def test_add_task_tool_exists(self):
        """Verify add_task tool is properly configured."""
        add_task = await mcp.get_tool("add_task")
        assert add_task is not None, "add_task tool must exist"

    @pytest.mark.asyncio
    async def test_list_tasks_tool_exists(self):
        """Verify list_tasks tool is properly configured."""
        list_tasks = await mcp.get_tool("list_tasks")
        assert list_tasks is not None, "list_tasks tool must exist"

    @pytest.mark.asyncio
    async def test_complete_task_tool_exists(self):
        """Verify complete_task tool is properly configured."""
        complete_task = await mcp.get_tool("complete_task")
        assert complete_task is not None, "complete_task tool must exist"

    @pytest.mark.asyncio
    async def test_delete_task_tool_exists(self):
        """Verify delete_task tool is properly configured."""
        delete_task = await mcp.get_tool("delete_task")
        assert delete_task is not None, "delete_task tool must exist"

    @pytest.mark.asyncio
    async def test_update_task_tool_exists(self):
        """Verify update_task tool is properly configured."""
        update_task = await mcp.get_tool("update_task")
        assert update_task is not None, "update_task tool must exist"

    def test_mcp_server_name(self):
        """Verify MCP server has correct name."""
        assert mcp.name == "task-manager", "MCP server should be named 'task-manager'"
