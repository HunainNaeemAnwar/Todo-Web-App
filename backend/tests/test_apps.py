#!/usr/bin/env python3
"""
Test script to verify backend and frontend applications are working properly.
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
    print("Starting backend server...")
    backend_process = subprocess.Popen(
        ["python", "-m", "uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd="backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return backend_process

def start_frontend():
    """Start the frontend server"""
    print("Starting frontend server...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return frontend_process

def check_backend_health():
    """Check if backend is responding"""
    try:
        response = requests.get("http://localhost:8000/")
        return response.status_code == 200
    except:
        return False

def check_frontend_health():
    """Check if frontend is responding"""
    try:
        response = requests.get("http://localhost:3000/")
        return response.status_code == 200
    except:
        return False

def test_api_endpoints():
    """Test key API endpoints"""
    endpoints_to_test = [
        ("/", 200),
        ("/docs", 200),
        ("/openapi.json", 200),
    ]

    results = []
    for endpoint, expected_status in endpoints_to_test:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}")
            success = response.status_code == expected_status
            results.append((f"Backend {endpoint}", success, response.status_code))
        except Exception as e:
            results.append((f"Backend {endpoint}", False, str(e)))

    return results

def test_mcp_integration():
    """Test MCP integration by checking if the mount point exists"""
    try:
        # MCP endpoints should return 405 (Method Not Allowed) or 401 (Unauthorized) rather than 404
        # if the server is properly mounted
        response = requests.options("http://localhost:8000/mcp")
        # If it returns 404, the MCP server might not be properly mounted
        is_mounted = response.status_code != 404
        return ("MCP Integration", is_mounted, response.status_code)
    except Exception as e:
        return ("MCP Integration", False, str(e))

def main():
    print("Testing backend and frontend applications...")

    # Start both servers
    backend_proc = start_backend()
    frontend_proc = start_frontend()

    print("Waiting for servers to start...")
    time.sleep(10)  # Give servers time to start

    # Test backend health
    print("\n1. Testing backend health...")
    backend_healthy = check_backend_health()
    print(f"   Backend health: {'✓ PASS' if backend_healthy else '✗ FAIL'}")

    # Test frontend health
    print("\n2. Testing frontend health...")
    frontend_healthy = check_frontend_health()
    print(f"   Frontend health: {'✓ PASS' if frontend_healthy else '✗ FAIL'}")

    # Test API endpoints
    print("\n3. Testing key API endpoints...")
    api_results = test_api_endpoints()
    for name, success, status in api_results:
        print(f"   {name}: {'✓ PASS' if success else '✗ FAIL'} (Status: {status})")

    # Test MCP integration
    print("\n4. Testing MCP integration...")
    mcp_result = test_mcp_integration()
    name, success, status = mcp_result
    print(f"   {name}: {'✓ PASS' if success else '✗ FAIL'} (Status: {status})")

    # Overall results
    print("\n" + "="*50)
    print("SUMMARY:")
    print(f"Backend Health: {'✓ PASS' if backend_healthy else '✗ FAIL'}")
    print(f"Frontend Health: {'✓ PASS' if frontend_healthy else '✗ FAIL'}")

    api_pass_count = sum(1 for _, success, _ in api_results if success)
    api_total_count = len(api_results)
    print(f"API Endpoints: {api_pass_count}/{api_total_count} passed")

    print(f"MCP Integration: {'✓ PASS' if success else '✗ FAIL'}")

    # Determine overall status
    overall_pass = (
        backend_healthy and
        frontend_healthy and
        api_pass_count == api_total_count
    )

    print(f"\nOVERALL STATUS: {'✓ ALL SYSTEMS OPERATIONAL' if overall_pass else '✗ ISSUES DETECTED'}")

    # Cleanup
    print("\nStopping servers...")
    try:
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait(timeout=5)
        frontend_proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        backend_proc.kill()
        frontend_proc.kill()

    return overall_pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)