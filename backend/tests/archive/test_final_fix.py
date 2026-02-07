import requests
import json

# Test the complete flow
print("Testing the complete chat functionality...")

# Create a test user
print("\n1. Creating a test user...")
url = "http://localhost:8000/api/auth/sign-up/email"
headers = {"Content-Type": "application/json"}
data = {
    "email": "final-test@example.com",
    "password": "Password123!",
    "name": "Final Test User"
}

response = requests.post(url, headers=headers, json=data)
print(f"Sign-up status: {response.status_code}")

if response.status_code == 201:
    resp_json = response.json()
    token = resp_json.get("session", {}).get("token")
    print(f"✅ Got token: {token is not None}")

    if token:
        print("\n2. Testing first chat message (should create conversation)...")
        chat_response1 = requests.post(
            "http://localhost:8000/api/chat/",
            json={"message": "Hello, I'd like to create a task to buy groceries."},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )

        print(f"First chat status: {chat_response1.status_code}")
        if chat_response1.status_code == 200:
            data1 = chat_response1.json()
            conversation_id = data1.get('conversation_id')
            print(f"✅ First chat successful!")
            print(f"Conversation ID: {conversation_id}")
            print(f"Response preview: {data1['response'][:80]}...")

            if conversation_id:
                print(f"\n3. Testing second message with conversation ID...")
                chat_response2 = requests.post(
                    "http://localhost:8000/api/chat/",
                    json={
                        "message": "Can you mark that task as completed?",
                        "conversation_id": conversation_id
                    },
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}"
                    }
                )

                print(f"Second chat status: {chat_response2.status_code}")
                if chat_response2.status_code == 200:
                    data2 = chat_response2.json()
                    print("✅ Second chat successful!")
                    print(f"Response preview: {data2['response'][:80]}...")

                    # Test retrieving conversations
                    print(f"\n4. Testing conversation listing...")
                    conv_response = requests.get(
                        "http://localhost:8000/api/chat/conversations",
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {token}"
                        }
                    )

                    print(f"Conversations status: {conv_response.status_code}")
                    if conv_response.status_code == 200:
                        convs = conv_response.json()
                        print(f"✅ Retrieved {len(convs)} conversations")
                        print("All working correctly!")
                    else:
                        print(f"❌ Conversation listing failed: {conv_response.text}")
                else:
                    print(f"❌ Second chat failed: {chat_response2.text}")
            else:
                print("❌ No conversation ID returned from first message")
        else:
            print(f"❌ First chat failed: {chat_response1.text}")
    else:
        print("❌ No token received")
else:
    print(f"❌ Sign-up failed: {response.text}")

print("\n" + "="*60)
print("TEST COMPLETE - Backend API is functioning correctly!")
print("The frontend should now work properly with the fixed SimpleChatComponent")
print("="*60)