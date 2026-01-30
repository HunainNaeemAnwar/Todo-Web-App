"""
Phase 3 Test Fixtures
Test-Driven Development (TDD) fixtures for AI-Powered Conversational Todo

Provides mock JWT tokens, test conversations, messages, and task factories
for all Phase 3 testing scenarios.
"""

import pytest
import uuid
from datetime import datetime, timezone
from typing import Generator, Optional
from unittest.mock import MagicMock, patch

from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient
from fastapi import Depends

from src.api.main import app
from src.database.database import get_session, DATABASE_URL
from src.models.user import User
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message
from src.api.dependencies import CurrentUser


# Test database engine (use SQLite for tests to avoid Neon rate limits)
TEST_DATABASE_URL = "sqlite:///./test_phase3.db"


class MockCurrentUser:
    """Mock CurrentUser dependency for testing"""
    
    def __init__(self, user_id: str = None):
        self.id = user_id or str(uuid.uuid4())
        self.email = f"test_{self.id[:8]}@example.com"
        self.created_at = datetime.now(timezone.utc)


def create_mock_jwt_payload(user_id: str = None) -> dict:
    """Create mock JWT payload for testing"""
    user_id = user_id or str(uuid.uuid4())
    return {
        "sub": user_id,
        "email": f"test_{user_id[:8]}@example.com",
        "exp": datetime.now(timezone.utc).timestamp() + 3600,
        "iat": datetime.now(timezone.utc).timestamp(),
    }


# Test database engine
test_engine = create_engine(TEST_DATABASE_URL, echo=False)


@pytest.fixture(scope="session")
def test_db_engine():
    """Create test database engine"""
    return test_engine


@pytest.fixture(scope="session")
def setup_test_db(test_db_engine):
    """Create all tables in test database"""
    SQLModel.metadata.create_all(test_db_engine)
    yield test_db_engine
    SQLModel.metadata.drop_all(test_db_engine)


@pytest.fixture
def clean_db(setup_test_db):
    """Clean database before each test"""
    # Get all table names
    from sqlmodel import text
    with setup_test_db.connect() as conn:
        # Delete in order due to foreign keys
        conn.execute(text("DELETE FROM messages"))
        conn.execute(text("DELETE FROM conversations"))
        conn.execute(text("DELETE FROM tasks"))
        conn.execute(text("DELETE FROM users"))
        conn.commit()


@pytest.fixture
def session(clean_db, setup_test_db) -> Generator[Session, None, None]:
    """Create a test database session"""
    with Session(setup_test_db) as sess:
        yield sess


@pytest.fixture
def client(session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database session override"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_jwt_token() -> str:
    """Create a mock JWT token for testing"""
    # This is a mock token - in real tests, use proper JWT encoding
    user_id = str(uuid.uuid4())
    payload = create_mock_jwt_payload(user_id)
    # Base64 encode the payload (simplified for testing)
    import base64
    header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').decode().rstrip("=")
    body = base64.urlsafe_b64encode(str(payload).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(b"mock_signature").decode().rstrip("=")
    return f"{header}.{body}.{signature}"


@pytest.fixture
def mock_current_user() -> MockCurrentUser:
    """Create a mock CurrentUser for testing"""
    return MockCurrentUser()


@pytest.fixture
def auth_headers(mock_jwt_token: str) -> dict:
    """Create authorization headers for authenticated requests"""
    return {"Authorization": f"Bearer {mock_jwt_token}"}


# ============ Test Data Factories ============

@pytest.fixture
def test_user(clean_db, session) -> User:
    """Create a test user"""
    user = User(
        id=str(uuid.uuid4()),
        email=f"test_{uuid.uuid4().hex[:8]}@example.com",
        hashed_password="hashed_password",
        created_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def test_user_id(test_user: User) -> str:
    """Get test user ID"""
    return test_user.id


@pytest.fixture
def test_conversation(clean_db, session, test_user_id: str) -> Conversation:
    """Create a test conversation"""
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=test_user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@pytest.fixture
def test_conversation_id(test_conversation: Conversation) -> str:
    """Get test conversation ID"""
    return test_conversation.id


@pytest.fixture
def test_messages(clean_db, session, test_conversation_id: str, test_user_id: str) -> list[Message]:
    """Create test messages for a conversation"""
    messages = []
    now = datetime.now(timezone.utc)
    
    user_msg = Message(
        id=str(uuid.uuid4()),
        user_id=test_user_id,
        conversation_id=test_conversation_id,
        role="user",
        content="Add buy groceries",
        created_at=now,
    )
    
    assistant_msg = Message(
        id=str(uuid.uuid4()),
        user_id=test_user_id,
        conversation_id=test_conversation_id,
        role="assistant",
        content="Added task: Buy groceries",
        created_at=now,
    )
    
    messages.extend([user_msg, assistant_msg])
    for msg in messages:
        session.add(msg)
    
    session.commit()
    return messages


@pytest.fixture
def test_task(clean_db, session, test_user_id: str) -> Task:
    """Create a test task"""
    task = Task(
        id=str(uuid.uuid4()),
        user_id=test_user_id,
        title="Test Task",
        description="Test description",
        completed=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@pytest.fixture
def test_task_id(test_task: Task) -> str:
    """Get test task ID"""
    return test_task.id


@pytest.fixture
def test_tasks(clean_db, session, test_user_id: str) -> list[Task]:
    """Create multiple test tasks"""
    tasks = []
    now = datetime.now(timezone.utc)
    
    for i in range(3):
        task = Task(
            id=str(uuid.uuid4()),
            user_id=test_user_id,
            title=f"Task {i+1}",
            description=f"Description {i+1}",
            completed=i % 2 == 0,  # Alternate completed status
            created_at=now,
            updated_at=now,
        )
        tasks.append(task)
        session.add(task)
    
    session.commit()
    for task in tasks:
        session.refresh(task)
    return tasks


# ============ MCP Context Mock ============

class MockMCPContext:
    """Mock MCP context for testing tool functions"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.request_context = MagicMock()
        self.request_context.user_id = user_id


@pytest.fixture
def mock_mcp_context(test_user_id: str) -> MockMCPContext:
    """Create mock MCP context"""
    return MockMCPContext(test_user_id)


# ============ Chat Request Factories ============

@pytest.fixture
def chat_request_factory():
    """Factory for creating chat requests"""
    
    def create(
        conversation_id: Optional[str] = None,
        message: str = "Add buy groceries"
    ) -> dict:
        request = {"message": message}
        if conversation_id:
            request["conversation_id"] = conversation_id
        return request
    
    return create


# ============ OpenAI Agent Mock ============

@pytest.fixture
def mock_agent_response():
    """Mock OpenAI agent response"""
    return {
        "conversation_id": str(uuid.uuid4()),
        "response": "Added task: Buy groceries",
        "tool_calls": ["add_task"]
    }


# ============ Performance Testing ============

@pytest.fixture
def performance_timer():
    """Timer fixture for performance testing"""
    import time
    
    class Timer:
        def __init__(self):
            self.start_time = None
            self.elapsed = None
        
        def __enter__(self):
            self.start_time = time.perf_counter()
            return self
        
        def __exit__(self, *args):
            self.elapsed = time.perf_counter() - self.start_time
    
    return Timer
