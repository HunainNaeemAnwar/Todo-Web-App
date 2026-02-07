"""
Integration tests for calendar filtering.
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session


def test_calendar_endpoint_today(client: TestClient, session: Session):
    """Test calendar endpoint returns today's tasks."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "calendar_today@example.com",
            "password": "TestPass123!",
            "name": "Calendar Today User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "calendar_today@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create a task
    client.post(
        "/api/tasks",
        json={"title": "Calendar Task"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Get calendar data for today
    response = client.get(
        "/api/tasks/calendar?period=today", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "today"
    assert "tasks_by_day" in data
    assert "days" in data
    assert len(data["days"]) == 1


def test_calendar_endpoint_week(client: TestClient, session: Session):
    """Test calendar endpoint returns week tasks."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "calendar_week@example.com",
            "password": "TestPass123!",
            "name": "Calendar Week User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "calendar_week@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get calendar data for week
    response = client.get(
        "/api/tasks/calendar?period=week", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "week"
    assert len(data["days"]) == 7


def test_calendar_endpoint_month(client: TestClient, session: Session):
    """Test calendar endpoint returns month tasks."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "calendar_month@example.com",
            "password": "TestPass123!",
            "name": "Calendar Month User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "calendar_month@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get calendar data for month
    response = client.get(
        "/api/tasks/calendar?period=month", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "month"
    assert len(data["days"]) >= 28  # At least 28 days


def test_calendar_endpoint_invalid_period(client: TestClient, session: Session):
    """Test calendar endpoint returns error for invalid period."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "calendar_invalid@example.com",
            "password": "TestPass123!",
            "name": "Calendar Invalid User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "calendar_invalid@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Try invalid period
    response = client.get(
        "/api/tasks/calendar?period=invalid",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_calendar_endpoint_unauthorized(client: TestClient, session: Session):
    """Test that calendar endpoint requires authentication."""
    response = client.get("/api/tasks/calendar?period=week")
    assert response.status_code == 401


def test_calendar_groups_tasks_by_date(client: TestClient, session: Session):
    """Test that calendar endpoint groups tasks by date correctly."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "calendar_group@example.com",
            "password": "TestPass123!",
            "name": "Calendar Group User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "calendar_group@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create tasks with different due dates
    today = datetime.now(timezone.utc)

    for i in range(3):
        due_date = (today + timedelta(days=i)).isoformat()
        client.post(
            "/api/tasks",
            json={"title": f"Task {i + 1}", "due_date": due_date},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Get calendar data
    response = client.get(
        "/api/tasks/calendar?period=week", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # Check that tasks are grouped by day
    tasks_by_day = data["tasks_by_day"]
    total_tasks = sum(len(tasks) for tasks in tasks_by_day.values())
    assert total_tasks >= 3
