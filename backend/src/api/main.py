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
from src.database.database import engine
from src.api.auth_router import auth_router
from src.api.task_router import task_router
from src.api.backend_token_router import backend_token_router
from src.api.chat_router import router as chat_router
from src.api.chatkit_router import router as chatkit_router
from src.mcp.server import mcp
from src.logging_.logger import setup_logging
from src.exceptions.handler import setup_exception_handlers
from src.logging_.observability import ObservabilityMiddleware
import os
import jwt
from jwt.algorithms import RSAAlgorithm
from typing import Dict, Any
from dotenv import load_dotenv
import base64

load_dotenv()

setup_logging()
logger = structlog.get_logger(__name__)

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup initiated")
    yield
    logger.info("Application shutdown initiated")

app = FastAPI(
    title="Task Management API",
    description="API for managing tasks with user authentication",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

setup_exception_handlers(app)

app.state.limiter = limiter

app.add_middleware(ObservabilityMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin"]
)

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(task_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(backend_token_router, prefix="/api", tags=["backend-token"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(chatkit_router, prefix="/api", tags=["chatkit"])

# Mount MCP server
app.mount("/mcp", mcp.streamable_http_app())

@app.get("/")
def read_root():
    return {"message": "Task Management API"}