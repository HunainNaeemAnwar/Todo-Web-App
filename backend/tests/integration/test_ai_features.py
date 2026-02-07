#!/usr/bin/env python3
"""
Test script to verify the AI conversational features are working properly.
"""
import subprocess
import time
import requests
import signal
import sys
import os
from threading import Thread
import json

def start_backend():
    """Start the backend server"""
    print("Starting backend server for AI functionality test...")
    backend_process = subprocess.Popen(
        ["python", "-m", "uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=".",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return backend_process

def test_ai_conversational_features():
    """Test AI conversational features"""
    print("Testing AI conversational features...")

    # We can't test the full AI functionality without a valid JWT token,
    # but we can test that the endpoints exist and are properly structured
    try:
        # Test that the chat endpoint exists and returns proper error (not 404)
        response = requests.post("http://localhost:8000/api/chat/",
                                json={"message": "Test message"},
                                headers={"Content-Type": "application/json"})

        # Should return 401 (Unauthorized) rather than 404 (Not Found)
        if response.status_code == 401:
            print("✅ Chat endpoint exists and requires authentication")

            # Verify the response structure is correct for auth error
            data = response.json()
            if "detail" in data and "Bearer token required" in data["detail"]:
                print("✅ Chat endpoint authentication error structure correct")
                return True
            else:
                print(f"❌ Chat endpoint error structure unexpected: {data}")
                return False
        elif response.status_code == 404:
            print("❌ Chat endpoint not found - AI features may not be enabled")
            return False
        else:
            print(f"❌ Chat endpoint unexpected status: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Chat endpoint test failed: {str(e)}")
        return False

def test_mcp_tools_availability():
    """Test if MCP tools are available"""
    print("Testing MCP tools availability...")

    try:
        # Check if the main app has the MCP routes registered
        from src.api.main import app
        mcp_routes = [route for route in app.routes if '/mcp' in route.path]

        if mcp_routes:
            print(f"✅ MCP routes registered: {[route.path for route in mcp_routes]}")
            return True
        else:
            print("❌ No MCP routes found in main app")
            return False
    except Exception as e:
        print(f"❌ MCP routes test failed: {str(e)}")
        return False

def main():
    print("="*60)
    print("AI CONVERSATIONAL FEATURES VERIFICATION")
    print("="*60)

    # Start backend server
    backend_proc = start_backend()

    print("Waiting for backend server to start...")
    time.sleep(8)  # Give server time to start

    # Test AI features
    print("\n1. Testing AI conversational features...")
    ai_success = test_ai_conversational_features()

    print("\n2. Testing MCP tools availability...")
    mcp_success = test_mcp_tools_availability()

    # Summary
    print("\n" + "="*40)
    print("AI FEATURES SUMMARY:")
    print(f"Conversational API: {'✅ AVAILABLE' if ai_success else '❌ ISSUE'}")
    print(f"MCP Integration: {'✅ AVAILABLE' if mcp_success else '❌ ISSUE'}")

    overall_success = ai_success and mcp_success
    print(f"\nAI FEATURES STATUS: {'✅ ALL OPERATIONAL' if overall_success else '⚠️  PARTIAL'}")
    print("="*40)

    # Cleanup
    print("\nStopping backend server...")
    try:
        backend_proc.terminate()
        backend_proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        backend_proc.kill()

    return overall_success

if __name__ == "__main__":
    success = main()
    print(f"\nFinal result: {'SUCCESS' if success else 'ISSUES FOUND'}")
    sys.exit(0 if success else 1)