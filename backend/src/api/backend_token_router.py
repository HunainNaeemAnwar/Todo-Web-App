from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Optional
from src.utils.jwt_validator import verify_token
from src.database.database import engine
from sqlmodel import Session, select
from src.models.user import User
import structlog

logger = structlog.get_logger(__name__)

backend_token_router = APIRouter()

@backend_token_router.get("/get-backend-token")
async def get_backend_token(request: Request):
    """Get JWT token from cookie for backend API calls"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        auth_header = request.headers.get("cookie")
        
    token = None
    
    if auth_header:
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        elif "auth_token=" in auth_header:
            for cookie in auth_header.split(";"):
                cookie = cookie.strip()
                if cookie.startswith("auth_token="):
                    token = cookie.split("=")[1]
                    break
    
    if not token:
        return {"token": None}
    
    payload = verify_token(token)
    if payload is None:
        return {"token": None}
    
    user_id = payload.get("user_id")
    if not user_id:
        return {"token": None}
    
    return {"token": token}
