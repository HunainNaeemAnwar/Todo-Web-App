"""
Optimized database connection pool for Neon Serverless PostgreSQL.

Best practices from SQLAlchemy documentation:
- Use LIFO to prevent stale connections during idle periods
- Use pool_pre_ping to validate connections before use
- Optimize pool size for serverless workloads
- Lazy initialization to avoid startup blocking
"""

from sqlalchemy import create_engine, text, event
from sqlalchemy.pool import QueuePool
from sqlmodel import Session, create_engine as sqlmodel_create_engine
from contextlib import contextmanager
import os
import time
import logging
from pathlib import Path
from typing import Any, Optional, Generator

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://user:password@localhost/task_management"
)

_engine: Any = None
_engine_initialized = False
_connection_retries = 0
_max_connection_retries = 3


def create_optimized_engine():
    """
    Create an optimized SQLAlchemy engine for Neon serverless PostgreSQL.
    """
    global _engine, _engine_initialized, _connection_retries

    if _engine_initialized and _engine is not None:
        return _engine

    try:
        connect_args = {
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 5,
            "keepalives_count": 3,
            "connect_timeout": 10,
            "target_session_attrs": "read-write",
        }

        _engine = sqlmodel_create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=10,
            pool_pre_ping=True,
            pool_use_lifo=True,
            pool_recycle=300,
            pool_timeout=30,
            echo=False,
            connect_args=connect_args,
        )

        @event.listens_for(_engine, "connect")
        def set_session_vars(dbapi_connection, connection_record):
            try:
                cursor = dbapi_connection.cursor()
                cursor.execute("SET statement_timeout = '30s'")
                cursor.close()
            except Exception:
                pass

        _engine_initialized = True
        _connection_retries = 0
        logger.info("Database engine created with optimized Neon settings")
        return _engine

    except Exception as e:
        _connection_retries += 1
        if _connection_retries >= _max_connection_retries:
            logger.error(
                f"Failed to create optimized engine after {_max_connection_retries} attempts: {e}"
            )
            return None
        logger.warning(f"Engine creation attempt {_connection_retries} failed: {e}")
        raise


def get_engine() -> Any:
    """Get the database engine (lazy initialization)."""
    return create_optimized_engine()


@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.

    This properly handles exceptions and cleanup without generator issues.
    Use this in routes that need direct session access.
    """
    engine = get_engine()
    if engine is None:
        raise Exception("Database engine not available")

    session = Session(engine)
    try:
        # Test connection
        session.execute(text("SELECT 1"))
        yield session
    except Exception as e:
        session.rollback()
        logger.error(f"Session error: {e}")
        raise
    finally:
        try:
            session.close()
        except Exception:
            pass


def get_session_factory():
    """
    Returns a callable that creates a new session.

    Usage:
        async def route(session: Session = Depends(get_session_factory())):
            ...
    """

    def factory() -> Session:
        engine = get_engine()
        if engine is None:
            raise Exception("Database engine not available")
        session = Session(engine)
        # Test connection
        session.execute(text("SELECT 1"))
        return session

    return factory


def get_managed_session() -> Session:
    """
    Get a managed session that must be explicitly closed.

    Usage:
        async def route(session = Depends(get_managed_session)):
            try:
                # use session
            finally:
                session.close()
    """
    engine = get_engine()
    if engine is None:
        raise Exception("Database engine not available")
    session = Session(engine)
    session.execute(text("SELECT 1"))
    return session


def get_session():
    """
    Generator-based session dependency for FastAPI.

    Use with: session: Session = Depends(get_session)

    FastAPI automatically handles closing the session after the request.
    """
    engine = get_engine()
    if engine is None:
        raise Exception("Database engine not available")

    session = Session(engine)
    try:
        session.execute(text("SELECT 1"))
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        try:
            session.close()
        except Exception:
            pass


def check_database_health() -> tuple[bool, str]:
    """Check if database connection is healthy."""
    try:
        eng = get_engine()
        if eng is None:
            return False, "Engine not initialized"
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "healthy"
    except Exception as e:
        return False, str(e)[:100]


def reset_connection_pool() -> Any:
    """Reset the connection pool to handle stale connections."""
    global _engine, _engine_initialized, _connection_retries
    if _engine:
        try:
            _engine.dispose()
            logger.info("Connection pool disposed")
        except Exception as e:
            logger.warning(f"Error disposing pool: {e}")
    _engine = None
    _engine_initialized = False
    _connection_retries = 0
    _engine = create_optimized_engine()
    return _engine


def dispose_engine():
    """Dispose the engine completely."""
    global _engine, _engine_initialized, _connection_retries
    if _engine:
        try:
            _engine.dispose()
        except Exception:
            pass
    _engine = None
    _engine_initialized = False
    _connection_retries = 0


# For backward compatibility - create engine on import
try:
    engine = create_optimized_engine()
    if engine is None:
        logger.warning(
            "Database engine could not be created - database may be unavailable"
        )
        engine = None
except Exception as e:
    logger.warning(f"Database engine creation deferred: {e}")
    engine = None

DATA_RETENTION_POLICY = "indefinite"
