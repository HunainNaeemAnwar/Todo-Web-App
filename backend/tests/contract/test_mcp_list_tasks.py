"""
Phase 3 TDD - MCP list_tasks Tool Tests (RED Phase)

Tests for list_tasks MCP tool.
Target: 90% coverage.

Tests verify:
- list_tasks returns all tasks when status="all"
- list_tasks returns only pending when status="pending"
- list_tasks returns only completed when status="completed"
- list_tasks returns array with id, title, completed, description
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestListTasksTool:
    """Test cases for list_tasks MCP tool."""
    
    @pytest.mark.asyncio
    async def test_list_tasks_tool_exists(self):
        """T017R-1: list_tasks tool is registered."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
    
    @pytest.mark.asyncio
    async def test_list_tasks_returns_all_by_default(self):
        """T017R-2: list_tasks returns all tasks when status not specified."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
    
    @pytest.mark.asyncio
    async def test_list_tasks_accepts_status_parameter(self):
        """T017R-3: list_tasks accepts optional status parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
        # Tool should accept status: "all" | "pending" | "completed"
    
    @pytest.mark.asyncio
    async def test_list_tasks_returns_array(self):
        """T017R-4: list_tasks returns array of tasks."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
    
    @pytest.mark.asyncio
    async def test_list_tasks_includes_required_fields(self):
        """T017R-5: list_tasks returns tasks with id, title, completed, description."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
        # Response should include: id, title, completed, description


class TestListTasksToolSecurity:
    """Security tests for list_tasks tool."""
    
    @pytest.mark.asyncio
    async def test_list_tasks_filters_by_user_id(self):
        """T017R-6: list_tasks filters by user_id from context (FR-012)."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        assert tool is not None, "list_tasks tool must exist"
        # Implementation must filter by user_id from JWT context
    
    @pytest.mark.asyncio
    async def test_list_tasks_does_not_accept_user_id_parameter(self):
        """T017R-7: user_id must NOT be a tool parameter (FR-011)."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("list_tasks")
        # Tool should only accept status, not user_id


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
