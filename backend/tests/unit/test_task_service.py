"""
Additional unit tests for task service to improve coverage.
"""
import pytest
from sqlmodel import Session, select
from src.services.task_service import TaskService
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.user import User
from src.utils.jwt_validator import create_access_token
import uuid
from datetime import datetime, timezone


def test_task_service_delete_task_with_invalid_user_id(session: Session):
    """Test that delete_task returns False when user_id is invalid."""
    service = TaskService(session)
    
    # Test with empty user_id
    result = service.delete_task_sync(str(uuid.uuid4()), "")
    assert result is False
    
    # Test with None user_id (passing None as string won't work, so skip)
    # The function checks `if not user_id` which is False for empty string


def test_task_service_toggle_task_not_found(session: Session):
    """Test that toggle_task_completion returns None when task not found."""
    # Create a user first so we have a valid user_id
    user = User(email="notfound_test@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    service = TaskService(session)
    
    # Use a valid UUID string that doesn't exist
    result = service.toggle_task_completion_sync(str(uuid.uuid4()), True, str(user.id))
    assert result is None


def test_task_service_update_task_not_found(session: Session):
    """Test that update_task returns None when task not found."""
    # Create a user first so we have a valid user_id
    user = User(email="update_notfound@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    service = TaskService(session)
    
    task_update = TaskUpdate(title="New Title")
    # Use a valid UUID string that doesn't exist
    result = service.update_task_sync(str(uuid.uuid4()), task_update, str(user.id))
    assert result is None


def test_task_service_get_user_tasks_with_completed_filter(session: Session):
    """Test get_user_tasks_sync with completed status filter."""
    # Create a user first
    user = User(email="filter_test@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create some tasks
    task1 = Task(
        title="Task 1",
        description="Description 1",
        completed=True,
        user_id=str(user.id)
    )
    task2 = Task(
        title="Task 2",
        description="Description 2",
        completed=False,
        user_id=str(user.id)
    )
    session.add(task1)
    session.add(task2)
    session.commit()
    
    service = TaskService(session)
    
    # Filter by completed
    completed_tasks = service.get_user_tasks_sync(str(user.id), "completed")
    assert len(completed_tasks) == 1
    assert completed_tasks[0].completed is True
    
    # Filter by pending
    pending_tasks = service.get_user_tasks_sync(str(user.id), "pending")
    assert len(pending_tasks) == 1
    assert pending_tasks[0].completed is False
    
    # Filter by all (default)
    all_tasks = service.get_user_tasks_sync(str(user.id), "all")
    assert len(all_tasks) == 2


def test_task_service_get_user_tasks_with_uppercase_filter(session: Session):
    """Test get_user_tasks_sync handles case-insensitive status filter."""
    user = User(email="case_test@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    task = Task(
        title="Test Task",
        completed=True,
        user_id=str(user.id)
    )
    session.add(task)
    session.commit()
    
    service = TaskService(session)
    
    # Test uppercase filter
    tasks = service.get_user_tasks_sync(str(user.id), "COMPLETED")
    assert len(tasks) == 1
    
    # Test mixed case filter
    tasks = service.get_user_tasks_sync(str(user.id), "PeNdInG")
    assert len(tasks) == 0


def test_task_service_create_task_with_minimal_data(session: Session):
    """Test create_task_sync with minimal data (title only)."""
    user = User(email="minimal_test@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    task_create = TaskCreate(title="Minimal Task")
    service = TaskService(session)
    
    task = service.create_task_sync(task_create, str(user.id))
    
    assert task is not None
    assert task.title == "Minimal Task"
    assert task.description is None
    assert task.completed is False
    assert task.user_id == user.id


def test_task_service_update_task_with_partial_data(session: Session):
    """Test update_task_sync with partial update data."""
    user = User(email="partial_update@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create existing task
    task = Task(
        title="Original Title",
        description="Original Description",
        completed=False,
        user_id=str(user.id)
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    
    service = TaskService(session)
    
    # Update only title
    update = TaskUpdate(title="Updated Title")
    updated_task = service.update_task_sync(task.id, update, str(user.id))
    
    assert updated_task is not None
    assert updated_task.title == "Updated Title"
    assert updated_task.description == "Original Description"  # Should remain unchanged
    assert updated_task.completed is False  # Should remain unchanged


def test_task_service_get_task_by_id_sync_not_found(session: Session):
    """Test get_task_by_id_sync returns None when task doesn't exist."""
    service = TaskService(session)
    
    result = service.get_task_by_id_sync(str(uuid.uuid4()), str(uuid.uuid4()))
    assert result is None


def test_task_service_delete_task_not_found(session: Session):
    """Test delete_task_sync returns False when task doesn't exist."""
    service = TaskService(session)

    # Use string UUID to match the task model's id type
    result = service.delete_task_sync(str(uuid.uuid4()), str(uuid.uuid4()))
    assert result is False


def test_task_service_delete_task_with_nonexistent_task_id(session: Session):
    """Test delete_task_sync handles invalid UUID format gracefully."""
    service = TaskService(session)

    # The function expects a UUID, so passing an invalid format would fail at the UUID conversion
    # But since we're using a string, it should be handled gracefully
    user = User(email="delete_test@example.com", hashed_password="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)

    # Test with a valid UUID string that doesn't exist
    result = service.delete_task_sync(str(uuid.uuid4()), str(user.id))
    assert result is False
