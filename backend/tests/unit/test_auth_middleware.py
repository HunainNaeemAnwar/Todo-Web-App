"""
Unit tests for authentication middleware.
"""
import pytest
from fastapi import HTTPException, status
from fastapi.requests import Request
from unittest.mock import Mock, patch, AsyncMock
from src.middleware.auth_middleware import JWTAuth


def test_jwt_auth_initialization():
    """Test JWTAuth class initialization."""
    jwt_auth = JWTAuth()

    assert jwt_auth is not None
    assert hasattr(jwt_auth, 'security')


@pytest.mark.asyncio
async def test_jwt_auth_call_with_valid_token():
    """Test JWTAuth with a valid token."""
    jwt_auth = JWTAuth()

    # Create a mock request
    mock_request = Mock()
    mock_request.state = Mock()

    # Mock the security object to return credentials
    mock_credentials = Mock()
    mock_credentials.credentials = "valid_token"

    # Mock the security call to return credentials
    jwt_auth.security = AsyncMock(return_value=mock_credentials)

    # Mock the verify_token function
    with patch('src.middleware.auth_middleware.verify_token') as mock_verify:
        mock_verify.return_value = {"user_id": "12345"}

        # Call the JWTAuth instance
        result = await jwt_auth(mock_request)

        # Verify that verify_token was called
        mock_verify.assert_called_once_with("valid_token")

        # Verify that the user_id was stored in request state
        assert mock_request.state.user_id == "12345"

        # Verify that the result is the user_id
        assert result == "12345"


@pytest.mark.asyncio
async def test_jwt_auth_call_with_invalid_token():
    """Test JWTAuth with an invalid token."""
    jwt_auth = JWTAuth()

    # Create a mock request
    mock_request = Mock()
    mock_request.state = Mock()

    # Mock the security object to return credentials
    mock_credentials = Mock()
    mock_credentials.credentials = "invalid_token"
    jwt_auth.security = AsyncMock(return_value=mock_credentials)

    # Mock the verify_token function to return None (invalid)
    with patch('src.middleware.auth_middleware.verify_token') as mock_verify:
        mock_verify.return_value = None

        # Call the JWTAuth instance, should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await jwt_auth(mock_request)

        # Verify the exception details
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid or expired token"


@pytest.mark.asyncio
async def test_jwt_auth_call_with_token_missing_user_id():
    """Test JWTAuth with a token that doesn't contain user_id."""
    jwt_auth = JWTAuth()

    # Create a mock request
    mock_request = Mock()
    mock_request.state = Mock()

    # Mock the security object to return credentials
    mock_credentials = Mock()
    mock_credentials.credentials = "valid_token_but_no_user_id"
    jwt_auth.security = AsyncMock(return_value=mock_credentials)

    # Mock the verify_token function to return a payload without user_id
    with patch('src.middleware.auth_middleware.verify_token') as mock_verify:
        mock_verify.return_value = {"some_other_claim": "value"}  # No user_id

        # Call the JWTAuth instance, should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await jwt_auth(mock_request)

        # Verify the exception details
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid token: missing user_id"


@pytest.mark.asyncio
async def test_jwt_auth_call_without_credentials():
    """Test JWTAuth when no credentials are provided."""
    jwt_auth = JWTAuth()

    # Create a mock request
    mock_request = Mock()
    mock_request.state = Mock()

    # Mock the security object to raise an HTTPException for no credentials
    jwt_auth.security = AsyncMock(side_effect=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Bearer token required",
        headers={"WWW-Authenticate": "Bearer"},
    ))

    # Call the JWTAuth instance, should raise HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await jwt_auth(mock_request)

    # Verify the exception details
    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "Bearer token required"