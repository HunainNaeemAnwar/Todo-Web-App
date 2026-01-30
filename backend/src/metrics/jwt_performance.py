"""
JWT performance benchmarking module.
Measures JWT verification performance to ensure it meets performance requirements.
"""
import time
import statistics
from typing import List
from src.utils.jwt_validator import create_access_token, verify_token


class JWTPerformanceBenchmark:
    """Benchmark JWT verification performance."""

    def __init__(self):
        self.results = []

    def benchmark_single_verification(self, token: str) -> float:
        """Benchmark a single JWT verification operation."""
        start_time = time.perf_counter()
        verify_token(token)
        end_time = time.perf_counter()

        return end_time - start_time

    def benchmark_verification_performance(self, num_iterations: int = 1000) -> dict:
        """Run benchmark on JWT verification performance."""
        # Create a sample token for testing
        payload = {"user_id": "test-user-id", "sub": "benchmark"}
        test_token = create_access_token(payload)

        verification_times = []

        for _ in range(num_iterations):
            elapsed_time = self.benchmark_single_verification(test_token)
            verification_times.append(elapsed_time)

        # Calculate statistics
        stats = {
            "num_verifications": num_iterations,
            "total_time": sum(verification_times),
            "average_time": statistics.mean(verification_times),
            "median_time": statistics.median(verification_times),
            "min_time": min(verification_times),
            "max_time": max(verification_times),
            "std_deviation": statistics.stdev(verification_times) if len(verification_times) > 1 else 0,
            "p95_time": sorted(verification_times)[int(0.95 * len(verification_times))] if verification_times else 0,
            "p99_time": sorted(verification_times)[int(0.99 * len(verification_times))] if verification_times else 0,
            "verifications_per_second": num_iterations / sum(verification_times) if sum(verification_times) > 0 else 0
        }

        self.results.append(stats)
        return stats

    def check_performance_requirements(self, stats: dict) -> bool:
        """Check if performance meets requirements (e.g., avg verification under 5ms)."""
        # Requirement: JWT verification should be fast (under 5ms average)
        avg_time_ms = stats["average_time"] * 1000  # Convert to milliseconds
        return avg_time_ms < 5.0  # Less than 5ms per verification

    def print_benchmark_report(self, stats: dict):
        """Print a formatted benchmark report."""
        print("JWT Verification Performance Benchmark")
        print("=" * 50)
        print(f"Number of verifications: {stats['num_verifications']:,}")
        print(f"Total time: {stats['total_time']:.4f}s")
        print(f"Average time: {stats['average_time']*1000:.4f}ms")
        print(f"Median time: {stats['median_time']*1000:.4f}ms")
        print(f"Min time: {stats['min_time']*1000:.4f}ms")
        print(f"Max time: {stats['max_time']*1000:.4f}ms")
        print(f"P95 time: {stats['p95_time']*1000:.4f}ms")
        print(f"P99 time: {stats['p99_time']*1000:.4f}ms")
        print(f"Std deviation: {stats['std_deviation']*1000:.4f}ms")
        print(f"Verifications/sec: {stats['verifications_per_second']:,.0f}")
        print(f"Meets requirements: {'YES' if self.check_performance_requirements(stats) else 'NO'}")


# Global benchmark instance
jwt_benchmark = JWTPerformanceBenchmark()


def run_jwt_performance_benchmarks():
    """Run JWT performance benchmarks and return results."""
    return jwt_benchmark.benchmark_verification_performance()


if __name__ == "__main__":
    # Run benchmark when script is executed directly
    results = run_jwt_performance_benchmarks()
    jwt_benchmark.print_benchmark_report(results)