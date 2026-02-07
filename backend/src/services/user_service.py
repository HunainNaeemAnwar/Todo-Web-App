import re
import warnings
from typing import cast
from sqlmodel import Session, select
from passlib.context import CryptContext
from typing import Optional
from fastapi import HTTPException, status
from src.models.user import User, UserCreate, UserUpdate
from src.utils.jwt_validator import verify_token

warnings.filterwarnings(
    "ignore", category=DeprecationWarning, module="passlib.handlers.bcrypt"
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength according to requirements:
    - Minimum 8 characters
    - Mixed case (upper and lower)
    - Contains numbers
    - Contains special characters
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"

    return True, "Password is valid"


class UserService:
    def __init__(self, session: Session):
        self.session = session

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify plain password against hashed password"""
        return pwd_context.verify(plain_password, hashed_password)  # type: ignore[return-value]

    def get_password_hash(self, password: str) -> str:
        """Hash a plain password"""
        return pwd_context.hash(password)  # type: ignore[return-value]

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user with hashed password"""
        is_valid, message = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

        existing_user = self.session.execute(
            select(User).where(User.email == user_data.email)
        ).scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
            )
        hashed_password = self.get_password_hash(user_data.password)

        # Create user object
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            name=user_data.name or "",
        )

        # Add to session and commit
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user

    def create_user_sync(self, user_data: UserCreate) -> User:
        """Synchronous version of create_user for testing purposes"""
        is_valid, message = validate_password_strength(user_data.password)
        if not is_valid:
            raise ValueError(message)

        existing_user = self.session.execute(
            select(User).where(User.email == user_data.email)
        ).scalar_one_or_none()

        if existing_user:
            raise ValueError("Email already registered")

        hashed_password = self.get_password_hash(user_data.password)

        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            name=user_data.name or "",
        )

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user

    def get_user_by_email_sync(self, email: str) -> Optional[User]:
        """Synchronous version of get_user_by_email for testing purposes"""
        statement = select(User).where(User.email == email)
        user = self.session.execute(statement).scalar_one_or_none()
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email"""
        statement = select(User).where(User.email == email)
        user = self.session.execute(statement).scalar_one_or_none()
        return cast(Optional[User], user)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by ID"""
        user = self.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        return cast(Optional[User], user)

    async def update_user(
        self, user_id: str, user_update: UserUpdate
    ) -> Optional[User]:
        """Update user information"""
        user = self.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        user = cast(Optional[User], user)

        if not user:
            return None

        if user_update.email:
            user.email = user_update.email

        if user_update.name is not None:
            user.name = user_update.name

        if user_update.password:
            is_valid, message = validate_password_strength(user_update.password)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=message
                )
            user.hashed_password = self.get_password_hash(user_update.password)

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user

    async def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        user = self.session.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()

        if not user:
            return False

        self.session.delete(user)
        self.session.commit()
        return True
