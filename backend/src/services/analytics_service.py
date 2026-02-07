from typing import Optional, Any
from sqlmodel import Session, select, func, and_, asc, text
from sqlalchemy import Boolean, Integer, case
from datetime import datetime, timezone, timedelta
from src.models.task import Task


def make_naive(dt: datetime) -> datetime:
    """Convert timezone-aware datetime to naive for database comparison."""
    if dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


class AnalyticsService:
    """Handles statistics and streak calculations."""

    def get_user_stats(
        self,
        session: Session,
        user_id: str,
    ) -> dict:
        """Calculate all user statistics using database aggregations."""
        now = datetime.now(timezone.utc)
        now_naive = make_naive(now)

        # Use COUNT aggregation instead of loading all data
        total_tasks = (
            session.execute(
                select(func.count()).select_from(Task).where(Task.user_id == user_id)  # type: ignore
            ).scalar()
            or 0
        )

        completed_tasks = (
            session.execute(
                select(func.count())
                .select_from(Task)
                .where(and_(Task.user_id == user_id, Task.completed == True))  # type: ignore
            ).scalar()
            or 0
        )

        overdue_tasks = (
            session.execute(
                select(func.count())
                .select_from(Task)
                .where(
                    and_(
                        Task.user_id == user_id,  # type: ignore
                        Task.completed.is_(True),  # type: ignore
                        Task.due_date.isnot(None),  # type: ignore
                        Task.due_date < now_naive,  # type: ignore
                    )
                )
            ).scalar()
            or 0
        )

        completion_rate = (
            (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
        )

        current_streak, best_streak = self.calculate_streak(session, user_id)

        avg_tasks_per_day = self.calculate_avg_tasks_per_day(session, user_id)

        weekly_activity = self.get_weekly_activity(session, user_id)

        # Get user creation date with aggregation
        created_at = session.execute(
            select(func.min(Task.created_at)).where(Task.user_id == user_id)  # type: ignore
        ).scalar()

        if created_at is None:
            created_at = now

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "completion_rate": round(completion_rate, 1),
            "streak_current": current_streak,
            "streak_best": best_streak,
            "avg_tasks_per_day": round(avg_tasks_per_day, 1),
            "weekly_activity": weekly_activity,
            "created_at": created_at.isoformat(),
        }

    def calculate_streak(
        self,
        session: Session,
        user_id: str,
    ) -> tuple[int, int]:
        """Calculate current and best streak using database aggregation."""
        completed_dates = (
            session.execute(
                select(func.date(Task.completed_at)).where(  # type: ignore
                    and_(
                        Task.user_id == user_id,  # type: ignore
                        Task.completed.is_(True),  # type: ignore
                        Task.completed_at != None,  # type: ignore[operator]
                    )
                )
            )
            .scalars()
            .all()
        )

        if not completed_dates:
            return 0, 0

        # Convert to set of dates
        date_set = {d.date() if hasattr(d, "date") else d for d in completed_dates if d}
        sorted_dates = sorted(date_set)

        current_streak = 0
        today = datetime.now(timezone.utc).date()

        for i in range(len(sorted_dates)):
            check_date = today - timedelta(days=i)
            if check_date in sorted_dates:
                current_streak += 1
            else:
                break

        best_streak = 1
        if len(sorted_dates) > 1:
            max_streak = 1
            current = 1
            for i in range(1, len(sorted_dates)):
                if sorted_dates[i] == sorted_dates[i - 1] + timedelta(days=1):
                    current += 1
                    max_streak = max(max_streak, current)
                else:
                    current = 1
            best_streak = max_streak

        return current_streak, best_streak

    def calculate_avg_tasks_per_day(
        self,
        session: Session,
        user_id: str,
    ) -> float:
        """Calculate average tasks per day using database aggregation."""
        # Get count and oldest task date in one query
        result = session.execute(
            select(
                func.count().label("total"),
                func.min(Task.created_at).label("first"),  # type: ignore
            ).where(Task.user_id == user_id)  # type: ignore
        ).one_or_none()

        if not result or result.total == 0:
            return 0.0

        first_task = result.first
        if not first_task:
            return 0.0

        created_at = first_task
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        days_since = (datetime.now(timezone.utc) - created_at).days
        days_since = max(days_since, 1)

        return result.total / days_since

    def get_weekly_activity(
        self,
        session: Session,
        user_id: str,
        weeks: int = 8,
    ) -> list[dict]:
        """Get daily completion counts using database aggregation."""
        # Aggregate completion counts by date using database
        completed_counts = session.execute(
            select(
                func.date(Task.completed_at).label("date"),  # type: ignore[reportAttributeAccessIssue]
                func.count().label("count"),  # type: ignore
            )
            .where(
                and_(
                    Task.user_id == user_id,  # type: ignore
                    Task.completed.is_(True),  # type: ignore
                    Task.completed_at != None,  # type: ignore[operator]
                )
            )
            .group_by(func.date(Task.completed_at))  # type: ignore[reportAttributeAccessIssue]
        ).all()

        date_counts: dict[Any, int] = {}
        for row in completed_counts:
            count_val: Any = getattr(row, "count", 0)
            if callable(count_val):
                count_val = count_val()
            date_counts[row.date] = int(count_val)  # type: ignore[index]

        activity: list[dict[str, str | int]] = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        today = datetime.now(timezone.utc).date()

        for week_offset in range(weeks):
            week_data: dict[str, str | int] = {
                "week": f"Week {-week_offset}" if week_offset > 0 else "Current"
            }
            for day_offset in range(7):
                target_date = today - timedelta(weeks=week_offset, days=day_offset)
                day_name = days[(target_date.weekday()) % 7]
                count = date_counts.get(target_date, 0)
                week_data[day_name.lower()] = int(count) if count is not None else 0

            activity.append(week_data)

        return activity

    def get_productivity_data(
        self,
        session: Session,
        user_id: str,
        period: str,
    ) -> list[dict]:
        """Get chart-ready productivity data using database aggregation."""
        data = []
        today = datetime.now(timezone.utc).date()

        if period == "week":
            # Aggregate by date using database
            productivity = session.execute(
                select(
                    func.date(Task.created_at).label("date"),
                    func.count().label("created"),
                    func.sum(case((Task.completed.is_(True), 1), else_=0)).label(  # type: ignore
                        "completed"
                    ),
                )
                .where(Task.user_id == user_id)  # type: ignore
                .group_by(func.date(Task.created_at))
            ).all()

            productivity_map = {
                row.date: {"created": row.created or 0, "completed": row.completed or 0}
                for row in productivity
            }

            for i in range(7):
                date = today - timedelta(days=6 - i)
                counts = productivity_map.get(date, {"created": 0, "completed": 0})
                data.append(
                    {
                        "date": date.isoformat(),
                        "created": counts["created"],
                        "completed": counts["completed"],
                    }
                )

        elif period == "month":
            productivity = session.execute(
                select(
                    func.date(Task.created_at).label("date"),
                    func.count().label("created"),
                    func.sum(case((Task.completed.is_(True), 1), else_=0)).label(  # type: ignore
                        "completed"
                    ),
                )
                .where(Task.user_id == user_id)  # type: ignore
                .group_by(func.date(Task.created_at))
            ).all()

            productivity_map = {
                row.date: {"created": row.created or 0, "completed": row.completed or 0}
                for row in productivity
            }

            for i in range(30):
                date = today - timedelta(days=29 - i)
                counts = productivity_map.get(date, {"created": 0, "completed": 0})
                data.append(
                    {
                        "date": date.isoformat(),
                        "created": counts["created"],
                        "completed": counts["completed"],
                    }
                )

        elif period == "quarter":
            # Aggregate by week using database
            productivity = session.execute(
                select(
                    func.date_trunc("week", Task.created_at).label("week_start"),
                    func.count().label("created"),
                    func.sum(case((Task.completed.is_(True), 1), else_=0)).label(  # type: ignore
                        "completed"
                    ),
                )
                .where(Task.user_id == user_id)  # type: ignore
                .group_by(func.date_trunc("week", Task.created_at))
            ).all()

            week_map = {
                (
                    row.week_start.date()
                    if hasattr(row.week_start, "date")
                    else row.week_start
                ): {
                    "created": row.created or 0,
                    "completed": row.completed or 0,
                }
                for row in productivity
            }

            for i in range(12):
                date = today - timedelta(days=(11 - i) * 7)
                week_start = date - timedelta(days=date.weekday())
                counts = week_map.get(week_start, {"created": 0, "completed": 0})
                data.append(
                    {
                        "date": week_start.isoformat(),
                        "week": f"W{12 - i}",
                        "created": counts["created"],
                        "completed": counts["completed"],
                    }
                )

        return data


analytics_service = AnalyticsService()
