from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlmodel import Session
from src.database.database import get_session
from src.models.user import User, UserUpdate
from src.services.user_service import UserService
from src.services.analytics_service import analytics_service
from src.services.notification_service import notification_service
from src.models.notification import NotificationListResponse, NotificationResponse
from src.models.notification_preference import NotificationPreferenceUpdate
from src.api.dependencies import CurrentUser
import structlog

logger = structlog.get_logger(__name__)

user_router = APIRouter()


@user_router.get("/profile")
@user_router.get("/profile/")
async def get_user_profile(
    user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Get current user profile."""
    user_service = UserService(session)
    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


@user_router.put("/profile")
@user_router.put("/profile/")
async def update_user_profile(
    body: dict, user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Update user profile (name)."""
    name = body.get("name")

    if not name or not name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required and cannot be empty",
        )

    user_service = UserService(session)
    user_update = UserUpdate(name=name.strip())
    updated_user = await user_service.update_user(user_id, user_update=user_update)

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    logger.info("User profile updated", user_id=user_id)

    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "name": updated_user.name,
        "created_at": (
            updated_user.created_at.isoformat() if updated_user.created_at else None
        ),
        "updated_at": (
            updated_user.updated_at.isoformat() if updated_user.updated_at else None
        ),
    }


@user_router.get("/stats")
@user_router.get("/stats/")
async def get_user_stats(user_id: CurrentUser, session: Session = Depends(get_session)):
    """Get user task statistics."""
    stats = analytics_service.get_user_stats(session, user_id)
    return stats


@user_router.get("/notifications")
@user_router.get("/notifications/")
async def get_user_notifications(
    user_id: CurrentUser,
    session: Session = Depends(get_session),
    limit: int = 20,
    cursor: Optional[str] = None,
):
    """Get paginated user notifications."""
    notifications, next_cursor = await notification_service.get_user_notifications(
        session, user_id, limit, cursor
    )

    notification_responses = [
        NotificationResponse(
            id=n.id,
            type=n.type,
            title=n.title,
            message=n.message,
            task_id=n.task_id,
            read=n.read,
            created_at=n.created_at,
        )
        for n in notifications
    ]

    total_count = await notification_service.get_unread_count(session, user_id)

    return NotificationListResponse(
        notifications=notification_responses,
        next_cursor=next_cursor,
        total_count=total_count,
    )


@user_router.put("/notifications/{notification_id}/read")
@user_router.put("/notifications/{notification_id}/read/")
async def mark_notification_read(
    notification_id: str, user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Mark a notification as read."""
    success = await notification_service.mark_as_read(session, notification_id, user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    return {"success": True}


@user_router.put("/notifications/read-all")
@user_router.put("/notifications/read-all/")
async def mark_all_notifications_read(
    user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Mark all notifications as read."""
    count = await notification_service.mark_all_as_read(session, user_id)
    return {"success": True, "marked_count": count}


@user_router.get("/notifications/preferences")
@user_router.get("/notifications/preferences/")
async def get_notification_preferences(
    user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Get user notification preferences."""
    pref = await notification_service.get_user_preferences(session, user_id)
    return {
        "notify_due_soon": pref.notify_due_soon,
        "notify_overdue": pref.notify_overdue,
        "notify_streaks": pref.notify_streaks,
    }


@user_router.put("/notifications/preferences")
@user_router.put("/notifications/preferences/")
async def update_notification_preferences(
    body: dict, user_id: CurrentUser, session: Session = Depends(get_session)
):
    """Update user notification preferences."""
    update = NotificationPreferenceUpdate(
        notify_due_soon=body.get("notify_due_soon"),
        notify_overdue=body.get("notify_overdue"),
        notify_streaks=body.get("notify_streaks"),
    )

    pref = await notification_service.update_user_preferences(session, user_id, update)

    logger.info("Notification preferences updated", user_id=user_id)

    return {
        "notify_due_soon": pref.notify_due_soon,
        "notify_overdue": pref.notify_overdue,
        "notify_streaks": pref.notify_streaks,
    }
