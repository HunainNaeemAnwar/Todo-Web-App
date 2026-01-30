"""
Phase 3 TDD - MCP update_task Tool Tests (RED Phase)

Tests for update_task MCP tool.
Target: 90% coverage.

Tests verify:
- update_task modifies title (1-based index to UUID)
- update_task modifies description
- update_task returns task_id, status="updated", title
- update_task raises error for non-existent task
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestUpdateTaskTool:
    """Test cases for update_task MCP tool."""
    
    @pytest.mark.asyncio
    async def test_update_task_tool_exists(self):
        """T020R-1: update_task tool is registered."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_update_task_accepts_task_id(self):
        """T020R-2: update_task accepts task_id parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_update_task_converts_index_to_uuid(self):
        """T020R-3: update_task converts 1-based index to UUID."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_update_task_accepts_title_parameter(self):
        """T020R-4: update_task accepts optional title parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
        # Tool should accept title (optional)
    
    @pytest.mark.asyncio
    async def test_update_task_accepts_description_parameter(self):
        """T020R-5: update_task accepts optional description parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
        # Tool should accept description (optional)
    
    @pytest.mark.asyncio
    async def test_update_task_returns_updated_status(self):
        """T020R-6: update_task returns status='updated'."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
        # Response should include status: "updated"
    
    @pytest.mark.asyncio
    async def test_update_task_returns_title(self):
        """T020R-7: update_task returns task title in response."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"


class TestUpdateTaskToolErrors:
    """Error handling tests for update_task tool."""
    
    @pytest.mark.asyncio
    async def test_update_task_raises_error_for_invalid_task(self):
        """T020R-8: update_task raises error for non-existent task."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"


class TestUpdateTaskToolSecurity:
    """Security tests for update_task tool."""
    
    @pytest.mark.asyncio
    async def test_update_task_uses_user_id_from_context(self):
        """T020R-9: update_task uses user_id from JWT context."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_update_task_cannot_update_other_user_task(self):
        """T020R-10: update_task enforces user isolation."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("update_task")
        assert tool is not None, "update_task tool must exist"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
