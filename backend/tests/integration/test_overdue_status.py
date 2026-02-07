"""
Integration tests for overdue task management.
Tests the auto-overdue functionality.
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session
from sqlmodel import Session


def test_task_with_past_due_date_shows_overdue(client: TestClient, session: Session):
    """Test that a task with past due date is marked as overdue."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "overdue_test@example.com",
            "password": "TestPass123!",
            "name": "Overdue Test User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "overdue_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create a task with past due date
    past_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    create_response = client.post(
        "/api/tasks",
        json={"title": "Overdue Task", "due_date": past_date},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Verify the task is marked as overdue in stats
    stats_response = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["overdue_tasks"] >= 1


def test_completing_overdue_task_removes_overdue_status(
    client: TestClient, session: Session
):
    """Test that completing an overdue task removes it from overdue count."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "complete_overdue@example.com",
            "password": "TestPass123!",
            "name": "Complete Overdue User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "complete_overdue@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create overdue task
    past_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    create_response = client.post(
        "/api/tasks",
        json={"title": "Overdue Task", "due_date": past_date},
        headers={"Authorization": f"Bearer {token}"},
    )
    task_id = create_response.json()["id"]

    # Verify overdue count is 1
    stats_before = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    ).json()
    assert stats_before["overdue_tasks"] >= 1

    # Complete the task
    complete_response = client.put(
        f"/api/tasks/{task_id}/complete",
        json={"completed": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert complete_response.status_code == 200

    # Verify overdue count is now 0
    stats_after = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    ).json()
    assert stats_after["overdue_tasks"] == 0


def test_task_without_due_date_not_overdue(client: TestClient, session: Session):
    """Test that a task without due date is not marked as overdue."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "no_due_date@example.com",
            "password": "TestPass123!",
            "name": "No Due Date User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "no_due_date@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create task without due date
    create_response = client.post(
        "/api/tasks",
        json={"title": "Task Without Due Date"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 200

    # Verify overdue count is 0
    stats_response = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_response.status_code == 200
    assert stats_response.json()["overdue_tasks"] == 0


def test_task_with_future_due_date_not_overdue(client: TestClient, session: Session):
    """Test that a task with future due date is not marked as overdue."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "future_due_date@example.com",
            "password": "TestPass123!",
            "name": "Future Due Date User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "future_due_date@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create task with future due date
    future_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    create_response = client.post(
        "/api/tasks",
        json={"title": "Future Task", "due_date": future_date},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 200

    # Verify overdue count is 0
    stats_response = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_response.status_code == 200
    assert stats_response.json()["overdue_tasks"] == 0


def test_overdue_filter_in_task_list(client: TestClient, session: Session):
    """Test that the overdue filter returns only overdue tasks."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "overdue_filter@example.com",
            "password": "TestPass123!",
            "name": "Overdue Filter User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "overdue_filter@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create normal task
    client.post(
        "/api/tasks",
        json={"title": "Normal Task"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Create overdue task
    past_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    client.post(
        "/api/tasks",
        json={"title": "Overdue Task", "due_date": past_date},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Get overdue tasks only
    overdue_response = client.get(
        "/api/tasks?filter=overdue", headers={"Authorization": f"Bearer {token}"}
    )
    assert overdue_response.status_code == 200
    tasks = overdue_response.json()

    # All returned tasks should be overdue
    for task in tasks:
        assert task["completed"] == False
        assert task["due_date"] is not None
        assert datetime.fromisoformat(
            task["due_date"].replace("Z", "+00:00")
        ) < datetime.now(timezone.utc)


def test_multiple_overdue_tasks_count_correctly(client: TestClient, session: Session):
    """Test that multiple overdue tasks are counted correctly."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "multiple_overdue@example.com",
            "password": "TestPass123!",
            "name": "Multiple Overdue User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "multiple_overdue@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create multiple overdue tasks
    for i in range(3):
        past_date = (datetime.now(timezone.utc) - timedelta(days=i + 1)).isoformat()
        client.post(
            "/api/tasks",
            json={"title": f"Overdue Task {i + 1}", "due_date": past_date},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Verify overdue count
    stats_response = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_response.status_code == 200
    assert stats_response.json()["overdue_tasks"] >= 3
