# AI Conversational Todo Manager

A modern, full-stack task management application with AI-powered conversational interface. Built with Next.js 16, FastAPI, Better Auth, and Neon Serverless PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-16+-black.svg)

## ✨ Features

### 🎯 Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Rich Task Properties**:
  - Title and description
  - Priority levels (High, Medium, Low)
  - Categories (Work, Personal, Study, Health, Finance)
  - Due dates with timezone support
  - Completion status
- **Visual Indicators**:
  - Color-coded priority badges
  - Category icons
  - Overdue task alerts
  - Completion checkboxes

### 🔍 Advanced Filtering (15 Filter Options)
- **Status Filters**: All, Active/Pending, Completed
- **Priority Filters**: High, Medium, Low
- **Date Filters**: Today, Tomorrow, This Week, Overdue, No Due Date
- **Category Filters**: Work, Personal, Study, Health, Finance

### 🤖 AI Chat Assistant
- **Natural Language Interface**: Manage tasks through conversation
- **Intelligent Task Creation**: Auto-categorization and priority assignment
- **Context-Aware**: Understands filter requests and task queries
- **Floating Chat Button**: Accessible from any page
- **Conversation History**: Maintains context across interactions

### 🔐 Authentication & Security
- **Better Auth Integration**: JWT-based authentication
- **Secure Sessions**: httpOnly cookies
- **User Isolation**: Row-level security for tasks
- **Protected Routes**: API and page-level protection

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Clean, modern styling
- **Lucide Icons**: Beautiful, consistent iconography
- **Real-time Updates**: Instant task synchronization
- **Loading States**: Smooth user experience

## 📁 Project Phases

This project was built in phases, each documented with detailed information:

| Phase | Status | Description |
|-------|--------|-------------|
| [Phase-1.md](./Phase-1.md) | ✅ Complete | CLI Todo Application |
| [Phase-2.md](./Phase-2.md) | ✅ Complete | Task Management Web App |
| [Phase-3.md](./Phase-3.md) | ✅ Complete | AI Conversational Todo |

Each phase document contains:
- Features implemented
- Technology used
- Project structure
- Key files and their purposes
- Lessons learned

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React Context API
- **Authentication**: Better Auth (client-side)
- **Chat UI**: OpenAI ChatKit

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12+
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth JWT verification
- **AI Agent**: OpenAI Agents SDK with Gemini
- **MCP Server**: FastMCP for tool integration
- **Logging**: Structlog

### Infrastructure
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **API Protocol**: REST + Server-Sent Events (SSE)
- **Model Context Protocol**: MCP for AI tool integration

## 📋 Prerequisites

- **Python**: 3.12 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **PostgreSQL**: Neon Serverless account
- **API Keys**:
  - Google Gemini API key
  - Better Auth secret
  - Neon database connection string

## 🚀 Quick Start

For detailed setup instructions, see:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd it
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Configure `.env`:**

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

**Run Database Migrations:**

```bash
alembic upgrade head
```

**Start Backend Server:**

```bash
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

**Configure `.env.local`:**

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Database (for Better Auth)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Start Frontend Server:**

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### REST Endpoints

#### Tasks

**GET /api/tasks**
- Get all tasks for authenticated user
- Query params: `status_filter` (optional)
- Supports all 15 filter types

**POST /api/tasks**
- Create a new task
- Body: `{ title, description?, priority?, category?, due_date? }`

**GET /api/tasks/{task_id}**
- Get a specific task

**PUT /api/tasks/{task_id}**
- Update a task
- Body: `{ title?, description?, completed?, priority?, category?, due_date? }`

**DELETE /api/tasks/{task_id}**
- Delete a task

**PATCH /api/tasks/{task_id}/complete**
- Toggle task completion
- Body: `{ completed: boolean }`

#### Authentication

**POST /api/auth/sign-in**
- Sign in with email/password

**POST /api/auth/sign-up**
- Create new account

**POST /api/auth/sign-out**
- Sign out current user

#### User Profile

**GET /api/user/profile**
- Get current user's profile information

**PUT /api/user/profile**
- Update user profile
- Body: `{ name?, avatar? }`

**GET /api/user/stats**
- Get task statistics for current user
- Returns: `{ total_tasks, completed_tasks, completion_rate, streak_current, streak_best }`

**GET /api/user/notifications**
- Get paginated notifications for current user
- Query params: `page?`, `limit?`

#### Analytics

**GET /api/analytics/productivity?period={week|month|quarter}**
- Get productivity data for charts
- Returns daily created/completed task counts

**GET /api/analytics/weekly-activity?weeks={1-52}**
- Get weekly activity breakdown
- Returns week-by-week task completion data

**GET /api/analytics/export/csv**
- Export all tasks to CSV format
- Returns: `{ filename, content, content_type }`

**GET /api/analytics/report/weekly**
- Generate weekly productivity report

**GET /api/analytics/report/monthly**
- Generate monthly productivity report

#### Calendar

**GET /api/tasks/calendar?period={today|week|month}&date={YYYY-MM-DD}**
- Get tasks grouped by day for calendar view
- Returns tasks organized by their due dates

### MCP Tools (AI Agent)

**add_task**
- Create task via AI agent
- Parameters: `title, description?, priority?, category?, due_date?`

**list_tasks**
- List tasks with optional filter
- Parameters: `status?` (supports all 15 filter types)

**update_task**
- Update task properties
- Parameters: `task_id, title?, description?, priority?, category?, due_date?`

**delete_task**
- Delete a task
- Parameters: `task_id`

**complete_task**
- Mark task as complete/incomplete
- Parameters: `task_id, completed`

## 🤖 AI Chat Assistant Usage

### Natural Language Commands

**Task Creation:**
- "Add a task to buy groceries"
- "Create a high priority work task to review code"
- "Add a health task for dentist appointment on Feb 15"

**Task Filtering:**
- "Show me my high priority tasks"
- "What's due today?"
- "List all work tasks"
- "Show overdue tasks"
- "What tasks are due this week?"

**Task Management:**
- "Mark task 1 as complete"
- "Delete the grocery task"
- "Update task 2 priority to high"

### Intelligent Features

- **Auto-categorization**: Automatically assigns categories based on task content
- **Priority Detection**: Suggests priority levels from task description
- **Due Date Parsing**: Understands natural date expressions
- **Context Retention**: Remembers conversation history

### 👤 User Profile Management
- **Profile Page**: View and edit user profile information
- **Statistics Display**: Shows task statistics (total, completed, completion rate)
- **Streak Tracking**: Current and best streak indicators
- **Avatar Integration**: Gravatar support for user avatars

### 📊 Analytics Dashboard
- **Productivity Charts**: Visual productivity trends (week/month/quarter)
- **Weekly Activity**: Day-by-day task completion breakdown
- **Completion Rates**: Track task completion over time
- **Trend Analysis**: Identify productivity patterns

### 📅 Calendar View
- **Task Calendar**: View tasks organized by due date
- **Period Navigation**: Switch between today, week, and month views
- **Day Grouping**: Tasks grouped by day for easy scanning
- **Quick Access**: Navigate to specific dates

### 🔔 In-App Notifications
- **Due Soon Alerts**: Get notified before tasks are due
- **Overdue Reminders**: Stay on top of overdue tasks
- **Streak Celebrations**: Celebrate streak achievements
- **Notification Center**: Bell icon with dropdown notification list
- **Read/Unread Status**: Mark notifications as read

### 📁 Data Export
- **CSV Export**: Download all tasks as CSV files
- **PDF Reports**: Generate detailed productivity reports
- **Report Types**: Weekly and monthly productivity summaries
- **Printable Format**: Clean, professional PDF formatting

## 🗄️ Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',  -- 'high', 'medium', 'low'
    category VARCHAR(20),  -- 'work', 'personal', 'study', 'health', 'finance'
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
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
    type VARCHAR(20) NOT NULL,  -- 'due_soon', 'overdue', 'streak'
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ix_notifications_user_read ON notifications(user_id, read);
CREATE INDEX ix_notifications_user_created ON notifications(user_id, created_at);
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing scenarios.

## 📦 Project Structure

```
it/
├── backend/
│   ├── src/
│   │   ├── api/           # FastAPI routes (auth, tasks, user, analytics)
│   │   ├── models/        # SQLModel models (user, task, notification)
│   │   ├── services/      # Business logic (analytics, notification, export)
│   │   ├── mcp/           # MCP server & tools
│   │   └── database/      # Database config & migrations
│   ├── tests/             # Backend tests (unit & integration)
│   └── requirements.txt   # Python dependencies
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   └── package.json       # Node dependencies
├── CLAUDE.md              # Project instructions
├── TESTING_GUIDE.md       # Testing documentation
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret for JWT signing
- `BETTER_AUTH_URL`: Frontend URL for auth callbacks
- `GEMINI_API_KEY`: Google Gemini API key
- `ALLOWED_ORIGINS`: CORS allowed origins
- `ENVIRONMENT`: development/production

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `BETTER_AUTH_SECRET`: Must match backend secret
- `BETTER_AUTH_URL`: Frontend URL
- `DATABASE_URL`: Neon PostgreSQL connection string

## 🚢 Deployment

### Backend Deployment

1. Set environment variables on hosting platform
2. Run database migrations: `alembic upgrade head`
3. Start server: `uvicorn src.api.main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment

1. Build the application: `npm run build`
2. Set environment variables
3. Start server: `npm start`

**Recommended Platforms:**
- Backend: Railway, Render, Fly.io
- Frontend: Vercel, Netlify
- Database: Neon Serverless PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **FastAPI** - Python web framework
- **Better Auth** - Authentication solution
- **Neon** - Serverless PostgreSQL
- **OpenAI** - ChatKit and Agents SDK
- **Google** - Gemini AI model
- **Tailwind CSS** - Utility-first CSS framework

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using Claude Code**
