import requests
import json

# Create a test user
print("Creating a test user...")
url = "http://localhost:8000/api/auth/sign-up/email"
headers = {"Content-Type": "application/json"}
data = {
    "email": "test6@example.com",
    "password": "Password123!",
    "name": "Test User 6"
}

response = requests.post(url, headers=headers, json=data)
print(f"Sign-up status: {response.status_code}")

if response.status_code == 201:
    resp_json = response.json()
    token = resp_json.get("session", {}).get("token")
    print(f"✅ Got token: {token is not None}")

    if token:
        print("\nTesting the chat endpoint WITHOUT conversation_id...")
        chat_response = requests.post(
            "http://localhost:8000/api/chat/",
            json={"message": "Hello, can you help me manage my tasks?"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        print(f"Chat endpoint status: {chat_response.status_code}")

        if chat_response.status_code == 200:
            chat_data = chat_response.json()
            print("✅ Chat endpoint working!")
            print(f"Response preview: {chat_data['response'][:100]}...")
            print(f"Conversation ID returned: {chat_data.get('conversation_id')}")
        else:
            print(f"❌ Chat endpoint failed: {chat_response.text}")
            error_detail = chat_response.text if chat_response.status_code != 404 else "Conversation not found"
            print(f"Error detail: {error_detail}")
    else:
        print("❌ No token received")
else:
    print(f"❌ Sign-up failed: {response.text}")