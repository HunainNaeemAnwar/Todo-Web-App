"""
Integration test for user profile update flow.
Tests the complete flow of registering, logging in, and updating profile.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session


def test_complete_profile_update_flow(client: TestClient, session: Session):
    """Test complete flow: register -> login -> get profile -> update profile -> verify."""

    # Step 1: Register a new user
    register_response = client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "flow_test@example.com",
            "password": "TestPass123!",
            "name": "Original Name",
        },
    )
    assert register_response.status_code == 201
    user_data = register_response.json()["user"]
    user_id = user_data["id"]
    assert user_data["name"] == "Original Name"
    assert user_data["email"] == "flow_test@example.com"

    # Step 2: Login to get token
    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "flow_test@example.com", "password": "TestPass123!"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["session"]["token"]

    # Step 3: Get profile before update
    profile_before = client.get(
        "/api/user/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_before.status_code == 200
    assert profile_before.json()["name"] == "Original Name"

    # Step 4: Update profile with new name
    update_response = client.put(
        "/api/user/profile",
        json={"name": "Updated Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_response.status_code == 200
    updated_data = update_response.json()
    assert updated_data["name"] == "Updated Name"
    assert updated_data["id"] == user_id
    assert updated_data["email"] == "flow_test@example.com"

    # Step 5: Verify profile was actually updated in database
    profile_after = client.get(
        "/api/user/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_after.status_code == 200
    assert profile_after.json()["name"] == "Updated Name"


def test_profile_update_reflects_in_stats(client: TestClient, session: Session):
    """Test that profile update doesn't affect stats endpoint."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "stats_reflect@example.com",
            "password": "TestPass123!",
            "name": "Stats User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "stats_reflect@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Get stats before update
    stats_before = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_before.status_code == 200

    # Update profile
    client.put(
        "/api/user/profile",
        json={"name": "New Stats User"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Get stats after update - should still work and have same structure
    stats_after = client.get(
        "/api/user/stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_after.status_code == 200
    assert stats_after.json()["total_tasks"] == stats_before.json()["total_tasks"]


def test_profile_update_same_name(client: TestClient, session: Session):
    """Test updating profile with the same name works without error."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "same_name@example.com",
            "password": "TestPass123!",
            "name": "Same Name",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "same_name@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Update with same name
    response = client.put(
        "/api/user/profile",
        json={"name": "Same Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Same Name"


def test_profile_update_name_trimmed(client: TestClient, session: Session):
    """Test that profile update trims whitespace from name."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "trim_test@example.com",
            "password": "TestPass123!",
            "name": "Trim Test",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "trim_test@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Update with whitespace around name
    response = client.put(
        "/api/user/profile",
        json={"name": "  Trimmed Name  "},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    # Router should trim the name
    assert response.json()["name"] == "Trimmed Name"


def test_concurrent_profile_updates(client: TestClient, session: Session):
    """Test that concurrent profile updates don't cause issues."""
    # Register and login
    client.post(
        "/api/auth/sign-up/email",
        json={
            "email": "concurrent@example.com",
            "password": "TestPass123!",
            "name": "Concurrent User",
        },
    )

    login_response = client.post(
        "/api/auth/sign-in/email",
        json={"email": "concurrent@example.com", "password": "TestPass123!"},
    )
    token = login_response.json()["session"]["token"]

    # Make multiple rapid updates
    for i in range(3):
        response = client.put(
            "/api/user/profile",
            json={"name": f"Name Version {i}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["name"] == f"Name Version {i}"

    # Final verify - should be the last update
    profile = client.get(
        "/api/user/profile", headers={"Authorization": f"Bearer {token}"}
    )
    assert profile.json()["name"] == "Name Version 2"
