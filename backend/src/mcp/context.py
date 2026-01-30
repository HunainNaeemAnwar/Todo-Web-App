"""
MCP Context Management

Provides user_id context for MCP tools extracted from JWT.
Uses context variables to pass user_id from the chat endpoint to MCP tools.
"""

import contextvars
from typing import Optional

# Context variable for current user ID
current_user_id: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar('current_user_id', default=None)

def get_current_user_id() -> Optional[str]:
    """
    Get the current user ID from context.

    Returns:
        User ID string or None if not set
    """
    return current_user_id.get()

def set_current_user_id(user_id: str) -> None:
    """
    Set the current user ID in context.

    Args:
        user_id: User ID to set
    """
    current_user_id.set(user_id)

def reset_current_user_id() -> None:
    """
    Reset the current user ID context.
    """
    current_user_id.set(None)

# For backward compatibility with existing code
class MCPContextError(Exception):
    """Base exception for MCP context errors"""
    pass

class MissingJWTTokenError(MCPContextError):
    """Raised when JWT token is missing from request"""
    pass

class InvalidJWTTokenError(MCPContextError):
    """Raised when JWT token is invalid"""
    pass

class MissingUserIdError(MCPContextError):
    """Raised when JWT payload missing user_id"""
    pass

# MCPContext for compatibility with tests
class MCPContext(dict):
    def __init__(self, user_id: str, request_id: str, timestamp: str):
        super().__init__()
        self["request_context"] = {
            "user_id": user_id,
            "request_id": request_id,
            "timestamp": timestamp
        }
        # Also set direct attributes for backward compatibility
        self.user_id = user_id
        self.request_id = request_id
        self.timestamp = timestamp

    @classmethod
    def from_jwt(cls, jwt_token: str, request_id: str) -> 'MCPContext':
        """Create MCPContext from JWT token (for testing)"""
        from src.utils.jwt_validator import verify_token
        import time

        if jwt_token is None:
            raise MissingJWTTokenError("Authorization header required")

        try:
            payload = verify_token(jwt_token)
            if payload and payload.get("user_id"):
                return cls(
                    user_id=payload["user_id"],
                    request_id=request_id,
                    timestamp=str(int(time.time()))
                )
            else:
                raise InvalidJWTTokenError("JWT payload missing user_id")
        except Exception as e:
            if "expired" in str(e).lower():
                raise InvalidJWTTokenError("JWT token expired")
            raise InvalidJWTTokenError("Invalid JWT token format. Expected Bearer token.")

    def to_dict(self) -> dict:
        """Convert to dictionary format"""
        return {
            "user_id": self.user_id,
            "request_id": self.request_id,
            "timestamp": self.timestamp
        }


def extract_mcp_context(jwt_token: str, request_id: str) -> MCPContext:
    """Extract MCP context from JWT token"""
    return MCPContext.from_jwt(jwt_token, request_id)


def create_tool_context(user_id: str, request_id: str) -> MCPContext:
    """Create tool context for testing"""
    import time
    return MCPContext(
        user_id=user_id,
        request_id=request_id,
        timestamp=str(int(time.time()))
    )
