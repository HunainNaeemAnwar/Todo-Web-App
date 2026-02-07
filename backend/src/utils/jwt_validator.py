import jwt
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from functools import lru_cache

ALGORITHM: str = "HS256"

# Token expiration configuration
JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))  # 24 hours as per spec
REFRESH_TOKEN_EXPIRATION_DAYS: int = int(
    os.getenv("REFRESH_TOKEN_EXPIRATION_DAYS", "7")
)

# Token blacklist for logout (in production, use Redis)
_token_blacklist: set = set()

# Weak secret patterns to reject
_WEAK_SECRETS = {
    "your-super-secret-jwt-secret-change-this-in-production",
    "your-secret-key-here",
    "change-this-in-production",
    "example-secret-key",
    "dev-secret",
    "development-secret",
    "test-secret",
    "default-secret",
}


def get_secret_key() -> str:
    """Get and validate JWT secret key from environment."""
    secret_key = os.getenv("BETTER_AUTH_SECRET", "")

    if not secret_key:
        raise ValueError(
            "BETTER_AUTH_SECRET environment variable must be set. "
            "Generate a secure key using: openssl rand -hex 32"
        )

    if len(secret_key) < 32:
        raise ValueError(
            f"BETTER_AUTH_SECRET must be at least 32 characters long. "
            f"Current length: {len(secret_key)} characters"
        )

    if secret_key.lower() in _WEAK_SECRETS:
        raise ValueError(
            "BETTER_AUTH_SECRET appears to be a placeholder value. "
            "Please generate a secure key using: openssl rand -hex 32"
        )

    return secret_key


SECRET_KEY: str = get_secret_key()


def is_token_blacklisted(token: str) -> bool:
    """Check if a token has been blacklisted (e.g., after logout)."""
    return token in _token_blacklist


def blacklist_token(token: str) -> None:
    """Add a token to the blacklist. Call this on logout."""
    _token_blacklist.add(token)


def cleanup_blacklist() -> None:
    """Remove expired entries from blacklist. Call periodically."""
    now = datetime.now(timezone.utc)
    expired = []
    for token in _token_blacklist:
        expiry = _get_token_expiry(token)
        if expiry is not None and expiry <= now:
            expired.append(token)
    for token in expired:
        _token_blacklist.discard(token)


def _get_token_expiry(token: str) -> Optional[datetime]:
    """Extract expiry time from token without verifying signature."""
    try:
        # Decode without verification to get exp claim
        payload = jwt.decode(token, options={"verify_signature": False})
        exp = payload.get("exp")
        if exp:
            return datetime.fromtimestamp(exp, tz=timezone.utc)
    except jwt.DecodeError:
        pass
    return None


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[datetime] = None
) -> str:
    to_encode = data.copy()

    # Token expiration - configured via environment variable
    # Default: 1 hour for access token (shorter for security)
    expire = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(
        hours=JWT_EXPIRATION_HOURS
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt  # type: ignore[return-value]


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a refresh token with longer expiration."""
    to_encode = data.copy()

    expire = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(
        days=REFRESH_TOKEN_EXPIRATION_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt  # type: ignore[return-value]


def verify_token(token: str, check_blacklist: bool = True) -> Optional[Dict[str, Any]]:
    """Verify a JWT token and optionally check blacklist."""
    # Check blacklist first
    if check_blacklist and is_token_blacklisted(token):
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # type: ignore[return-value]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def clear_token_cache():
    """Clear the token blacklist - useful for testing"""
    global _token_blacklist
    _token_blacklist = set()
