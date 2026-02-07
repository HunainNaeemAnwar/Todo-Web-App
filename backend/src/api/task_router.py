from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from typing import List, Optional, Dict, Any
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select, and_
from datetime import datetime, timezone, timedelta
from src.database.database import get_session
from src.models.task import Task, TaskCreate, TaskUpdate, TaskResponse  # type: ignore[reportAttributeAccessIssue]
from src.services.task_service import TaskService  # type: ignore[reportAttributeAccessIssue]
from src.api.dependencies import CurrentUser
from src.utils.validators import validate_calendar_period

limiter = Limiter(key_func=get_remote_address)

task_router = APIRouter()


@task_router.get("", response_model=List[TaskResponse])
@limiter.limit("100/minute")
async def get_tasks(
    request: Request,
    current_user_id: CurrentUser,
    status_filter: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Get all tasks for the current user"""
    task_service = TaskService(session)
    return await task_service.get_user_tasks(current_user_id, status_filter)


@task_router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("50/minute")
async def create_task(
    request: Request,
    task: TaskCreate,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Create a new task for the current user"""
    task_service = TaskService(session)
    return await task_service.create_task(task, current_user_id)


@task_router.get("/calendar")
async def get_tasks_for_calendar(
    request: Request,
    current_user_id: CurrentUser,
    period: str = "week",
    date: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Get tasks grouped by day for calendar view."""
    period = validate_calendar_period(period)

    reference_date = datetime.now(timezone.utc).date()
    if date:
        try:
            reference_date = datetime.fromisoformat(date.replace("Z", "+00:00")).date()
        except ValueError:
            pass

    if period == "today":
        start_date = datetime.combine(reference_date, datetime.min.time()).replace(
            tzinfo=timezone.utc
        )
        end_date = start_date + timedelta(days=1)
        days_set = {reference_date}
        days = [reference_date]
    elif period == "week":
        days_since_monday = reference_date.weekday()
        start_date = datetime.combine(
            reference_date - timedelta(days=days_since_monday), datetime.min.time()
        ).replace(tzinfo=timezone.utc)
        end_date = start_date + timedelta(days=7)
        days = [(start_date.date() + timedelta(days=i)) for i in range(7)]
        days_set = set(days)
    else:
        start_date = datetime.combine(
            reference_date.replace(day=1), datetime.min.time()
        ).replace(tzinfo=timezone.utc)
        days_in_month = (start_date.replace(day=28) + timedelta(days=5)).day
        end_date = start_date + timedelta(days=days_in_month)
        days = [(start_date + timedelta(days=i)).date() for i in range(days_in_month)]
        days_set = set(days)

    tasks = session.exec(select(Task).where(Task.user_id == current_user_id)).all()  # type: ignore

    grouped_tasks: Dict[str, List[Dict[str, Any]]] = {}

    for task in tasks:
        task_date = None
        if task.due_date:  # type: ignore[reportAttributeAccessIssue]
            due_date = task.due_date  # type: ignore[reportAttributeAccessIssue]
            if due_date.tzinfo:
                task_date = due_date.date()
            else:
                task_date = due_date.date()
        elif task.created_at:
            created_at = task.created_at
            if created_at.tzinfo:
                task_date = created_at.date()
            else:
                task_date = created_at.date()

        if task_date and task_date in days_set:
            date_key = task_date.isoformat()
            if date_key not in grouped_tasks:
                grouped_tasks[date_key] = []
            grouped_tasks[date_key].append(
                {
                    "id": task.id,
                    "title": task.title,
                    "completed": task.completed,
                    "priority": task.priority,  # type: ignore[reportAttributeAccessIssue]
                    "category": task.category,  # type: ignore[reportAttributeAccessIssue]
                    "due_date": task.due_date.isoformat() if task.due_date else None,  # type: ignore[reportAttributeAccessIssue]
                }
            )

    return {
        "period": period,
        "days": [d.isoformat() for d in days],
        "tasks_by_day": grouped_tasks,
    }


@task_router.get("/{task_id}", response_model=TaskResponse)
@limiter.limit("100/minute")
async def get_task(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Get a specific task by ID"""
    task_service = TaskService(session)
    task = await task_service.get_task_by_id(task_id, current_user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@task_router.put("/{task_id}", response_model=TaskResponse)
@limiter.limit("50/minute")
async def update_task(
    request: Request,
    task_id: str,
    task: TaskUpdate,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Update a task by ID"""
    task_service = TaskService(session)
    updated_task = await task_service.update_task(task_id, task, current_user_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


@task_router.delete("/{task_id}")
@limiter.limit("50/minute")
async def delete_task(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session),
):
    """Delete a task by ID"""
    task_service = TaskService(session)
    success = await task_service.delete_task(task_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@task_router.patch("/{task_id}/complete")
@limiter.limit("50/minute")
async def toggle_task_completion(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    completed: bool = Body(..., embed=True),
    session: Session = Depends(get_session),
):
    """Toggle task completion status"""
    task_service = TaskService(session)
    updated_task = await task_service.toggle_task_completion(
        task_id, completed, current_user_id
    )
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task
