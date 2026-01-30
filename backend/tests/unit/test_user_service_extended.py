"""
Extended unit tests for user service.
"""
import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException, status
from sqlmodel import Session
from src.models.user import User, UserCreate
from src.services.user_service import UserService


def test_user_service_initialization():
    """Test UserService initialization."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    assert user_service is not None
    assert user_service.session == mock_session


def test_verify_password():
    """Test password verification."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Mock the pwd_context.verify method
    with patch('src.services.user_service.pwd_context.verify', return_value=True):
        result = user_service.verify_password("plain_password", "hashed_password")
        assert result is True

    # Test with incorrect password
    with patch('src.services.user_service.pwd_context.verify', return_value=False):
        result = user_service.verify_password("wrong_password", "hashed_password")
        assert result is False


def test_get_password_hash():
    """Test password hashing."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Mock the pwd_context.hash method
    with patch('src.services.user_service.pwd_context.hash', return_value="mocked_hash"):
        result = user_service.get_password_hash("plain_password")
        assert result == "mocked_hash"


def test_validate_password_strength_direct():
    """Test password validation function directly."""
    # Test the standalone function directly
    from src.services.user_service import validate_password_strength

    # Valid password: has uppercase, lowercase, digit, special char, and is at least 8 chars
    valid_password = "ValidPass1!"
    result, message = validate_password_strength(valid_password)
    assert result is True


def test_validate_password_strength_invalid():
    """Test password validation with invalid passwords."""
    from src.services.user_service import validate_password_strength

    # Test various invalid passwords
    invalid_passwords = [
        ("short", "Password must be at least 8 characters long"),
        ("nouppercase1!", "Password must contain at least one uppercase letter"),
        ("NOLOWERCASE1!", "Password must contain at least one lowercase letter"),
        ("NoDigits!", "Password must contain at least one digit"),
        ("NoSpecial1", "Password must contain at least one special character"),
    ]

    for password, expected_error in invalid_passwords:
        result, message = validate_password_strength(password)
        assert result is False, f"Password '{password}' should be invalid"
        assert expected_error in message


@pytest.mark.asyncio
async def test_create_user_success():
    """Test successful user creation."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request
    user_create = UserCreate(email="test@example.com", password="ValidPass1!")

    # Create a mock user object that would be returned
    created_user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )

    # Mock the session operations
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    # Mock the user creation process - use execute() instead of exec()
    with patch('src.services.user_service.validate_password_strength', return_value=(True, "Valid password")):
        with patch('src.services.user_service.UserService.get_password_hash', return_value="hashed_password"):
            # Mock the query to return None (no existing user)
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_session.execute.return_value = mock_result

            result = await user_service.create_user(user_create)

            # Verify that session methods were called
            mock_session.add.assert_called_once()
            mock_session.commit.assert_called_once()
            mock_session.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_create_user_duplicate_email():
    """Test user creation with duplicate email."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request
    user_create = UserCreate(email="existing@example.com", password="ValidPass1!")

    # Mock that a user with this email already exists
    existing_user = User(
        id="existing-user-id",
        email="existing@example.com",
        hashed_password="hashed_password",
        is_active=True
    )

    # Mock the select query to return an existing user - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = existing_user
    mock_session.execute.return_value = mock_result

    # Test that creating a user with duplicate email raises an exception
    with pytest.raises(HTTPException) as exc_info:
        await user_service.create_user(user_create)

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert exc_info.value.detail == "Email already registered"


@pytest.mark.asyncio
async def test_create_user_invalid_password():
    """Test user creation with invalid password."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request with invalid password
    user_create = UserCreate(email="test@example.com", password="weak")

    # Mock that no user with this email exists (so we can test password validation)
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    # Mock password validation to return False
    with patch('src.services.user_service.validate_password_strength', return_value=(False, "Weak password")):
        # Test that creating a user with weak password raises an exception
        with pytest.raises(HTTPException) as exc_info:
            await user_service.create_user(user_create)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Weak password"


@pytest.mark.asyncio
async def test_get_user_by_email_found():
    """Test getting a user by email when user exists."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create an expected user
    expected_user = User(
        id="user-id",
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )

    # Mock the select query to return the user - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = expected_user
    mock_session.execute.return_value = mock_result

    result = await user_service.get_user_by_email("test@example.com")

    # Verify that the correct user was returned
    assert result == expected_user


@pytest.mark.asyncio
async def test_get_user_by_email_not_found():
    """Test getting a user by email when user does not exist."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Mock the select query to return None - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    result = await user_service.get_user_by_email("nonexistent@example.com")

    # Verify that None was returned
    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_id_found():
    """Test getting a user by ID when user exists."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create an expected user
    expected_user = User(
        id="user-id",
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )

    # Mock the session.execute to return the user - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = expected_user
    mock_session.execute.return_value = mock_result

    result = await user_service.get_user_by_id("user-id")

    # Verify that the correct user was returned
    assert result == expected_user


@pytest.mark.asyncio
async def test_get_user_by_id_not_found():
    """Test getting a user by ID when user does not exist."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Mock the session.execute to return None - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    result = await user_service.get_user_by_id("nonexistent-id")

    # Verify that None was returned
    assert result is None


def test_create_user_sync():
    """Test synchronous user creation."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request
    user_create = UserCreate(email="sync@test.com", password="ValidPass1!")

    # Mock the session operations
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    # Mock the user creation process - use execute()
    with patch('src.services.user_service.validate_password_strength', return_value=(True, "Valid password")):
        with patch('src.services.user_service.UserService.get_password_hash', return_value="hashed_password"):
            # Mock the query to return None (no existing user)
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_session.execute.return_value = mock_result

            result = user_service.create_user_sync(user_create)

            # Verify that session methods were called
            mock_session.add.assert_called_once()
            mock_session.commit.assert_called_once()
            mock_session.refresh.assert_called_once()


def test_get_user_by_email_sync():
    """Test synchronous get user by email."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create an expected user
    expected_user = User(
        id="user-id",
        email="sync@test.com",
        hashed_password="hashed_password",
        is_active=True
    )

    # Mock the select query to return the user - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = expected_user
    mock_session.execute.return_value = mock_result

    result = user_service.get_user_by_email_sync("sync@test.com")

    # Verify that the correct user was returned
    assert result == expected_user




@pytest.mark.asyncio
async def test_create_user_password_validation_error():
    """Test user creation when password validation fails."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request with invalid password
    user_create = UserCreate(email="test@example.com", password="weak")

    # Mock the select query to return None (no existing user) - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    # Mock password validation to return False
    with patch('src.services.user_service.validate_password_strength', return_value=(False, "Weak password")):
        with pytest.raises(HTTPException) as exc_info:
            await user_service.create_user(user_create)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Weak password"


@pytest.mark.asyncio
async def test_create_user_internal_error():
    """Test user creation when an internal error occurs."""
    mock_session = Mock(spec=Session)
    user_service = UserService(mock_session)

    # Create a user creation request
    user_create = UserCreate(email="test@example.com", password="ValidPass1!")

    # Mock the select query to return None (no existing user) - use execute()
    mock_result = Mock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    # Mock the session.add to raise an exception
    mock_session.add.side_effect = Exception("Database error")

    # Mock password validation to return True
    with patch('src.services.user_service.validate_password_strength', return_value=(True, "Valid password")):
        with pytest.raises(Exception, match="Database error"):
            await user_service.create_user(user_create)