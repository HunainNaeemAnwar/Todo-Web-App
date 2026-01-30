---
id: "004"
title: "Fix login and signup authentication issues"
stage: "general"
date: "2026-01-19"
surface: "agent"
model: "claude-sonnet-4-20250514"
feature: "none"
branch: "main"
user: "hunain"
command: "My login and signup are failing—please fix this."
labels: ["authentication", "better-auth", "bugfix", "api"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "/home/hunain/DO/it/backend/src/api/auth_router.py"
  - "/home/hunain/DO/it/backend/src/models/user.py"
  - "/home/hunain/DO/it/backend/src/models/task.py"
  - "/home/hunain/DO/it/backend/src/services/user_service.py"
  - "/home/hunain/DO/it/frontend/src/components/auth/RegisterForm.tsx"
tests:
  - "Manual API testing: sign-up works"
  - "Manual API testing: sign-in works"
  - "Manual API testing: wrong password returns 401"
---

## Prompt

My login and signup are failing—please fix this.

Use Context7 to ensure the latest and correct technology context.
Also use other MCPs if needed.

For authentication, use the Better Auth skill to properly understand and apply the Better Auth implementation.

## Response summary

Identified and fixed multiple issues with the authentication flow:

1. **Endpoint mismatch**: The backend had endpoints at `/login` and `/register` but Better Auth client expects `/sign-in/email` and `/sign-up/email`.

2. **Missing `name` field**: Better Auth's signUp requires a `name` field, but the registration form wasn't collecting it.

3. **Response format mismatch**: The backend was returning a simple JWT token, but Better Auth expects `{user, session}` format.

4. **Database schema**: Added `name` column to users table.

**Files modified:**
- `backend/src/api/auth_router.py` - Updated endpoints to Better Auth format with proper response structure
- `backend/src/models/user.py` - Added `name` field to User model
- `backend/src/models/task.py` - Fixed TYPE_CHECKING import for User relationship
- `backend/src/services/user_service.py` - Handle `name` field in user creation
- `frontend/src/components/auth/RegisterForm.tsx` - Added name input field

**Test results:**
- ✅ Sign-up with new user works
- ✅ Sign-in with existing user works  
- ✅ Wrong password returns 401 Unauthorized

## Outcome

- ✅ Impact: Authentication flow fully functional with Better Auth compatible API
- 🧪 Tests: Manual API testing passed for sign-up, sign-in, and error handling
- 📁 Files: 5 files modified
- 🔁 Next prompts: None required
- 🧠 Reflection: The key issue was not following Better Auth's expected API format and missing required fields.

## Evaluation notes (flywheel)

- Failure modes observed: "Database schema missing name column"
- Graders run and results (PASS/FAIL): "Manual testing PASS"
- Prompt variant (if applicable): "N/A"
- Next experiment (smallest change to try): "Add email verification flow"
