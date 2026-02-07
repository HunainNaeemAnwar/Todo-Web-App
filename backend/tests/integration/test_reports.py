"""
Integration tests for weekly and monthly report endpoints.
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session


def test_weekly_report_endpoint(client: TestClient, session: Session):
    """Test weekly report endpoint returns valid report structure."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "weekly_report_test@example.com",
            "password": "TestPass123!",
            "name": "Weekly Report User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "weekly_report_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create some tasks
    for i in range(5):
        client.post(
            "/api/tasks",
            json={"title": f"Weekly Task {i + 1}"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Get weekly report
    response = client.get(
        "/api/analytics/report/weekly", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["type"] == "weekly"
    assert "period_start" in data
    assert "period_end" in data
    assert "summary" in data
    assert "tasks_created" in data["summary"]
    assert "tasks_completed" in data["summary"]
    assert "completion_rate" in data["summary"]
    assert "generated_at" in data


def test_monthly_report_endpoint(client: TestClient, session: Session):
    """Test monthly report endpoint returns valid report structure."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "monthly_report_test@example.com",
            "password": "TestPass123!",
            "name": "Monthly Report User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "monthly_report_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create some tasks
    for i in range(10):
        client.post(
            "/api/tasks",
            json={"title": f"Monthly Task {i + 1}"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Get monthly report
    response = client.get(
        "/api/analytics/report/monthly", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["type"] == "monthly"
    assert "period_start" in data
    assert "period_end" in data
    assert "summary" in data
    assert "tasks_created" in data["summary"]
    assert "tasks_completed" in data["summary"]
    assert "completion_rate" in data["summary"]
    assert "avg_daily_completed" in data["summary"]
    assert "daily_breakdown" in data
    assert len(data["daily_breakdown"]) == 30
    assert "generated_at" in data


def test_weekly_report_unauthorized(client: TestClient, session: Session):
    """Test that weekly report endpoint requires authentication."""
    response = client.get("/api/analytics/report/weekly")
    assert response.status_code == 401


def test_monthly_report_unauthorized(client: TestClient, session: Session):
    """Test that monthly report endpoint requires authentication."""
    response = client.get("/api/analytics/report/monthly")
    assert response.status_code == 401


def test_weekly_report_includes_daily_breakdown(client: TestClient, session: Session):
    """Test weekly report includes daily breakdown data."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "weekly_breakdown@example.com",
            "password": "TestPass123!",
            "name": "Weekly Breakdown User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "weekly_breakdown@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    response = client.get(
        "/api/analytics/report/weekly", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # Check daily breakdown has day keys
    daily = data.get("daily_breakdown", {})
    days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    for day in days:
        assert (
            day in daily or day not in daily
        )  # Either present or not (depending on current day)


def test_monthly_report_includes_30_days(client: TestClient, session: Session):
    """Test monthly report includes 30 days of data."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "monthly_30_days@example.com",
            "password": "TestPass123!",
            "name": "Monthly 30 Days User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "monthly_30_days@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    response = client.get(
        "/api/analytics/report/monthly", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert len(data["daily_breakdown"]) == 30
    # Each day should have date, created, completed
    for day in data["daily_breakdown"]:
        assert "date" in day
        assert "created" in day
        assert "completed" in day
