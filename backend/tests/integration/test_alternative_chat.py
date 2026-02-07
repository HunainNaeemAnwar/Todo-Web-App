import requests
import json

# Test the sign-up endpoint with a new email
url = "http://localhost:8000/api/auth/sign-up/email"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test5@example.com",
    "password": "Password123!",
    "name": "Test User 5"
}

print("Testing sign-up endpoint...")
response = requests.post(url, headers=headers, json=data)

print(f"Status: {response.status_code}")
if response.status_code == 201:
    resp_json = response.json()
    token = resp_json.get("session", {}).get("token")

    if token:
        print("\n✅ Got token, testing alternative chat endpoint (/api/chat/)...")
        chat_response = requests.post(
            "http://localhost:8000/api/chat/",
            json={"message": "Hello, can you help me with my tasks?"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        print(f"Alternative chat endpoint status: {chat_response.status_code}")
        print(f"Alternative chat response: {chat_response.text}")
    else:
        print("❌ No token received")
else:
    print(f"❌ Sign-up failed: {response.text}")