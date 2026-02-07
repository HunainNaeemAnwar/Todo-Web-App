from typing import Optional
from sqlalchemy import desc
from sqlmodel import Session, select, and_
from datetime import datetime, timezone, timedelta
from src.models.notification import (
    Notification,
    NotificationCreate,
    NotificationResponse,
)
from src.models.notification_preference import (
    NotificationPreference,
    NotificationPreferenceUpdate,
)
from src.models.task import Task


class NotificationService:
    """Handles notification CRUD operations and triggers."""

    def __init__(self):
        self.enabled = True

    async def create_notification(
        self,
        session: Session,
        user_id: str,
        type: str,
        title: str,
        message: str,
        task_id: Optional[str] = None,
    ) -> Notification:
        """Create a new notification."""
        notification = Notification(
            user_id=user_id,
            type=type,  # type: ignore
            title=title,
            message=message,
            task_id=task_id,
        )
        session.add(notification)
        session.commit()
        session.refresh(notification)
        return notification

    async def check_and_notify_due_soon(
        self,
        session: Session,
        user_id: str,
    ) -> list[Notification]:
        """Check for tasks due within 24 hours and create notifications."""
        pref = await self.get_user_preferences(session, user_id)
        if not pref.notify_due_soon:
            return []

        now = datetime.now(timezone.utc)
        tomorrow = now + timedelta(hours=24)

        tasks = session.exec(
            select(Task).where(
                and_(
                    Task.user_id == user_id,  # type: ignore
                    Task.completed.is_(False),  # type: ignore
                    Task.due_date.isnot(None),  # type: ignore
                    Task.due_date >= now,  # type: ignore
                    Task.due_date <= tomorrow,  # type: ignore
                )
            )
        ).all()

        notifications = []
        for task in tasks:
            already_notified = session.exec(
                select(Notification).where(
                    and_(
                        Notification.user_id == user_id,  # type: ignore
                        Notification.type == "due_soon",  # type: ignore
                        Notification.task_id == task.id,  # type: ignore
                    )
                )
            ).first()

            if not already_notified:
                notification = await self.create_notification(
                    session,
                    user_id,
                    "due_soon",
                    "Task Due Soon",
                    f'"{task.title}" is due within the next 24 hours',
                    task.id,  # type: ignore
                )
                notifications.append(notification)

        return notifications

    async def check_and_notify_overdue(
        self,
        session: Session,
        user_id: str,
    ) -> list[Notification]:
        """Check for overdue tasks and create notifications."""
        pref = await self.get_user_preferences(session, user_id)
        if not pref.notify_overdue:
            return []

        now = datetime.now(timezone.utc)

        tasks = session.exec(
            select(Task).where(
                and_(
                    Task.user_id == user_id,  # type: ignore
                    Task.completed.is_(False),  # type: ignore
                    Task.due_date.isnot(None),  # type: ignore
                    Task.due_date < now,  # type: ignore
                )
            )
        ).all()

        notifications = []
        for task in tasks:
            already_notified = session.exec(
                select(Notification).where(
                    and_(
                        Notification.user_id == user_id,  # type: ignore
                        Notification.type == "overdue",  # type: ignore
                        Notification.task_id == task.id,  # type: ignore
                    )
                )
            ).first()

            if not already_notified:
                notification = await self.create_notification(
                    session,
                    user_id,
                    "overdue",
                    "Task Overdue",
                    f'"{task.title}" is overdue!',
                    task.id,  # type: ignore
                )
                notifications.append(notification)

        return notifications

    async def check_and_notify_streak_milestone(
        self,
        session: Session,
        user_id: str,
        current_streak: int,
        previous_streak: int,
    ) -> Optional[Notification]:
        """Notify when user reaches a streak milestone."""
        pref = await self.get_user_preferences(session, user_id)
        if not pref.notify_streaks:
            return None

        milestones = [3, 7, 14, 30, 60, 100]
        milestone = next(
            (m for m in milestones if current_streak == m and previous_streak < m), None
        )

        if milestone:
            return await self.create_notification(
                session,
                user_id,
                "streak",
                "Streak Milestone!",
                f"Congratulations! You've maintained a {milestone}-day streak!",
            )

        return None

    async def run_notification_checks(
        self,
        session: Session,
        user_id: str,
        current_streak: int = 0,
        previous_streak: int = 0,
    ) -> dict:
        """Run all notification checks for a user."""
        results = {
            "due_soon": 0,
            "overdue": 0,
            "streak": None,
        }

        due_soon_notifications = await self.check_and_notify_due_soon(session, user_id)
        results["due_soon"] = len(due_soon_notifications)

        overdue_notifications = await self.check_and_notify_overdue(session, user_id)
        results["overdue"] = len(overdue_notifications)

        if current_streak > previous_streak:
            streak_notification = await self.check_and_notify_streak_milestone(
                session, user_id, current_streak, previous_streak
            )
            results["streak"] = streak_notification is not None

        return results

    async def get_user_notifications(
        self,
        session: Session,
        user_id: str,
        limit: int = 20,
        cursor: Optional[str] = None,
    ) -> tuple[list[Notification], Optional[str]]:
        """Get paginated user notifications."""
        query = select(Notification).where(Notification.user_id == user_id)

        if cursor:
            query = query.where(Notification.id > cursor)

        query = query.order_by(Notification.created_at.desc()).limit(limit + 1)  # type: ignore

        notifications = session.exec(query).all()

        next_cursor = None
        if len(notifications) > limit:
            notifications = notifications[:limit]
            next_cursor = str(notifications[-1].id)

        return list(notifications), next_cursor

    async def mark_as_read(
        self,
        session: Session,
        notification_id: str,
        user_id: str,
    ) -> bool:
        """Mark single notification as read."""
        notification = session.exec(
            select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
            )
        ).first()

        if notification:
            notification.read = True
            session.commit()
            return True
        return False

    async def mark_all_as_read(self, session: Session, user_id: str) -> int:
        """Mark all notifications as read, returns count."""
        notifications = session.exec(
            select(Notification).where(
                and_(
                    Notification.user_id == user_id,
                    Notification.read == False,
                )
            )
        ).all()

        count = len(notifications)
        for notification in notifications:
            notification.read = True

        session.commit()
        return count

    async def get_unread_count(
        self,
        session: Session,
        user_id: str,
    ) -> int:
        """Get count of unread notifications."""
        result = session.exec(
            select(Notification).where(
                and_(
                    Notification.user_id == user_id,
                    Notification.read == False,
                )
            )
        ).all()
        return len(result)

    async def get_user_preferences(
        self,
        session: Session,
        user_id: str,
    ) -> NotificationPreference:
        """Get user notification preferences, create default if not exists."""
        pref = session.exec(
            select(NotificationPreference).where(
                NotificationPreference.user_id == user_id
            )
        ).first()

        if not pref:
            pref = NotificationPreference(user_id=user_id)
            session.add(pref)
            session.commit()
            session.refresh(pref)

        return pref

    async def update_user_preferences(
        self,
        session: Session,
        user_id: str,
        update: NotificationPreferenceUpdate,
    ) -> NotificationPreference:
        """Update user notification preferences."""
        pref = await self.get_user_preferences(session, user_id)

        if update.notify_due_soon is not None:
            pref.notify_due_soon = update.notify_due_soon
        if update.notify_overdue is not None:
            pref.notify_overdue = update.notify_overdue
        if update.notify_streaks is not None:
            pref.notify_streaks = update.notify_streaks

        session.commit()
        session.refresh(pref)
        return pref


notification_service = NotificationService()
