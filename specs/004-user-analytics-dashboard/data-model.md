# Data Model: User Analytics Dashboard

**Branch**: `004-user-analytics-dashboard`  
**Created**: 2026-02-02

## Overview

This document defines the data models for the User Analytics Dashboard feature. The existing User and Task models are extended with new functionality.

## Models

### Notification (NEW)

Represents an in-app notification for a user.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| PK, max_length=64 | UUID id | str | identifier |
| user_id | str | | Unique notification FK → users.id, index, max_length=64 | - | Owner of notification |
| type | str | max_length=32 | - | due_soon, overdue, streak_milestone |
| title | str | max_length=255 | - | Notification title |
| message | str | max_length=1000 | - | Notification body |
| task_id | str | FK → tasks.id, nullable, max_length=64 | - | Related task (optional) |
| read | bool | default=False | False | Read status |
| created_at | datetime | index | now(utc) | Creation timestamp |

#### SQLModel Definition

```python
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=64
    )
    user_id: str = Field(
        foreign_key="users.id",
        max_length=64,
        index=True
    )
    type: str = Field(max_length=32)  # due_soon, overdue, streak_milestone
    title: str = Field(max_length=255)
    message: str = Field(max_length=1000)
    task_id: str | None = Field(
        None,
        foreign_key="tasks.id",
        max_length=64
    )
    read: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True
    )
```

#### Indexes

- `ix_notifications_user_created`: (user_id, created_at) - For fetching user's notifications ordered by time
- `ix_notifications_user_read`: (user_id, read, created_at) - For unread notification counts

---

### NotificationPreference (NEW)

Stores user notification settings.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| user_id | str | PK, FK → users.id, max_length=64 | - | Owner |
| notify_due_soon | bool | default=True | True | Reminder 24h before due date |
| notify_overdue | bool | default=True | True | Alert when task becomes overdue |
| notify_streaks | bool | default=True | True | Congratulatory notifications |

#### SQLModel Definition

```python
class NotificationPreference(SQLModel, table=True):
    __tablename__ = "notification_preferences"
    
    user_id: str = Field(
        primary_key=True,
        foreign_key="users.id",
        max_length=64
    )
    notify_due_soon: bool = Field(default=True)
    notify_overdue: bool = Field(default=True)
    notify_streaks: bool = Field(default=True)
```

---

### Task (Existing - Extended)

No schema changes. New computed/derived field:

| Field | Type | Description |
|-------|------|-------------|
| is_overdue | bool (computed) | True if due_date < NOW() AND NOT completed |

**Query Example**:
```python
# Get overdue tasks
overdue_tasks = await session.execute(
    select(Task).where(
        Task.user_id == user_id,
        Task.due_date < datetime.now(timezone.utc),
        Task.completed == False
    )
)
```

---

### User (Existing - Extended)

No schema changes. Statistics are computed on-demand.

**Computed Stats**:
```python
class UserStats:
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    streak_current: int
    streak_best: int
    avg_tasks_per_day: float
    weekly_activity: list[dict]  # [{"day": "Mon", "completed": 5}, ...]
    created_at: datetime
```

---

## Relationships

```
User (1) ────< (N) Notification
    │
    └───< (N) Task
```

- A User can have multiple Notifications
- A Notification belongs to one User
- A User has multiple Tasks (existing)

---

## Database Migrations

### Create Tables (Alembic)

```python
# backend/src/database/alembic/versions/004_add_notifications.py

def upgrade():
    # Create notification_preferences table
    op.create_table(
        "notification_preferences",
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("notify_due_soon", sa.Boolean, default=True),
        sa.Column("notify_overdue", sa.Boolean, default=True),
        sa.Column("notify_streaks", sa.Boolean, default=True),
    )
    
    # Create notifications table
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), index=True),
        sa.Column("type", sa.String(32)),
        sa.Column("title", sa.String(255)),
        sa.Column("message", sa.String(1000)),
        sa.Column("task_id", sa.String(64), sa.ForeignKey("tasks.id"), nullable=True),
        sa.Column("read", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), index=True),
    )
    
    # Create composite index for unread notifications
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "read", "created_at"])

def downgrade():
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_table("notifications")
    op.drop_table("notification_preferences")
```

---

## Service Layer

### AnalyticsService

```python
class AnalyticsService:
    """Handles statistics and streak calculations"""
    
    async def get_user_stats(self, user_id: str) -> UserStats:
        """Calculate all user statistics"""
    
    async def calculate_streak(self, user_id: str) -> tuple[int, int]:
        """Returns (current_streak, best_streak)"""
    
    async def get_weekly_activity(self, user_id: str, weeks: int = 8) -> list[dict]:
        """Returns daily completion counts for past weeks"""
    
    async def get_productivity_data(
        self, 
        user_id: str, 
        period: str  # week, month, quarter
    ) -> list[dict]:
        """Returns chart-ready productivity data"""
```

### NotificationService

```python
class NotificationService:
    """Handles notification CRUD and triggers"""
    
    async def create_notification(
        self,
        user_id: str,
        type: str,
        title: str,
        message: str,
        task_id: str | None = None
    ) -> Notification:
        """Create a new notification"""
    
    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 20,
        cursor: str | None = None
    ) -> tuple[list[Notification], str | None]:
        """Get paginated user notifications"""
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark single notification as read"""
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read, returns count"""
    
    async def trigger_due_soon_notifications(self, user_id: str):
        """Check tasks due in 24h and create notifications"""
    
    async def trigger_overdue_notifications(self, user_id: str):
        """Check overdue tasks and create notifications"""
    
    async def trigger_streak_notifications(self, user_id: str, streak: int):
        """Create streak milestone notification"""
```

### ExportService

```python
class ExportService:
    """Handles task exports"""
    
    async def export_to_csv(self, user_id: str) -> str:
        """Generate CSV content, returns file path or content"""
    
    async def generate_pdf_report(self, user_id: str) -> bytes:
        """Generate PDF report bytes for download"""
```

---

## Key Design Decisions

1. **Computed Overdue**: `is_overdue` is computed on query, not stored
2. **No Soft Delete**: Notifications are permanent until dismissed
3. **Cursor Pagination**: Efficient for large notification lists
4. **Stats On-Demand**: No pre-aggregation tables for MVP
5. **User Preferences**: Boolean toggles for notification types
