from sqlmodel import Session, select
from typing import List, Optional, cast
from fastapi import HTTPException, status
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.user import User

class TaskService:
    def __init__(self, session: Session):
        self.session = session

    async def get_user_tasks(self, user_id: str, status_filter: Optional[str] = None) -> List[Task]:
        """Get all tasks for a specific user, with optional status filter"""
        query = select(Task).where(Task.user_id == user_id)

        if status_filter:
            if status_filter.lower() == "completed":
                query = query.where(Task.completed == True)
            elif status_filter.lower() == "pending":
                query = query.where(Task.completed == False)

        tasks = self.session.execute(query).scalars().all()
        return list(cast(List[Task], tasks))

    async def get_task_by_id(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get a specific task by ID for a specific user"""
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.execute(statement).scalar_one_or_none()
        return cast(Optional[Task], task)

    async def create_task(self, task_create: TaskCreate, user_id: str) -> Task:
        """Create a new task for a specific user"""
        task = Task(
            title=task_create.title,
            description=task_create.description,
            completed=task_create.completed,
            user_id=user_id
        )

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    async def update_task(self, task_id: str, task_update: TaskUpdate, user_id: str) -> Optional[Task]:
        """Update a task for a specific user"""
        task = await self.get_task_by_id(task_id, user_id)

        if not task:
            return None

        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    async def delete_task(self, task_id: str, user_id: str) -> bool:
        """Delete a task for a specific user"""
        if not user_id:
            return False

        task = await self.get_task_by_id(task_id, user_id)

        if not task:
            return False

        self.session.delete(task)
        self.session.commit()

        return True

    async def toggle_task_completion(self, task_id: str, completed: bool, user_id: str) -> Optional[Task]:
        """Toggle task completion status for a specific user"""
        task = await self.get_task_by_id(task_id, user_id)

        if not task:
            return None

        task.completed = completed

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    def get_user_tasks_sync(self, user_id: str, status_filter: Optional[str] = None) -> List[Task]:
        """Synchronous version of get_user_tasks for testing purposes"""
        query = select(Task).where(Task.user_id == user_id)

        if status_filter:
            if status_filter.lower() == "completed":
                query = query.where(Task.completed == True)
            elif status_filter.lower() == "pending":
                query = query.where(Task.completed == False)

        tasks = self.session.execute(query).scalars().all()
        return list(cast(List[Task], tasks))

    def get_task_by_id_sync(self, task_id: str, user_id: str) -> Optional[Task]:
        """Synchronous version of get_task_by_id for testing purposes"""
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.execute(statement).scalar_one_or_none()
        return cast(Optional[Task], task)

    def create_task_sync(self, task_create: TaskCreate, user_id: str) -> Task:
        """Synchronous version of create_task for testing purposes"""
        task = Task(
            title=task_create.title,
            description=task_create.description,
            completed=task_create.completed,
            user_id=user_id
        )

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    def update_task_sync(self, task_id: str, task_update: TaskUpdate, user_id: str) -> Optional[Task]:
        """Synchronous version of update_task for testing purposes"""
        task = self.get_task_by_id_sync(task_id, user_id)

        if not task:
            return None

        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(task, field):
                setattr(task, field, value)

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    def delete_task_sync(self, task_id: str, user_id: str) -> bool:
        """Synchronous version of delete_task for testing purposes"""
        if not task_id or not user_id:
            return False

        task = self.get_task_by_id_sync(task_id, user_id)

        if not task:
            return False

        self.session.delete(task)
        self.session.commit()

        return True

    def toggle_task_completion_sync(self, task_id: str, completed: bool, user_id: str) -> Optional[Task]:
        """Synchronous version of toggle_task_completion for testing purposes"""
        task = self.get_task_by_id_sync(task_id, user_id)

        if not task:
            return None

        task.completed = completed

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task