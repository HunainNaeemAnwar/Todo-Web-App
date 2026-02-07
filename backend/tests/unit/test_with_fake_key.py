import requests
import json

# Test the sign-up endpoint with a new email
url = "http://localhost:8000/api/auth/sign-up/email"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test4@example.com",
    "password": "Password123!",
    "name": "Test User 4"
}

print("Testing sign-up endpoint with fake API key server...")
response = requests.post(url, headers=headers, json=data)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 201:
    # Get the token
    resp_json = response.json()
    token = resp_json.get("session", {}).get("token")

    if token:
        print("\n✅ Got token, testing chatkit endpoint...")
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
    print("Sign-up failed")