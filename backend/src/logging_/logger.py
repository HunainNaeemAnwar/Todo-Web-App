import structlog
import logging
from datetime import datetime
import json
from typing import Any, Dict

# Configure structlog
def setup_logging():
    """Set up structured logging configuration"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(serializer=json.dumps)
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
    )

def get_logger(name: str) -> structlog.BoundLogger:
    """Get a logger instance with the specified name"""
    return structlog.get_logger(name)

# Log a structured log entry
def log_event(event_type: str, message: str, **kwargs) -> None:
    """Log an event with structured data"""
    logger = get_logger(__name__)
    logger.info(
        event=event_type,
        message=message,
        **kwargs
    )

def log_error(event_type: str, message: str, error: Exception, **kwargs) -> None:
    """Log an error with structured data"""
    logger = get_logger(__name__)
    logger.error(
        event=event_type,
        message=message,
        error=str(error),
        error_type=type(error).__name__,
        **kwargs
    )