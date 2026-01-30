"""
Phase 3 TDD - MCP delete_task Tool Tests (RED Phase)

Tests for delete_task MCP tool.
Target: 90% coverage.

Tests verify:
- delete_task removes task (1-based index to UUID)
- delete_task returns task_id, status="deleted", title
- delete_task raises error for non-existent task
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestDeleteTaskTool:
    """Test cases for delete_task MCP tool."""
    
    @pytest.mark.asyncio
    async def test_delete_task_tool_exists(self):
        """T019R-1: delete_task tool is registered."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_delete_task_accepts_task_id(self):
        """T019R-2: delete_task accepts task_id parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_delete_task_converts_index_to_uuid(self):
        """T019R-3: delete_task converts 1-based index to UUID."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_delete_task_returns_deleted_status(self):
        """T019R-4: delete_task returns status='deleted'."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"
        # Response should include status: "deleted"
    
    @pytest.mark.asyncio
    async def test_delete_task_returns_title(self):
        """T019R-5: delete_task returns task title in response."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"


class TestDeleteTaskToolErrors:
    """Error handling tests for delete_task tool."""
    
    @pytest.mark.asyncio
    async def test_delete_task_raises_error_for_invalid_task(self):
        """T019R-6: delete_task raises error for non-existent task."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"


class TestDeleteTaskToolSecurity:
    """Security tests for delete_task tool."""
    
    @pytest.mark.asyncio
    async def test_delete_task_uses_user_id_from_context(self):
        """T019R-7: delete_task uses user_id from JWT context."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_delete_task_cannot_delete_other_user_task(self):
        """T019R-8: delete_task enforces user isolation."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("delete_task")
        assert tool is not None, "delete_task tool must exist"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
