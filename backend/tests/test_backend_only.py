#!/usr/bin/env python3
"""
Test script to verify backend functionality in detail.
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

def check_backend_health():
    """Check if backend is responding"""
    try:
        response = requests.get("http://localhost:8000/")
        return response.status_code == 200
    except:
        return False

def test_api_endpoints():
    """Test key API endpoints"""
    endpoints_to_test = [
        ("/", 200),
        ("/docs", 200),
        ("/openapi.json", 200),
        ("/api/auth/sign-up/email/", 422),  # Should return 422 (validation error) not 404
        ("/api/tasks/", 401),  # Should return 401 (unauthorized) not 404
    ]

    results = []
    for endpoint, expected_status in endpoints_to_test:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}")
            success = response.status_code == expected_status
            results.append((f"Backend {endpoint}", success, f"Got {response.status_code}, expected {expected_status}"))
        except Exception as e:
            results.append((f"Backend {endpoint}", False, str(e)))

    return results

def test_post_endpoints():
    """Test POST endpoints that require authentication"""
    post_tests = [
        ("/api/tasks/", 401, {}),  # Should return 401 (unauthorized)
    ]

    results = []
    for endpoint, expected_status, data in post_tests:
        try:
            response = requests.post(f"http://localhost:8000{endpoint}", json=data)
            success = response.status_code == expected_status
            results.append((f"Backend POST {endpoint}", success, f"Got {response.status_code}, expected {expected_status}"))
        except Exception as e:
            results.append((f"Backend POST {endpoint}", False, str(e)))

    return results

def test_mcp_server():
    """Test MCP server functionality by checking if it's properly mounted"""
    print("Testing MCP server endpoints...")

    # Test various MCP endpoints to see if the server is mounted
    mcp_endpoints = [
        "/mcp",           # Main MCP endpoint
        "/mcp/json",      # JSON protocol endpoint
        "/mcp/tools",     # Tools endpoint
        "/mcp/spec",      # Specification endpoint
    ]

    results = []
    for endpoint in mcp_endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}")
            # If it's a 404, the MCP server is not mounted
            # If it's 405 (Method Not Allowed), 401 (Unauthorized), or 200, it's mounted
            is_mounted = response.status_code != 404
            results.append((f"MCP {endpoint}", is_mounted, f"Status: {response.status_code}"))
        except Exception as e:
            results.append((f"MCP {endpoint}", False, str(e)))

    return results

def main():
    print("Testing backend functionality in detail...")

    # Start backend server
    backend_proc = start_backend()

    print("Waiting for backend server to start...")
    time.sleep(8)  # Give server time to start

    # Test backend health
    print("\n1. Testing backend health...")
    backend_healthy = check_backend_health()
    print(f"   Backend health: {'✓ PASS' if backend_healthy else '✗ FAIL'}")

    # Test API endpoints
    print("\n2. Testing key API endpoints...")
    api_results = test_api_endpoints()
    for name, success, msg in api_results:
        print(f"   {name}: {'✓ PASS' if success else '✗ FAIL'} ({msg})")

    # Test POST endpoints
    print("\n3. Testing POST endpoints...")
    post_results = test_post_endpoints()
    for name, success, msg in post_results:
        print(f"   {name}: {'✓ PASS' if success else '✗ FAIL'} ({msg})")

    # Test MCP server
    print("\n4. Testing MCP server integration...")
    mcp_results = test_mcp_server()
    for name, success, msg in mcp_results:
        print(f"   {name}: {'✓ PASS' if success else '✗ FAIL'} ({msg})")

    # Overall results
    print("\n" + "="*60)
    print("BACKEND FUNCTIONALITY SUMMARY:")
    print(f"Backend Health: {'✓ PASS' if backend_healthy else '✗ FAIL'}")

    api_pass_count = sum(1 for _, success, _ in api_results if success)
    api_total_count = len(api_results)
    print(f"API GET Endpoints: {api_pass_count}/{api_total_count} passed")

    post_pass_count = sum(1 for _, success, _ in post_results if success)
    post_total_count = len(post_results)
    print(f"API POST Endpoints: {post_pass_count}/{post_total_count} passed")

    mcp_pass_count = sum(1 for _, success, _ in mcp_results if success)
    mcp_total_count = len(mcp_results)
    print(f"MCP Endpoints: {mcp_pass_count}/{mcp_total_count} mounted")

    # Determine overall backend status
    overall_pass = (
        backend_healthy and
        api_pass_count == api_total_count and
        post_pass_count == post_total_count
    )

    print(f"\nBACKEND STATUS: {'✓ BACKEND OPERATIONAL' if overall_pass else '✗ BACKEND ISSUES'}")

    # Additional check for MCP - if all MCP endpoints return 404, MCP is not properly mounted
    all_mcp_404 = all(not success for name, success, msg in mcp_results)
    if all_mcp_404:
        print("\n⚠️  MCP SERVER WARNING: All MCP endpoints returned 404 - MCP may not be properly mounted")
        print("   This could indicate an issue with the app.mount('/mcp', mcp.http_app()) call")
    else:
        print(f"\n✓ MCP SERVER: {mcp_pass_count}/{mcp_total_count} endpoints accessible")

    # Cleanup
    print("\nStopping backend server...")
    try:
        backend_proc.terminate()
        backend_proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        backend_proc.kill()

    return overall_pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)