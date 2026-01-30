import requests
import json

print("Testing chatbot functionality with the current backend configuration...")

# Get an existing user or create one for testing
# Using a test user that might already exist
headers = {"Content-Type": "application/json"}

# Try to sign in with a test user
signin_data = {
    "email": "newapi-test@example.com",
    "password": "Password123!"
}

signin_response = requests.post("http://localhost:8000/api/auth/sign-in/email",
                               headers=headers, json=signin_data)

token = None
if signin_response.status_code == 200:
    token = signin_response.json().get("session", {}).get("token")
    print(f"✅ Signed in with existing user, got token: {token is not None}")
else:
    # Create a new test user
    signup_data = {
        "email": "functional-test@example.com",
        "password": "Password123!",
        "name": "Functional Test User"
    }
    signup_response = requests.post("http://localhost:8000/api/auth/sign-up/email",
                                   headers=headers, json=signup_data)

    if signup_response.status_code == 201:
        token = signup_response.json().get("session", {}).get("token")
        print(f"✅ Created new user and got token: {token is not None}")
    else:
        print(f"❌ Could not get user token: {signup_response.status_code}")

if token:
    print("\nTesting chat functionality...")
    chat_response = requests.post(
        "http://localhost:8000/api/chat/",
        json={"message": "Hello, can you help me create a task?"},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )

    print(f"Chat endpoint status: {chat_response.status_code}")

    if chat_response.status_code == 200:
        response_data = chat_response.json()
        print("✅ Chat endpoint is responding!")
        print(f"Response: {response_data['response'][:100]}...")
        print(f"Conversation ID: {response_data.get('conversation_id')}")

        # Check if there's an error in the response indicating model issues
        if "Unknown prefix" in response_data['response']:
            print("❌ Model configuration issue detected in response")
        elif "having trouble processing" in response_data['response']:
            print("⚠️  Processing issue (could be API key/model related)")
        else:
            print("✅ Response seems normal")
    else:
        print(f"❌ Chat endpoint failed: {chat_response.text}")
else:
    print("❌ Cannot test without authentication token")

print("\n" + "="*60)
print("Chatbot functionality test complete")
print("="*60)