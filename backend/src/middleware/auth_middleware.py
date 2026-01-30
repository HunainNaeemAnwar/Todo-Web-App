from fastapi import Request, HTTPException, status
from fastapi.security.http import HTTPAuthorizationCredentials, HTTPBearer
from src.utils.jwt_validator import verify_token
from src.database.database import engine
from sqlmodel import Session, select
from src.models.user import User
import structlog

logger = structlog.get_logger(__name__)

class JWTAuth:
    def __init__(self):
        self.security = HTTPBearer()

    async def __call__(self, request: Request) -> str:
        credentials: HTTPAuthorizationCredentials | None = await self.security(request)

        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Bearer token required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id_raw = payload.get("user_id")
        if not user_id_raw:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id: str = str(user_id_raw)

        request.state.user_id = user_id
        return user_id