#!/usr/bin/env python3
"""
Test the authentication flow for the chatkit endpoint.
"""
import requests
import json

def test_auth_flow():
    print("Testing authentication flow for chatbot...")

    # First, let's create a test user
    print("\n1. Creating a test user...")
    signup_data = {
        "email": "test@example.com",
        "password": "Password123!",
        "name": "Test User"
    }

    response = requests.post("http://localhost:8000/api/auth/sign-up/email",
                           json=signup_data)

    if response.status_code == 201:
        print("✅ User created successfully")
        data = response.json()
        token = data.get("session", {}).get("token")
        if token:
            print("✅ JWT token retrieved")

            # Now test the chatkit session endpoint with the token
            print("\n2. Testing chatkit session endpoint with token...")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }

            session_response = requests.post("http://localhost:8000/chatkit/session",
                                          headers=headers)

            if session_response.status_code == 200:
                print("✅ Chatkit session endpoint working with authentication")
                session_data = session_response.json()
                print(f"Session data: {session_data}")

                # Now test the main chatkit endpoint
                print("\n3. Testing main chatkit endpoint with token...")
                chat_data = {"message": "Hello"}
                chat_response = requests.post("http://localhost:8000/chatkit",
                                            json=chat_data,
                                            headers=headers)

                if chat_response.status_code in [200, 422]:  # 422 is validation error, not auth error
                    print("✅ Chatkit main endpoint accessible with authentication")
                    print(f"Response status: {chat_response.status_code}")
                    return True
                elif chat_response.status_code == 401:
                    print("❌ Chatkit main endpoint still requires authentication")
                    return False
                else:
                    print(f"❓ Chatkit main endpoint unexpected status: {chat_response.status_code}")
                    print(f"Response: {chat_response.text}")
                    return False
            else:
                print(f"❌ Chatkit session endpoint failed: {session_response.status_code}")
                print(f"Response: {session_response.text}")
                return False
        else:
            print("❌ No token in signup response")
            return False
    else:
        print(f"❌ User creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_without_auth():
    print("\n4. Testing chatkit endpoints without authentication (should fail)...")

    # Test chatkit session without auth
    response = requests.post("http://localhost:8000/chatkit/session")
    if response.status_code == 401:
        print("✅ Chatkit session properly requires authentication")
    else:
        print(f"❌ Chatkit session should require auth but got: {response.status_code}")

    # Test main chatkit endpoint without auth
    chat_response = requests.post("http://localhost:8000/chatkit", json={"message": "test"})
    if chat_response.status_code == 401:
        print("✅ Chatkit main endpoint properly requires authentication")
        return True
    else:
        print(f"❌ Chatkit main endpoint should require auth but got: {chat_response.status_code}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("TESTING AUTHENTICATION FLOW FOR CHATBOT")
    print("="*60)

    success = test_auth_flow()
    auth_required = test_without_auth()

    print("\n" + "="*60)
    if success and auth_required:
        print("✅ AUTHENTICATION FLOW WORKING CORRECTLY")
        print("The chatbot should now work with proper authentication!")
    else:
        print("❌ ISSUES WITH AUTHENTICATION FLOW")
    print("="*60)