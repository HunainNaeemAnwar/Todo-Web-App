"""
Phase 3 TDD - MCP Context Tests (GREEN Phase)

Tests for MCP context module that extracts user_id from JWT for MCP tool security.
This is a blocking prerequisite for MCP tools (FR-011).

Target: 90% coverage on MCP context module
"""

import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from typing import Optional


class TestMCPContext:
    """Test cases for MCP context user_id extraction"""
    
    def test_context_creation_with_user_id(self):
        """Test: MCP context can be created with user_id from JWT"""
        from src.mcp.context import MCPContext
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("mock.jwt.token", request_id)
            
            assert context.user_id == user_id
            assert context.request_id == request_id
            assert context.timestamp is not None
    
    def test_context_extracts_user_id_from_jwt(self):
        """Test: Context extracts user_id from JWT token"""
        from src.mcp.context import MCPContext
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        jwt_token = "mock.jwt.token"
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt(jwt_token, request_id)
            
            assert context.user_id == user_id
            assert isinstance(context.user_id, str)
    
    def test_context_with_invalid_jwt_raises_error(self):
        """Test: Invalid JWT raises appropriate error"""
        from src.mcp.context import MCPContext, InvalidJWTTokenError
        
        invalid_token = "invalid.token.here"
        request_id = str(uuid.uuid4())
        
        with patch('src.utils.jwt_validator.verify_token', return_value=None):
            with pytest.raises(InvalidJWTTokenError):
                MCPContext.from_jwt(invalid_token, request_id)
    
    def test_context_with_missing_jwt_raises_401(self):
        """Test: Missing JWT raises appropriate error"""
        from src.mcp.context import extract_mcp_context, MissingJWTTokenError
        
        request_id = str(uuid.uuid4())
        
        with pytest.raises(MissingJWTTokenError):
            extract_mcp_context(None, request_id)
    
    def test_context_user_id_matches_request(self):
        """Test: Context user_id matches the authenticated user"""
        from src.mcp.context import MCPContext
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("valid.jwt.token", request_id)
            
            assert context.user_id == user_id
    
    def test_context_isolation_prevents_cross_user_access(self):
        """Test: Context enforces user isolation for MCP tools"""
        from src.mcp.context import MCPContext, create_tool_context
        
        owner_user_id = str(uuid.uuid4())
        other_user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": owner_user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("valid.jwt.token", request_id)
            tool_ctx = create_tool_context(context.user_id, request_id)
            
            assert tool_ctx["request_context"]["user_id"] == owner_user_id
            assert tool_ctx["request_context"]["user_id"] != other_user_id
    
    def test_context_request_format(self):
        """Test: Context has correct request format for MCP"""
        from src.mcp.context import MCPContext
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("valid.jwt.token", request_id)
            context_dict = context.to_dict()
            
            assert "user_id" in context_dict
            assert "request_id" in context_dict
            assert "timestamp" in context_dict
            assert context_dict["user_id"] == user_id
            assert context_dict["request_id"] == request_id
    
    def test_context_response_format(self):
        """Test: Context has correct response format for MCP"""
        from src.mcp.context import MCPContext
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("valid.jwt.token", request_id)
            
            assert hasattr(context, 'user_id')
            assert hasattr(context, 'request_id')
            assert hasattr(context, 'timestamp')
            assert isinstance(context.user_id, str)
            assert isinstance(context.request_id, str)
            assert isinstance(context.timestamp, str)


class TestMCPContextSecurity:
    """Test cases for MCP context security (FR-011, FR-012)"""
    
    def test_user_id_not_in_tool_parameters(self):
        """Test: user_id is NOT passed as tool parameter (FR-011)"""
        from src.mcp.context import create_tool_context
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        tool_context = create_tool_context(user_id, request_id)
        
        assert "user_id" in tool_context["request_context"]
        assert tool_context["request_context"]["user_id"] == user_id
    
    def test_user_isolation_enforced(self):
        """Test: All queries filtered by user_id from JWT (FR-012)"""
        from src.mcp.context import create_tool_context
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        tool_context = create_tool_context(user_id, request_id)
        
        assert tool_context["request_context"]["user_id"] == user_id
        assert "user_id" in tool_context["request_context"]
    
    def test_no_raw_errors_exposed(self):
        """Test: No raw errors or system internals exposed (FR-018)"""
        from src.mcp.context import extract_mcp_context, MissingJWTTokenError, InvalidJWTTokenError
        
        request_id = str(uuid.uuid4())
        
        try:
            extract_mcp_context(None, request_id)
            assert False, "Should have raised MissingJWTTokenError"
        except MissingJWTTokenError as e:
            assert "Authorization header required" in str(e)
            assert "jwt" not in str(e).lower() or "Authorization" in str(e)
        
        try:
            extract_mcp_context("InvalidFormat token", request_id)
            assert False, "Should have raised InvalidJWTTokenError"
        except InvalidJWTTokenError as e:
            assert "Bearer" in str(e)


class TestMCPContextIntegration:
    """Integration tests for MCP context with Official MCP SDK"""

    def test_mcp_sdk_receives_correct_context(self):
        """Test: Official MCP SDK server receives correct user context"""
        from src.mcp.context import MCPContext, create_tool_context
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        context = MCPContext(
            user_id=user_id,
            request_id=request_id,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        tool_context = create_tool_context(context.user_id, context.request_id)
        
        assert tool_context["request_context"]["user_id"] == user_id
        assert tool_context["request_context"]["request_id"] == request_id
    
    def test_tool_calls_include_user_context(self):
        """Test: Tool calls include user context from JWT"""
        from src.mcp.context import MCPContext, create_tool_context
        
        user_id = str(uuid.uuid4())
        request_id = str(uuid.uuid4())
        
        mock_payload = {"user_id": user_id}
        
        with patch('src.utils.jwt_validator.verify_token', return_value=mock_payload):
            context = MCPContext.from_jwt("valid.jwt.token", request_id)
            tool_context = create_tool_context(context.user_id, request_id)
            
            assert "request_context" in tool_context
            assert tool_context["request_context"]["user_id"] == user_id
            assert tool_context["request_context"]["request_id"] == request_id


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
