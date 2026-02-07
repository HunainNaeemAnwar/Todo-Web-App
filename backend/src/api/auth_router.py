from fastapi import APIRouter, Depends, HTTPException, status, Body, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
from sqlmodel import Session
from src.database.database import get_session
from src.models.user import UserCreate
from src.services.user_service import UserService
from src.services.auth_service import AuthService
from src.utils.jwt_validator import (
    create_access_token,
    create_refresh_token,
    blacklist_token,
)
from src.utils.validators import (
    validate_email_or_raise,
    validate_password_or_raise,
    validate_name_or_raise,
)
import structlog
import os

logger = structlog.get_logger(__name__)

auth_router = APIRouter()
security = HTTPBearer()

# Cookie duration constants (in seconds)
ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24  # 24 hours - matches JWT expiration
REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


@auth_router.post(
    "/sign-up/email", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def sign_up(
    body: Annotated[dict, Body()],
    session: Session = Depends(get_session),
):
    """Register a new user - Better Auth compatible endpoint"""
    email_raw = body.get("email")
    password_raw = body.get("password")
    name_raw = body.get("name", "")

    email = validate_email_or_raise(str(email_raw) if email_raw else "")
    name = validate_name_or_raise(str(name_raw) if name_raw else "")
    password = str(password_raw) if password_raw else ""
    validate_password_or_raise(password)

    user_service = UserService(session)
    try:
        user = await user_service.create_user(
            UserCreate(email=email, password=password, name=name)  # type: ignore[call-arg]
        )
    except ValueError as e:
        # Log without exposing email in production
        if os.getenv("ENVIRONMENT") == "production":
            logger.warning("Registration failed", error=str(e))
        else:
            logger.warning(
                "Registration failed", email_prefix=email[:2] + "***", error=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    access_token = create_access_token(data={"user_id": str(user.id)})
    refresh_token = create_refresh_token(
        data={"user_id": str(user.id), "type": "refresh"}
    )

    # Log without exposing email in production
    if os.getenv("ENVIRONMENT") == "production":
        logger.info("User registered successfully", user_id=str(user.id))
    else:
        logger.info("User registered successfully", user_id=str(user.id), email=email)

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "emailVerified": False,
            "image": None,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
            "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
        },
        "session": {
            "token": access_token,
            "refresh_token": refresh_token,
            "expiresAt": None,
            "ipAddress": None,
            "userAgent": None,
        },
    }


def _set_auth_cookies(
    response: Response, access_token: str, refresh_token: str
) -> Response:
    # type: ignore[return]  # Response is compatible with JSONResponse
    """Set authentication cookies with secure settings."""
    is_production = os.getenv("ENVIRONMENT") == "production"

    # Access token cookie (shorter-lived)
    response.set_cookie(
        key="auth_token",
        value=access_token,
        max_age=ACCESS_TOKEN_COOKIE_MAX_AGE,
        httponly=True,
        secure=is_production,
        samesite="strict" if is_production else "lax",
        path="/",
    )

    # Refresh token cookie (longer-lived for automatic re-authentication)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_COOKIE_MAX_AGE,
        httponly=True,
        secure=is_production,
        samesite="strict" if is_production else "lax",
        path="/",
    )

    return response


def _clear_auth_cookies(response: Response) -> Response:
    """Clear all authentication cookies."""
    response.delete_cookie(key="auth_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return response


@auth_router.post("/sign-in/email", response_model=None)
async def sign_in(
    body: Annotated[dict, Body()],
    session: Session = Depends(get_session),
):
    """Authenticate user and return JWT token - Better Auth compatible endpoint"""
    from fastapi.responses import JSONResponse

    email_raw = body.get("email")
    email = validate_email_or_raise(str(email_raw) if email_raw else "")
    password = body.get("password")

    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required",
        )

    auth_service = AuthService(session)
    try:
        token_data = await auth_service.authenticate_user(email, password)
    except HTTPException as e:
        # Log without exposing email in production
        if os.getenv("ENVIRONMENT") == "production":
            logger.warning("Login failed", detail=e.detail)
        else:
            logger.warning(
                "Login failed", email_prefix=email[:2] + "***", detail=e.detail
            )
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
        )

    user = await auth_service.get_current_user(token_data["access_token"])

    # Generate refresh token
    refresh_token = create_refresh_token(
        data={"user_id": str(user.id), "type": "refresh"}
    )

    # Log without exposing email in production
    if os.getenv("ENVIRONMENT") == "production":
        logger.info("User signed in successfully", user_id=str(user.id))
    else:
        logger.info("User signed in successfully", user_id=str(user.id), email=email)

    result = {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "emailVerified": False,
            "image": None,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
            "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
        },
        "session": {
            "token": token_data["access_token"],
            "refresh_token": refresh_token,
            "expiresAt": None,
            "ipAddress": None,
            "userAgent": None,
        },
    }

    response: Response = JSONResponse(result)
    response = _set_auth_cookies(response, token_data["access_token"], refresh_token)

    return response


@auth_router.post("/sign-out", response_model=None)
async def sign_out(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
):
    """Logout current user - Better Auth compatible endpoint"""
    from fastapi.responses import JSONResponse

    # Blacklist the current token if provided
    if credentials:
        blacklist_token(credentials.credentials)

    response: Response = JSONResponse({"message": "Successfully signed out"})
    response = _clear_auth_cookies(response)
    return response


@auth_router.post("/refresh", response_model=dict)
async def refresh_token(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)] = None,
    session: Session = Depends(get_session),
):
    """Refresh access token using refresh token."""
    from fastapi.responses import JSONResponse

    # Try to get refresh token from header first, then from cookie
    refresh_token_value = credentials.credentials if credentials else None

    if not refresh_token_value:
        refresh_token_value = request.cookies.get("refresh_token")

    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(session)

    # Verify the refresh token
    try:
        payload = await auth_service.verify_refresh_token(refresh_token_value)
        user_id = payload.get("user_id")
    except HTTPException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate new access token
    new_access_token = create_access_token(data={"user_id": str(user_id)})
    new_refresh_token = create_refresh_token(
        data={"user_id": str(user_id), "type": "refresh"}
    )

    # Blacklist old refresh token
    blacklist_token(refresh_token_value)

    logger.info("Token refreshed successfully", user_id=str(user_id))

    response: Response = JSONResponse(
        {
            "user": None,
            "session": {
                "token": new_access_token,
                "refresh_token": new_refresh_token,
            },
        }
    )
    response = _set_auth_cookies(response, new_access_token, new_refresh_token)

    return response


@auth_router.get("/get-session")
async def get_current_session(
    request: Request,
    session: Session = Depends(get_session),
):
    """Get current session - Better Auth compatible endpoint"""
    token = None

    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    # Try cookie if no header
    if not token:
        token = request.cookies.get("auth_token")

    if not token:
        return {"user": None, "session": None}

    auth_service = AuthService(session)

    try:
        user = await auth_service.get_current_user(token)
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "emailVerified": False,
                "image": None,
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
            },
            "session": {
                "token": token,
                "expiresAt": None,
                "ipAddress": None,
                "userAgent": None,
            },
        }
    except HTTPException:
        return {"user": None, "session": None}
