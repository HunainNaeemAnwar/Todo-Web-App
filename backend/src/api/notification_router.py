from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select, and_
from src.database.database import get_session
from src.models.notification import (
    Notification,
    NotificationResponse,
    NotificationListResponse,
)
from src.models.notification_preference import (
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
)
from src.services.notification_service import notification_service
from src.api.dependencies import CurrentUser

limiter = Limiter(key_func=get_remote_address)

notification_router = APIRouter()


@notification_router.get("", response_model=NotificationListResponse)
@notification_router.get("/", response_model=NotificationListResponse)
@limiter.limit("60/minute")
async def get_notifications(
    request: Request,
    current_user_id: CurrentUser,
    limit: int = 20,
    cursor: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Get paginated notifications for the current user."""
    notifications, next_cursor = await notification_service.get_user_notifications(
        session, current_user_id, limit, cursor
    )
    return NotificationListResponse(
        notifications=[
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
        ],
        next_cursor=next_cursor,
        total_count=len(notifications),
    )


@notification_router.get("/unread-count", response_model=dict)
@limiter.limit("60/minute")
async def get_unread_count(
    request: Request,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Get count of unread notifications."""
    count = await notification_service.get_unread_count(session, current_user_id)
    return {"unread_count": count}


@notification_router.post(
    "/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT
)
@limiter.limit("60/minute")
async def mark_notification_read(
    request: Request,
    notification_id: str,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Mark a single notification as read."""
    success = await notification_service.mark_as_read(
        session, notification_id, current_user_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None


@notification_router.post("/read-all", response_model=dict)
@limiter.limit("30/minute")
async def mark_all_read(
    request: Request,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Mark all notifications as read."""
    count = await notification_service.mark_all_as_read(session, current_user_id)
    return {"marked_count": count}


@notification_router.get("/preferences", response_model=NotificationPreferenceResponse)
@limiter.limit("30/minute")
async def get_preferences(
    request: Request,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Get notification preferences."""
    pref = await notification_service.get_user_preferences(session, current_user_id)
    return NotificationPreferenceResponse(
        notify_due_soon=pref.notify_due_soon,
        notify_overdue=pref.notify_overdue,
        notify_streaks=pref.notify_streaks,
    )


@notification_router.put("/preferences", response_model=NotificationPreferenceResponse)
@limiter.limit("30/minute")
async def update_preferences(
    request: Request,
    current_user_id: CurrentUser,
    update: NotificationPreferenceUpdate,
    session: Session = Depends(get_session),
):
    """Update notification preferences."""
    pref = await notification_service.update_user_preferences(
        session, current_user_id, update
    )
    return NotificationPreferenceResponse(
        notify_due_soon=pref.notify_due_soon,
        notify_overdue=pref.notify_overdue,
        notify_streaks=pref.notify_streaks,
    )


@notification_router.post("/check", response_model=dict)
@limiter.limit("30/minute")
async def trigger_notification_check(
    request: Request,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Manually trigger notification checks for the current user."""
    results = await notification_service.run_notification_checks(
        session, current_user_id
    )
    return results
