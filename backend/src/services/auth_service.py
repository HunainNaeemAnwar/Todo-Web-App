import jwt
import hashlib
import warnings
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from sqlmodel import Session, select
from passlib.context import CryptContext
from fastapi import HTTPException, status
from src.models.user import User
from src.utils.jwt_validator import create_access_token, verify_token

warnings.filterwarnings(
    "ignore", category=DeprecationWarning, module="passlib.handlers.bcrypt"
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    async def authenticate_user(self, email: str, password: str):
        """Authenticate user and return JWT token"""
        user = self.session.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

        if not user or not pwd_context.verify(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your account has been deactivated. Please contact support.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(data={"user_id": str(user.id)})

        return {"access_token": access_token, "token_type": "bearer"}

    async def get_current_user(self, token: str):
        """Get current user from JWT token"""
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id_raw: Any = payload.get("user_id")
        if user_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id: str = str(user_id_raw)

        user = self.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    async def logout_user(self, token: str):
        """
        Logout user. In a stateless JWT system, this is typically a client-side operation.
        The server doesn't maintain session state, so logout is about clearing the token on the client.
        """
        pass

    async def verify_refresh_token(self, refresh_token: str) -> dict:
        """Verify refresh token and return payload."""
        payload = verify_token(refresh_token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify user still exists
        user = self.session.execute(
            select(User).where(User.id == str(user_id))
        ).scalar_one_or_none()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    def authenticate_user_sync(self, email: str, password: str):
        """
        Synchronous version of authenticate_user for testing purposes.
        """
        user = self.session.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

        if not user or not pwd_context.verify(password, user.hashed_password):
            raise ValueError("Invalid credentials")

        if not user.is_active:
            raise ValueError("Inactive user")

        access_token = create_access_token(data={"user_id": str(user.id)})

        return {"access_token": access_token, "token_type": "bearer"}

    def get_current_user_sync(self, token: str):
        """
        Synchronous version of get_current_user for testing purposes.
        """
        payload = verify_token(token)
        if payload is None:
            raise ValueError("Could not validate credentials")

        user_id_raw: Any = payload.get("user_id")
        if user_id_raw is None:
            raise ValueError("Could not validate credentials")
        user_id: str = str(user_id_raw)

        user = self.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        if user is None:
            raise ValueError("User not found")

        return user

    def logout_user_sync(self, token: str):
        """
        Synchronous version of logout_user for testing purposes.
        """
        pass
