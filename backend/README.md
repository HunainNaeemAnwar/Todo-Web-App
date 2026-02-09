# AI Task Manager - Backend

A high-performance FastAPI backend for the AI Conversational Todo Manager with JWT authentication, SQLModel ORM, and Neon Serverless PostgreSQL.

## Tech Stack

- **Framework**: FastAPI (Python 3.12+)
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth JWT verification
- **AI Integration**: OpenAI Agents SDK, Google Gemini
- **MCP Server**: FastMCP for tool integration
- **Logging**: Structlog
- **Rate Limiting**: SlowAPI

## Features

- RESTful API endpoints for task management
- JWT-based authentication with HttpOnly cookies
- User data isolation (row-level security)
- AI-powered task creation and management
- Analytics and productivity tracking
- MCP tools for AI agent integration
- Comprehensive logging and monitoring

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL database (Neon)
- JWT secret key

### Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Configure environment variables
# See .env.example for required variables
```

### Database Setup

```bash
# Run migrations
alembic upgrade head
```

### Development

```bash
# Start development server with auto-reload
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

# Or use the run script
./run_backend.sh
```

### Production

```bash
# Build and run with gunicorn
gunicorn src.api.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Project Structure

```
backend/
├── src/
│   ├── api/           # FastAPI routes
│   │   ├── auth_router.py       # Authentication endpoints
│   │   ├── task_router.py       # Task CRUD endpoints
│   │   ├── user_router.py       # User profile endpoints
│   │   ├── analytics_router.py  # Analytics endpoints
│   │   ├── notification_router.py
│   │   ├── chatkit_router.py    # AI chat integration
│   │   ├── dependencies.py       # Route dependencies
│   │   └── main.py              # App entry point
│   ├── models/        # SQLModel database models
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── notification.py
│   │   └── ...
│   ├── services/      # Business logic
│   │   ├── task_service.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── ...
│   ├── database/     # Database configuration
│   │   ├── database.py
│   │   └── migrations/
│   ├── mcp/          # MCP server & tools
│   ├── utils/        # Utilities
│   │   ├── jwt_validator.py
│   │   └── validators.py
│   ├── logging_/     # Logging configuration
│   └── exceptions/   # Exception handlers
├── tests/            # Test files
│   ├── unit/
│   ├── integration/
│   └── contract/
├── scripts/          # Utility scripts
├── alembic/          # Database migrations
├── requirements.txt  # Python dependencies
└── .env              # Environment variables
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/get-session` | Get current session |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/{id}` | Get task by ID |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |
| GET | `/api/tasks/calendar` | Calendar view |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/stats` | Get user statistics |
| GET | `/api/user/notifications` | Get notifications |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/productivity` | Productivity data |
| GET | `/api/analytics/weekly-activity` | Weekly activity |
| GET | `/api/analytics/export/csv` | Export to CSV |
| GET | `/api/analytics/report/weekly` | Weekly report |
| GET | `/api/analytics/report/monthly` | Monthly report |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | JWT signing secret (32+ chars) | Yes |
| `JWT_EXPIRATION_HOURS` | Token expiration (default: 24) | No |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | No |
| `ENVIRONMENT` | development/production | No |

## Authentication

All protected endpoints require a valid JWT token passed via:

1. **Authorization Header**: `Authorization: Bearer <token>`
2. **Cookie**: `auth_token=<token>` (HttpOnly)

The backend validates tokens using the shared `BETTER_AUTH_SECRET` and extracts the `user_id` for data isolation.

## Testing

```bash
# Run all tests with coverage
pytest tests/ -v --cov=src --cov-report=term-missing

# Run specific test file
pytest tests/unit/test_apps.py -v

# Run with coverage report
pytest tests/ --cov=src --cov-report=html
```

## Database Migrations

```bash
# Create new migration
alembic revision -m "description"

# Run migrations
alembic upgrade head

# Show current revision
alembic current

# Show migration history
alembic history
```

## Logging

Structured JSON logging with structlog:

```bash
# Set log level
LOG_LEVEL=DEBUG  # Default: INFO
```

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel](https://sqlmodel.tiangolo.com)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Better Auth](https://www.better-auth.com)
- [FastMCP](https://github.com/jlowin/fastmcp)
