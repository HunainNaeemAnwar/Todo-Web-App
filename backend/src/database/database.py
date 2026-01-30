from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlmodel import Session, create_engine
from contextlib import contextmanager
import os
from dotenv import load_dotenv

# Load environment variables
from pathlib import Path
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/task_management")

# Create optimized engine with connection pooling for Neon Serverless PostgreSQL
# Neon closes idle connections after ~5 minutes, so we need aggressive recycling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,  # Reduced for serverless - Neon has connection limits
    max_overflow=10,  # Reduced overflow
    pool_pre_ping=True,  # Test connections before using
    pool_recycle=300,  # Recycle connections every 5 minutes (Neon's idle timeout)
    echo=False,
    pool_timeout=10,  # Reduced timeout to fail fast
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "connect_timeout": 10,
    },
)

def get_session():
    """Dependency for FastAPI to get database session"""
    with Session(engine) as session:
        yield session


# Data retention policy: User data is retained indefinitely as per requirement FR-009
# No automatic deletion of user data is implemented
DATA_RETENTION_POLICY = "indefinite"  # As per FR-009