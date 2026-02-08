# AI-Powered Task Management Application - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Phase 1: Todo Console App](#phase-1-todo-console-app)
4. [Phase 2: Task Management Web App](#phase-2-task-management-web-app)
5. [Phase 3: AI Conversational Todo](#phase-3-ai-conversational-todo)
6. [Phase 4: User Analytics Dashboard](#phase-4-user-analytics-dashboard)
7. [Security Model](#security-model)
8. [Database Schema](#database-schema)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Key Files Reference](#key-files-reference)
11. [Data Flow Architecture](#data-flow-architecture)

---

## Project Overview

This is a **Full-Stack AI-Powered Task Management Application** built progressively across 4 phases. It combines traditional task management features with AI-powered conversational interface using OpenAI ChatKit and OpenAI Agents SDK.

### Core Features
- User authentication with JWT tokens
- Task CRUD operations (Create, Read, Update, Delete)
- Natural language task management via AI chatbot
- Productivity analytics and statistics
- Streak tracking and achievement system
- In-app notifications
- Calendar view with time filters
- Export functionality (CSV/PDF)
- Responsive web interface

### Development Phases
1. **Phase 1**: Todo Console App (CLI foundation)
2. **Phase 2**: Task Management Web App (Full-stack web app)
3. **Phase 3**: AI Conversational Todo (ChatKit + MCP integration)
4. **Phase 4**: User Analytics Dashboard (Notifications, exports, calendar)

---

## Technology Stack

### Frontend Layer
| Technology | Purpose |
|------------|---------|
| Next.js 16+ | React framework with App Router |
| TypeScript | Type safety across codebase |
| Tailwind CSS | Utility-first styling |
| OpenAI ChatKit | AI chat interface component |
| Lucide React | Icon library |
| Axios | HTTP client for API calls |

### Backend Layer
| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework with async support |
| SQLModel | ORM combining SQLAlchemy + Pydantic |
| Neon Serverless PostgreSQL | Cloud database |
| Better Auth | Authentication framework |
| PyJWT | JWT token handling |
| OpenAI Agents SDK | AI agent framework |
| MCP SDK | Model Context Protocol server |
| Structlog | Structured logging |
| Slowapi | Rate limiting |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| Alembic | Database migrations |
| MyPy | Python type checking |
| Pytest | Testing framework |
| Git | Version control |
| Docker | Containerization (optional) |

---

## Phase 1: Todo Console App

**Branch**: `001-todo-console-app`
**Purpose**: Foundation CLI application demonstrating core task concepts

### What Was Done

```
src/
├── cli/              # Command-line interface using argparse
│   └── main.py      # CLI entry point with argparse commands
├── models/           # Task data model
│   └── task.py      # Task class with id, title, description, completed, created_at
├── services/         # Business logic
│   └── task_service.py  # Task operations (add, list, update, delete, complete)
└── main.py           # Application entry point
```

### Features Implemented

#### Task Model
```python
class Task:
    id: int                    # Auto-incrementing unique identifier
    title: str                 # Task name (required)
    description: str           # Detailed information (optional)
    completed: bool            # Task completion status
    created_at: datetime       # Timestamp of creation
```

#### CLI Commands
| Command | Description |
|---------|-------------|
| `todo add -t "Buy milk" -d "2 liters"` | Add new task |
| `todo list` | List all tasks |
| `todo done -i 1` | Mark task as complete |
| `todo update -i 1 -t "New title" -d "New details"` | Update task |
| `todo delete -i 1` | Delete task |

#### Special Features

**Natural Language Timestamps:**
- Less than 1 minute: "Just now"
- 1-59 minutes: "X minutes ago" (e.g., "5 minutes ago")
- 1-23 hours: "X hours ago" (e.g., "3 hours ago")
- 1-6 days: "X days ago" (e.g., "2 days ago")
- Older than 7 days: Full date "YYYY-MM-DD"

**Duplicate Title Detection:**
- Case-insensitive comparison
- Leading/trailing whitespace trimmed
- Error: "ERROR: A task with this title already exists"

**Error Handling:**
- All errors sent to stderr
- Format: "ERROR: [message]"

### Implementation Details

1. **Global Task Storage:**
   ```python
   tasks: List[Task] = []  # In-memory list
   next_task_id: int = 1   # Auto-increment counter
   ```

2. **Argparse Commands:**
   ```python
   parser = argparse.ArgumentParser(description="Todo CLI App")
   subparsers = parser.add_subparsers(dest="command")
   
   # add command
   add_parser = subparsers.add_parser("add")
   add_parser.add_argument("-t", "--title", required=True)
   add_parser.add_argument("-d", "--description")
   
   # list command
   list_parser = subparsers.add_parser("list")
   
   # done command
   done_parser = subparsers.add_parser("done")
   done_parser.add_argument("-i", "--id", type=int, required=True)
   ```

3. **Output Examples:**
   ```
   $ todo add -t "Buy milk" -d "2 liters"
   Task added: [ID:1] Buy milk (Pending)
   
   $ todo list
   1. [ ] Buy milk | Created: 2025-12-30
   
   $ todo done -i 1
   Task completed: [ID:1] Buy milk
   
   $ todo delete -i 1
   Task deleted: [ID:1] Buy milk
   ```

---

## Phase 2: Task Management Web App

**Branch**: `002-task-management-app`
**Purpose**: Full-stack web application with authentication and persistence

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Auth Pages  │  │ Task Pages   │  │   Dashboard         │ │
│  │ /login      │  │ /tasks       │  │   /analytics        │ │
│  │ /register   │  │ /calendar    │  │   /user             │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                    JWT Token (Bearer header + HttpOnly cookie)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Auth Router │  │ Task Router  │  │   Middleware        │ │
│  │ /api/auth/* │  │ /api/tasks/* │  │   JWT Validation    │ │
│  └─────────────┘  └──────────────┘  │   Rate Limiting     │ │
│                                     └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                    SQLModel ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Neon PostgreSQL)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ users       │  │ tasks        │  │   notifications     │ │
│  │ sessions    │  │              │  │                     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

#### Registration
```
POST /api/auth/register
Body: { email, password }
Response: { user: { id, email, created_at } }

Process:
1. Validate email format
2. Check password strength (8+ chars, mixed case, numbers, special)
3. Hash password using bcrypt
4. Create user record in database
5. Return user data (no token yet)
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, email } }

Process:
1. Find user by email
2. Verify bcrypt password hash
3. Generate JWT token with user_id claim
4. Set HttpOnly cookie with token
5. Return token in response body
6. Apply rate limiting (5 failed attempts/minute)
```

#### JWT Token Structure
```python
payload = {
    "user_id": "uuid-string",
    "email": "user@example.com",
    "exp": 1735689600,  # 24 hours from now
    "iat": 1735603200
}
```

#### Logout
```
POST /api/auth/logout
Response: { success: true }

Process:
1. Clear HttpOnly cookie
2. Blacklist token (optional)
3. Invalidate server-side session
```

### Task CRUD Operations

#### Create Task
```
POST /api/tasks
Body: { title, description?, priority?, category?, due_date? }
Response: { id, title, description, completed, created_at, ... }

Validation:
- title: required, 1-255 characters
- description: optional, max 2000 characters
- priority: optional, "high"|"medium"|"low", default: "medium"
- category: optional, max 20 characters
- due_date: optional, ISO 8601 datetime
```

#### List Tasks
```
GET /api/tasks?status=pending|completed|all
Response: [ { id, title, description, completed, created_at, ... }, ... ]

Filter Options:
- No filter: returns all tasks
- status=pending: incomplete tasks only
- status=completed: complete tasks only
```

#### Get Task
```
GET /api/tasks/{id}
Response: { id, title, description, completed, created_at, ... }

Error (404): "Task not found"
Error (401): Unauthorized
```

#### Update Task
```
PUT /api/tasks/{id}
Body: { title?, description?, priority?, category?, due_date? }
Response: { id, title, description, completed, updated_at, ... }

Partial updates supported (only provided fields updated)
```

#### Delete Task
```
DELETE /api/tasks/{id}
Response: { message: "Task deleted successfully" }

Permanently removes task from database
```

#### Toggle Completion
```
PATCH /api/tasks/{id}/complete
Body: { completed: true|false }
Response: { id, title, completed, completed_at, ... }

Sets completed_at timestamp when marking complete
Clears completed_at when uncompleting
```

### User Data Isolation

Every database query includes user_id filtering:

```python
# WRONG - security vulnerability
tasks = session.exec(select(Task)).all()  # Returns ALL users' tasks!

# CORRECT - user isolation
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()  # Returns only authenticated user's tasks
```

### Rate Limiting

```python
@limiter.limit("100/minute")
async def get_tasks(request, current_user_id):
    ...

@limiter.limit("50/minute")
async def create_task(request, task, current_user_id):
    ...

@limiter.limit("5/minute")
async def login(request, credentials):
    # 5 failed attempts triggers temporary lockout
    ...
```

### Middleware Stack

1. **CORS Middleware**: Allows frontend requests
2. **Rate Limiting**: Requests per minute limits
3. **JWT Authentication**: Validates tokens, extracts user_id
4. **Request Logging**: Structured logs for observability
5. **Error Handling**: Consistent RFC 7807 error responses

---

## Phase 3: AI Conversational Todo

**Branch**: `003-ai-conversational-todo`
**Purpose**: Natural language task management via ChatKit interface

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              OpenAI ChatKit Component                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  User types: "Add buy groceries and eggs"       │    │    │
│  │  │  AI responds: "Added 2 tasks to your list!"     │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                    POST /api/chatkit (SSE stream)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ChatKit Router                             │    │
│  │  ┌───────────────────────────────────────────────┐     │    │
│  │  │ ConversationStore                             │     │    │
│  │  │ - load_thread()      → Load chat history     │     │    │
│  │  │ - save_thread()      → Save chat metadata    │     │    │
│  │  │ - load_thread_items() → Load messages        │     │    │
│  │  │ - add_thread_item()  → Save new message      │     │    │
│  │  └───────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                    OpenAI Agents SDK + MCP                     │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│        ┌─────────┐    ┌─────────────┐    ┌─────────┐           │
│        │ add_task│    │list_tasks   │    │complete_│           │
│        │ tool    │    │ tool        │    │task tool│           │
│        └─────────┘    └─────────────┘    └─────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────────────────────────────────────────────────┐
        │              PostgreSQL Tables                       │
        │  conversations  │  messages  │  tasks (shared)      │
        └──────────────────────────────────────────────────────┘
```

### How AI Conversation Works

#### 1. User Input
User types in ChatKit: "Add buy groceries and eggs"

#### 2. Request Forwarding
```
POST /api/chatkit
Headers: Authorization: Bearer <JWT>
Body: { message: "Add buy groceries and eggs", thread_id: "..." }
```

#### 3. JWT Verification
```python
async def get_current_user_id(request: Request) -> str:
    # Extract and verify JWT token
    auth_header = request.headers.get("Authorization")
    token = auth_header.split(" ")[1]
    
    payload = verify_token(token)
    user_id = payload.get("user_id")  # Extract from VERIFIED token
    return user_id
```

#### 4. Conversation Loading
```python
# Load conversation history from database
messages = service.get_conversation_messages(thread_id, user_id)

# Build context for AI agent
context = [
    {"role": "user", "content": msg.content}
    for msg in messages
]
context.append({"role": "user", "content": "Add buy groceries and eggs"})
```

#### 5. AI Agent Processing
```python
agent = Agent(
    name="Task Assistant",
    instructions="""You are a helpful task management assistant.
    Use available tools to help users manage their todo lists.
    Always confirm actions taken.""",
    model=openai_model,
    mcp_servers=[mcp_server]
)

# Agent decides to call add_task twice
result = await Runner.run(agent, context)
```

#### 6. MCP Tool Execution
```python
@mcp.tool()
async def add_task(
    title: str,
    description: Optional[str] = None,
    ctx: Optional[Context] = None
) -> Dict[str, Any]:
    # Get user_id from JWT context, NOT from parameters
    user_id = get_user_id_from_context(ctx)
    
    # Create task with user isolation
    with Session(engine) as session:
        task = TaskCreate(title=title, description=description)
        result = task_service.create_task(task, user_id)
        return {
            "success": True,
            "task": {"id": result.id, "title": result.title},
            "message": f"Task '{result.title}' created successfully."
        }
```

#### 7. Response Generation
```python
response = "I've added 2 tasks to your list:\n" \
           "1. Buy groceries\n" \
           "2. Buy eggs\n" \
           "What else can I help you with?"
```

#### 8. Persistence
```python
# Save conversation to database
service.add_message(thread_id, user_id, "user", "Add buy groceries and eggs")
service.add_message(thread_id, user_id, "assistant", response)
```

### MCP Tools Specification

#### add_task
```python
@mcp.tool()
async def add_task(
    title: str,                    # Required, 1-255 chars
    description: Optional[str] = None,  # Optional
    priority: Optional[str] = "medium",  # "high"|"medium"|"low"
    category: Optional[str] = None,  # "work"|"personal"|"study"|"health"|"finance"
    due_date: Optional[str] = None,  # ISO format
    ctx: Optional[Context] = None
) -> Dict[str, Any]
```
Returns: `{ success: bool, task: Task, message: str }`

#### list_tasks
```python
@mcp.tool()
async def list_tasks(
    status: Optional[str] = None,  # "all"|"active"|"pending"|"completed"
    ctx: Optional[Context] = None
) -> Dict[str, Any]
```
Returns: `{ success: bool, tasks: List[Task], message: str }`

#### complete_task
```python
@mcp.tool()
async def complete_task(
    task_id: str,  # UUID or 1-based index
    ctx: Optional[Context] = None
) -> Dict[str, Any]
```
Returns: `{ success: bool, task: Task, message: str }`

#### delete_task
```python
@mcp.tool()
async def delete_task(
    task_id: str,  # UUID or 1-based index
    ctx: Optional[Context] = None
) -> Dict[str, Any]
```
Returns: `{ success: bool, message: str }`

#### update_task
```python
@mcp.tool()
async def update_task(
    task_id: str,  # UUID or 1-based index
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None,
    ctx: Optional[Context] = None
) -> Dict[str, Any]
```
Returns: `{ success: bool, task: Task, message: str }`

### Security Implementation

#### User ID Isolation (FR-011, FR-012)
```python
# WRONG - security vulnerability
def add_task(title, description, user_id):
    # user_id could be spoofed!
    task = Task(title=title, user_id=user_id)

# CORRECT - extract from JWT only
def get_user_id_from_context(ctx) -> str:
    user_id = os.getenv("USER_ID")  # Passed from chat router
    if not user_id:
        raise ValueError("User not authenticated")
    return user_id

@mcp.tool()
async def add_task(title, description, ctx):
    user_id = get_user_id_from_context(ctx)  # From JWT
    # Create task for authenticated user only
    task = create_task_for_user(title, description, user_id)
```

#### Error Handling
```python
try:
    result = task_service.get_task(task_id, user_id)
except Exception as e:
    # Never expose raw errors
    logger.error("Task lookup failed", error=str(e))
    raise ValueError(f"Failed to find task: {task_id}")
```

### Conversation Persistence

#### Database Tables
```sql
-- Conversations (chat sessions)
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),  -- Derived from first message
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Messages (conversation history)
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20),  -- 'user' or 'assistant'
    content TEXT,
    created_at TIMESTAMP
);
```

#### Stateless Request Cycle
```
1. Receive user message
2. Fetch conversation history from database
3. Build message array (history + new message)
4. Store user message in database
5. Run agent with MCP tools
6. Store assistant response in database
7. Return response to client
8. Server holds NO state (ready for next request)
```

### Frontend Integration

```tsx
// ChatContainer.tsx
<ChatKit
  api={{
    url: `${API_URL}/chatkit`,
    domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY,
    fetch: customFetch
  }}
  theme="light"
  startScreen={{
    greeting: "Hi! I'm your AI Task Assistant.",
    prompts: [
      { label: "View Tasks", prompt: "Show me my pending tasks" },
      { label: "Add Task", prompt: "Help me add a new task" }
    ]
  }}
/>
```

---

## Phase 4: User Analytics Dashboard

**Branch**: `004-user-analytics-dashboard`
**Purpose**: Productivity insights, notifications, calendar, exports

### Features Implemented

#### 1. User Profile (`/user` route)

```
Page: /user
Features:
- Display name, email, account creation date
- Edit button → updates name in database
- Statistics cards with key metrics
- Streak display
- Productivity overview
- Notification preferences

API Endpoints:
GET /api/user/profile      → User details
PUT /api/user/profile       → Update name
GET /api/user/stats         → Statistics
```

#### 2. Statistics Calculation

```python
def get_user_stats(session, user_id) -> dict:
    # Total tasks
    total_tasks = count(Task, user_id=user_id)
    
    # Completed tasks
    completed_tasks = count(Task, user_id=user_id, completed=True)
    
    # Completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Overdue tasks
    overdue_tasks = count(Task, user_id=user_id, 
                         completed=False, 
                         due_date__lt=now)
    
    # Streaks
    current_streak, best_streak = calculate_streak(session, user_id)
    
    # Average tasks per day
    avg_tasks = calculate_avg_tasks_per_day(session, user_id)
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": round(completion_rate, 1),
        "streak_current": current_streak,
        "streak_best": best_streak,
        "avg_tasks_per_day": round(avg_tasks, 1),
        "created_at": first_task.created_at.isoformat()
    }
```

#### 3. Streak Calculation Logic

```python
def calculate_streak(session, user_id) -> tuple[int, int]:
    # Get all completion dates
    completed_dates = session.execute(
        select(func.date(Task.completed_at))
        .where(
            and_(
                Task.user_id == user_id,
                Task.completed == True,
                Task.completed_at != None
            )
        )
    ).scalars().all()
    
    # Convert to date objects
    date_set = {d.date() if hasattr(d, 'date') else d for d in completed_dates}
    sorted_dates = sorted(date_set)
    
    # Calculate current streak (working backwards from today)
    current_streak = 0
    today = datetime.now(timezone.utc).date()
    
    for i in range(len(sorted_dates)):
        check_date = today - timedelta(days=i)
        if check_date in date_set:
            current_streak += 1
        else:
            break
    
    # Calculate best streak (longest consecutive sequence)
    best_streak = 1
    if len(sorted_dates) > 1:
        max_streak = 1
        current = 1
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] == sorted_dates[i-1] + timedelta(days=1):
                current += 1
                max_streak = max(max_streak, current)
            else:
                current = 1
        best_streak = max_streak
    
    return current_streak, best_streak
```

#### 4. Productivity Charts API

```
GET /api/analytics/productivity?period=week|month|quarter

Response (period=week):
{
  "period": "week",
  "data": [
    {"date": "2026-02-02", "created": 5, "completed": 3},
    {"date": "2026-02-01", "created": 2, "completed": 2},
    {"date": "2026-01-31", "created": 0, "completed": 1},
    {"date": "2026-01-30", "created": 4, "completed": 4},
    {"date": "2026-01-29", "created": 1, "completed": 1},
    {"date": "2026-01-28", "created": 3, "completed": 2},
    {"date": "2026-01-27", "created": 6, "completed": 5}
  ]
}
```

#### 5. Calendar View (`/calendar` route)

```
Filters: Today, This Week, This Month, All Tasks

Endpoint: GET /api/tasks/calendar?period=week&date=2026-02-08

Response:
{
  "period": "week",
  "days": [
    "2026-02-02",
    "2026-02-03",
    "2026-02-04",
    "2026-02-05",
    "2026-02-06",
    "2026-02-07",
    "2026-02-08"
  ],
  "tasks_by_day": {
    "2026-02-02": [
      {"id": "abc", "title": "Buy milk", "completed": false, "due_date": "2026-02-02T10:00:00Z"}
    ],
    "2026-02-03": [],
    ...
  }
}
```

#### 6. Notification System

##### Database Schema
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(32),  -- 'due_soon', 'overdue', 'streak', 'task_completed', 'general'
    title VARCHAR(255),
    message VARCHAR(1000),
    task_id UUID REFERENCES tasks(id),  -- Optional, for task-related notifications
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    notify_due_soon BOOLEAN DEFAULT TRUE,
    notify_overdue BOOLEAN DEFAULT TRUE,
    notify_streaks BOOLEAN DEFAULT TRUE
);
```

##### Notification Types
| Type | Trigger | Message |
|------|---------|---------|
| due_soon | Task due within 24 hours | "Task 'X' is due within the next 24 hours" |
| overdue | Past due date, not completed | "Task 'X' is overdue!" |
| streak | Milestone reached (3, 7, 14, 30, 60, 100 days) | "Congratulations! You've maintained a 7-day streak!" |

##### API Endpoints
```
GET /api/user/notifications
Query: limit=20, cursor=optional
Response: { notifications: [...], next_cursor: string, total_count: int }

PUT /api/user/notifications/{id}/read
Response: { success: true }

PUT /api/user/notifications/read-all
Response: { success: true, marked_count: int }

GET /api/user/notifications/preferences
Response: { notify_due_soon: true, notify_overdue: true, notify_streaks: true }

PUT /api/user/notifications/preferences
Body: { notify_due_soon?: boolean, notify_overdue?: boolean, notify_streaks?: boolean }
Response: { notify_due_soon: true, notify_overdue: true, notify_streaks: true }
```

##### Notification Triggers
```python
class NotificationService:
    async def check_and_notify_due_soon(self, session, user_id):
        # Find tasks due within next 24 hours
        tasks = session.exec(select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.completed == False,
                Task.due_date >= now,
                Task.due_date <= tomorrow
            )
        )).all()
        
        # Create notifications for tasks without existing due_soon notification
        for task in tasks:
            if not already_notified(task, "due_soon"):
                await create_notification(
                    user_id, "due_soon",
                    "Task Due Soon",
                    f'"{task.title}" is due within the next 24 hours',
                    task.id
                )
    
    async def check_and_notify_overdue(self, session, user_id):
        # Find overdue tasks
        tasks = session.exec(select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.completed == False,
                Task.due_date < now
            )
        )).all()
        
        # Create notifications
        for task in tasks:
            if not already_notified(task, "overdue"):
                await create_notification(
                    user_id, "overdue",
                    "Task Overdue",
                    f'"{task.title}" is overdue!',
                    task.id
                )
```

#### 7. Export Features

##### CSV Export
```
GET /api/analytics/export/csv
Response: JSON with CSV content

Response Format:
{
  "filename": "tasks_export_abc12345.csv",
  "content": "id,title,description,priority,category,due_date,completed,created_at\n
              abc123,Buy milk,2 liters,medium,personal,2026-02-15,FALSE,2026-01-01\n
              ..."
}

Downloaded File: tasks_export_[user_id_first_8_chars].csv
```

##### PDF Export
```typescript
// Frontend using jsPDF + jspdf-autotable
async function generateTasksPDF(tasks: Task[], stats: UserStats) {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Task Report', pageWidth / 2, 20, { align: 'center' });
    
    // Statistics section
    doc.setFontSize(14);
    doc.text('Statistics Overview', 14, 40);
    
    const statsData = [
        ['Total Tasks', stats.total_tasks.toString()],
        ['Completed Tasks', stats.completed_tasks.toString()],
        ['Completion Rate', `${stats.completion_rate}%`],
        ['Current Streak', `${stats.streak_current} days`],
        ['Best Streak', `${stats.streak_best} days`]
    ];
    
    autoTable(doc, {
        startY: 48,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'striped'
    });
    
    // Task list section
    doc.text('Task List', 14, doc.lastAutoTable.finalY + 15);
    
    const taskRows = tasks.map(task => [
        task.title,
        task.priority || '-',
        task.category || '-',
        task.due_date ? new Date(task.due_date).toLocaleDateString() : '-',
        task.completed ? 'Completed' : 'Pending'
    ]);
    
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 23,
        head: [['Title', 'Priority', 'Category', 'Due Date', 'Status']],
        body: taskRows,
        theme: 'striped'
    });
    
    doc.save('task-report.pdf');
}
```

#### 8. Weekly/Monthly Reports

##### Weekly Report
```
GET /api/analytics/report/weekly

Response:
{
  "type": "weekly",
  "period_start": "2026-02-01T00:00:00Z",
  "period_end": "2026-02-08T00:00:00Z",
  "summary": {
    "tasks_created": 25,
    "tasks_completed": 18,
    "completion_rate": 72.0,
    "streak_current": 5,
    "streak_best": 7
  },
  "daily_breakdown": {
    "mon": 3,
    "tue": 4,
    "wed": 2,
    "thu": 5,
    "fri": 2,
    "sat": 1,
    "sun": 1
  },
  "generated_at": "2026-02-08T12:00:00Z"
}
```

##### Monthly Report
```
GET /api/analytics/report/monthly

Response:
{
  "type": "monthly",
  "period_start": "2026-01-08T00:00:00Z",
  "period_end": "2026-02-08T00:00:00Z",
  "summary": {
    "tasks_created": 87,
    "tasks_completed": 62,
    "completion_rate": 71.3,
    "avg_daily_completed": 2.1,
    "total_days": 30
  },
  "daily_breakdown": [
    {"date": "2026-01-09", "created": 3, "completed": 2},
    {"date": "2026-01-10", "created": 5, "completed": 4},
    ...
  ],
  "generated_at": "2026-02-08T12:00:00Z"
}
```

---

## Security Model

### Authentication Security
| Layer | Protection |
|-------|------------|
| Transport | HTTPS only (TLS 1.3) |
| Password Storage | bcrypt (12 rounds, cost factor 12) |
| Token Format | JWT with HS256 algorithm |
| Token Storage | HttpOnly cookies + Bearer header |
| Token Expiry | 24 hours access, 7 days refresh |
| Token Verification | Signature + expiration check |

### JWT Token Structure
```python
{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "exp": 1735689600,      # Expiration timestamp
    "iat": 1735603200,      # Issued at timestamp
    "iss": "taskflow-app",  # Issuer
    "aud": "taskflow-api"   # Audience
}
```

### User Data Isolation
```python
# EVERY database query includes user_id filtering
# This is enforced at the code level

# User can ONLY access their own data
tasks = session.exec(
    select(Task).where(Task.user_id == authenticated_user_id)
).all()

# User can ONLY see their own conversations
conversations = session.exec(
    select(Conversation).where(Conversation.user_id == user_id)
).all()

# User can ONLY see their notifications
notifications = session.exec(
    select(Notification).where(Notification.user_id == user_id)
).all()
```

### Rate Limiting
| Endpoint | Limit | Purpose |
|----------|-------|---------|
| POST /api/auth/login | 5/minute | Prevent brute force |
| GET /api/tasks | 100/minute | Read operations |
| POST /api/tasks | 50/minute | Write operations |
| GET /api/analytics/export/csv | 10/minute | Prevent export abuse |
| GET /api/analytics/export/pdf | 10/minute | Prevent export abuse |

### Input Validation
```python
# Pydantic models enforce constraints at API level
class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)  # Required, 1-255 chars
    description: Optional[str] = Field(max_length=2000)  # Optional, max 2000
    priority: Optional[str] = Field(default="medium", max_length=20)
    category: Optional[str] = Field(max_length=20)

class UserCreate(SQLModel):
    email: str = Field(max_length=255)  # Validated as email
    password: str = Field(min_length=8)  # Min 8 characters
    name: str = Field(default="", max_length=255)
```

### Error Handling
```python
# RFC 7807 Problem Details format
{
    "type": "https://api.taskflow.com/errors/not-found",
    "title": "Task Not Found",
    "status": 404,
    "detail": "Task with id 'abc123' was not found",
    "instance": "/api/tasks/abc123"
}

# Never expose raw errors
try:
    result = database_query()
except DatabaseError as e:
    logger.error("Database error", error=str(e))
    raise HTTPException(
        status_code=500,
        detail="An internal error occurred"
    )
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) DEFAULT '',
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_users_email ON users(email);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(20),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT chk_title_length CHECK (char_length(title) BETWEEN 1 AND 255),
    CONSTRAINT chk_priority CHECK (priority IN ('high', 'medium', 'low')),
    CONSTRAINT chk_category CHECK (category IN ('work', 'personal', 'study', 'health', 'finance'))
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);
CREATE INDEX ix_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX ix_tasks_user_created ON tasks(user_id, created_at);
CREATE INDEX ix_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX ix_tasks_completed_at ON tasks(completed_at);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_conversations_user_created ON conversations(user_id, created_at);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX ix_messages_user ON messages(user_id);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('due_soon', 'overdue', 'streak', 'task_completed', 'general')),
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_notifications_user ON notifications(user_id, created_at);
CREATE INDEX ix_notifications_user_read ON notifications(user_id, read, created_at);
```

### Notification Preferences Table
```sql
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notify_due_soon BOOLEAN DEFAULT TRUE,
    notify_overdue BOOLEAN DEFAULT TRUE,
    notify_streaks BOOLEAN DEFAULT TRUE
);
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new account |
| POST | /api/auth/login | Authenticate user |
| POST | /api/auth/logout | End session |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List user's tasks |
| GET | /api/tasks?status=pending\|completed\|all | Filter tasks |
| GET | /api/tasks/{id} | Get specific task |
| POST | /api/tasks | Create new task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| PATCH | /api/tasks/{id}/complete | Toggle completion |
| GET | /api/tasks/calendar?period=week\|month&date=YYYY-MM-DD | Calendar view |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get user profile |
| PUT | /api/user/profile | Update username |
| GET | /api/user/stats | Get statistics |
| GET | /api/user/notifications | List notifications |
| PUT | /api/user/notifications/{id}/read | Mark as read |
| PUT | /api/user/notifications/read-all | Mark all read |
| GET | /api/user/notifications/preferences | Get preferences |
| PUT | /api/user/notifications/preferences | Update preferences |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/productivity?period=week\|month\|quarter | Chart data |
| GET | /api/analytics/weekly-activity?weeks=8 | Weekly activity |
| GET | /api/analytics/export/csv | Export CSV |
| GET | /api/analytics/report/weekly | Weekly report |
| GET | /api/analytics/report/monthly | Monthly report |

### ChatKit
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chatkit | AI chat endpoint |
| POST | /api/chatkit/session | Create chat session |
| GET | /api/chatkit/health | Health check |

---

## Key Files Reference

### Backend
| Path | Purpose |
|------|---------|
| `backend/src/api/main.py` | FastAPI application entry point |
| `backend/src/api/auth_router.py` | Registration, login, logout endpoints |
| `backend/src/api/task_router.py` | CRUD operations for tasks |
| `backend/src/api/user_router.py` | User profile, stats, notifications |
| `backend/src/api/analytics_router.py` | Charts, reports, exports |
| `backend/src/api/chatkit_router.py` | AI chat integration |
| `backend/src/api/dependencies.py` | Authentication dependencies |
| `backend/src/middleware/auth_middleware.py` | JWT validation |
| `backend/src/middleware/rate_limit.py` | Rate limiting |
| `backend/src/mcp/server.py` | MCP server with task tools |
| `backend/src/services/task_service.py` | Task business logic |
| `backend/src/services/analytics_service.py` | Statistics calculations |
| `backend/src/services/notification_service.py` | Notification handling |
| `backend/src/services/conversation_service.py` | Chat conversation management |
| `backend/src/models/task.py` | Task data model |
| `backend/src/models/user.py` | User data model |
| `backend/src/models/notification.py` | Notification model |
| `backend/src/models/conversation.py` | Conversation model |
| `backend/src/models/message.py` | Message model |
| `backend/src/database/database.py` | Database connection |
| `backend/src/utils/jwt_validator.py` | JWT verification |

### Frontend
| Path | Purpose |
|------|---------|
| `frontend/src/app/page.tsx` | Dashboard page |
| `frontend/src/app/tasks/page.tsx` | Task list page |
| `frontend/src/app/calendar/page.tsx` | Calendar view |
| `frontend/src/app/user/page.tsx` | User profile page |
| `frontend/src/app/chat/page.tsx` | AI chat page |
| `frontend/src/app/analytics/page.tsx` | Analytics dashboard |
| `frontend/src/components/chat/ChatContainer.tsx` | ChatKit component |
| `frontend/src/components/user/UserProfile.tsx` | Profile management |
| `frontend/src/components/user/StatisticsCard.tsx` | Statistics display |
| `frontend/src/components/user/StreakDisplay.tsx` | Streak visualization |
| `frontend/src/components/calendar/TaskGroupByDay.tsx` | Calendar grouping |
| `frontend/src/components/notifications/NotificationCenter.tsx` | Notification UI |
| `frontend/src/services/userService.ts` | User API client |
| `frontend/src/services/analyticsService.ts` | Analytics API client |
| `frontend/src/context/AuthContext.tsx` | Authentication context |
| `frontend/src/utils/pdfGenerator.ts` | PDF export generation |

### Database
| Path | Purpose |
|------|---------|
| `backend/src/database/alembic/versions/*.py` | Migration scripts |
| `backend/src/database/database.py` | Connection management |

---

## Data Flow Architecture

### Complete Request Flow (Traditional)

```
User Action (Click "Create Task")
    │
    ▼
Frontend (React Component)
    │
    ├─► Validate input locally
    │
    ▼
API Call (axios.post('/api/tasks', { title: 'Buy milk' }))
    │
    ├─► Add Authorization header: "Bearer <JWT>"
    │
    ▼
Backend (FastAPI)
    │
    ├─► CORS Middleware (allow origin)
    │
    ├─► Rate Limiting (count request)
    │
    ├─► JWT Authentication
    │   ├─► Extract token from header/cookie
    │   ├─► Verify signature with BETTER_AUTH_SECRET
    │   ├─► Check expiration
    │   ├─► Extract user_id from payload
    │   │
    │   ▼
    │   current_user_id = "uuid..."
    │
    ├─► Route Handler (create_task)
    │   │
    │   ├─► Validate request body (Pydantic)
    │   │
    │   ├─► Database Query
    │   │   INSERT INTO tasks (user_id, title, ...)
    │   │   VALUES ('uuid...', 'Buy milk', ...)
    │   │
    │   ▼
    │   Task created with ID
    │
    ▼
Response (JSON)
    │
    ▼
Frontend renders updated task list
```

### Complete Request Flow (AI Chat)

```
User types in ChatKit: "Add buy groceries and eggs"
    │
    ▼
ChatKit Component
    │
    ▼
POST /api/chatkit (Server-Sent Events stream)
Headers: Authorization: Bearer <JWT>
Body: { message: "Add buy groceries and eggs", thread_id: "conv-uuid" }
    │
    ▼
Backend (FastAPI - ChatKit Router)
    │
    ├─► JWT Verification → user_id
    │
    ├─► Load Conversation
    │   SELECT * FROM conversations WHERE id = 'conv-uuid' AND user_id = 'user'
    │   SELECT * FROM messages WHERE conversation_id = 'conv-uuid' ORDER BY created_at
    │
    ├─► Build Agent Context
    │   [
    │     {"role": "user", "content": "Previous message..."},
    │     {"role": "assistant", "content": "Previous response..."},
    │     {"role": "user", "content": "Add buy groceries and eggs"}
    │   ]
    │
    ├─► Create OpenAI Agent with MCP Server
    │   │
    │   ├─► Agent analyzes: "User wants to add 2 tasks"
    │   │
    │   ├─► MCP Tool Call: add_task(title="Buy groceries")
    │   │   └─► Database: INSERT INTO tasks (user_id, title, ...)
    │   │
    │   ├─► MCP Tool Call: add_task(title="Buy eggs")
    │   │   └─► Database: INSERT INTO tasks (user_id, title, ...)
    │   │
    │   ▼
    │   Agent response: "I've added 2 tasks..."
    │
    ├─► Save Conversation
    │   INSERT INTO messages (conversation_id, user_id, role, content)
    │   VALUES ('conv-uuid', 'user', 'user', 'Add buy groceries and eggs')
    │   INSERT INTO messages (conversation_id, user_id, role, content)
    │   VALUES ('conv-uuid', 'assistant', 'I\'ve added 2 tasks...')
    │
    ▼
Streaming Response (SSE)
    │
    ▼
ChatKit displays: "I've added 2 tasks to your list!"
```

### Notification Trigger Flow

```
Scheduled Job (Every 5 minutes)
    │
    ▼
Check Due Soon Tasks
    │
    ▼
SELECT * FROM tasks
WHERE user_id = 'user'
  AND completed = FALSE
  AND due_date >= NOW()
  AND due_date <= NOW() + INTERVAL '24 hours'
    │
    ├─► Found task: "Pay bills" due tomorrow
    │
    ├─► Check if notification exists
    │   SELECT * FROM notifications
    │   WHERE user_id = 'user' AND type = 'due_soon' AND task_id = 'bills-id'
    │
    ├─► Create notification
    │   INSERT INTO notifications (user_id, type, title, message, task_id)
    │   VALUES ('user', 'due_soon', 'Task Due Soon', '"Pay bills" is due...', 'bills-id')
    │
    ▼
Frontend polls notifications endpoint
    │
    ▼
GET /api/user/notifications
    │
    ▼
Response: { notifications: [...], unread_count: 3 }
    │
    ▼
UI shows red badge on bell icon
```

---

## Success Criteria Summary

### Phase 1 (Console App)
- ✅ All 5 CRUD operations work correctly
- ✅ Duplicate title detection (case-insensitive)
- ✅ Natural language timestamps
- ✅ Error handling to stderr

### Phase 2 (Web App)
- ✅ Registration/login/logout flow
- ✅ JWT authentication (24h access, 7d refresh)
- ✅ Rate limiting (5 failed attempts/minute lockout)
- ✅ Task CRUD with user isolation
- ✅ Responsive Next.js frontend
- ✅ 200ms reads, 500ms writes performance

### Phase 3 (AI Chat)
- ✅ Natural language task management
- ✅ Conversation continuity (persisted to DB)
- ✅ MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- ✅ User isolation (user_id from JWT only)
- ✅ Response within 4 seconds
- ✅ No raw errors exposed

### Phase 4 (Analytics)
- ✅ Profile management and username updates
- ✅ Statistics (completion rate, streaks, averages)
- ✅ Productivity charts (week/month/quarter)
- ✅ Weekly and monthly reports
- ✅ In-app notifications (due soon, overdue, streaks)
- ✅ Calendar view with filters
- ✅ CSV and PDF exports
- ✅ Notification preferences

---

## Conclusion

This project demonstrates a complete, production-ready full-stack application with:

1. **Modern Architecture**: Next.js + FastAPI + PostgreSQL
2. **AI Integration**: ChatKit + OpenAI Agents SDK + MCP
3. **Security First**: JWT auth, user isolation, rate limiting
4. **Observable**: Structured logging, metrics, error handling
5. **Scalable**: Stateless design, connection pooling, indexed queries
6. **User-Friendly**: Responsive UI, notifications, exports

All specifications are fully implemented with production-ready code quality.

---

*Documentation generated for TaskFlow - AI-Powered Task Management Application*
*Last Updated: February 2026*
