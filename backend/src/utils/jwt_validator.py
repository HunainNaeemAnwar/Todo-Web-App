import jwt
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from functools import lru_cache

SECRET_KEY: str = os.getenv("BETTER_AUTH_SECRET", "your-super-secret-jwt-secret-change-this-in-production")
ALGORITHM: str = "HS256"

# Cache JWT verification results for 5 minutes to reduce CPU overhead
# Tokens are stateless, so this is safe as long as we verify the expiry
JWT_CACHE_TTL = 5 * 60  # 5 minutes in seconds

_cached_tokens: Dict[str, tuple[datetime, Dict[str, Any]]] = {}

def _is_token_valid_cached(token: str) -> Optional[Dict[str, Any]]:
    """Check if token is in cache and still valid"""
    now = datetime.now(timezone.utc)
    if token in _cached_tokens:
        expiry_time, payload = _cached_tokens[token]
        # Check if expiry is more than 1 minute in the future (buffer)
        if expiry_time > now + timedelta(minutes=1):
            return payload
        # Remove expired entry
        del _cached_tokens[token]
    return None

def _cache_token_result(token: str, payload: Dict[str, Any]) -> None:
    """Cache the token verification result"""
    exp = payload.get("exp")
    if exp:
        if isinstance(exp, datetime):
            expiry_time = exp
        else:
            expiry_time = datetime.fromtimestamp(exp, tz=timezone.utc)
        # Only cache if it has significant time left
        if expiry_time > datetime.now(timezone.utc) + timedelta(minutes=1):
            _cached_tokens[token] = (expiry_time, payload)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = expires_delta
    else:
        expire = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt  # type: ignore[return-value]

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    # Check cache first
    cached_result = _is_token_valid_cached(token)
    if cached_result is not None:
        return cached_result

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Cache the successful verification result
        _cache_token_result(token, payload)
        return payload  # type: ignore[return-value]
    except jwt.PyJWTError:
        return None

def clear_token_cache():
    """Clear the token cache - useful for testing or logout"""
    global _cached_tokens
    _cached_tokens = {}
