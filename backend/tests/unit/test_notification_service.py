"""
Unit tests for notification service.
"""
import pytest
from unittest.mock import Mock, patch
from src.services.notification_service import NotificationService


def test_notification_service_initialization():
    """Test NotificationService initialization."""
    # Create an instance of the service
    service = NotificationService()

    # Verify that it was initialized correctly
    assert service is not None
    assert service.enabled is False


def test_send_notification_when_disabled():
    """Test sending notification when service is disabled."""
    service = NotificationService()

    # Call the send_notification method
    result = service.send_notification("user123", "Test message", "info")

    # Verify the result
    assert result["status"] == "disabled"
    assert "feature disabled in initial version" in result["message"]


def test_get_notifications_for_user_when_disabled():
    """Test getting notifications for user when service is disabled."""
    service = NotificationService()

    # Call the get_notifications_for_user method
    result = service.get_notifications_for_user("user123")

    # Verify the result is an empty list
    assert result == []


def test_mark_notification_as_read_when_disabled():
    """Test marking notification as read when service is disabled."""
    service = NotificationService()

    # Call the mark_notification_as_read method
    result = service.mark_notification_as_read("notification123", "user123")

    # Verify the result
    assert result["status"] == "disabled"
    assert "feature disabled in initial version" in result["message"]


def test_global_notification_service_instance():
    """Test that the global notification service instance exists."""
    from src.services.notification_service import notification_service

    # Verify that the global instance exists and is properly initialized
    assert notification_service is not None
    assert notification_service.enabled is False


def test_notification_service_all_methods_disabled():
    """Test that all notification service methods return disabled status."""
    service = NotificationService()

    # Test all methods return disabled status
    send_result = service.send_notification("user", "message")
    get_result = service.get_notifications_for_user("user")
    mark_result = service.mark_notification_as_read("notif", "user")

    assert send_result["status"] == "disabled"
    assert get_result == []
    assert mark_result["status"] == "disabled"


def test_notification_service_with_different_parameters():
    """Test notification service with different parameter values."""
    service = NotificationService()

    # Test with different notification types
    result = service.send_notification("user456", "Different message", "alert")
    assert result["status"] == "disabled"

    # Test with different user IDs
    result = service.get_notifications_for_user("different_user")
    assert result == []

    # Test with different notification IDs
    result = service.mark_notification_as_read("different_notif", "different_user")
    assert result["status"] == "disabled"