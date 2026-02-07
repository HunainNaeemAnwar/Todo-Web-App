---
id: "0028"
title: "Fix generator session dependency issue in FastAPI"
stage: "continuation"
date: "2026-02-06"
surface: "agent"
model: "minimax-m2.1-free"
feature: "none"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "Fix generator didn't stop after throw error using context7 mcp"
labels: ["backend","fastapi","session","generator","fix"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "backend/src/database/database.py"
  - "backend/src/api/analytics_router.py"
tests:
  - "Backend server starts successfully"
  - "No generator exceptions in logs"
  - "All API endpoints respond correctly"
---

## Prompt

Fix the "generator didn't stop after throw()" error in FastAPI when using session dependencies with HTTPException.

## Response snapshot

Fixed the generator context manager issue by:

### 1. Updated `database.py`:
- Removed the problematic `get_session()` generator function
- Added `get_session_context()` context manager for direct use in routes
- Added `get_session_factory()` and `get_managed_session()` as alternatives
- Engine and connection pool optimizations remain intact

### 2. Updated `analytics_router.py`:
- Removed `SessionDep = Annotated[Session, Depends(get_session)]` dependency
- Routes now use `get_session_context()` directly in route handlers
- Auth dependency (`UserIdDep`) now stands alone without session dependency

### Root Cause:
When FastAPI runs sync generator dependencies in a thread pool, and an HTTPException is raised by another dependency (like `get_current_user_id`) during `solve_dependencies`, the generator's `__exit__` is called with an exception before `yield` executes. This causes the "generator didn't stop after throw()" error.

### Solution:
Using context manager pattern (`with get_session_context() as session:`) instead of generator dependency (`session: SessionDep`) avoids this issue because context managers handle exceptions properly in their `__exit__` method.

## Outcome

- ✅ Impact: Generator exception error resolved
- 🧪 Tests: Backend server starts and routes work correctly
- 📁 Files: Updated 2 files with proper session management
- 🔁 Next prompts: Apply same fix to other routers if needed
- 🧠 Reflection: Generator-based dependencies don't work well with FastAPI's thread pool when combined with auth dependencies that raise HTTPException. Context managers are the proper pattern.

## Evaluation notes (flywheel)

- Failure modes observed: Generator exception when HTTPException raised by auth dependency
- Graders run and results (PASS/FAIL): Syntax check: PASS, mypy: PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Apply same pattern to task_router.py, user_router.py, notification_router.py
