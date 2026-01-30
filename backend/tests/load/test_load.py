"""
Load testing scenarios for Task Management API.

Tests performance requirements:
- SC-008: Reads < 200ms 95% of time
- SC-009: Writes < 500ms 95% of time
"""
import asyncio
import statistics
import time
from typing import Any
import httpx
import pytest

BASE_URL = "http://localhost:8000"
AUTH_TOKEN = "test-jwt-token"


async def make_authenticated_request(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    token: str = AUTH_TOKEN,
    **kwargs: Any
) -> httpx.Response:
    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {token}"
    headers["Content-Type"] = "application/json"
    return await client.request(method, f"{BASE_URL}{url}", headers=headers, **kwargs)


async def test_read_performance(num_requests: int = 100, concurrent: int = 10) -> dict[str, Any]:
    """Test GET /api/tasks endpoint performance (should be < 200ms 95% of time)."""
    async with httpx.AsyncClient() as client:
        latencies = []
        start = time.perf_counter()

        async def make_request(request_id: int) -> float:
            start_time = time.perf_counter()
            response = await make_authenticated_request(client, "GET", "/api/tasks/")
            elapsed = time.perf_counter() - start_time
            latencies.append(elapsed * 1000)  # Convert to ms
            return elapsed

        tasks = [make_request(i) for i in range(num_requests)]
        await asyncio.gather(*tasks)

        total_time = time.perf_counter() - start
        latencies.sort()

        p95 = latencies[int(len(latencies) * 0.95)]
        p50 = latencies[int(len(latencies) * 0.50)]

        return {
            "total_requests": num_requests,
            "total_time_ms": total_time * 1000,
            "avg_latency_ms": statistics.mean(latencies),
            "p50_latency_ms": p50,
            "p95_latency_ms": p95,
            "min_latency_ms": min(latencies),
            "max_latency_ms": max(latencies),
            "passed": p95 < 200,
        }


async def test_write_performance(num_requests: int = 50, concurrent: int = 10) -> dict[str, Any]:
    """Test POST /api/tasks endpoint performance (should be < 500ms 95% of time)."""
    async with httpx.AsyncClient() as client:
        latencies = []
        start = time.perf_counter()

        async def make_request(request_id: int) -> float:
            start_time = time.perf_counter()
            payload = {
                "title": f"Load Test Task {request_id}",
                "description": "Test description for load testing",
                "completed": False,
            }
            response = await make_authenticated_request(
                client, "POST", "/api/tasks/", json=payload
            )
            elapsed = time.perf_counter() - start_time
            latencies.append(elapsed * 1000)
            return elapsed

        tasks = [make_request(i) for i in range(num_requests)]
        await asyncio.gather(*tasks)

        total_time = time.perf_counter() - start
        latencies.sort()

        p95 = latencies[int(len(latencies) * 0.95)]
        p50 = latencies[int(len(latencies) * 0.50)]

        return {
            "total_requests": num_requests,
            "total_time_ms": total_time * 1000,
            "avg_latency_ms": statistics.mean(latencies),
            "p50_latency_ms": p50,
            "p95_latency_ms": p95,
            "min_latency_ms": min(latencies),
            "max_latency_ms": max(latencies),
            "passed": p95 < 500,
        }


async def test_auth_performance(num_requests: int = 100, concurrent: int = 10) -> dict[str, Any]:
    """Test authentication endpoint performance."""
    async with httpx.AsyncClient() as client:
        latencies = []
        start = time.perf_counter()

        async def make_request(request_id: int) -> float:
            start_time = time.perf_counter()
            response = await client.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": "test@example.com", "password": "testpassword123"},
                headers={"Content-Type": "application/json"},
            )
            elapsed = time.perf_counter() - start_time
            latencies.append(elapsed * 1000)
            return elapsed

        tasks = [make_request(i) for i in range(num_requests)]
        await asyncio.gather(*tasks)

        total_time = time.perf_counter() - start
        latencies.sort()

        p95 = latencies[int(len(latencies) * 0.95)]
        p50 = latencies[int(len(latencies) * 0.50)]

        return {
            "total_requests": num_requests,
            "total_time_ms": total_time * 1000,
            "avg_latency_ms": statistics.mean(latencies),
            "p50_latency_ms": p50,
            "p95_latency_ms": p95,
            "min_latency_ms": min(latencies),
            "max_latency_ms": max(latencies),
        }


async def run_all_load_tests() -> dict[str, Any]:
    """Run all load tests and return results."""
    results = {}

    print("Running load tests...")
    print("=" * 60)

    print("\nTest 1: Read Performance (GET /api/tasks)")
    print("-" * 40)
    read_results = await test_read_performance()
    results["read"] = read_results
    print(f"  Total Requests: {read_results['total_requests']}")
    print(f"  Total Time: {read_results['total_time_ms']:.2f}ms")
    print(f"  Avg Latency: {read_results['avg_latency_ms']:.2f}ms")
    print(f"  P50 Latency: {read_results['p50_latency_ms']:.2f}ms")
    print(f"  P95 Latency: {read_results['p95_latency_ms']:.2f}ms")
    print(f"  Target: < 200ms (95th percentile)")
    print(f"  PASSED: {read_results['passed']}")

    print("\nTest 2: Write Performance (POST /api/tasks)")
    print("-" * 40)
    write_results = await test_write_performance()
    results["write"] = write_results
    print(f"  Total Requests: {write_results['total_requests']}")
    print(f"  Total Time: {write_results['total_time_ms']:.2f}ms")
    print(f"  Avg Latency: {write_results['avg_latency_ms']:.2f}ms")
    print(f"  P50 Latency: {write_results['p50_latency_ms']:.2f}ms")
    print(f"  P95 Latency: {write_results['p95_latency_ms']:.2f}ms")
    print(f"  Target: < 500ms (95th percentile)")
    print(f"  PASSED: {write_results['passed']}")

    print("\nTest 3: Auth Performance (POST /api/auth/login)")
    print("-" * 40)
    auth_results = await test_auth_performance()
    results["auth"] = auth_results
    print(f"  Total Requests: {auth_results['total_requests']}")
    print(f"  Total Time: {auth_results['total_time_ms']:.2f}ms")
    print(f"  Avg Latency: {auth_results['avg_latency_ms']:.2f}ms")
    print(f"  P50 Latency: {auth_results['p50_latency_ms']:.2f}ms")
    print(f"  P95 Latency: {auth_results['p95_latency_ms']:.2f}ms")

    print("\n" + "=" * 60)
    print("Summary:")
    all_passed = results["read"]["passed"] and results["write"]["passed"]
    print(f"  Read Tests: {'PASSED' if results['read']['passed'] else 'FAILED'}")
    print(f"  Write Tests: {'PASSED' if results['write']['passed'] else 'FAILED'}")
    print(f"  Overall: {'ALL PASSED' if all_passed else 'SOME FAILED'}")

    return results


if __name__ == "__main__":
    results = asyncio.run(run_all_load_tests())
