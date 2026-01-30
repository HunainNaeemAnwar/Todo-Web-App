"""
Unit tests for rate limiting middleware.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from src.middleware.rate_limit import setup_rate_limiting, RateLimitMiddleware, limiter


def test_setup_rate_limiting():
    """Test that rate limiting can be set up on an app."""
    app = FastAPI()

    # Call the setup function
    setup_rate_limiting(app)

    # Verify the app has the limiter state
    assert hasattr(app.state, 'limiter')
    assert app.state.limiter == limiter


def test_rate_limit_middleware_initialization():
    """Test RateLimitMiddleware initialization."""
    middleware = RateLimitMiddleware()

    assert middleware is not None


@pytest.mark.asyncio
async def test_rate_limit_middleware_call():
    """Test RateLimitMiddleware __call__ method."""
    middleware = RateLimitMiddleware()

    # Create a mock request
    mock_request = Mock()
    mock_request.url.path = "/api/test"
    mock_request.method = "GET"
    mock_request.state = Mock()
    mock_request.state.user_id = None  # No user ID initially

    # Create a mock call_next coroutine
    async def mock_call_next(req):
        mock_response = Mock()
        mock_response.status_code = 200
        return mock_response

    # Call the middleware
    response = await middleware(mock_request, mock_call_next)

    # Verify response was returned
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_rate_limit_middleware_auth_endpoint():
    """Test RateLimitMiddleware behavior on auth endpoints."""
    middleware = RateLimitMiddleware()

    # Create a mock request to an auth endpoint
    mock_request = Mock()
    mock_request.url.path = "/api/auth/login"  # Auth endpoint
    mock_request.method = "POST"
    mock_request.state = Mock()
    mock_request.state.user_id = None

    # Create a mock call_next coroutine
    async def mock_call_next(req):
        mock_response = Mock()
        mock_response.status_code = 200
        return mock_response

    # Call the middleware
    response = await middleware(mock_request, mock_call_next)

    # Verify response was returned
    assert response.status_code == 200


def test_limiter_object():
    """Test that the limiter object exists and is properly configured."""
    assert limiter is not None
    # The limiter should have a key function (checking internal attribute)
    assert hasattr(limiter, '_key_func')


def test_rate_limit_constants():
    """Test that rate limit constants are defined."""
    from src.middleware.rate_limit import api_rate_limit, auth_rate_limit, failed_login_limit

    assert api_rate_limit == "100/minute"
    assert auth_rate_limit == "5/minute"
    assert failed_login_limit == "5/minute"