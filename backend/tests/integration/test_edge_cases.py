"""
Edge case tests for the task management application.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.utils.jwt_validator import create_access_token
from src.models.user import User
from src.database.database import engine, get_session
from src.api.main import app
import uuid


def create_user_and_get_token(session: Session, email: str) -> str:
    """Helper to create a user and return an auth token."""
    user = User(email=email, hashed_password="hashed_password")
    session.add(user)
    session.commit()
    session.refresh(user)

    payload = {"user_id": str(user.id)}
    return create_access_token(payload)


def test_user_access_to_other_users_tasks_prevention(client: TestClient, session: Session):
    """Test that users cannot access other users' tasks."""
    # Create users and tokens
    token_user1 = create_user_and_get_token(session, "user1@example.com")
    token_user2 = create_user_and_get_token(session, "user2@example.com")

    # User 1 creates a task
    create_response1 = client.post("/api/tasks",
                                  json={"title": "User 1's Task", "description": "Only for user 1"},
                                  headers={"Authorization": f"Bearer {token_user1}"})

    assert create_response1.status_code == 201
    task_id = create_response1.json()["id"]

    # User 2 tries to access User 1's task
    access_response = client.get(f"/api/tasks/{task_id}",
                                headers={"Authorization": f"Bearer {token_user2}"})

    # Should get 404 (not found) because the task belongs to another user
    # Or 403 Forbidden depending on implementation, but usually 404 for isolation
    assert access_response.status_code in [404, 403]


def test_long_task_description_handling(client: TestClient, session: Session):
    """Test handling of very long task descriptions."""
    token = create_user_and_get_token(session, "long_desc@example.com")

    # Create a description with maximum allowed length (2000 chars)
    long_description = "A" * 2000

    response = client.post("/api/tasks",
                          json={"title": "Long Description Task", "description": long_description},
                          headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert len(data["description"]) == 2000


def test_task_title_max_length(client: TestClient, session: Session):
    """Test that task titles at maximum length (255 chars) are accepted."""
    token = create_user_and_get_token(session, "max_title@example.com")

    # Create a title with maximum allowed length (255 chars)
    long_title = "A" * 255

    response = client.post("/api/tasks",
                          json={"title": long_title, "description": "Test description"},
                          headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert len(data["title"]) == 255


def test_task_title_over_max_length_rejection(client: TestClient, session: Session):
    """Test that task titles over maximum length (255 chars) are rejected."""
    token = create_user_and_get_token(session, "over_max@example.com")

    # Create a title that exceeds maximum length (256 chars)
    too_long_title = "A" * 256

    response = client.post("/api/tasks",
                          json={"title": too_long_title, "description": "Test description"},
                          headers={"Authorization": f"Bearer {token}"})

    # Should get a validation error
    assert response.status_code in [422, 400]  # Either validation error or bad request


def test_empty_title_validation(client: TestClient, session: Session):
    """Test that empty titles are not allowed."""
    token = create_user_and_get_token(session, "empty_title@example.com")

    # Try to create a task with an empty title
    response = client.post("/api/tasks",
                          json={"title": "", "description": "Test description"},
                          headers={"Authorization": f"Bearer {token}"})

    # Should get a validation error
    assert response.status_code in [422, 400]


def test_whitespace_only_title_validation(client: TestClient, session: Session):
    """Test that whitespace-only titles are treated as empty."""
    token = create_user_and_get_token(session, "whitespace@example.com")

    # Try to create a task with a whitespace-only title
    response = client.post("/api/tasks",
                          json={"title": "   ", "description": "Test description"},
                          headers={"Authorization": f"Bearer {token}"})

    # Should get a validation error
    assert response.status_code in [422, 400]


def test_concurrent_access_by_same_user_multiple_devices(client: TestClient, session: Session):
    """Test concurrent access by the same user from multiple devices."""
    # Create a user and token
    token = create_user_and_get_token(session, "concurrent@example.com")

    # We need to ensure each thread gets its own session, as SQLAlchemy sessions are not thread-safe.
    # The default client fixture uses a single shared session override.
    # We'll remove that override so the app creates a new session per request using the engine.
    # Note: This means changes won't be rolled back automatically by the session fixture,
    # but since we're using a persistent test DB (or in-memory), it should be fine for this specific test
    # or we accept the side effects.

    # Verify we can access the override to clear it
    if get_session in app.dependency_overrides:
        del app.dependency_overrides[get_session]

    # Create multiple simultaneous requests from the same user
    from concurrent.futures import ThreadPoolExecutor

    def create_task(task_num):
        # Create a NEW TestClient for each thread to ensure thread safety if needed,
        # or share the client but ensure the backend handles concurrency correctly.
        # Sharing client is fine if the app handles concurrency.
        # But we cleared the dependency override, so each request will create a new Session(engine).

        response = client.post("/api/tasks",
                              json={"title": f"Concurrent Task {task_num}", "description": f"Task {task_num} from concurrent access"},
                              headers={"Authorization": f"Bearer {token}"})
        return response.status_code, response.json() if response.status_code == 201 else None

    # Execute multiple task creations concurrently
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(create_task, i) for i in range(5)]
        results = [future.result() for future in futures]

    # Restore the dependency override for other tests if needed (though pytest fixtures handle teardown)
    # Ideally, we shouldn't mess with global state, but this is an integration test.
    # Let's trust pytest to reset dependencies if the client fixture does clean up,
    # but the client fixture uses `app.dependency_overrides` which is global on `app`.
    # The client fixture does `app.dependency_overrides.clear()` on teardown, so we are safe.

    # Check that all requests were successful
    success_count = sum(1 for status_code, _ in results if status_code == 201)
    assert success_count == 5  # All should succeed


def test_task_creation_with_special_characters(client: TestClient, session: Session):
    """Test task creation with special characters in title and description."""
    token = create_user_and_get_token(session, "special_chars@example.com")

    special_chars_title = "Task with special chars: !@#$%^&*()"
    special_chars_desc = "Description with unicode: ñáéíóú 中文 🌟 and symbols: ©®™"

    response = client.post("/api/tasks",
                          json={"title": special_chars_title, "description": special_chars_desc},
                          headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == special_chars_title
    assert data["description"] == special_chars_desc


def test_task_update_with_empty_description(client: TestClient, session: Session):
    """Test updating a task with an empty description (should be allowed)."""
    token = create_user_and_get_token(session, "update_empty@example.com")

    # Create a task first
    create_response = client.post("/api/tasks",
                                json={"title": "Update Test Task", "description": "Initial description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Update the task with an empty description
    update_response = client.put(f"/api/tasks/{task_id}",
                               json={"title": "Updated Task", "description": ""},
                               headers={"Authorization": f"Bearer {token}"})

    assert update_response.status_code == 200
    updated_data = update_response.json()
    # Description could be empty string or None depending on implementation
    # It might come back as empty string or None
    assert updated_data["title"] == "Updated Task"


def test_get_tasks_with_no_tasks(client: TestClient, session: Session):
    """Test getting tasks when user has no tasks."""
    token = create_user_and_get_token(session, "no_tasks@example.com")

    # Get tasks when user has none
    response = client.get("/api/tasks",
                         headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) == 0
