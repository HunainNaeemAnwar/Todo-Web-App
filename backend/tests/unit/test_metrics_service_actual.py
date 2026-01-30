"""
Unit tests for metrics service.
"""
import pytest
from unittest.mock import Mock, patch, call
from src.logging_.metrics import record_request


def test_record_request_basic():
    """Test basic request recording."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Call record_request with basic parameters
                record_request("GET", "/api/test", 200, 0.1)

                # Verify that counter was incremented
                mock_counter.add.assert_called_once_with(
                    1,
                    attributes={
                        "http.method": "GET",
                        "http.route": "/api/test",
                        "http.status_code": 200
                    }
                )

                # Verify that histogram was recorded
                mock_histogram.record.assert_called_once_with(
                    0.1,
                    attributes={
                        "http.method": "GET",
                        "http.route": "/api/test",
                        "http.status_code": 200
                    }
                )

                # Verify that error counter was NOT called (200 is not an error)
                mock_error_counter.add.assert_not_called()


def test_record_request_error():
    """Test request recording for error responses."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Call record_request with error status code
                record_request("POST", "/api/data", 404, 0.2)

                # Verify that counter was incremented
                mock_counter.add.assert_called_once_with(
                    1,
                    attributes={
                        "http.method": "POST",
                        "http.route": "/api/data",
                        "http.status_code": 404
                    }
                )

                # Verify that histogram was recorded
                mock_histogram.record.assert_called_once_with(
                    0.2,
                    attributes={
                        "http.method": "POST",
                        "http.route": "/api/data",
                        "http.status_code": 404
                    }
                )

                # Verify that error counter WAS called (404 is an error)
                mock_error_counter.add.assert_called_once_with(
                    1,
                    attributes={
                        "http.method": "POST",
                        "http.route": "/api/data",
                        "http.status_code": 404
                    }
                )


def test_record_request_server_error():
    """Test request recording for server error responses."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Call record_request with server error status code
                record_request("PUT", "/api/update", 500, 0.5)

                # Verify that error counter was called (500 is an error)
                mock_error_counter.add.assert_called_once_with(
                    1,
                    attributes={
                        "http.method": "PUT",
                        "http.route": "/api/update",
                        "http.status_code": 500
                    }
                )


def test_record_request_different_methods():
    """Test request recording with different HTTP methods."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Test different HTTP methods
                methods_paths = [
                    ("GET", "/api/users"),
                    ("POST", "/api/users"),
                    ("PUT", "/api/users/123"),
                    ("DELETE", "/api/users/123"),
                    ("PATCH", "/api/users/123")
                ]

                for i, (method, path) in enumerate(methods_paths):
                    # Reset mocks for each call
                    mock_counter.reset_mock()
                    mock_histogram.reset_mock()
                    mock_error_counter.reset_mock()

                    # Call record_request
                    record_request(method, path, 200, 0.1)

                    # Verify that counter was incremented with correct attributes
                    mock_counter.add.assert_called_once_with(
                        1,
                        attributes={
                            "http.method": method,
                            "http.route": path,
                            "http.status_code": 200
                        }
                    )

                    # Verify that histogram was recorded with correct attributes
                    mock_histogram.record.assert_called_once_with(
                        0.1,
                        attributes={
                            "http.method": method,
                            "http.route": path,
                            "http.status_code": 200
                        }
                    )

                    # Verify that error counter was not called
                    mock_error_counter.add.assert_not_called()


def test_record_request_different_status_codes():
    """Test request recording with different status codes."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Test different status codes
                status_codes = [200, 201, 301, 400, 401, 403, 404, 500, 502, 503]

                for status_code in status_codes:
                    # Reset mocks for each call
                    mock_counter.reset_mock()
                    mock_histogram.reset_mock()
                    mock_error_counter.reset_mock()

                    # Call record_request
                    record_request("GET", "/api/test", status_code, 0.1)

                    # Verify that counter was incremented
                    mock_counter.add.assert_called_once()

                    # Verify that histogram was recorded
                    mock_histogram.record.assert_called_once()

                    # Check if error counter was called based on status code
                    if status_code >= 400:
                        mock_error_counter.add.assert_called_once()
                    else:
                        mock_error_counter.add.assert_not_called()


def test_record_request_different_durations():
    """Test request recording with different durations."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Test different durations
                durations = [0.001, 0.01, 0.1, 1.0, 10.0]

                for duration in durations:
                    # Reset mocks for each call
                    mock_counter.reset_mock()
                    mock_histogram.reset_mock()
                    mock_error_counter.reset_mock()

                    # Call record_request
                    record_request("GET", "/api/test", 200, duration)

                    # Verify that histogram was recorded with the correct duration
                    mock_histogram.record.assert_called_once_with(
                        duration,
                        attributes={
                            "http.method": "GET",
                            "http.route": "/api/test",
                            "http.status_code": 200
                        }
                    )


def test_record_request_complex_attributes():
    """Test request recording with complex attributes."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:
                # Call record_request with a complex path
                complex_path = "/api/users/123/posts/456/comments?filter=recent&limit=10"
                record_request("GET", complex_path, 200, 0.15)

                # Verify that counter was incremented with correct attributes
                mock_counter.add.assert_called_once_with(
                    1,
                    attributes={
                        "http.method": "GET",
                        "http.route": complex_path,
                        "http.status_code": 200
                    }
                )

                # Verify that histogram was recorded with correct attributes
                mock_histogram.record.assert_called_once_with(
                    0.15,
                    attributes={
                        "http.method": "GET",
                        "http.route": complex_path,
                        "http.status_code": 200
                    }
                )

                # Verify that error counter was not called
                mock_error_counter.add.assert_not_called()


def test_record_request_error_codes():
    """Test that error counter is called for various error codes."""
    with patch('src.logging_.metrics.request_counter') as mock_counter:
        with patch('src.logging_.metrics.request_duration_histogram') as mock_histogram:
            with patch('src.logging_.metrics.error_counter') as mock_error_counter:

                # Test client errors (4xx)
                for status_code in [400, 401, 403, 404, 422, 429]:
                    mock_error_counter.reset_mock()
                    record_request("GET", "/api/test", status_code, 0.1)
                    mock_error_counter.add.assert_called_once()

                # Test server errors (5xx)
                for status_code in [500, 502, 503, 504]:
                    mock_error_counter.reset_mock()
                    record_request("GET", "/api/test", status_code, 0.1)
                    mock_error_counter.add.assert_called_once()

                # Test success codes (should not call error counter)
                for status_code in [200, 201, 301, 302]:
                    mock_error_counter.reset_mock()
                    record_request("GET", "/api/test", status_code, 0.1)
                    mock_error_counter.add.assert_not_called()