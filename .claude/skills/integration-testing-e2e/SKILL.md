# Full-Stack End-to-End Integration Testing Skill

## Skill Metadata
- **Name**: `integration-testing-e2e`
- **Version**: 1.0.0
- **Category**: Testing & Validation
- **Stack**: Next.js 16+, FastAPI, SQLModel, Better Auth, Neon PostgreSQL

## Purpose
Validates complete end-to-end integration across the full technology stack, ensuring seamless communication between frontend, backend, database, and authentication layers.

## When to Use This Skill
- After implementing new features that span frontend and backend
- Before deployment to production
- When authentication flows are modified
- After database schema changes
- During integration testing phases
- When investigating cross-layer bugs

## Prerequisites
- Frontend server running (Next.js dev server on port 3000)
- Backend server running (FastAPI on port 8000)
- Neon PostgreSQL database accessible
- Test user credentials configured
- Environment variables set (.env files)

## Core Validation Areas

### 1. API Routes and Frontend API Calls

**Objective**: Ensure Next.js frontend correctly communicates with FastAPI backend.

**Steps**:
1. Identify all API endpoints from `specs/001-task-management-app/contracts/api-contract.md`
2. For each endpoint, validate:
   - Frontend makes correct HTTP method (GET, POST, PUT, DELETE, PATCH)
   - Request headers include proper Content-Type and Authorization
   - Request body matches API contract schema
   - Response status codes match expected values (200, 400, 401, 404, 500)
   - Response body follows RFC 7807 format for errors
   - Response data structure matches API contract

**Commands to Execute**:
```bash
# Start both servers
cd frontend && npm run dev &
cd backend && uvicorn src.main:app --reload &

# Run API integration tests
pytest backend/tests/integration/test_api_routes.py -v

# Test frontend API calls
cd frontend && npm run test:integration
```

**Validation Checklist**:
- [ ] All API endpoints respond with correct status codes
- [ ] Request/response payloads match API contract
- [ ] Error responses follow RFC 7807 format
- [ ] CORS headers configured correctly
- [ ] Content-Type headers are correct (application/json)

### 2. JWT Token Lifecycle and Authentication Flows

**Objective**: Validate complete JWT authentication flow from registration to logout.

**Test Scenarios**:

#### Scenario A: User Registration Flow
```bash
# Test user registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'

# Expected: 201 Created with JWT tokens in response
```

**Validation**:
- [ ] User created in database (check `users` table)
- [ ] Password hashed (not stored in plaintext)
- [ ] JWT access token returned (24-hour expiry)
- [ ] JWT refresh token returned (7-day expiry)
- [ ] Token payload contains user_id and email
- [ ] Better Auth session created

#### Scenario B: User Login Flow
```bash
# Test user login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Expected: 200 OK with JWT tokens
```

**Validation**:
- [ ] Correct credentials return valid JWT tokens
- [ ] Invalid credentials return 401 Unauthorized
- [ ] Rate limiting enforced (5 failed attempts trigger lockout)
- [ ] Token stored client-side (localStorage or sessionStorage)

#### Scenario C: Authenticated Request Flow
```bash
# Test authenticated endpoint
TOKEN="<jwt_token_from_login>"
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user's tasks
```

**Validation**:
- [ ] Valid token grants access to protected endpoints
- [ ] Invalid/expired token returns 401 Unauthorized
- [ ] Missing token returns 401 Unauthorized
- [ ] Token validation uses PyJWT correctly
- [ ] User isolation enforced (only user's own data returned)

#### Scenario D: Token Refresh Flow
```bash
# Test token refresh
REFRESH_TOKEN="<refresh_token>"
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"'$REFRESH_TOKEN'"}'

# Expected: 200 OK with new access token
```

**Validation**:
- [ ] Valid refresh token returns new access token
- [ ] Expired refresh token returns 401 Unauthorized
- [ ] New access token has correct expiry (24 hours)

#### Scenario E: Logout Flow
```bash
# Test logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
```

**Validation**:
- [ ] Token invalidated (subsequent requests fail)
- [ ] Client-side token cleared
- [ ] Better Auth session terminated

### 3. React Context State Consistency with Backend

**Objective**: Ensure React Context state remains synchronized with backend database state.

**Test Scenarios**:

#### Scenario A: Initial State Load
```typescript
// Test: Load user tasks on mount
// File: frontend/src/components/TaskList.tsx

// Expected behavior:
// 1. Component mounts
// 2. useEffect triggers API call to GET /api/tasks
// 3. Response updates React Context
// 4. UI renders tasks from Context
```

**Validation Steps**:
1. Open browser DevTools Network tab
2. Navigate to tasks page
3. Verify GET /api/tasks called on mount
4. Check React DevTools for Context state update
5. Confirm UI displays correct tasks

**Validation Checklist**:
- [ ] API called exactly once on mount
- [ ] Context state updated with response data
- [ ] UI renders all tasks from Context
- [ ] Loading state handled correctly
- [ ] Error state handled correctly

#### Scenario B: Create Task Flow
```typescript
// Test: Create new task and sync state
// File: frontend/src/components/CreateTaskForm.tsx

// Expected behavior:
// 1. User submits form
// 2. POST /api/tasks called with form data
// 3. Backend creates task in database
// 4. Response returns created task with ID
// 5. Context state updated with new task
// 6. UI immediately shows new task (optimistic update)
```

**Validation Steps**:
1. Fill out create task form
2. Submit form
3. Verify POST /api/tasks in Network tab
4. Check database for new task record
5. Verify Context state includes new task
6. Confirm UI displays new task without page refresh

**Validation Checklist**:
- [ ] POST request includes all required fields
- [ ] Backend returns 201 Created with task object
- [ ] Task saved to database with correct user_id
- [ ] Context state updated immediately
- [ ] UI updates without page refresh
- [ ] Optimistic update handled correctly

#### Scenario C: Update Task Flow
```typescript
// Test: Update existing task and sync state
// File: frontend/src/components/TaskItem.tsx

// Expected behavior:
// 1. User edits task
// 2. PUT /api/tasks/:id called with updated data
// 3. Backend updates task in database
// 4. Response returns updated task
// 5. Context state updated with changes
// 6. UI reflects changes immediately
```

**Validation Steps**:
1. Edit an existing task
2. Save changes
3. Verify PUT /api/tasks/:id in Network tab
4. Check database for updated values
5. Verify Context state reflects changes
6. Confirm UI shows updated task

**Validation Checklist**:
- [ ] PUT request includes only changed fields
- [ ] Backend validates user owns the task
- [ ] Database record updated correctly
- [ ] Context state updated with new values
- [ ] UI reflects changes immediately
- [ ] Concurrent edits handled (last-write-wins)

#### Scenario D: Delete Task Flow
```typescript
// Test: Delete task and sync state
// File: frontend/src/components/TaskItem.tsx

// Expected behavior:
// 1. User clicks delete
// 2. DELETE /api/tasks/:id called
// 3. Backend deletes task from database
// 4. Response returns 204 No Content
// 5. Context state removes task
// 6. UI removes task from display
```

**Validation Steps**:
1. Click delete on a task
2. Verify DELETE /api/tasks/:id in Network tab
3. Check database (task should be gone)
4. Verify Context state no longer includes task
5. Confirm UI removes task from display

**Validation Checklist**:
- [ ] DELETE request sent to correct endpoint
- [ ] Backend validates user owns the task
- [ ] Database record deleted
- [ ] Context state removes task
- [ ] UI updates immediately
- [ ] No orphaned data in Context

### 4. Automated Detection of Race Conditions in State Updates

**Objective**: Identify and prevent race conditions in concurrent state updates.

**Test Scenarios**:

#### Scenario A: Concurrent Task Creation
```typescript
// Test: Multiple tasks created simultaneously
// Simulate rapid-fire task creation

// Expected behavior:
// - All tasks created successfully
// - No tasks lost or overwritten
// - Context state includes all tasks
// - Database contains all tasks
```

**Test Script**:
```bash
# Run concurrent creation test
cd frontend && npm run test:race-conditions

# Or manually with curl
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/tasks \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Task '$i'","description":"Test"}' &
done
wait
```

**Validation**:
- [ ] All 10 tasks created in database
- [ ] No duplicate tasks
- [ ] Context state includes all 10 tasks
- [ ] No tasks overwritten or lost
- [ ] UI displays all 10 tasks

#### Scenario B: Concurrent Task Updates
```typescript
// Test: Same task updated from multiple sources
// Simulate two users editing same task simultaneously

// Expected behavior:
// - Last write wins (as per spec)
// - No data corruption
// - Context state reflects final state
// - Database reflects final state
```

**Test Script**:
```bash
# Update same task twice concurrently
TASK_ID="123"
curl -X PUT http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Update 1"}' &

curl -X PUT http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Update 2"}' &
wait
```

**Validation**:
- [ ] One update succeeds (last write wins)
- [ ] No data corruption in database
- [ ] Context state reflects final state
- [ ] No partial updates or mixed data

#### Scenario C: Create and Delete Race Condition
```typescript
// Test: Task created and deleted rapidly
// Simulate user creating then immediately deleting

// Expected behavior:
// - Task created in database
// - Task deleted from database
// - Context state consistent (no orphaned task)
// - UI consistent (task not displayed)
```

**Test Script**:
```bash
# Create and immediately delete
RESPONSE=$(curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Quick Task","description":"Test"}')

TASK_ID=$(echo $RESPONSE | jq -r '.id')

curl -X DELETE http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Validation**:
- [ ] Task created successfully
- [ ] Task deleted successfully
- [ ] Context state does not include task
- [ ] Database does not contain task
- [ ] No orphaned references

### 5. End-to-End Response and Error Validation

**Objective**: Ensure all responses and errors follow consistent formats and standards.

**Success Response Validation**:

```bash
# Test successful task creation
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Description"}' \
  -w "\nStatus: %{http_code}\n"

# Expected response format:
# {
#   "id": 1,
#   "title": "Test Task",
#   "description": "Description",
#   "completed": false,
#   "user_id": 123,
#   "created_at": "2026-01-08T12:00:00Z",
#   "updated_at": "2026-01-08T12:00:00Z"
# }
```

**Validation Checklist**:
- [ ] Status code: 201 Created
- [ ] Content-Type: application/json
- [ ] Response includes all required fields
- [ ] Timestamps in ISO 8601 format
- [ ] IDs are integers
- [ ] Boolean fields are true/false (not 1/0)

**Error Response Validation (RFC 7807)**:

```bash
# Test validation error
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":""}' \
  -w "\nStatus: %{http_code}\n"

# Expected error format (RFC 7807):
# {
#   "type": "https://example.com/probs/validation-error",
#   "title": "Validation Error",
#   "status": 400,
#   "detail": "Title cannot be empty",
#   "instance": "/api/tasks"
# }
```

**Error Scenarios to Test**:

1. **400 Bad Request** - Invalid input
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"","description":"Test"}'
```

2. **401 Unauthorized** - Missing/invalid token
```bash
curl -X GET http://localhost:8000/api/tasks
```

3. **404 Not Found** - Resource doesn't exist
```bash
curl -X GET http://localhost:8000/api/tasks/99999 \
  -H "Authorization: Bearer $TOKEN"
```

4. **500 Internal Server Error** - Server error
```bash
# Simulate by causing database connection failure
# or other server-side error
```

**Validation Checklist**:
- [ ] All errors follow RFC 7807 format
- [ ] Status codes match error types
- [ ] Error messages are descriptive
- [ ] No sensitive information leaked in errors
- [ ] Frontend displays errors correctly
- [ ] Context state handles errors gracefully

## Complete End-to-End Test Flow

### Full User Journey Test

**Scenario**: Complete user workflow from registration to task management

```bash
#!/bin/bash
# File: .claude/skills/integration-testing-e2e/scenarios/full-user-journey.sh

set -e

echo "=== Starting Full E2E Test ==="

# 1. Register new user
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e@test.com","password":"Test123!","name":"E2E User"}')

echo "Registration response: $REGISTER_RESPONSE"

# 2. Login
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e@test.com","password":"Test123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token obtained: ${TOKEN:0:20}..."

# 3. Create tasks
echo "3. Creating tasks..."
for i in {1..3}; do
  TASK_RESPONSE=$(curl -s -X POST http://localhost:8000/api/tasks \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Task '$i'","description":"E2E Test Task '$i'"}')
  echo "Created task $i: $(echo $TASK_RESPONSE | jq -r '.id')"
done

# 4. List tasks
echo "4. Listing tasks..."
TASKS=$(curl -s -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN")
TASK_COUNT=$(echo $TASKS | jq '. | length')
echo "Found $TASK_COUNT tasks"

# 5. Update first task
echo "5. Updating task..."
FIRST_TASK_ID=$(echo $TASKS | jq -r '.[0].id')
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8000/api/tasks/$FIRST_TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"Updated description"}')
echo "Updated task: $(echo $UPDATE_RESPONSE | jq -r '.title')"

# 6. Complete task
echo "6. Completing task..."
COMPLETE_RESPONSE=$(curl -s -X PATCH http://localhost:8000/api/tasks/$FIRST_TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN")
echo "Task completed: $(echo $COMPLETE_RESPONSE | jq -r '.completed')"

# 7. Delete task
echo "7. Deleting task..."
DELETE_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE http://localhost:8000/api/tasks/$FIRST_TASK_ID \
  -H "Authorization: Bearer $TOKEN")
echo "Delete status: $DELETE_RESPONSE"

# 8. Verify deletion
echo "8. Verifying deletion..."
REMAINING_TASKS=$(curl -s -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN")
REMAINING_COUNT=$(echo $REMAINING_TASKS | jq '. | length')
echo "Remaining tasks: $REMAINING_COUNT"

# 9. Logout
echo "9. Logging out..."
LOGOUT_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN")
echo "Logout status: $LOGOUT_RESPONSE"

# 10. Verify token invalidated
echo "10. Verifying token invalidated..."
INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN")
echo "Request with invalidated token: $INVALID_RESPONSE"

echo "=== E2E Test Complete ==="
```

**Expected Results**:
- [ ] User registered successfully (201)
- [ ] User logged in successfully (200)
- [ ] 3 tasks created (201 each)
- [ ] Tasks listed correctly (200, count=3)
- [ ] Task updated successfully (200)
- [ ] Task completed successfully (200)
- [ ] Task deleted successfully (204)
- [ ] Remaining tasks count correct (2)
- [ ] Logout successful (200)
- [ ] Token invalidated (401 on subsequent request)

## Execution Instructions

### Manual Execution

1. **Start all services**:
```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Verify database
psql $DATABASE_URL
```

2. **Run test scenarios**:
```bash
# Run full user journey
bash .claude/skills/integration-testing-e2e/scenarios/full-user-journey.sh

# Run specific scenario
bash .claude/skills/integration-testing-e2e/scenarios/auth-flow-test.sh
```

3. **Validate results**:
- Check terminal output for errors
- Verify database state
- Check browser DevTools for frontend errors
- Review server logs for backend errors

### Automated Execution

```bash
# Run all integration tests
npm run test:e2e

# Or with pytest
pytest tests/integration/ -v --tb=short

# Run with coverage
pytest tests/integration/ --cov=src --cov-report=html
```

## Success Criteria

All tests pass when:
- [ ] All API endpoints respond correctly
- [ ] JWT authentication flow works end-to-end
- [ ] React Context stays synchronized with backend
- [ ] No race conditions detected
- [ ] All responses follow RFC 7807 format
- [ ] User isolation enforced (users only see their data)
- [ ] Error handling works correctly
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Database state consistent with UI state

## Troubleshooting

### Common Issues

**Issue**: Token not being sent in requests
- **Check**: Frontend stores token in localStorage
- **Check**: Authorization header format: `Bearer <token>`
- **Fix**: Verify token storage and retrieval logic

**Issue**: CORS errors in browser
- **Check**: FastAPI CORS middleware configured
- **Check**: Frontend origin allowed in backend
- **Fix**: Update CORS settings in `backend/src/main.py`

**Issue**: Context state not updating
- **Check**: API response includes updated data
- **Check**: Context update function called after API response
- **Fix**: Verify Context provider and update logic

**Issue**: Race conditions causing data loss
- **Check**: Concurrent requests completing out of order
- **Check**: Context updates overwriting each other
- **Fix**: Implement request queuing or optimistic locking

**Issue**: Database connection errors
- **Check**: Neon PostgreSQL connection string correct
- **Check**: Database accessible from backend
- **Fix**: Verify DATABASE_URL environment variable

## Integration with Development Workflow

### When to Run This Skill

1. **Before committing**: Run quick smoke tests
2. **Before PR creation**: Run full test suite
3. **After merging**: Run regression tests
4. **Before deployment**: Run complete E2E validation
5. **After production deployment**: Run smoke tests against production

### CI/CD Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.13'

      - name: Start services
        run: |
          docker-compose up -d
          npm run dev &
          cd backend && uvicorn src.main:app &

      - name: Run E2E tests
        run: |
          bash .claude/skills/integration-testing-e2e/scenarios/full-user-journey.sh

      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

## Reporting

### Test Report Format

```json
{
  "test_run_id": "e2e-2026-01-08-12-00-00",
  "timestamp": "2026-01-08T12:00:00Z",
  "duration_seconds": 45,
  "total_tests": 50,
  "passed": 48,
  "failed": 2,
  "skipped": 0,
  "results": [
    {
      "test_name": "test_user_registration",
      "status": "passed",
      "duration_ms": 234
    },
    {
      "test_name": "test_concurrent_task_creation",
      "status": "failed",
      "duration_ms": 1234,
      "error": "Race condition detected: task lost"
    }
  ]
}
```

## Maintenance

### Updating This Skill

When to update:
- New API endpoints added
- Authentication flow changes
- Database schema changes
- New frontend components added
- Error handling patterns change

### Version History

- **1.0.0** (2026-01-08): Initial version with full-stack E2E testing

## Related Skills

- `fastapi-security-validator`: Backend security validation
- `auth-security-guardian`: Authentication security checks
- `nextjs-frontend-optimizer`: Frontend optimization
- `fullstack-integration-validator`: Cross-layer integration validation

## References

- API Contract: `specs/001-task-management-app/contracts/api-contract.md`
- Specification: `specs/001-task-management-app/spec.md`
- Implementation Plan: `specs/001-task-management-app/plan.md`
- RFC 7807: https://tools.ietf.org/html/rfc7807
