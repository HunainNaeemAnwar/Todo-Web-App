# Quickstart: Phase 3 AI-Powered Conversational Todo

## Overview

This guide covers setting up and running the Phase 3 conversational todo feature. The feature adds an AI-powered chat interface using OpenAI ChatKit that uses natural language to manage tasks via MCP tools.

## Prerequisites

- Python 3.13+
- PostgreSQL database (Neon)
- OpenAI API key
- Better Auth JWT configured (Phase 2)
- Node.js 18+ (for frontend)

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
pip install mcp openai-agents chatkit
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install @openai/chatkit-react
```

### 3. Environment Variables

Create or update `.env` in `backend/`:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
BETTER_AUTH_SECRET=your-jwt-secret

# Optional - defaults shown
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8000
CHATKIT_DOMAIN_KEY=local-dev
```

Create or update `.env.local` in `frontend/`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=local-dev
```

### 4. Database Migration

Run the migration to add conversation and message tables:

```bash
cd backend
alembic upgrade head
```

## Running the Servers

### Backend Server

```bash
cd backend
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend ChatKit Page

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000/chat` to see the ChatKit interface.

## ChatKit Endpoint

### POST /chatkit

The main ChatKit endpoint for streaming conversations:

```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Add buy groceries"}]
  }'
```

Response is streamed via Server-Sent Events.

### Legacy REST Endpoints (Still Available)

```bash
# Get conversations
curl http://localhost:8000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get conversation messages
curl http://localhost:8000/api/chat/conversations/{id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing the Chat

### Using ChatKit UI

1. Navigate to `http://localhost:3000/chat`
2. The ChatKit interface will load
3. Try: "Add buy groceries"
4. Try: "Show me my tasks"
5. Try: "What's pending?"

### Using REST API

```bash
# Start a new conversation
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy groceries"}'
```

## Natural Language Examples

| User Input | Expected Action |
|------------|-----------------|
| "Add buy milk and eggs" | Creates task "Buy milk and eggs" |
| "Show me all my tasks" | Lists all tasks |
| "What's pending?" | Lists pending tasks |
| "Mark task 1 as complete" | Completes first task |
| "Delete the groceries task" | Deletes task by name |
| "Change task 1 to buy milk" | Updates task title |

## Error Handling

### Unauthorized (401)

```json
{
  "detail": "Invalid or missing authentication token"
}
```

### Task Not Found (400)

```json
{
  "response": "I couldn't find task #999 in your list. You have 3 tasks total."
}
```

### Invalid Input (400)

```json
{
  "response": "I didn't understand that. Did you want to add, list, or update tasks?"
}
```

## Verifying MCP Tools

### Direct MCP Tool Test

```bash
# Test MCP server directly (if running separately)
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

Returns available tools:

```json
{
  "tools": [
    {"name": "add_task", "description": "Add a new task..."},
    {"name": "list_tasks", "description": "List user's tasks..."},
    {"name": "complete_task", "description": "Mark task as complete..."},
    {"name": "delete_task", "description": "Delete a task..."},
    {"name": "update_task", "description": "Update a task..."}
  ]
}
```

## Troubleshooting

### ChatKit Not Loading

- Verify frontend is running on port 3000
- Check browser console for API errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct

### Conversation Not Found

If you receive an error about conversation not found:
- Verify the `conversation_id` is valid for your user
- Each user can only access their own conversations

### Slow Responses

If responses take longer than 4 seconds:
- Check OpenAI API latency
- Verify database query performance
- Check network connectivity

### Authentication Failures

If JWT validation fails:
- Verify token is not expired
- Check `BETTER_AUTH_SECRET` matches the signing secret
