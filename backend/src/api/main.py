# Import startup configuration first to ensure proper environment setup
from src.startup_config import configure_environment

configure_environment()

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import structlog
from contextlib import asynccontextmanager
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.api.auth_router import auth_router
from src.api.task_router import task_router
from src.api.user_router import user_router
from src.api.analytics_router import analytics_router
from src.api.chatkit_router import router as chatkit_router
from src.api.notification_router import notification_router
from src.mcp.server import mcp
from src.logging_.logger import setup_logging
from src.exceptions.handler import setup_exception_handlers
from src.logging_.observability import ObservabilityMiddleware
import os
import jwt
import time
from jwt.algorithms import RSAAlgorithm
from typing import Dict, Any, cast
from sqlmodel import Session
from dotenv import load_dotenv
import os

# Load .env file from the backend directory
# Use __file__ to get absolute path regardless of working directory
full_path = os.path.abspath(__file__)
# Path structure: /home/hunain/DO/it/backend/src/api/main.py
# We need: /home/hunain/DO/it/backend/.env
backend_src_dir = os.path.dirname(full_path)  # /home/hunain/DO/it/backend/src/api
backend_src_parent = os.path.dirname(backend_src_dir)  # /home/hunain/DO/it/backend/src
backend_dir = os.path.dirname(backend_src_parent)  # /home/hunain/DO/it/backend
env_path = os.path.join(backend_dir, ".env")
print(f"Loading .env from: {env_path}")  # Debug
if os.path.exists(env_path):
    load_dotenv(env_path)
    print("✓ .env loaded successfully")
else:
    print("⚠ .env not found, trying fallback")
    # Fallback to current directory
    load_dotenv()
    print("✓ Fallback .env loaded")

setup_logging()
logger = structlog.get_logger(__name__)

limiter = Limiter(key_func=get_remote_address)


def get_cors_origins() -> list:
    """Get CORS origins from environment variable."""
    origins_str = os.getenv("ALLOWED_ORIGINS", "")
    if origins_str:
        return [origin.strip() for origin in origins_str.split(",")]
    return ["http://localhost:3000", "http://localhost:5173"]


def validate_environment() -> None:
    """Validate required environment variables at startup."""
    required_vars = [
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
    ]

    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Please set these in your .env file."
        )

    # Validate JWT secret strength
    secret = os.getenv("BETTER_AUTH_SECRET", "")
    if len(secret) < 32:
        raise ValueError(
            f"BETTER_AUTH_SECRET must be at least 32 characters long. "
            f"Current length: {len(secret)}"
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup initiated")

    # Validate environment at startup
    try:
        validate_environment()
        logger.info("Environment validation passed")
    except ValueError as e:
        logger.error("Environment validation failed", error=str(e))
        raise

    yield
    logger.info("Application shutdown initiated")


app = FastAPI(
    title="Task Management API",
    description="API for managing tasks with user authentication",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)


def health_check():
    """Comprehensive health check endpoint."""
    from sqlalchemy import text
    from src.database.database import get_engine

    health_status = {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "checks": {},
    }

    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": (
                str(e)[:200]
                if os.getenv("ENVIRONMENT") != "production"
                else "Database connection failed"
            ),
        }
        health_status["status"] = "unhealthy"

    return health_status


app.get("/health")(health_check)
app.get("/api/health")(health_check)


@app.post("/api/admin/reset-connections")
async def reset_connections():
    """Reset database connection pool (admin endpoint)."""
    from src.database.database import reset_connection_pool

    try:
        reset_connection_pool()
        return {"status": "success", "message": "Connection pool reset successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


setup_exception_handlers(app)

app.state.limiter = limiter

app.add_middleware(ObservabilityMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(task_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(user_router, prefix="/api/user", tags=["user"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(chatkit_router, prefix="/api/chatkit", tags=["chatkit"])
app.include_router(
    notification_router, prefix="/api/notifications", tags=["notifications"]
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    # Get reset time from exc.reset_at attribute
    retry_after = getattr(exc, "reset_at", None)
    headers = {}
    if retry_after:
        headers["Retry-After"] = str(int(retry_after))
    return Response(
        content="Rate limit exceeded",
        status_code=429,
        headers=headers,
    )


def get_token_from_header(authorization: str | None) -> str | None:
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return None


from typing import cast



# Mount MCP server if available
try:
    # type: ignore[arg-type]  # FastMCP is compatible with ASGIApp
    app.mount("/mcp", mcp)  # type: ignore[arg-type]
except Exception:
    pass


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Task Management API",
        "docs": "/docs",
        "version": "1.0.0",
    }
