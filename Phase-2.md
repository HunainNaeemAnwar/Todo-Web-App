# Phase 2: Task Management Web Application

**Status**: ✅ Complete
**Created**: 2026-01-07
**Updated**: 2026-02-09

## Overview

A full-stack web application for task management with user authentication, persistent storage, and a responsive interface. Built with Next.js 16, FastAPI, SQLModel, and Neon Serverless PostgreSQL.

## Features Implemented

### Authentication (Better Auth + JWT)
- ✅ User registration with email/password
- ✅ User login with session management
- ✅ Secure logout with token invalidation
- ✅ Automatic token refresh
- ✅ HttpOnly cookie-based JWT storage
- ✅ Password hashing with bcrypt

### Task Management (CRUD)
- ✅ Create tasks with title, description, priority, category, due date
- ✅ List all tasks for authenticated user
- ✅ View task details
- ✅ Update task properties
- ✅ Delete tasks
- ✅ Toggle task completion status

### Advanced Features
- ✅ 15+ filter options (status, priority, date, category)
- ✅ Calendar view with task grouping
- ✅ User statistics and analytics
- ✅ Productivity charts
- ✅ Responsive design (mobile-first)

## Technology Stack

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.0+ |
| Styling | Tailwind CSS |
| State | React Context API |
| HTTP Client | Axios with interceptors |
| Icons | Lucide React |
| Auth | Better Auth (cookie-based JWT) |

### Backend
| Layer | Technology |
|-------|------------|
| Framework | FastAPI (Python 3.12+) |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Auth | Better Auth JWT verification |
| Logging | Structlog |
| Rate Limiting | SlowAPI |
| Validation | Pydantic v2 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/get-session` | Get current session |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get task details |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |
| GET | `/api/tasks/calendar` | Calendar view |

### User & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | User profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/stats` | Task statistics |
| GET | `/api/user/notifications` | User notifications |
| GET | `/api/analytics/productivity` | Productivity data |
| GET | `/api/analytics/export/csv` | Export to CSV |

## Project Structure

```
it/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth_router.py
│   │   │   ├── task_router.py
│   │   │   ├── user_router.py
│   │   │   ├── analytics_router.py
│   │   │   ├── notification_router.py
│   │   │   ├── chatkit_router.py
│   │   │   ├── dependencies.py
│   │   │   └── main.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── notification.py
│   │   ├── services/
│   │   │   ├── task_service.py
│   │   │   ├── auth_service.py
│   │   │   └── user_service.py
│   │   ├── database/
│   │   │   └── database.py
│   │   ├── utils/
│   │   │   ├── jwt_validator.py
│   │   │   └── validators.py
│   │   ├── mcp/
│   │   └── logging_/
│   ├── tests/
│   ├── alembic/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # API proxy routes
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   ├── chat/
│   │   │   └── user/
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   ├── notifications/
│   │   │   ├── theme/
│   │   │   └── user/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── TaskContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/
│   │   │   ├── auth-client.ts
│   │   │   ├── axiosConfig.ts
│   │   │   └── cookies.ts
│   │   ├── services/
│   │   │   └── userService.ts
│   │   ├── types/
│   │   │   └── task.ts
│   │   └── utils/
│   ├── package.json
│   └── next.config.js
│
└── specs/
    └── 002-task-management-app/
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
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
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(20),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);
CREATE INDEX ix_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX ix_tasks_user_created ON tasks(user_id, created_at);
CREATE INDEX ix_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX ix_tasks_user_category ON tasks(user_id, category);
CREATE INDEX ix_tasks_user_due_date ON tasks(user_id, due_date);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_notifications_user_read ON notifications(user_id, read);
CREATE INDEX ix_notifications_user_created ON notifications(user_id, created_at);
```

## Getting Started

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Neon database URL and JWT secret

# Run migrations
alembic upgrade head

# Start server
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with API URL and auth secret

# Start development server
npm run dev
```

## Security Features

1. **JWT Authentication**
   - HS256 algorithm
   - 24-hour token expiration
   - 7-day refresh token
   - Token blacklist for logout

2. **Cookie Security**
   - HttpOnly (prevent XSS theft)
   - Secure in production
   - SameSite policy

3. **User Data Isolation**
   - All queries filtered by authenticated user_id
   - No cross-user data access possible

4. **Password Security**
   - bcrypt hashing
   - Validation rules

5. **Rate Limiting**
   - 100 requests/minute for reads
   - 50 requests/minute for writes

## Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=src

# Frontend tests
cd frontend
npm run test
```

## Deployment

### Backend
1. Set environment variables
2. Run database migrations
3. Deploy with gunicorn/uvicorn

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify

## Key Differences from Phase 1

| Aspect | Phase 1 (CLI) | Phase 2 (Web) |
|--------|---------------|---------------|
| Interface | Command Line | Web Browser |
| Auth | None | JWT + Cookies |
| Database | SQLite | Neon PostgreSQL |
| User Multi-tenancy | Single user | Multiple users |
| Task Properties | Basic | Extended (priority, category, due date) |
| Views | List only | Dashboard, Calendar, Analytics |

## Lessons Learned

1. **API-First Design**: RESTful endpoints enable multiple clients
2. **Stateless Auth**: JWT enables horizontal scaling
3. **User Isolation**: Query-level security essential for multi-tenancy
4. **Cookie vs LocalStorage**: HttpOnly cookies more secure for JWT
5. **Next.js Rewrites**: Clean API proxying without separate routes

## References

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](backend/API.md)
- [Feature Specification](specs/002-task-management-app/spec.md)

---

**Next Phase**: [Phase 3 - AI Conversational Todo](Phase-3.md)

**Previous Phase**: [Phase 1 - CLI Todo](Phase-1.md)
