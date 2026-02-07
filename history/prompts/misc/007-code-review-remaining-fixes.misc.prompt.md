---
id: "007"
title: Code review remaining fixes - magic numbers and duplicate routes
stage: misc
date: "2026-02-05"
surface: agent
model: minimax-m2.1-free
feature: task-management-app
branch: 002-task-management-app
user: hunain
command: Continue remaining code review fixes
labels: [code-review, magic-numbers, routes, cleanup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/api/auth_router.py
  - backend/src/api/task_router.py
tests: []
---

## Prompt

Continue if you have next steps

## Response snapshot

Completed remaining code review fixes:

1. **Magic numbers replaced with named constants in auth_router.py:**
   - Added `ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24` (24 hours)
   - Added `REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7` (7 days)
   - Replaced hardcoded `max_age=60 * 60 * 24` and `max_age=60 * 60 * 24 * 7` with constants

2. **Duplicate API routes removed from auth_router.py:**
   - Removed `/sign-up/email/` duplicate
   - Removed `/sign-in/email/` duplicate
   - Removed `/sign-out/` duplicate
   - Removed `/refresh/` duplicate
   - Removed `/get-session/` duplicate

3. **Duplicate API routes removed from task_router.py:**
   - Removed `/` duplicate for GET tasks
   - Removed `/` duplicate for POST tasks
   - Removed duplicate `/calendar/` routes (had 3 variants)
   - Removed `/{task_id}/` duplicate for GET task
   - Removed `/{task_id}/` duplicate for PUT task
   - Removed `/{task_id}/` duplicate for DELETE task
   - Removed `/{task_id}/complete/` duplicate

4. **Verification:**
   - Python syntax check passed for both files

## Outcome

- ✅ Impact: All remaining code review items completed, codebase more maintainable
- 🧪 Tests: none
- 📁 Files: 2 files modified (auth_router.py, task_router.py)
- 🔁 Next prompts: none
- 🧠 Reflection: All production readiness issues from code review have been addressed

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Python syntax check PASS
- Prompt variant (if applicable): continuation from previous code review
- Next experiment (smallest change to try): none
