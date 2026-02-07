---
id: phr-2026-02-02-003
title: Fix user_router.py authentication
stage: misc
date_iso: "2026-02-02"
surface: agent
model: minimax-m2.1-free
feature: "004-user-analytics-dashboard"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "fix user_router.py authentication"
labels: ["bug-fix", "authentication", "backend"]
links: {"spec": "null", "ticket": "null", "adr": "null", "pr": "null"}
files_created: []
files_modified: ["backend/src/api/user_router.py"]
tests_run: []
tests_added: []
prompt_text: |
  The user reported that /user and /analytics routes were redirecting to login even when authenticated. Looking at the backend logs, we found:
  - /api/tasks/ returns 200 OK (uses CurrentUser dependency correctly)
  - /api/user/profile returns 401 "Not authenticated"
  - /api/user/stats returns 401 "Not authenticated"
  - /api/chatkit/session returns 401 "Invalid or expired token"

  The issue was in user_router.py which had a broken get_current_user_id function that called UserService.get_current_user(token) but UserService doesn't have that method.
response_text: |
  Fixed user_router.py to use CurrentUser dependency from dependencies.py instead of broken custom implementation. Now /api/user/profile and /api/user/stats work correctly with Bearer token authentication.
outcome: "success"
---
