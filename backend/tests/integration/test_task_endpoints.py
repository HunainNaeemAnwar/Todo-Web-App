"""
Integration tests for task endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.api.main import app
from src.utils.jwt_validator import create_access_token
import uuid
from src.models.user import User

def get_auth_token(session: Session, email: str = "test@example.com"):
    """Helper function to create a user and return an authentication token."""
    # Create a real user in the database to satisfy foreign key constraints
    user = User(email=email, hashed_password="hashed_password")
    session.add(user)
    session.commit()
    session.refresh(user)

    payload = {"user_id": str(user.id)}
    return create_access_token(payload)


def test_create_task_success(client: TestClient, session: Session):
    """Test successful task creation."""
    token = get_auth_token(session)

    response = client.post("/api/tasks",
                          json={"title": "Test Task", "description": "Test Description"},
                          headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Task"
    assert data["description"] == "Test Description"
    assert data["completed"] is False


def test_get_tasks_success(client: TestClient, session: Session):
    """Test getting tasks for a user."""
    token = get_auth_token(session)

    # Create a task first
    client.post("/api/tasks",
                json={"title": "Test Task", "description": "Test Description"},
                headers={"Authorization": f"Bearer {token}"})

    # Get tasks
    response = client.get("/api/tasks",
                         headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 1
    # Find our test task
    test_task = next((task for task in tasks if task["title"] == "Test Task"), None)
    assert test_task is not None


def test_get_task_by_id_success(client: TestClient, session: Session):
    """Test getting a specific task by ID."""
    token = get_auth_token(session)

    # Create a task first
    create_response = client.post("/api/tasks",
                                json={"title": "Test Task", "description": "Test Description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Get the specific task
    response = client.get(f"/api/tasks/{task_id}",
                         headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Test Task"


def test_update_task_success(client: TestClient, session: Session):
    """Test updating a task."""
    token = get_auth_token(session)

    # Create a task first
    create_response = client.post("/api/tasks",
                                json={"title": "Original Task", "description": "Original Description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Update the task
    update_response = client.put(f"/api/tasks/{task_id}",
                                json={"title": "Updated Task", "description": "Updated Description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["id"] == task_id
    assert data["title"] == "Updated Task"
    assert data["description"] == "Updated Description"


def test_toggle_task_completion(client: TestClient, session: Session):
    """Test toggling task completion status."""
    token = get_auth_token(session)

    # Create a task first
    create_response = client.post("/api/tasks",
                                json={"title": "Test Task", "description": "Test Description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Verify task is initially not completed
    get_response = client.get(f"/api/tasks/{task_id}",
                             headers={"Authorization": f"Bearer {token}"})
    assert get_response.status_code == 200
    assert get_response.json()["completed"] is False

    # Toggle task to completed
    toggle_response = client.patch(f"/api/tasks/{task_id}/complete",
                                 json={"completed": True},
                                 headers={"Authorization": f"Bearer {token}"})

    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True

    # Toggle task back to not completed
    toggle_response2 = client.patch(f"/api/tasks/{task_id}/complete",
                                   json={"completed": False},
                                   headers={"Authorization": f"Bearer {token}"})

    assert toggle_response2.status_code == 200
    assert toggle_response2.json()["completed"] is False


def test_delete_task_success(client: TestClient, session: Session):
    """Test deleting a task."""
    token = get_auth_token(session)

    # Create a task first
    create_response = client.post("/api/tasks",
                                json={"title": "Test Task", "description": "Test Description"},
                                headers={"Authorization": f"Bearer {token}"})

    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Delete the task
    delete_response = client.delete(f"/api/tasks/{task_id}",
                                  headers={"Authorization": f"Bearer {token}"})

    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Task deleted successfully"

    # Verify task is gone
    get_response = client.get(f"/api/tasks/{task_id}",
                             headers={"Authorization": f"Bearer {token}"})
    assert get_response.status_code == 404


def test_unauthorized_access_to_tasks(client: TestClient, session: Session):
    """Test that accessing tasks without authorization fails."""
    # Try to access tasks without a token
    response = client.get("/api/tasks")

    assert response.status_code == 401


def test_task_filtering_by_status(client: TestClient, session: Session):
    """Test filtering tasks by status."""
    token = get_auth_token(session)

    # Create two tasks: one completed, one pending
    task1_resp = client.post("/api/tasks",
                            json={"title": "Completed Task", "description": "Completed Description"},
                            headers={"Authorization": f"Bearer {token}"})

    task2_resp = client.post("/api/tasks",
                            json={"title": "Pending Task", "description": "Pending Description"},
                            headers={"Authorization": f"Bearer {token}"})

    assert task1_resp.status_code == 201
    assert task2_resp.status_code == 201

    task1_id = task1_resp.json()["id"]
    task2_id = task2_resp.json()["id"]

    # Mark first task as completed
    client.patch(f"/api/tasks/{task1_id}/complete",
                json={"completed": True},
                headers={"Authorization": f"Bearer {token}"})

    # Get completed tasks
    completed_response = client.get("/api/tasks?status_filter=completed",
                                  headers={"Authorization": f"Bearer {token}"})
    assert completed_response.status_code == 200
    completed_tasks = completed_response.json()
    completed_task_ids = [task["id"] for task in completed_tasks]
    assert task1_id in completed_task_ids
    assert task2_id not in completed_task_ids

    # Get pending tasks
    pending_response = client.get("/api/tasks?status_filter=pending",
                                headers={"Authorization": f"Bearer {token}"})
    assert pending_response.status_code == 200
    pending_tasks = pending_response.json()
    pending_task_ids = [task["id"] for task in pending_tasks]
    assert task2_id in pending_task_ids
    assert task1_id not in pending_task_ids
