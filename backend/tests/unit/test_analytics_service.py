"""
Unit tests for streak calculation in AnalyticsService.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, MagicMock
from src.services.analytics_service import AnalyticsService
from src.models.task import Task


class TestStreakCalculation:
    """Test cases for streak calculation algorithm."""

    def test_empty_completed_tasks_returns_zero_streak(self):
        """Test that empty completed tasks return (0, 0) for both streaks."""
        service = AnalyticsService()
        mock_session = Mock()

        # Mock session.exec to return empty list
        mock_session.exec.return_value.all.return_value = []

        result = service.calculate_streak(mock_session, "user123")

        assert result == (0, 0)

    def test_single_completed_task_returns_streak_of_one(self):
        """Test that a single completed task returns current streak of 1."""
        service = AnalyticsService()
        mock_session = Mock()

        # Mock completed_at for today
        completed_at = datetime.now(timezone.utc)
        mock_session.exec.return_value.all.return_value = [completed_at]

        current, best = service.calculate_streak(mock_session, "user123")

        assert current == 1
        assert best == 1

    def test_consecutive_days_increases_current_streak(self):
        """Test that consecutive completed days increase current streak."""
        service = AnalyticsService()
        mock_session = Mock()

        today = datetime.now(timezone.utc).date()
        completed_dates = [
            datetime.combine(today - timedelta(days=i), datetime.min.time())
            for i in range(3)
        ]
        mock_session.exec.return_value.all.return_value = completed_dates

        current, best = service.calculate_streak(mock_session, "user123")

        assert current == 3

    def test_gap_in_completed_days_breaks_current_streak(self):
        """Test that a gap in completed days resets current streak."""
        service = AnalyticsService()
        mock_session = Mock()

        today = datetime.now(timezone.utc).date()
        # Completed yesterday, today, but not 2 days ago
        completed_dates = [
            datetime.combine(today, datetime.min.time()),
            datetime.combine(today - timedelta(days=1), datetime.min.time()),
        ]
        mock_session.exec.return_value.all.return_value = completed_dates

        current, best = service.calculate_streak(mock_session, "user123")

        assert current == 2

    def test_no_activity_today_resets_current_streak(self):
        """Test that no activity today resets current streak to 0."""
        service = AnalyticsService()
        mock_session = Mock()

        today = datetime.now(timezone.utc).date()
        # Only completed tasks from previous days
        completed_dates = [
            datetime.combine(today - timedelta(days=1), datetime.min.time()),
            datetime.combine(today - timedelta(days=2), datetime.min.time()),
        ]
        mock_session.exec.return_value.all.return_value = completed_dates

        current, best = service.calculate_streak(mock_session, "user123")

        assert current == 0

    def test_best_streak_tracks_longest_consecutive_period(self):
        """Test that best streak tracks the longest consecutive period."""
        service = AnalyticsService()
        mock_session = Mock()

        today = datetime.now(timezone.utc).date()
        # Pattern: 3 days, gap, 5 days
        completed_dates = []
        for i in range(3):
            completed_dates.append(
                datetime.combine(today - timedelta(days=7 + i), datetime.min.time())
            )
        for i in range(5):
            completed_dates.append(
                datetime.combine(today - timedelta(days=i), datetime.min.time())
            )

        mock_session.exec.return_value.all.return_value = completed_dates

        current, best = service.calculate_streak(mock_session, "user123")

        assert current == 5  # Current streak is 5 days
        assert best == 5  # Best streak is also 5 days

    def test_mixed_completion_times_same_day_count_once(self):
        """Test that multiple completions on the same day count as one day."""
        service = AnalyticsService()
        mock_session = Mock()

        today = datetime.now(timezone.utc).date()
        # Multiple tasks completed on the same day
        completed_dates = [
            datetime.now(timezone.utc),  # Today
            datetime.now(timezone.utc) - timedelta(hours=5),  # Same day, earlier
            datetime.now(timezone.utc) - timedelta(days=1),  # Yesterday
        ]
        mock_session.exec.return_value.all.return_value = completed_dates

        current, best = service.calculate_streak(mock_session, "user123")

        # Should count today and yesterday as 2 days, not 3
        assert current == 2


class TestGetUserStats:
    """Test cases for get_user_stats method."""

    def test_get_user_stats_returns_complete_structure(self):
        """Test that get_user_stats returns all required fields."""
        service = AnalyticsService()
        mock_session = Mock()

        # Mock all the queries
        mock_session.exec.return_value.count.side_effect = [
            5,
            3,
        ]  # total_tasks, completed_tasks
        mock_session.exec.return_value.first.side_effect = [
            Mock(created_at=datetime.now(timezone.utc) - timedelta(days=10)),
            None,  # For user query in get_user_stats
        ]
        mock_session.exec.return_value.all.return_value = []

        result = service.get_user_stats(mock_session, "user123")

        assert "total_tasks" in result
        assert "completed_tasks" in result
        assert "completion_rate" in result
        assert "streak_current" in result
        assert "streak_best" in result
        assert "avg_tasks_per_day" in result
        assert "weekly_activity" in result
        assert "created_at" in result

    def test_completion_rate_calculated_correctly(self):
        """Test that completion rate is calculated correctly."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.side_effect = [
            10,
            7,
        ]  # 10 total, 7 completed
        mock_session.exec.return_value.first.side_effect = [
            Mock(created_at=datetime.now(timezone.utc) - timedelta(days=10)),
            None,
        ]
        mock_session.exec.return_value.all.return_value = []

        result = service.get_user_stats(mock_session, "user123")

        assert result["completion_rate"] == 70.0

    def test_completion_rate_zero_when_no_tasks(self):
        """Test that completion rate is 0 when there are no tasks."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_user_stats(mock_session, "user123")

        assert result["completion_rate"] == 0.0
        assert result["total_tasks"] == 0
        assert result["completed_tasks"] == 0


class TestWeeklyActivity:
    """Test cases for weekly activity calculation."""

    def test_weekly_activity_returns_correct_structure(self):
        """Test that weekly activity returns correct data structure."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_weekly_activity(mock_session, "user123", weeks=2)

        assert len(result) == 2
        for week in result:
            assert "week" in week
            assert "mon" in week
            assert "tue" in week
            assert "wed" in week
            assert "thu" in week
            assert "fri" in week
            assert "sat" in week
            assert "sun" in week

    def test_weekly_activity_counts_completed_tasks(self):
        """Test that weekly activity correctly counts completed tasks."""
        service = AnalyticsService()
        mock_session = Mock()

        # Set up mocks to return counts
        mock_session.exec.return_value.count.return_value = 1
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_weekly_activity(mock_session, "user123", weeks=1)

        assert len(result) == 1
        # Each day should have a count (could be 0 or more)


class TestProductivityData:
    """Test cases for productivity data calculation."""

    def test_productivity_data_week_period(self):
        """Test productivity data for week period."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_productivity_data(mock_session, "user123", "week")

        assert len(result) == 7
        for day in result:
            assert "date" in day
            assert "created" in day
            assert "completed" in day

    def test_productivity_data_month_period(self):
        """Test productivity data for month period."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_productivity_data(mock_session, "user123", "month")

        assert len(result) == 30

    def test_productivity_data_quarter_period(self):
        """Test productivity data for quarter period."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None
        mock_session.exec.return_value.all.return_value = []

        result = service.get_productivity_data(mock_session, "user123", "quarter")

        assert len(result) == 12  # 12 weeks in a quarter


class TestAverageTasksPerDay:
    """Test cases for average tasks per day calculation."""

    def test_average_tasks_per_day_zero_when_no_tasks(self):
        """Test that average is 0 when there are no tasks."""
        service = AnalyticsService()
        mock_session = Mock()

        mock_session.exec.return_value.count.return_value = 0
        mock_session.exec.return_value.first.return_value = None

        result = service.calculate_avg_tasks_per_day(mock_session, "user123")

        assert result == 0.0

    def test_average_tasks_per_day_calculated_correctly(self):
        """Test that average tasks per day is calculated correctly."""
        service = AnalyticsService()
        mock_session = Mock()

        first_task_time = datetime.now(timezone.utc) - timedelta(days=10)
        mock_session.exec.return_value.count.return_value = 5  # 5 tasks in 10 days
        mock_session.exec.return_value.first.return_value = Mock(
            created_at=first_task_time
        )

        result = service.calculate_avg_tasks_per_day(mock_session, "user123")

        assert result == 0.5  # 5 tasks / 10 days = 0.5 per day
