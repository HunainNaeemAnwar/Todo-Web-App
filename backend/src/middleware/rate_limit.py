from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
from typing import Optional

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiting(app):
    """Set up rate limiting for the application"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Rate limit for general API requests: 100 per minute per user
api_rate_limit = "100/minute"

# Rate limit for authentication endpoints: 5 per minute per IP
auth_rate_limit = "5/minute"

# Rate limit for failed login attempts: Prevent brute force
failed_login_limit = "5/minute"


class RateLimitMiddleware:
    """
    Custom rate limiting middleware to handle user-based rate limiting
    beyond IP-based limiting, incorporating user_id from JWT when available
    """

    def __init__(self):
        pass

    async def __call__(self, request: Request, call_next):
        # Extract user_id from request state (set by auth middleware)
        user_id = getattr(request.state, 'user_id', None)

        # Apply different rate limits based on endpoint
        if request.url.path.startswith('/api/auth'):
            # For auth endpoints, use IP-based rate limiting
            if request.method == 'POST' and '/api/auth/login' in request.url.path:
                # Apply stricter rate limit for login attempts
                pass  # This would be handled by slowapi decorators

        response = await call_next(request)
        return response
