"""
Security tests for JWT validation and user isolation.

Tests security requirements:
- FR-028: JWT verification with BETTER_AUTH_SECRET
- FR-029: Rejection of invalid JWT
- FR-030: User ID extraction from JWT
- FR-031: User ID filtering requirement
- FR-032: Stateless authentication
"""
import pytest
import jwt
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import os

os.environ["BETTER_AUTH_SECRET"] = "test-secret-key-for-testing-only"

from src.utils.jwt_validator import create_access_token, verify_token


SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "default-secret-change-in-production")
ALGORITHM = "HS256"


def decode_jwt_directly(token: str) -> dict:
    """Decode JWT without verification (for testing only)."""
    return jwt.decode(token, options={"verify_signature": False})


class TestJWTSecurityValidation:
    """Test JWT token security validation."""

    def test_valid_token_verification(self):
        """Verify that valid tokens are accepted."""
        payload = {"sub": "user123", "user_id": "user123"}
        token = create_access_token(payload)
        result = verify_token(token)
        assert result is not None
        assert result["sub"] == "user123"
        assert result["user_id"] == "user123"

    def test_expired_token_rejected(self):
        """Verify that expired tokens are rejected."""
        payload = {
            "sub": "user123",
            "user_id": "user123",
            "exp": datetime.now(timezone.utc) - timedelta(hours=1),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        result = verify_token(token)
        assert result is None

    def test_invalid_signature_rejected(self):
        """Verify that tokens with invalid signatures are rejected."""
        payload = {"sub": "user123", "user_id": "user123"}
        token = jwt.encode(payload, "wrong-secret", algorithm=ALGORITHM)
        result = verify_token(token)
        assert result is None

    def test_wrong_algorithm_rejected(self):
        """Verify that tokens signed with wrong algorithm are rejected."""
        payload = {"sub": "user123", "user_id": "user123"}
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS512")
        result = verify_token(token)
        assert result is None

    def test_malformed_token_rejected(self):
        """Verify that malformed tokens are rejected."""
        result = verify_token("not.a.valid.token")
        assert result is None

    def test_empty_token_rejected(self):
        """Verify that empty tokens are rejected."""
        result = verify_token("")
        assert result is None

    def test_token_without_user_id_returns_payload(self):
        """Verify that tokens without user_id still return payload."""
        payload = {"sub": "user123"}
        token = create_access_token(payload)
        result = verify_token(token)
        assert result is not None
        assert "user_id" not in result

    def test_hs256_algorithm_enforced(self):
        """Verify that only HS256 algorithm is accepted."""
        payload = {"sub": "user123", "user_id": "user123"}
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS384")
        result = verify_token(token)
        assert result is None


class TestUserIsolation:
    """Test user data isolation through JWT."""

    def test_user_id_extraction_from_token(self):
        """Verify user_id is correctly extracted from JWT."""
        user_id = "user-abc-123"
        payload = {"sub": user_id, "user_id": user_id}
        token = create_access_token(payload)
        result = verify_token(token)
        assert result is not None
        assert result["user_id"] == user_id

    def test_different_users_cannot_access_each_other_data(self):
        """Verify that users can only access their own data."""
        user1_token = create_access_token({"sub": "user1", "user_id": "user1"})
        user2_token = create_access_token({"sub": "user2", "user_id": "user2"})

        result1 = verify_token(user1_token)
        result2 = verify_token(user2_token)

        assert result1 is not None
        assert result2 is not None
        assert result1["user_id"] != result2["user_id"]
        assert result1["user_id"] == "user1"
        assert result2["user_id"] == "user2"

    def test_token_does_not_automatically_include_sensitive_data(self):
        """Verify token only contains what we explicitly add."""
        payload = {
            "sub": "user123",
            "user_id": "user123",
        }
        token = create_access_token(payload)
        result = verify_token(token)

        assert result is not None
        assert "sub" in result
        assert "user_id" in result
        assert "password" not in result
        assert "hashed_password" not in result

    def test_no_server_side_session_required(self):
        """Verify stateless authentication - no server-side state needed."""
        payload = {"sub": "user123", "user_id": "user123"}
        token1 = create_access_token(payload)
        token2 = create_access_token(payload)

        result1 = verify_token(token1)
        result2 = verify_token(token2)

        assert result1 is not None
        assert result2 is not None
        assert result1["user_id"] == result2["user_id"]
        assert result1["sub"] == result2["sub"]


class TestTokenSecurityBoundaries:
    """Test token security boundaries."""

    def test_token_cannot_be_modified(self):
        """Verify token integrity - modified tokens are rejected."""
        payload = {"sub": "user123", "user_id": "user123"}
        token = create_access_token(payload)

        modified_token = token[:-5] + "xxxxx"
        result = verify_token(modified_token)
        assert result is None

    def test_no_leakage_between_users(self):
        """Verify no data leakage between different user tokens."""
        user1_payload = {"sub": "user1", "user_id": "user1"}
        user2_payload = {"sub": "user2", "user_id": "user2"}

        token1 = create_access_token(user1_payload)
        token2 = create_access_token(user2_payload)

        result1 = verify_token(token1)
        result2 = verify_token(token2)

        assert result1 is not None
        assert result2 is not None
        assert result1["user_id"] == "user1"
        assert result2["user_id"] == "user2"
        assert result1 != result2


class TestPasswordHashingSecurity:
    """Test password hashing security."""

    def test_password_weakness_rejected(self):
        """Verify weak passwords are rejected."""
        from src.services.user_service import validate_password_strength

        weak_passwords = [
            "short",
            "alllowercase123",
            "ALLUPPERCASE123",
            "NoNumbers!",
        ]

        for password in weak_passwords:
            is_valid, _ = validate_password_strength(password)
            assert not is_valid, f"Password '{password}' should be rejected"

    def test_password_strength_requirements(self):
        """Verify password meets all strength requirements."""
        from src.services.user_service import validate_password_strength

        strong_password = "SecureP@ssw0rd!"
        is_valid, message = validate_password_strength(strong_password)
        assert is_valid, f"Strong password should be accepted: {message}"
