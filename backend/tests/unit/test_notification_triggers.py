"""
Unit tests for notification triggers.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, AsyncMock, patch
from src.services.notification_service import NotificationService
from src.models.notification import NotificationType


class TestNotificationTriggers:
    """Test cases for notification trigger logic."""

    @pytest.fixture
    def service(self):
        return NotificationService()

    @pytest.fixture
    def mock_session(self):
        session = Mock()
        return session

    @pytest.mark.asyncio
    async def test_check_due_soon_no_tasks(self, service, mock_session):
        """Test that no notifications created when no tasks due soon."""
        mock_session.exec.return_value.all.return_value = []
        mock_session.exec.return_value.first.side_effect = [
            None,  # get_user_preferences
            None,  # Check for existing notification
        ]

        pref_mock = Mock()
        pref_mock.notify_due_soon = True
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_due_soon(mock_session, "user123")

        assert result == []

    @pytest.mark.asyncio
    async def test_check_due_soon_with_preferences_disabled(
        self, service, mock_session
    ):
        """Test that no notifications created when due_soon preference is disabled."""
        pref_mock = Mock()
        pref_mock.notify_due_soon = False
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_due_soon(mock_session, "user123")

        assert result == []

    @pytest.mark.asyncio
    async def test_check_overdue_no_tasks(self, service, mock_session):
        """Test that no notifications created when no overdue tasks."""
        mock_session.exec.return_value.all.return_value = []

        pref_mock = Mock()
        pref_mock.notify_overdue = True
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_overdue(mock_session, "user123")

        assert result == []

    @pytest.mark.asyncio
    async def test_check_overdue_with_preferences_disabled(self, service, mock_session):
        """Test that no notifications created when overdue preference is disabled."""
        pref_mock = Mock()
        pref_mock.notify_overdue = False
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_overdue(mock_session, "user123")

        assert result == []

    @pytest.mark.asyncio
    async def test_check_streak_milestone_reached(self, service, mock_session):
        """Test notification created when streak milestone reached."""
        pref_mock = Mock()
        pref_mock.notify_streaks = True
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_streak_milestone(
            mock_session, "user123", current_streak=7, previous_streak=5
        )

        assert result is not None
        assert result.type == NotificationType.STREAK
        assert "7-day streak" in result.message

    @pytest.mark.asyncio
    async def test_check_streak_milestone_not_reached(self, service, mock_session):
        """Test no notification when no milestone reached."""
        pref_mock = Mock()
        pref_mock.notify_streaks = True
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_streak_milestone(
            mock_session, "user123", current_streak=5, previous_streak=4
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_check_streak_preferences_disabled(self, service, mock_session):
        """Test no notification when streak preference is disabled."""
        pref_mock = Mock()
        pref_mock.notify_streaks = False
        mock_session.exec.return_value.first = pref_mock

        result = await service.check_and_notify_streak_milestone(
            mock_session, "user123", current_streak=7, previous_streak=5
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_run_notification_checks(self, service, mock_session):
        """Test running all notification checks."""
        mock_session.exec.return_value.all.return_value = []
        mock_session.exec.return_value.first.side_effect = [
            Mock(notify_due_soon=True),
            Mock(notify_overdue=True),
            Mock(notify_streaks=True),
        ]

        result = await service.run_notification_checks(
            mock_session, "user123", current_streak=3, previous_streak=0
        )

        assert "due_soon" in result
        assert "overdue" in result
        assert "streak" in result


class TestNotificationCRUD:
    """Test cases for notification CRUD operations."""

    @pytest.fixture
    def service(self):
        return NotificationService()

    @pytest.fixture
    def mock_session(self):
        return Mock()

    @pytest.mark.asyncio
    async def test_create_notification(self, service, mock_session):
        """Test creating a notification."""
        mock_session.refresh = Mock()

        result = await service.create_notification(
            mock_session,
            "user123",
            NotificationType.DUE_SOON,
            "Test Title",
            "Test Message",
            "task456",
        )

        assert result.user_id == "user123"
        assert result.type == NotificationType.DUE_SOON
        assert result.title == "Test Title"
        assert result.message == "Test Message"
        assert result.task_id == "task456"
        assert result.read == False

    @pytest.mark.asyncio
    async def test_mark_as_read(self, service, mock_session):
        """Test marking a notification as read."""
        notification_mock = Mock()
        notification_mock.read = False
        mock_session.exec.return_value.first = notification_mock

        result = await service.mark_as_read(mock_session, "notif123", "user123")

        assert result == True
        assert notification_mock.read == True
        mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_mark_as_read_not_found(self, service, mock_session):
        """Test marking non-existent notification as read."""
        mock_session.exec.return_value.first = None

        result = await service.mark_as_read(mock_session, "notif123", "user123")

        assert result == False

    @pytest.mark.asyncio
    async def test_mark_all_as_read(self, service, mock_session):
        """Test marking all notifications as read."""
        notifications = [Mock(read=False), Mock(read=False), Mock(read=False)]
        mock_session.exec.return_value.all.return_value = notifications

        result = await service.mark_all_as_read(mock_session, "user123")

        assert result == 3
        for n in notifications:
            assert n.read == True
        mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_unread_count(self, service, mock_session):
        """Test getting unread notification count."""
        mock_session.exec.return_value.count.return_value = 5

        result = await service.get_unread_count(mock_session, "user123")

        assert result == 5
