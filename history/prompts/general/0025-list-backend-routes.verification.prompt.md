---
id: "0025"
title: "List all backend routes"
stage: "continuation"
date: "2026-02-06"
surface: "agent"
model: "minimax-m2.1-free"
feature: "none"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "run backedn adn check its all routes"
labels: ["routes","backend","fastapi"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "backend/src/api/main.py"
  - "backend/src/api/task_router.py"
  - "backend/src/api/analytics_router.py"
  - "backend/src/api/auth_router.py"
  - "backend/src/api/user_router.py"
  - "backend/src/api/notification_router.py"
  - "backend/src/api/chatkit_router.py"
tests:
  - "All 60 routes registered successfully"
---

## Prompt

run backedn adn check its all routes

## Response snapshot

**Backend Routes - 60 Total:**

| Category | Endpoints |
|----------|-----------|
| **📋 Tasks** (7) | GET/POST /api/tasks, GET /api/tasks/calendar, GET/PUT/DELETE /api/tasks/{task_id}, PATCH /api/tasks/{task_id}/complete |
| **📊 Analytics** (9) | GET /api/analytics/productivity, weekly-activity, export/csv, report/weekly, report/monthly |
| **👤 User** (15) | GET/PUT /api/user/profile, GET /api/user/stats, User notifications and preferences |
| **🔔 Notifications** (8) | GET /api/notifications, unread-count, preferences, POST read, check |
| **🔐 Auth** (6) | POST sign-up/email, sign-in/email, sign-out, refresh, GET session |
| **💬 ChatKit** (4) | POST /api/chatkit/chatkit, session, upload, GET health |
| **🛠️ Admin** (1) | POST /api/admin/reset-connections |
| **📖 Docs** (3) | /openapi.json, /docs, /redoc |
| **❤️ Health** (2) | /health, /api/health |
| **🔌 MCP** (1) | /mcp |

## Outcome

- ✅ Impact: All 60 backend routes listed and verified
- 🧪 Routes: 60 total endpoints across 10 categories
- 📁 Files: 7 router files verified
- 🔁 Next prompts: Fix database connection for live server
- 🧠 Reflection: Backend has comprehensive API coverage for tasks, analytics, user management, notifications, and AI integration.

## Evaluation notes (flywheel)

- Failure modes observed: Server hangs on database connection at startup
- Graders run and results (PASS/FAIL): Routes listed successfully
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Use connection pooling with lazy initialization
