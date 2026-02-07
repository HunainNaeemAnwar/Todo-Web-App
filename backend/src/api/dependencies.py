from fastapi import Request, Depends, HTTPException, status
from typing import Annotated
from src.utils.jwt_validator import verify_token
from src.database.database import engine, get_session_context
from sqlmodel import Session, select
from src.models.user import User
import structlog

logger = structlog.get_logger(__name__)


async def get_current_user_id(request: Request) -> str:
    """Dependency to get the current user ID from the JWT token in the request"""
    token = None

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        cookie_header = request.headers.get("cookie")
        if cookie_header and "auth_token=" in cookie_header:
            for cookie in cookie_header.split(";"):
                cookie = cookie.strip()
                if cookie.startswith("auth_token="):
                    token = cookie.split("=")[1]
                    break

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info("Authenticating user", user_id=user_id)

    with get_session_context() as session:
        user = session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        if not user:
            logger.error("User not found in database", user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return user_id


CurrentUser = Annotated[str, Depends(get_current_user_id)]
