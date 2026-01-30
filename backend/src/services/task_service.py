from sqlmodel import Session, select
from typing import List, Optional, cast
from fastapi import HTTPException, status
from src.models.task import Task, TaskCreate, TaskUpdate
from src.models.user import User
from datetime import datetime, timezone, timedelta

class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def _apply_filters(self, query, filter_type: Optional[str] = None):
        """Apply filters to task query based on filter type"""
        if not filter_type:
            return query

        filter_type = filter_type.lower()
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        tomorrow_start = today_end
        tomorrow_end = tomorrow_start + timedelta(days=1)

        # Calculate week boundaries (Monday to Sunday)
        days_since_monday = now.weekday()
        week_start = today_start - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=7)

        # Status filters
        if filter_type == "all":
            pass  # No filter, return all tasks
        elif filter_type in ["active", "pending"]:
            query = query.where(Task.completed == False)
        elif filter_type == "completed":
            query = query.where(Task.completed == True)

        # Priority filters
        elif filter_type in ["high", "high priority"]:
            query = query.where(Task.priority == "high")
        elif filter_type in ["medium", "medium priority"]:
            query = query.where(Task.priority == "medium")
        elif filter_type in ["low", "low priority"]:
            query = query.where(Task.priority == "low")

        # Date-based filters
        elif filter_type == "today":
            query = query.where(
                Task.due_date >= today_start,
                Task.due_date < today_end
            )
        elif filter_type == "tomorrow":
            query = query.where(
                Task.due_date >= tomorrow_start,
                Task.due_date < tomorrow_end
            )
        elif filter_type in ["this week", "week"]:
            query = query.where(
                Task.due_date >= week_start,
                Task.due_date < week_end
            )
        elif filter_type == "overdue":
            query = query.where(
                Task.due_date < now,
                Task.completed == False
            )
        elif filter_type in ["no due date", "no date"]:
            query = query.where(Task.due_date == None)

        # Category filters
        elif filter_type == "work":
            query = query.where(Task.category == "work")
        elif filter_type == "personal":
            query = query.where(Task.category == "personal")
        elif filter_type == "study":
            query = query.where(Task.category == "study")
        elif filter_type == "health":
            query = query.where(Task.category == "health")
        elif filter_type == "finance":
            query = query.where(Task.category == "finance")

        return query

    async def get_user_tasks(self, user_id: str, status_filter: Optional[str] = None) -> List[Task]:
        """Get all tasks for a specific user, with optional filter"""
        query = select(Task).where(Task.user_id == user_id)
        query = self._apply_filters(query, status_filter)
        query = query.order_by(Task.created_at.desc())

        tasks = self.session.execute(query).scalars().all()
        return list(cast(List[Task], tasks))

    def get_user_tasks_sync(self, user_id: str, status_filter: Optional[str] = None) -> List[Task]:
        """Synchronous version of get_user_tasks for MCP tools"""
        query = select(Task).where(Task.user_id == user_id)
        query = self._apply_filters(query, status_filter)
        query = query.order_by(Task.created_at.desc())

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
            priority=task_create.priority,
            category=task_create.category,
            due_date=task_create.due_date,
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

    def get_task_by_id_sync(self, task_id: str, user_id: str) -> Optional[Task]:
        """Synchronous version of get_task_by_id for testing purposes"""
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.execute(statement).scalar_one_or_none()
        return cast(Optional[Task], task)

    def create_task_sync(self, task_create: TaskCreate, user_id: str) -> Task:
        """Synchronous version of create_task for MCP tools"""
        task = Task(
            title=task_create.title,
            description=task_create.description,
            completed=task_create.completed,
            priority=task_create.priority,
            category=task_create.category,
            due_date=task_create.due_date,
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