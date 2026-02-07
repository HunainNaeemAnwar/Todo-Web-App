from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, Optional, cast
from sqlmodel import Session
from src.database.database import engine, get_session_context
from src.services.analytics_service import analytics_service
from src.services.task_service import TaskService  # type: ignore[reportAttributeAccessIssue]
from src.utils.jwt_validator import verify_token
from sqlmodel import select
from src.models.user import User
import structlog

logger = structlog.get_logger(__name__)

analytics_router = APIRouter()
security = HTTPBearer()


async def get_current_user_id(request: Request) -> str:
    """Dependency to get the current user ID from the JWT token"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token: str = auth_header.split(" ")[1]
    else:
        auth_token = request.cookies.get("auth_token")
        if not auth_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Bearer token required",
            )
        token = auth_token

    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id",
        )

    return user_id


UserIdDep = Annotated[str, Depends(get_current_user_id)]


@analytics_router.get("/productivity")
@analytics_router.get("/productivity/")
async def get_productivity_data(
    user_id: UserIdDep,
    period: str = "week",
):
    """Get productivity data for charts (daily/weekly/monthly)."""
    if period not in ["week", "month", "quarter"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Period must be 'week', 'month', or 'quarter'",
        )

    try:
        with get_session_context() as session:
            data = analytics_service.get_productivity_data(session, user_id, period)
            return {"period": period, "data": data}
    except Exception as e:
        logger.error("Error fetching productivity data", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again.",
        )


@analytics_router.get("/weekly-activity")
@analytics_router.get("/weekly-activity/")
async def get_weekly_activity(
    user_id: UserIdDep,
    weeks: int = 8,
):
    """Get weekly activity data for charts."""
    if weeks < 1 or weeks > 52:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Weeks must be between 1 and 52",
        )

    with get_session_context() as session:
        activity = analytics_service.get_weekly_activity(session, user_id, weeks)
        return {"weeks": weeks, "activity": activity}


@analytics_router.get("/export/csv")
@analytics_router.get("/export/csv/")
async def export_tasks_csv(user_id: UserIdDep):
    """Export all user tasks to CSV format."""
    import csv
    import io
    from sqlmodel import Session
    from src.database.database import engine
    from sqlmodel import select
    from src.models.task import Task

    with Session(engine) as session:
        tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()  # type: ignore

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "id",
                "title",
                "description",
                "priority",
                "category",
                "due_date",
                "completed",
                "created_at",
            ]
        )

        for task in tasks:
            writer.writerow(
                [
                    task.id,  # type: ignore
                    task.title,  # type: ignore
                    task.description or "",  # type: ignore
                    task.priority or "",  # type: ignore
                    task.category or "",  # type: ignore
                    task.due_date.isoformat() if task.due_date else "",  # type: ignore
                    "TRUE" if task.completed else "FALSE",  # type: ignore
                    task.created_at.isoformat(),  # type: ignore
                ]
            )

    return {"filename": f"tasks_export_{user_id[:8]}.csv", "content": output.getvalue()}


@analytics_router.get("/report/weekly")
@analytics_router.get("/report/weekly/")
async def get_weekly_report(user_id: UserIdDep):
    """Generate weekly productivity report."""
    from datetime import datetime, timezone, timedelta
    from src.services.task_service import TaskService  # type: ignore[reportAttributeAccessIssue]
    from sqlmodel import Session

    try:
        with Session(engine) as session:
            task_service = TaskService(session)
            tasks = await task_service.get_user_tasks(user_id)

            now = datetime.now(timezone.utc)
            week_start = now - timedelta(days=7)

            weekly_tasks = [
                t
                for t in tasks
                if (
                    t.created_at.replace(tzinfo=timezone.utc)
                    if t.created_at.tzinfo is None
                    else t.created_at
                )
                >= week_start
            ]
            completed_weekly = [t for t in weekly_tasks if t.completed]

            stats = analytics_service.get_user_stats(session, user_id)
            weekly_activity = analytics_service.get_weekly_activity(
                session, user_id, weeks=1
            )

            total_completed = len(completed_weekly)
            total_created = len(weekly_tasks)
            completion_rate = (
                (total_completed / total_created * 100) if total_created > 0 else 0
            )

            return {
                "type": "weekly",
                "period_start": week_start.isoformat(),
                "period_end": now.isoformat(),
                "summary": {
                    "tasks_created": total_created,
                    "tasks_completed": total_completed,
                    "completion_rate": round(completion_rate, 1),
                    "streak_current": stats["streak_current"],
                    "streak_best": stats["streak_best"],
                },
                "daily_breakdown": weekly_activity[0] if weekly_activity else {},
                "generated_at": now.isoformat(),
            }
    except Exception as e:
        logger.error("Error generating weekly report", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again.",
        )


@analytics_router.get("/report/monthly")
@analytics_router.get("/report/monthly/")
async def get_monthly_report(user_id: UserIdDep):
    """Generate monthly productivity report."""
    from datetime import datetime, timezone, timedelta
    from src.services.task_service import TaskService  # type: ignore[reportAttributeAccessIssue]
    from sqlmodel import Session

    try:
        with Session(engine) as session:
            task_service = TaskService(session)
            tasks = await task_service.get_user_tasks(user_id)

            now = datetime.now(timezone.utc)
            month_start = now - timedelta(days=30)

            monthly_tasks = [
                t
                for t in tasks
                if (
                    t.created_at.replace(tzinfo=timezone.utc)
                    if t.created_at.tzinfo is None
                    else t.created_at
                )
                >= month_start
            ]
            completed_monthly = [t for t in monthly_tasks if t.completed]

            productivity_data = analytics_service.get_productivity_data(
                session, user_id, "month"
            )

            total_completed = len(completed_monthly)
            total_created = len(monthly_tasks)
            completion_rate = (
                (total_completed / total_created * 100) if total_created > 0 else 0
            )

            avg_daily_completed = (
                sum(d["completed"] for d in productivity_data) / len(productivity_data)
                if productivity_data
                else 0
            )

            return {
                "type": "monthly",
                "period_start": month_start.isoformat(),
                "period_end": now.isoformat(),
                "summary": {
                    "tasks_created": total_created,
                    "tasks_completed": total_completed,
                    "completion_rate": round(completion_rate, 1),
                    "avg_daily_completed": round(avg_daily_completed, 1),
                    "total_days": 30,
                },
                "daily_breakdown": productivity_data,
                "generated_at": now.isoformat(),
            }
    except Exception as e:
        logger.error("Error generating monthly report", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again.",
        )
