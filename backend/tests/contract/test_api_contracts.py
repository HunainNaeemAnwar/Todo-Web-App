import pytest
import uuid
from fastapi.testclient import TestClient

def test_register_contract(client: TestClient):
    """
    Contract test for POST /api/auth/register

    Expected Request:
    - Method: POST
    - URL: /api/auth/register
    - Content-Type: application/json
    - Body:
        {
            "email": "user@example.com",
            "password": "Password123!"
        }

    Expected Response:
    - Status: 201 Created
    - Content-Type: application/json
    - Body:
        {
            "id": "uuid-string",
            "email": "user@example.com",
            "created_at": "timestamp",
            "is_active": true
        }
    """
    payload = {
        "email": "contract_test@example.com",
        "password": "Password123!"
    }

    response = client.post("/api/auth/register", json=payload)

    # If the user already exists (from other tests), we might get 409, which is also a valid contract response for this case
    # But for a clean test, we expect 201.
    if response.status_code == 409:
        # Retry with unique email
        payload["email"] = "contract_test_unique@example.com"
    response = client.post("/api/auth/sign-up/email", json=payload)

    # If the user already exists (from other tests), we might get 409, which is also a valid contract response for this case
    # But for a clean test, we expect 201.
    if response.status_code == 409:
        # Retry with unique email
        payload["email"] = "contract_test_unique@example.com"
        response = client.post("/api/auth/sign-up/email", json=payload)

    assert response.status_code == 201
    assert response.headers["content-type"] == "application/json"

    data = response.json()
    assert "user" in data
    assert "id" in data["user"]
    assert data["user"]["email"] == payload["email"]
    assert "hashed_password" not in data["user"]  # Security check
    assert "session" in data  # Check that session is included
    assert "token" in data["session"]  # Check that token is included


def test_login_contract(client: TestClient):
    """
    Contract test for POST /api/auth/sign-in/email
    """
    # 1. Register a user
    email = f"contract_login_{uuid.uuid4()}@example.com"
    register_resp = client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Test User"})
    assert register_resp.status_code == 201

    # 2. Login
    payload = {"email": email, "password": "Password123!"}
    response = client.post("/api/auth/sign-in/email", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "session" in data
    assert "token" in data["session"]  # Better Auth format


def test_logout_contract(client: TestClient):
    """
    Contract test for POST /api/auth/sign-out
    """
    response = client.post("/api/auth/sign-out")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Successfully signed out" in data["message"]
    assert response.json() == {"message": "Successfully signed out"}


def test_create_task_contract(client: TestClient):
    """
    Contract test for POST /api/tasks
    """
    # 1. Register and login to get token
    email = f"contract_task_{uuid.uuid4()}@example.com"
    client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Task User"})
    login_resp = client.post("/api/auth/sign-in/email", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["session"]["token"]

    # 2. Create task
    payload = {"title": "Contract Task", "description": "Testing contract"}
    response = client.post(
        "/api/tasks/",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == payload["title"]
    assert data["completed"] is False
    assert "user_id" in data


def test_get_tasks_contract(client: TestClient):
    """
    Contract test for GET /api/tasks
    """
    # 1. Register and login
    email = f"contract_get_{uuid.uuid4()}@example.com"
    client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Get User"})
    login_resp = client.post("/api/auth/sign-in/email", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["session"]["token"]

    # 2. Get tasks
    response = client.get(
        "/api/tasks/",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_task_contract(client: TestClient):
    """
    Contract test for PUT /api/tasks/{id}
    """
    # 1. Register and login
    email = f"contract_update_{uuid.uuid4()}@example.com"
    client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Update User"})
    login_resp = client.post("/api/auth/sign-in/email", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["session"]["token"]

    # 2. Create task
    create_resp = client.post(
        "/api/tasks/",
        json={"title": "Old Title"},
        headers={"Authorization": f"Bearer {token}"}
    )
    task_id = create_resp.json()["id"]

    # 3. Update task
    payload = {"title": "New Title", "description": "Updated description"}
    response = client.put(
        f"/api/tasks/{task_id}",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["description"] == "Updated description"


def test_delete_task_contract(client: TestClient):
    """
    Contract test for DELETE /api/tasks/{id}
    """
    # 1. Register and login
    email = f"contract_delete_{uuid.uuid4()}@example.com"
    client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Delete User"})
    login_resp = client.post("/api/auth/sign-in/email", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["session"]["token"]

    # 2. Create task
    create_resp = client.post(
        "/api/tasks/",
        json={"title": "To Delete"},
        headers={"Authorization": f"Bearer {token}"}
    )
    task_id = create_resp.json()["id"]

    # 3. Delete task
    response = client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Task deleted successfully"}


def test_complete_task_contract(client: TestClient):
    """
    Contract test for PATCH /api/tasks/{id}/complete
    """
    # 1. Register and login
    email = f"contract_complete_{uuid.uuid4()}@example.com"
    client.post("/api/auth/sign-up/email", json={"email": email, "password": "Password123!", "name": "Complete User"})
    login_resp = client.post("/api/auth/sign-in/email", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["session"]["token"]

    # 2. Create task
    create_resp = client.post(
        "/api/tasks/",
        json={"title": "Toggle Me"},
        headers={"Authorization": f"Bearer {token}"}
    )
    task_id = create_resp.json()["id"]

    # 3. Toggle complete
    response = client.patch(
        f"/api/tasks/{task_id}/complete",
        json={"completed": True},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["completed"] is True
