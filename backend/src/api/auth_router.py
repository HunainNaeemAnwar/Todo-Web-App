from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Optional
from sqlmodel import Session
from src.database.database import get_session  # type: ignore[attr-defined]
from src.models.user import User, UserCreate, UserResponse
from src.services.user_service import UserService
from src.services.auth_service import AuthService
from src.utils.jwt_validator import create_access_token
import structlog

logger = structlog.get_logger(__name__)

auth_router = APIRouter()
security = HTTPBearer()

SessionDep = Annotated[Session, Depends(get_session)]  # type: ignore[valid-type]


@auth_router.post("/sign-up/email", response_model=dict, status_code=status.HTTP_201_CREATED)
@auth_router.post("/sign-up/email/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def sign_up(
    body: Annotated[
        dict,
        Body(
            examples=[{
                "email": "user@example.com",
                "password": "SecureP@ss123",
                "name": "John Doe",
            }]
        )
    ],
    session: Session = Depends(get_session)
):
    """Register a new user - Better Auth compatible endpoint"""
    email = body.get("email")
    password = body.get("password")
    name = body.get("name", "")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user_service = UserService(session)
    user = await user_service.create_user(UserCreate(email=email, password=password, name=name))

    access_token = create_access_token(data={"user_id": str(user.id)})

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
            "expiresAt": None,
            "ipAddress": None,
            "userAgent": None,
        }
    }


@auth_router.post("/sign-in/email")
@auth_router.post("/sign-in/email/")
async def sign_in(
    body: Annotated[
        dict,
        Body(
            examples=[{
                "email": "user@example.com",
                "password": "SecureP@ss123",
            }]
        )
    ],
    session: Session = Depends(get_session)
):
    """Authenticate user and return JWT token - Better Auth compatible endpoint"""
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    auth_service = AuthService(session)
    token_data = await auth_service.authenticate_user(email, password)

    user = await auth_service.get_current_user(token_data["access_token"])

    logger.info("User signed in successfully", user_id=str(user.id), email=email)

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
            "token": token_data["access_token"],
            "expiresAt": None,
            "ipAddress": None,
            "userAgent": None,
        }
    }


@auth_router.post("/sign-out")
@auth_router.post("/sign-out/")
async def sign_out():
    """Logout current user - Better Auth compatible endpoint"""
    return {"message": "Successfully signed out"}


@auth_router.get("/get-session")
@auth_router.get("/get-session/")
async def get_current_session(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
    session: SessionDep
):
    """Get current session - Better Auth compatible endpoint"""
    if not credentials:
        return {"user": None, "session": None}

    token = credentials.credentials
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
            }
        }
    except HTTPException:
        return {"user": None, "session": None}
