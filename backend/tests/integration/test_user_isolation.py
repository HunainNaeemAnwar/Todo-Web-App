"""
Tests for user isolation functionality.
Ensures that users can only access their own data.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from src.models.user import User
from src.models.task import Task
from src.utils.jwt_validator import create_access_token


def test_user_can_access_own_tasks(client: TestClient, session: Session):
    """Test that a user can access their own tasks."""
    # Register and login first user
    client.post("/api/auth/register",
               json={"email": "user1@example.com", "password": "TestPass123!"})

    login_response1 = client.post("/api/auth/login",
                                json={"email": "user1@example.com", "password": "TestPass123!"})

    token1 = login_response1.json()["access_token"]

    # Create a task for user1
    task_response = client.post("/api/tasks",
                              json={"title": "User 1 task", "description": "Task for user 1"},
                              headers={"Authorization": f"Bearer {token1}"})

    assert task_response.status_code == 201
    task_id = task_response.json()["id"]

    # User 1 should be able to access their own task
    get_task_response = client.get(f"/api/tasks/{task_id}",
                                 headers={"Authorization": f"Bearer {token1}"})

    assert get_task_response.status_code == 200
    assert get_task_response.json()["id"] == task_id


def test_user_cannot_access_other_users_tasks(client: TestClient, session: Session):
    """Test that a user cannot access tasks belonging to other users."""
    # Register and login first user
    client.post("/api/auth/register",
               json={"email": "user1@example.com", "password": "TestPass123!"})

    login_response1 = client.post("/api/auth/login",
                                json={"email": "user1@example.com", "password": "TestPass123!"})

    token1 = login_response1.json()["access_token"]

    # Create a task for user1
    task_response = client.post("/api/tasks",
                              json={"title": "User 1 task", "description": "Task for user 1"},
                              headers={"Authorization": f"Bearer {token1}"})

    assert task_response.status_code == 201
    task_id = task_response.json()["id"]

    # Register and login second user
    client.post("/api/auth/register",
               json={"email": "user2@example.com", "password": "TestPass123!"})

    login_response2 = client.post("/api/auth/login",
                                json={"email": "user2@example.com", "password": "TestPass123!"})

    token2 = login_response2.json()["access_token"]

    # User 2 should NOT be able to access user 1's task
    get_task_response = client.get(f"/api/tasks/{task_id}",
                                 headers={"Authorization": f"Bearer {token2}"})

    # Should get 404 (not found) because the task exists but belongs to another user
    assert get_task_response.status_code == 404


def test_user_can_only_see_own_tasks_in_list(client: TestClient, session: Session):
    """Test that a user only sees their own tasks when getting the task list."""
    # Register and login first user
    client.post("/api/auth/register",
               json={"email": "user1@example.com", "password": "TestPass123!"})

    login_response1 = client.post("/api/auth/login",
                                json={"email": "user1@example.com", "password": "TestPass123!"})

    token1 = login_response1.json()["access_token"]

    # Register and login second user
    client.post("/api/auth/register",
               json={"email": "user2@example.com", "password": "TestPass123!"})

    login_response2 = client.post("/api/auth/login",
                                json={"email": "user2@example.com", "password": "TestPass123!"})

    token2 = login_response2.json()["access_token"]

    # User 1 creates a task
    task1_response = client.post("/api/tasks",
                               json={"title": "User 1 task", "description": "Task for user 1"},
                               headers={"Authorization": f"Bearer {token1}"})

    assert task1_response.status_code == 201
    task1_id = task1_response.json()["id"]

    # User 2 creates a task
    task2_response = client.post("/api/tasks",
                               json={"title": "User 2 task", "description": "Task for user 2"},
                               headers={"Authorization": f"Bearer {token2}"})

    assert task2_response.status_code == 201
    task2_id = task2_response.json()["id"]

    # User 1 should only see their own task
    user1_tasks_response = client.get("/api/tasks",
                                    headers={"Authorization": f"Bearer {token1}"})

    assert user1_tasks_response.status_code == 200
    user1_tasks = user1_tasks_response.json()
    user1_task_ids = [task["id"] for task in user1_tasks]
    assert task1_id in user1_task_ids
    assert task2_id not in user1_task_ids

    # User 2 should only see their own task
    user2_tasks_response = client.get("/api/tasks",
                                    headers={"Authorization": f"Bearer {token2}"})

    assert user2_tasks_response.status_code == 200
    user2_tasks = user2_tasks_response.json()
    user2_task_ids = [task["id"] for task in user2_tasks]
    assert task2_id in user2_task_ids
    assert task1_id not in user2_task_ids


def test_user_cannot_update_other_users_tasks(client: TestClient, session: Session):
    """Test that a user cannot update tasks belonging to other users."""
    # Register and login first user
    client.post("/api/auth/register",
               json={"email": "user1@example.com", "password": "TestPass123!"})

    login_response1 = client.post("/api/auth/login",
                                json={"email": "user1@example.com", "password": "TestPass123!"})

    token1 = login_response1.json()["access_token"]

    # Create a task for user1
    task_response = client.post("/api/tasks",
                              json={"title": "User 1 task", "description": "Task for user 1"},
                              headers={"Authorization": f"Bearer {token1}"})

    assert task_response.status_code == 201
    task_id = task_response.json()["id"]

    # Register and login second user
    client.post("/api/auth/register",
               json={"email": "user2@example.com", "password": "TestPass123!"})

    login_response2 = client.post("/api/auth/login",
                                json={"email": "user2@example.com", "password": "TestPass123!"})

    token2 = login_response2.json()["access_token"]

    # User 2 should NOT be able to update user 1's task
    update_response = client.put(f"/api/tasks/{task_id}",
                               json={"title": "Modified by user 2", "description": "Should fail"},
                               headers={"Authorization": f"Bearer {token2}"})

    # Should get 404 (not found) because the task exists but belongs to another user
    assert update_response.status_code == 404


def test_user_cannot_delete_other_users_tasks(client: TestClient, session: Session):
    """Test that a user cannot delete tasks belonging to other users."""
    # Register and login first user
    client.post("/api/auth/register",
               json={"email": "user1@example.com", "password": "TestPass123!"})

    login_response1 = client.post("/api/auth/login",
                                json={"email": "user1@example.com", "password": "TestPass123!"})

    token1 = login_response1.json()["access_token"]

    # Create a task for user1
    task_response = client.post("/api/tasks",
                              json={"title": "User 1 task", "description": "Task for user 1"},
                              headers={"Authorization": f"Bearer {token1}"})

    assert task_response.status_code == 201
    task_id = task_response.json()["id"]

    # Register and login second user
    client.post("/api/auth/register",
               json={"email": "user2@example.com", "password": "TestPass123!"})

    login_response2 = client.post("/api/auth/login",
                                json={"email": "user2@example.com", "password": "TestPass123!"})

    token2 = login_response2.json()["access_token"]

    # User 2 should NOT be able to delete user 1's task
    delete_response = client.delete(f"/api/tasks/{task_id}",
                                  headers={"Authorization": f"Bearer {token2}"})

    # Should get 404 (not found) because the task exists but belongs to another user
    assert delete_response.status_code == 404