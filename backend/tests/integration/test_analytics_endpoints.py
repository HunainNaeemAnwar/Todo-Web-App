"""
Integration tests for analytics endpoints.
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session


def test_productivity_endpoint_week_period(client: TestClient, session: Session):
    """Test productivity endpoint returns 7 data points for week period."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "prod_week@example.com",
            "password": "TestPass123!",
            "name": "Productivity Week User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "prod_week@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create some tasks
    for i in range(3):
        client.post(
            "/api/tasks",
            json={"title": f"Task {i + 1}"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Get productivity data for week
    response = client.get(
        "/api/analytics/productivity?period=week",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "week"
    assert len(data["data"]) == 7


def test_productivity_endpoint_month_period(client: TestClient, session: Session):
    """Test productivity endpoint returns 30 data points for month period."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "prod_month@example.com",
            "password": "TestPass123!",
            "name": "Productivity Month User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "prod_month@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get productivity data for month
    response = client.get(
        "/api/analytics/productivity?period=month",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "month"
    assert len(data["data"]) == 30


def test_productivity_endpoint_quarter_period(client: TestClient, session: Session):
    """Test productivity endpoint returns 12 data points for quarter period."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "prod_quarter@example.com",
            "password": "TestPass123!",
            "name": "Productivity Quarter User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "prod_quarter@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get productivity data for quarter
    response = client.get(
        "/api/analytics/productivity?period=quarter",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["period"] == "quarter"
    assert len(data["data"]) == 12


def test_productivity_endpoint_invalid_period(client: TestClient, session: Session):
    """Test productivity endpoint returns error for invalid period."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "prod_invalid@example.com",
            "password": "TestPass123!",
            "name": "Invalid Period User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "prod_invalid@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Try invalid period
    response = client.get(
        "/api/analytics/productivity?period=invalid",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "period" in response.json()["detail"].lower()


def test_productivity_endpoint_unauthorized(client: TestClient, session: Session):
    """Test that productivity endpoint requires authentication."""
    response = client.get("/api/analytics/productivity?period=week")
    assert response.status_code == 401


def test_weekly_activity_endpoint(client: TestClient, session: Session):
    """Test weekly activity endpoint returns activity data."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "weekly_activity@example.com",
            "password": "TestPass123!",
            "name": "Weekly Activity User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "weekly_activity@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get weekly activity
    response = client.get(
        "/api/analytics/weekly-activity?weeks=4",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["weeks"] == 4
    assert len(data["activity"]) == 4
    for week in data["activity"]:
        assert "week" in week
        assert "mon" in week
        assert "tue" in week
        assert "wed" in week
        assert "thu" in week
        assert "fri" in week
        assert "sat" in week
        assert "sun" in week


def test_weekly_activity_invalid_weeks(client: TestClient, session: Session):
    """Test weekly activity endpoint returns error for invalid weeks."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "invalid_weeks@example.com",
            "password": "TestPass123!",
            "name": "Invalid Weeks User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "invalid_weeks@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Try invalid weeks
    response = client.get(
        "/api/analytics/weekly-activity?weeks=100",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_csv_export_endpoint(client: TestClient, session: Session):
    """Test CSV export endpoint returns valid CSV content."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "csv_export@example.com",
            "password": "TestPass123!",
            "name": "CSV Export User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "csv_export@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Create some tasks
    for i in range(3):
        client.post(
            "/api/tasks",
            json={"title": f"Export Task {i + 1}"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Export to CSV
    response = client.get(
        "/api/analytics/export/csv", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert "filename" in data
    assert "content" in data
    assert data["filename"].endswith(".csv")
    assert "title" in data["content"].lower()
