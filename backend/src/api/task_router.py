from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from typing import List, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session
from src.database.database import get_session
from src.models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from src.services.task_service import TaskService
from src.api.dependencies import CurrentUser

limiter = Limiter(key_func=get_remote_address)

task_router = APIRouter()


@task_router.get("", response_model=List[TaskResponse])
@task_router.get("/", response_model=List[TaskResponse])
@limiter.limit("100/minute")
async def get_tasks(
    request: Request,
    current_user_id: CurrentUser,
    status_filter: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Get all tasks for the current user"""
    task_service = TaskService(session)
    return await task_service.get_user_tasks(current_user_id, status_filter)


@task_router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@task_router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("50/minute")
async def create_task(
    request: Request,
    task: TaskCreate,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session)
):
    """Create a new task for the current user"""
    task_service = TaskService(session)
    return await task_service.create_task(task, current_user_id)


@task_router.get("/{task_id}", response_model=TaskResponse)
@task_router.get("/{task_id}/", response_model=TaskResponse)
@limiter.limit("100/minute")
async def get_task(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session)
):
    """Get a specific task by ID"""
    task_service = TaskService(session)
    task = await task_service.get_task_by_id(task_id, current_user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@task_router.put("/{task_id}", response_model=TaskResponse)
@task_router.put("/{task_id}/", response_model=TaskResponse)
@limiter.limit("50/minute")
async def update_task(
    request: Request,
    task_id: str,
    task: TaskUpdate,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session)
):
    """Update a task by ID"""
    task_service = TaskService(session)
    updated_task = await task_service.update_task(task_id, task, current_user_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


@task_router.delete("/{task_id}")
@task_router.delete("/{task_id}/")
@limiter.limit("50/minute")
async def delete_task(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    session: Session = Depends(get_session)
):
    """Delete a task by ID"""
    task_service = TaskService(session)
    success = await task_service.delete_task(task_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@task_router.patch("/{task_id}/complete")
@task_router.patch("/{task_id}/complete/")
@limiter.limit("50/minute")
async def toggle_task_completion(
    request: Request,
    task_id: str,
    current_user_id: CurrentUser,
    completed: bool = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    """Toggle task completion status"""
    task_service = TaskService(session)
    updated_task = await task_service.toggle_task_completion(task_id, completed, current_user_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task
