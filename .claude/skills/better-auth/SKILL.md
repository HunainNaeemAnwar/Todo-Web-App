# Better Auth JWT Integration Skill

## Purpose
This skill implements the proper integration between Better Auth (frontend) and FastAPI (backend) using JWT tokens for secure, stateless authentication with user isolation.

## Background
Better Auth is a JavaScript/TypeScript authentication library that runs on Next.js frontend. However, FastAPI backend is a separate Python service that needs to verify which user is making API requests. The solution is to use JWT tokens that can be verified by both services using a shared secret.

## How It Works

### Authentication Flow
1. User logs in on Frontend → Better Auth creates a session and issues a JWT token
2. Frontend makes API call → Includes the JWT token in the Authorization: Bearer <token> header
3. Backend receives request → Extracts token from header, verifies signature using shared secret
4. Backend identifies user → Decodes token to get user ID, email, etc., and matches it with the user ID in the URL
5. Backend filters data → Returns only tasks belonging to that user

### Components That Need Configuration

| Component | Changes Required | Location |
|-----------|------------------|----------|
| Better Auth Config | Enable JWT plugin to issue tokens with user_id claim | frontend/src/lib/better-auth-client.ts |
| Frontend API Client | Attach JWT token to every API request header | frontend/src/services/api.ts |
| FastAPI Backend | Add middleware to verify JWT and extract user | backend/src/middleware/auth_middleware.py |
| API Routes | Filter all queries by the authenticated user's ID | backend/src/api/task_router.py, backend/src/services/task_service.py |

## Shared Secret Configuration
Both frontend (Better Auth) and backend (FastAPI) must use the same secret key for JWT signing and verification via the `BETTER_AUTH_SECRET` environment variable.

## Security Benefits
- **User Isolation**: Each user only sees their own tasks
- **Stateless Auth**: Backend doesn't need to call frontend to verify users
- **Token Expiry**: JWTs expire automatically (e.g., after 7 days)
- **No Shared DB Session**: Frontend and backend can verify auth independently

## API Behavior Changes
- After Auth, all endpoints require a valid JWT token
- Requests without a token receive 401 Unauthorized
- Each user only sees/modifies their own tasks
- Task ownership is enforced on every operation

## Implementation Steps

### Step 1: Configure Better Auth with JWT Plugin
1. Update Better Auth configuration to enable JWT plugin
2. Ensure JWT tokens include user_id claim
3. Configure token expiration times (24 hours for access, 7 days for refresh)

### Step 2: Update Frontend API Client
1. Modify API client to retrieve JWT token from Better Auth
2. Attach token to Authorization header for all API requests
3. Handle token refresh when expired

### Step 3: Add JWT Verification Middleware
1. Create FastAPI middleware to extract JWT from Authorization header
2. Verify JWT signature using shared BETTER_AUTH_SECRET
3. Decode user_id from token and add to request context

### Step 4: Update API Routes for User Filtering
1. Modify all routes to extract user_id from verified JWT
2. Filter database queries by user_id
3. Ensure no cross-user data access is possible

## Environment Variables Required
- `BETTER_AUTH_SECRET`: Shared secret for JWT signing/verification
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Frontend URL for Better Auth
- `DATABASE_URL`: Neon Serverless PostgreSQL connection string

## Error Handling
- Invalid JWT tokens return 401 Unauthorized
- Expired tokens return 401 Unauthorized
- User attempting to access other user's data returns 404 Not Found
- Missing authentication header returns 401 Unauthorized

## Testing
- Test JWT token issuance and verification
- Test user isolation (can't access other users' data)
- Test authentication flow end-to-end
- Test error scenarios (expired tokens, invalid tokens)

## Files Modified
- frontend/src/lib/better-auth-client.ts
- frontend/src/services/api.ts
- backend/src/middleware/auth_middleware.py
- backend/src/api/auth_router.py
- backend/src/api/task_router.py
- backend/src/services/auth_service.py
- backend/src/services/task_service.py