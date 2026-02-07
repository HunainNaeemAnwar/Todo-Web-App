"""
Extended unit tests for authentication service.
"""
import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException, status
from sqlmodel import Session
from src.models.user import User
from src.services.auth_service import AuthService


def test_auth_service_initialization():
    """Test AuthService initialization."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    assert auth_service is not None
    assert auth_service.session == mock_session


@pytest.mark.asyncio
async def test_authenticate_user_success():
    """Test successful user authentication."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Create a mock user
    mock_user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="$2b$12$mocked_hashed_password",
        is_active=True
    )

    # Mock the session execution
    mock_exec = Mock()
    mock_exec.first.return_value = mock_user
    mock_session.exec.return_value = mock_exec

    # Mock password verification to return True
    with patch('src.services.auth_service.pwd_context.verify', return_value=True):
        # Mock JWT token creation
        with patch('src.services.auth_service.create_access_token', return_value="mocked_token"):
            result = await auth_service.authenticate_user("test@example.com", "password123")

            # Verify the result
            assert result["access_token"] == "mocked_token"
            assert result["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_authenticate_user_invalid_credentials():
    """Test authentication with invalid credentials."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Create a mock user
    mock_user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="$2b$12$mocked_hashed_password",
        is_active=True
    )

    # Mock the session execution to return a user
    mock_exec = Mock()
    mock_exec.first.return_value = mock_user
    mock_session.exec.return_value = mock_exec

    # Mock password verification to return False (invalid password)
    with patch('src.services.auth_service.pwd_context.verify', return_value=False):
        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.authenticate_user("test@example.com", "wrong_password")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid credentials"


@pytest.mark.asyncio
async def test_authenticate_user_nonexistent():
    """Test authentication with non-existent user."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Mock the session execution to return None (no user found) - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    # Should raise HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await auth_service.authenticate_user("nonexistent@example.com", "password123")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "Invalid credentials"


@pytest.mark.asyncio
async def test_authenticate_user_inactive():
    """Test authentication with inactive user."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Create a mock user that is not active
    mock_user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="$2b$12$mocked_hashed_password",
        is_active=False
    )

    # Mock the session execution - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = mock_user
    mock_session.execute.return_value = mock_result

    # Mock password verification to return True
    with patch('src.services.auth_service.pwd_context.verify', return_value=True):
        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.authenticate_user("test@example.com", "password123")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Inactive user"


@pytest.mark.asyncio
async def test_get_current_user_success():
    """Test getting current user with valid token."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Create a mock user
    mock_user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="$2b$12$mocked_hashed_password",
        is_active=True
    )

    # Mock the session.execute to return the user - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = mock_user
    mock_session.execute.return_value = mock_result

    # Mock token verification to return a payload with user_id
    with patch('src.services.auth_service.verify_token', return_value={"user_id": "test-user-id"}):
        result = await auth_service.get_current_user("valid_token")

        # Verify the result is the user object
        assert result == mock_user
        assert result.id == "test-user-id"


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    """Test getting current user with invalid token."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Mock token verification to return None (invalid token)
    with patch('src.services.auth_service.verify_token', return_value=None):
        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user("invalid_token")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_user_missing_user_id():
    """Test getting current user when token doesn't contain user_id."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Mock token verification to return a payload without user_id
    with patch('src.services.auth_service.verify_token', return_value={"other_claim": "value"}):
        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user("valid_token_but_no_user_id")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_current_user_not_found():
    """Test getting current user when user doesn't exist in database."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Mock the session.execute to return None (user not found) - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    # Mock token verification to return a payload with user_id
    with patch('src.services.auth_service.verify_token', return_value={"user_id": "nonexistent-user-id"}):
        # Should raise HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.get_current_user("valid_token")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "User not found"


def test_auth_service_sync_methods():
    """Test synchronous versions of auth service methods."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Test that sync methods exist
    assert hasattr(auth_service, 'authenticate_user_sync')
    assert hasattr(auth_service, 'get_current_user_sync')
    assert hasattr(auth_service, 'logout_user_sync')


@pytest.mark.asyncio
async def test_logout_user():
    """Test logout_user method."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # In the current implementation, logout is a no-op in a stateless system
    # This test verifies the method exists and can be called
    result = await auth_service.logout_user("some_token")

    # The method should return None (no-op)
    assert result is None


def test_logout_user_sync():
    """Test synchronous logout_user method."""
    mock_session = Mock(spec=Session)
    auth_service = AuthService(mock_session)

    # Call the sync logout method
    result = auth_service.logout_user_sync("some_token")

    # The method should return None (no-op)
    assert result is None