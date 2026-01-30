import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient
from src.api.main import app
from src.database.database import get_session, DATABASE_URL
from src.models.user import User  # Import models to register them with SQLModel
from src.models.task import Task  # Import Task model as well
import sys
import os

# Add backend to python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Use the existing DATABASE_URL (Postgres)
# Make sure to install psycopg2-binary if not present, though requirements say psycopg[binary]
engine = create_engine(DATABASE_URL)

@pytest.fixture(name="session", scope="function")
def session_fixture():
    # Schema initialization should be handled at a higher level or safely here
    with Session(engine) as session:
        # Just clean data before each test for isolation
        try:
            for table in reversed(SQLModel.metadata.sorted_tables):
                session.execute(table.delete())
            session.commit()
        except Exception:
            session.rollback()

        yield session

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure tables are created once per test session"""
    SQLModel.metadata.create_all(engine)
    yield
    # Optional: cleanup tables at the end of session
    # SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
