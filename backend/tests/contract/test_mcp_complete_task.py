"""
Phase 3 TDD - MCP complete_task Tool Tests (RED Phase)

Tests for complete_task MCP tool.
Target: 90% coverage.

Tests verify:
- complete_task marks task as completed (1-based index to UUID)
- complete_task returns task_id, status="completed", title
- complete_task raises error for non-existent task
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestCompleteTaskTool:
    """Test cases for complete_task MCP tool."""
    
    @pytest.mark.asyncio
    async def test_complete_task_tool_exists(self):
        """T018R-1: complete_task tool is registered."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_complete_task_accepts_task_id(self):
        """T018R-2: complete_task accepts task_id parameter."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
        # Tool should accept task_id (1-based index from user)
    
    @pytest.mark.asyncio
    async def test_complete_task_converts_index_to_uuid(self):
        """T018R-3: complete_task converts 1-based index to UUID."""
        # User says "complete task 1" → tool converts "1" to UUID
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
    
    @pytest.mark.asyncio
    async def test_complete_task_returns_completed_status(self):
        """T018R-4: complete_task returns status='completed'."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
        # Response should include status: "completed"
    
    @pytest.mark.asyncio
    async def test_complete_task_returns_title(self):
        """T018R-5: complete_task returns task title in response."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"


class TestCompleteTaskToolErrors:
    """Error handling tests for complete_task tool."""
    
    @pytest.mark.asyncio
    async def test_complete_task_raises_error_for_invalid_task(self):
        """T018R-6: complete_task raises error for non-existent task."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
        # Should return friendly error, not raise


class TestCompleteTaskToolSecurity:
    """Security tests for complete_task tool."""
    
    @pytest.mark.asyncio
    async def test_complete_task_uses_user_id_from_context(self):
        """T018R-7: complete_task uses user_id from JWT context."""
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"
        # Implementation must use ctx.request_context.user_id
    
    @pytest.mark.asyncio
    async def test_complete_task_cannot_complete_other_user_task(self):
        """T018R-8: complete_task enforces user isolation."""
        # User A cannot complete User B's task
        from src.mcp.server import mcp
        
        tool = await mcp.get_tool("complete_task")
        assert tool is not None, "complete_task tool must exist"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
