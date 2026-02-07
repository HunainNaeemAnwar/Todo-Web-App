import requests
import json

# Test the sign-up endpoint with a new email
url = "http://localhost:8000/api/auth/sign-up/email"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test2@example.com",
    "password": "Password123!",
    "name": "Test User 2"
}

print("Testing sign-up endpoint with new email...")
response = requests.post(url, headers=headers, json=data)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 201:
    # Get the token
    resp_json = response.json()
    token = resp_json.get("session", {}).get("token")

    if token:
        print("\n✅ Got token, testing chatkit session endpoint...")
        session_response = requests.post(
            "http://localhost:8000/chatkit/session",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        print(f"Session endpoint status: {session_response.status_code}")
        print(f"Session response: {session_response.text}")

        # Test the main chatkit endpoint
        print("\nTesting main chatkit endpoint...")
        chat_response = requests.post(
            "http://localhost:8000/chatkit",
            json={"message": "Hello"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        print(f"Chat endpoint status: {chat_response.status_code}")
        print(f"Chat response: {chat_response.text}")
else:
    print("Sign-up failed, checking other endpoints...")
    # Test the chatkit session endpoint without auth to confirm it requires auth
    session_response = requests.post("http://localhost:8000/chatkit/session")
    print(f"Session endpoint without auth status: {session_response.status_code}")
    print(f"Session response: {session_response.text}")