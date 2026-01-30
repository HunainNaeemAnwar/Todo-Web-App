"""
Integration tests for authentication endpoints.
"""
from fastapi.testclient import TestClient
from sqlmodel import Session

def test_register_new_user(client: TestClient, session: Session):
    """Test registering a new user."""
    response = client.post("/api/auth/sign-up/email",
                          json={"email": "test@example.com", "password": "TestPass123!", "name": "Test User"})

    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"


def test_register_duplicate_email(client: TestClient, session: Session):
    """Test registering a user with duplicate email."""
    # Register the first user
    client.post("/api/auth/sign-up/email",
               json={"email": "duplicate@example.com", "password": "TestPass123!", "name": "First User"})

    # Try to register the same email again
    response = client.post("/api/auth/sign-up/email",
                          json={"email": "duplicate@example.com", "password": "TestPass123!", "name": "Second User"})

    assert response.status_code == 409


def test_login_valid_credentials(client: TestClient, session: Session):
    """Test logging in with valid credentials."""
    # Register a user first
    client.post("/api/auth/sign-up/email",
               json={"email": "login@example.com", "password": "TestPass123!", "name": "Login User"})

    # Try to login
    response = client.post("/api/auth/sign-in/email",
                          json={"email": "login@example.com", "password": "TestPass123!"})

    assert response.status_code == 200
    data = response.json()
    assert "session" in data
    assert "token" in data["session"]


def test_login_invalid_credentials(client: TestClient, session: Session):
    """Test logging in with invalid credentials."""
    # Register a user first
    client.post("/api/auth/sign-up/email",
               json={"email": "invalid@example.com", "password": "TestPass123!", "name": "Invalid User"})

    # Try to login with wrong password
    response = client.post("/api/auth/sign-in/email",
                          json={"email": "invalid@example.com", "password": "WrongPassword123!"})

    assert response.status_code == 401


def test_logout_endpoint(client: TestClient, session: Session):
    """Test logout endpoint."""
    # Register and login a user
    client.post("/api/auth/sign-up/email",
               json={"email": "logout@example.com", "password": "TestPass123!", "name": "Logout User"})

    login_response = client.post("/api/auth/sign-in/email",
                               json={"email": "logout@example.com", "password": "TestPass123!"})

    assert login_response.status_code == 200

    # Logout
    response = client.post("/api/auth/sign-out")

    assert response.status_code == 200
    assert response.json() == {"message": "Successfully signed out"}


def test_jwt_verification_for_protected_endpoint(client: TestClient, session: Session):
    """Test that protected endpoints require valid JWT tokens."""
    # Register and login a user to get a token
    client.post("/api/auth/sign-up/email",
               json={"email": "protected@example.com", "password": "TestPass123!", "name": "Protected User"})

    login_response = client.post("/api/auth/sign-in/email",
                               json={"email": "protected@example.com", "password": "TestPass123!"})

    assert login_response.status_code == 200
    token = login_response.json()["session"]["token"]

    # Try to access a protected endpoint
    no_token_response = client.get("/api/tasks")
    assert no_token_response.status_code == 401

    # With valid token - should succeed
    with_token_response = client.get("/api/tasks",
                                    headers={"Authorization": f"Bearer {token}"})
    assert with_token_response.status_code == 200


def test_rejection_of_invalid_jwt(client: TestClient, session: Session):
    """Test that requests with invalid JWT tokens are rejected."""
    # Try to access a protected endpoint with an invalid token
    response = client.get("/api/tasks",
                         headers={"Authorization": "Bearer invalid_token_here"})

    assert response.status_code == 401