"""
Unit tests for user profile API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.models.user import User
from src.services.user_service import UserService


def test_get_user_profile_unauthorized(client: TestClient):
    """Test that getting profile without auth returns 401."""
    response = client.get("/api/user/profile")
    assert response.status_code == 401


def test_get_user_profile_invalid_token(client: TestClient):
    """Test that invalid token returns 401."""
    response = client.get(
        "/api/user/profile", headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401


def test_update_profile_empty_name(client: TestClient, session: Session):
    """Test that updating profile with empty name returns 400."""
    # First register a user
    register_response = client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "profile_test@example.com",
            "password": "TestPass123!",
            "name": "Original Name",
        },
    )
    assert register_response.status_code == 201

    # Login to get token
    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "profile_test@example.com", "password": "TestPass123!"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["session"]["token"]

    # Try to update with empty name
    response = client.put(
        "/api/user/profile",
        json={"name": ""},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert (
        "required" in response.json()["detail"].lower()
        or "empty" in response.json()["detail"].lower()
    )


def test_update_profile_whitespace_only_name(client: TestClient, session: Session):
    """Test that updating profile with whitespace-only name returns 400."""
    # First register a user
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "whitespace_test@example.com",
            "password": "TestPass123!",
            "name": "Original Name",
        },
    )

    # Login to get token
    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "whitespace_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Try to update with whitespace-only name
    response = client.put(
        "/api/user/profile",
        json={"name": "   "},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_get_user_stats_unauthorized(client: TestClient):
    """Test that getting stats without auth returns 401."""
    response = client.get("/api/user/stats")
    assert response.status_code == 401


def test_get_user_notifications_unauthorized(client: TestClient):
    """Test that getting notifications without auth returns 401."""
    response = client.get("/api/user/notifications")
    assert response.status_code == 401


def test_mark_notification_read_unauthorized(client: TestClient):
    """Test that marking notification read without auth returns 401."""
    response = client.put("/api/user/notifications/some-id/read")
    assert response.status_code == 401


def test_get_notification_preferences_unauthorized(client: TestClient):
    """Test that getting notification preferences without auth returns 401."""
    response = client.get("/api/user/notifications/preferences")
    assert response.status_code == 401


def test_update_notification_preferences_unauthorized(client: TestClient):
    """Test that updating notification preferences without auth returns 401."""
    response = client.put("/api/user/notifications/preferences", json={})
    assert response.status_code == 401


def test_get_user_profile_structure(client: TestClient, session: Session):
    """Test that profile response has correct structure."""
    # Register a user
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "structure_test@example.com",
            "password": "TestPass123!",
            "name": "Structure Test",
        },
    )

    # Login
    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "structure_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get profile
    response = client.get(
        "/api/user/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # Verify structure
    assert "id" in data
    assert "email" in data
    assert "name" in data
    assert "created_at" in data
    assert "updated_at" in data
    assert data["email"] == "structure_test@example.com"
    assert data["name"] == "Structure Test"


def test_get_user_stats_structure(client: TestClient, session: Session):
    """Test that stats response has correct structure."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "stats_structure@example.com",
            "password": "TestPass123!",
            "name": "Stats Test",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "stats_structure@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get stats
    response = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # Verify structure
    assert "total_tasks" in data
    assert "completed_tasks" in data
    assert "completion_rate" in data
    assert "streak_current" in data
    assert "streak_best" in data
    assert "avg_tasks_per_day" in data
    assert "weekly_activity" in data
    assert "created_at" in data

    # Verify types
    assert isinstance(data["total_tasks"], int)
    assert isinstance(data["completed_tasks"], int)
    assert isinstance(data["completion_rate"], (int, float))
    assert isinstance(data["streak_current"], int)
    assert isinstance(data["streak_best"], int)
    assert isinstance(data["avg_tasks_per_day"], (int, float))
    assert isinstance(data["weekly_activity"], list)
