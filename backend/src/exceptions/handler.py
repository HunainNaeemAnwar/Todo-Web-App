from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any
import traceback
import structlog

logger = structlog.get_logger(__name__)


def setup_exception_handlers(app: FastAPI):
    """Set up global exception handlers for the application"""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions according to RFC 7807"""
        logger.warning(
            event="http_exception",
            status_code=exc.status_code,
            detail=exc.detail,
            url=str(request.url),
            method=request.method,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "type": "about:blank",
                "title": get_http_status_title(exc.status_code),
                "status": exc.status_code,
                "detail": exc.detail,
                "instance": str(request.url),
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle general exceptions according to RFC 7807"""
        logger.error(
            event="general_exception",
            error=str(exc),
            traceback=traceback.format_exc(),
            url=str(request.url),
            method=request.method,
        )

        return JSONResponse(
            status_code=500,
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An unexpected error occurred",
                "instance": str(request.url),
            },
        )


def get_http_status_title(status_code: int) -> str:
    """Get a human-readable title for an HTTP status code"""
    status_titles = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
    }

    return status_titles.get(status_code, "Unknown Error")
