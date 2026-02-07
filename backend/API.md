# API Documentation

## Overview

The Task Management API provides a comprehensive RESTful interface for managing tasks, users, analytics, and AI-powered conversations. All endpoints are built with FastAPI and include automatic OpenAPI documentation at `/docs`.

**Base URL**: `http://localhost:8000/api` (development)

**Authentication**: JWT Bearer tokens via `Authorization: Bearer <token>` header

---

## Quick Reference

| Category | Endpoint | Method | Auth Required |
|----------|----------|--------|---------------|
| Health | `/health` | GET | No |
| Auth | `/auth/sign-in` | POST | No |
| Auth | `/auth/sign-up` | POST | No |
| Auth | `/auth/sign-out` | POST | Yes |
| Auth | `/auth/session` | GET | Yes |
| Tasks | `/tasks` | GET | Yes |
| Tasks | `/tasks` | POST | Yes |
| Tasks | `/tasks/{id}` | GET | Yes |
| Tasks | `/tasks/{id}` | PUT | Yes |
| Tasks | `/tasks/{id}` | DELETE | Yes |
| Tasks | `/tasks/{id}/complete` | PATCH | Yes |
| Tasks | `/tasks/calendar` | GET | Yes |
| User | `/user/profile` | GET | Yes |
| User | `/user/profile` | PUT | Yes |
| User | `/user/stats` | GET | Yes |
| User | `/user/notifications` | GET | Yes |
| Analytics | `/analytics/productivity` | GET | Yes |
| Analytics | `/analytics/weekly-activity` | GET | Yes |
| Analytics | `/analytics/export/csv` | GET | Yes |
| Analytics | `/analytics/report/weekly` | GET | Yes |
| Analytics | `/analytics/report/monthly` | GET | Yes |
| Notifications | `/notifications` | GET | Yes |
| Notifications | `/notifications/{id}/read` | PATCH | Yes |
| Chat | `/chatkit/chat` | POST | Yes |

---

## Authentication

### Sign In

**POST** `/auth/sign-in`

Authenticate a user and receive a JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors**:
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

---

### Sign Up

**POST** `/auth/sign-up`

Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Get Session

**GET** `/auth/session`

Validate token and get current user session.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": null
  }
}
```

---

## Tasks

### List Tasks

**GET** `/tasks`

Retrieve all tasks for the authenticated user with optional filtering.

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status | `active`, `completed`, `all` |
| `priority` | string | Filter by priority | `high`, `medium`, `low` |
| `category` | string | Filter by category | `work`, `personal`, `study`, `health`, `finance` |
| `due_date` | string | Filter by due date | `today`, `tomorrow`, `week`, `overdue` |

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Complete project documentation",
      "description": "Write API docs for the task management system",
      "completed": false,
      "priority": "high",
      "category": "work",
      "due_date": "2025-02-10T17:00:00Z",
      "created_at": "2025-02-05T08:00:00Z",
      "updated_at": "2025-02-05T08:00:00Z"
    }
  ],
  "total": 1,
  "filters_applied": {
    "status": "active"
  }
}
```

---

### Create Task

**POST** `/tasks`

Create a new task.

**Request Body**:
```json
{
  "title": "Review pull requests",
  "description": "Review team PRs for the sprint",
  "priority": "medium",
  "category": "work",
  "due_date": "2025-02-06T17:00:00Z"
}
```

**Validation Rules**:
- `title`: Required, 1-255 characters
- `description`: Optional, max 2000 characters
- `priority`: Optional, one of `high`, `medium`, `low` (default: `medium`)
- `category`: Optional, one of `work`, `personal`, `study`, `health`, `finance`
- `due_date`: Optional, ISO 8601 format

**Response** (201 Created):
```json
{
  "id": "task-uuid",
  "title": "Review pull requests",
  "description": "Review team PRs for the sprint",
  "completed": false,
  "priority": "medium",
  "category": "work",
  "due_date": "2025-02-06T17:00:00Z",
  "created_at": "2025-02-05T10:30:00Z",
  "updated_at": "2025-02-05T10:30:00Z"
}
```

---

### Get Task

**GET** `/tasks/{task_id}`

Retrieve a specific task by ID.

**Path Parameters**:
- `task_id`: UUID of the task

**Response** (200 OK):
```json
{
  "id": "task-uuid",
  "title": "Review pull requests",
  "description": "Review team PRs for the sprint",
  "completed": false,
  "priority": "medium",
  "category": "work",
  "due_date": "2025-02-06T17:00:00Z",
  "created_at": "2025-02-05T10:30:00Z",
  "updated_at": "2025-02-05T10:30:00Z"
}
```

**Errors**:
- `404 Not Found`: Task does not exist or belongs to another user

---

### Update Task

**PUT** `/tasks/{task_id}`

Update an existing task.

**Request Body** (all fields optional):
```json
{
  "title": "Review and merge pull requests",
  "description": "Updated description",
  "priority": "high",
  "completed": false
}
```

**Response** (200 OK):
```json
{
  "id": "task-uuid",
  "title": "Review and merge pull requests",
  "description": "Updated description",
  "completed": false,
  "priority": "high",
  "category": "work",
  "due_date": "2025-02-06T17:00:00Z",
  "created_at": "2025-02-05T10:30:00Z",
  "updated_at": "2025-02-05T11:00:00Z"
}
```

---

### Delete Task

**DELETE** `/tasks/{task_id}`

Delete a task permanently.

**Response** (204 No Content)

---

### Toggle Task Completion

**PATCH** `/tasks/{task_id}/complete`

Toggle the completion status of a task.

**Request Body**:
```json
{
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": "task-uuid",
  "title": "Review pull requests",
  "completed": true,
  "completed_at": "2025-02-05T14:30:00Z"
}
```

---

### Calendar View

**GET** `/tasks/calendar`

Get tasks grouped by date for calendar display.

**Query Parameters**:
- `period`: `today`, `week`, or `month`
- `date`: Reference date (ISO 8601, default: today)

**Response** (200 OK):
```json
{
  "period": "week",
  "start_date": "2025-02-03",
  "end_date": "2025-02-09",
  "tasks_by_date": {
    "2025-02-05": [
      {
        "id": "task-uuid",
        "title": "Team standup",
        "completed": false
      }
    ],
    "2025-02-06": [
      {
        "id": "task-uuid-2",
        "title": "Review PRs",
        "completed": false
      }
    ]
  }
}
```

---

## User Profile

### Get Profile

**GET** `/user/profile`

Get current user's profile information.

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://gravatar.com/avatar/...",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-02-05T09:00:00Z"
}
```

---

### Update Profile

**PUT** `/user/profile`

Update user profile.

**Request Body**:
```json
{
  "name": "Johnathan Doe",
  "avatar": "https://new-avatar-url.com/image.jpg"
}
```

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "Johnathan Doe",
  "avatar": "https://new-avatar-url.com/image.jpg",
  "updated_at": "2025-02-05T12:00:00Z"
}
```

---

### Get User Stats

**GET** `/user/stats`

Get task statistics for the current user.

**Response** (200 OK):
```json
{
  "total_tasks": 42,
  "completed_tasks": 35,
  "completion_rate": 83.3,
  "streak_current": 5,
  "streak_best": 12,
  "tasks_due_today": 3,
  "overdue_tasks": 1
}
```

---

## Analytics

### Productivity Metrics

**GET** `/analytics/productivity`

Get productivity data for charts.

**Query Parameters**:
- `period`: `week`, `month`, or `quarter`

**Response** (200 OK):
```json
{
  "period": "week",
  "data": [
    {
      "date": "2025-01-30",
      "created": 5,
      "completed": 3
    },
    {
      "date": "2025-01-31",
      "created": 3,
      "completed": 4
    }
  ]
}
```

---

### Weekly Activity

**GET** `/analytics/weekly-activity`

Get weekly activity breakdown.

**Query Parameters**:
- `weeks`: Number of weeks (1-52, default: 4)

**Response** (200 OK):
```json
{
  "weeks": 4,
  "data": [
    {
      "week": "2025-W04",
      "completed": 12,
      "created": 15
    },
    {
      "week": "2025-W05",
      "completed": 18,
      "created": 14
    }
  ]
}
```

---

### Export to CSV

**GET** `/analytics/export/csv`

Export all tasks to CSV format.

**Response** (200 OK):
```json
{
  "filename": "tasks_export_2025-02-05.csv",
  "content": "Title,Description,Completed,Priority,Category,Due Date\nTask 1,Desc,false,high,work,2025-02-10...",
  "content_type": "text/csv"
}
```

---

### Weekly Report

**GET** `/analytics/report/weekly`

Generate a weekly productivity report.

**Response** (200 OK):
```json
{
  "week": "2025-W05",
  "period": "2025-01-27 to 2025-02-02",
  "summary": {
    "total_tasks": 25,
    "completed": 20,
    "completion_rate": 80
  },
  "by_priority": {
    "high": 5,
    "medium": 12,
    "low": 8
  },
  "by_category": {
    "work": 15,
    "personal": 10
  }
}
```

---

## Notifications

### List Notifications

**GET** `/notifications`

Get paginated notifications for the current user.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response** (200 OK):
```json
{
  "notifications": [
    {
      "id": "notif-uuid",
      "type": "due_soon",
      "title": "Task due soon",
      "message": "Review pull requests is due in 2 hours",
      "read": false,
      "created_at": "2025-02-05T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### Mark as Read

**PATCH** `/notifications/{notification_id}/read`

Mark a notification as read.

**Response** (200 OK):
```json
{
  "id": "notif-uuid",
  "read": true,
  "read_at": "2025-02-05T16:30:00Z"
}
```

---

## Chat / AI Assistant

### Send Message

**POST** `/chatkit/chat`

Send a message to the AI assistant and receive a streaming response.

**Request Body**:
```json
{
  "message": "What tasks do I have due today?",
  "conversation_id": "conv-uuid",
  "stream": true
}
```

**Response** (Streaming SSE):
```
event: message
data: {"content": "You have 3 tasks due today:"}

event: message
data: {"content": "1. Review pull requests (High priority)"}

event: done
data: {}
```

**Natural Language Commands**:
- Task creation: "Add a task to buy groceries tomorrow"
- Task queries: "Show my high priority work tasks"
- Task updates: "Mark the grocery task as complete"
- Task deletion: "Delete the dentist appointment task"

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 1 and 255 characters"
      }
    ],
    "request_id": "req-uuid-for-tracing"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `204` | No Content | Resource deleted successfully |
| `400` | Bad Request | Invalid request body or parameters |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Resource conflict (e.g., duplicate email) |
| `422` | Validation Error | Request validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Internal server error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute
- **Chat endpoints**: 30 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707151200
```

---

## Filtering Reference

### Task Filters (15 Total)

**Status Filters**:
- `all` - All tasks
- `active` / `pending` - Incomplete tasks
- `completed` - Complete tasks

**Priority Filters**:
- `high` - High priority tasks
- `medium` - Medium priority tasks
- `low` - Low priority tasks

**Category Filters**:
- `work` - Work-related tasks
- `personal` - Personal tasks
- `study` - Study/education tasks
- `health` - Health-related tasks
- `finance` - Financial tasks

**Date Filters**:
- `today` - Due today
- `tomorrow` - Due tomorrow
- `week` - Due this week
- `overdue` - Past due date
- `no_due_date` - No due date set

### Combining Filters

Filters can be combined using query parameters:

```
GET /api/tasks?status=active&priority=high&category=work
```

---

## Data Types

### Task Object

```typescript
interface Task {
  id: string;                    // UUID
  user_id: string;               // Owner UUID
  title: string;                 // 1-255 characters
  description: string | null;    // Max 2000 characters
  completed: boolean;            // Default: false
  priority: Priority;            // 'high' | 'medium' | 'low'
  category: Category | null;     // 'work' | 'personal' | 'study' | 'health' | 'finance'
  due_date: string | null;       // ISO 8601 datetime
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}
```

### User Object

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Valid email format
  name: string;                  // Display name
  avatar: string | null;         // URL to avatar image
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}
```

### Notification Object

```typescript
interface Notification {
  id: string;                    // UUID
  user_id: string;               // Owner UUID
  type: NotificationType;        // 'due_soon' | 'overdue' | 'streak' | 'system'
  title: string;                 // Notification title
  message: string | null;        // Detailed message
  read: boolean;                 // Read status
  created_at: string;            // ISO 8601 datetime
  read_at: string | null;        // ISO 8601 datetime
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize API client
const api = {
  baseUrl: 'http://localhost:8000/api',
  token: localStorage.getItem('token'),
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Tasks
  getTasks(filters?: TaskFilters) {
    const params = new URLSearchParams(filters);
    return this.request(`/tasks?${params}`);
  },
  
  createTask(task: CreateTaskInput) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  
  updateTask(id: string, task: UpdateTaskInput) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },
  
  deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class TaskAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
    
    def get_tasks(self, **filters) -> Dict[str, Any]:
        """Get tasks with optional filters."""
        response = requests.get(
            f'{self.base_url}/tasks',
            headers=self.headers,
            params=filters
        )
        response.raise_for_status()
        return response.json()
    
    def create_task(self, title: str, **kwargs) -> Dict[str, Any]:
        """Create a new task."""
        data = {'title': title, **kwargs}
        response = requests.post(
            f'{self.base_url}/tasks',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()
    
    def update_task(self, task_id: str, **kwargs) -> Dict[str, Any]:
        """Update an existing task."""
        response = requests.put(
            f'{self.base_url}/tasks/{task_id}',
            headers=self.headers,
            json=kwargs
        )
        response.raise_for_status()
        return response.json()
    
    def delete_task(self, task_id: str) -> None:
        """Delete a task."""
        response = requests.delete(
            f'{self.base_url}/tasks/{task_id}',
            headers=self.headers
        )
        response.raise_for_status()

# Usage
api = TaskAPI('http://localhost:8000/api', 'your-jwt-token')
tasks = api.get_tasks(status='active', priority='high')
```

---

## Changelog

### v1.0.0 (2025-02-05)
- Initial API release
- Task CRUD operations
- User authentication
- Analytics endpoints
- Notification system
- AI chat integration

---

For additional help, refer to:
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **OpenAPI Spec**: `http://localhost:8000/openapi.json`
- **MCP Tools**: `/mcp` endpoint for AI integration
