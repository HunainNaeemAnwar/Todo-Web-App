# Implementation Plan: AI-Powered Conversational Todo Interface

**Branch**: `003-ai-conversational-todo` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-ai-conversational-todo/spec.md`

## Summary

Build an AI-powered conversational todo interface using OpenAI Agents SDK for natural language understanding and Official MCP SDK for exposing task management tools. The system provides:
- **POST /chatkit**: Streaming endpoint for OpenAI ChatKit with SSE responses
- **POST /api/chat**: Legacy REST endpoint (also available)
- **MCP Tools**: 5 task management tools exposed via Official MCP SDK
- **User Isolation**: user_id extracted from JWT, enforced on all operations
- **Persistence**: Conversation history stored in Neon PostgreSQL
- **Frontend**: OpenAI ChatKit React component for chat interface

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI 0.115+, OpenAI Agents SDK (latest), MCP Python SDK (Official MCP SDK), SQLModel, Pydantic v2, OpenAI ChatKit (React)
**Storage**: Neon Serverless PostgreSQL (existing database at `src/database/database.py`)
**Testing**: pytest (existing test infrastructure at `backend/tests/`)
**Target Platform**: Linux server (FastAPI deployment)
**Frontend**: Next.js 16+ with OpenAI ChatKit React component
**Performance Goals**: <4s response time for 90% of requests (SC-003), stateless scaling
**Constraints**: Must not break existing Phase 1/2 codebase, user_id from JWT only, stateless server, conversation persistence required
**Scale/Scope**: Single user conversations, ~100-1000 tasks per user, MCP tools only for task operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase III Core Principles Compliance

| Principle | Requirement | Implementation | Status |
|-----------|-------------|----------------|--------|
| I. Stateless Server | No in-memory conversation state | Chat endpoint loads history from DB on every request | ✅ PASS |
| II. Persistent History | Conversation + Message tables | Use existing DB infrastructure | ✅ PASS |
| III. Auth & User Isolation | JWT auth, user_id from token | Use existing `CurrentUser` dependency | ✅ PASS |
| IV. AI via OpenAI + MCP | OpenAI Agents SDK + MCP tools | New MCP server, OpenAI SDK integration | ✅ PASS |
| V. MCP Tool Security | Idempotent, structured JSON, logged | Tool implementations follow pattern | ✅ PASS |
| VI. Chat Experience | Friendly responses, graceful errors | Agent instructions define behavior | ✅ PASS |

### Phase-Specific Constraints Compliance

| Constraint | Implementation | Status |
|------------|----------------|--------|
| Frontend: OpenAI ChatKit only | Use ChatKit React component, no custom chat UI | ✅ PASS |
| Domain allowlist configured | Production deployment requirement | ✅ PASS |
| Logging: tool calls + responses | FR-019 implementation | ✅ PASS |
| Forbidden: no direct DB in agent | MCP tools call TaskService | ✅ PASS |
| Forbidden: no in-memory state | Stateless design | ✅ PASS |

### Gates (Must Pass)

- [x] JWT authentication implemented and working (Phase 2)
- [x] TaskService provides all required operations (Phase 2)
- [x] Database models support user_id filtering (Phase 2)
- [x] No existing code modification required for core functionality

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-conversational-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── chat-endpoint.yaml
│   └── mcp-tools.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── chat_router.py      # NEW: Chat endpoint POST /api/chat
│   │   └── main.py             # MODIFY: Mount chat router, MCP server
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py           # NEW: Official MCP SDK server with task tools
│   │   └── tools.py            # NEW: MCP tool implementations
│   ├── services/
│   │   ├── conversation_service.py  # NEW: Conversation/messages CRUD
│   │   └── task_service.py          # EXISTING: Reuse
│   ├── models/
│   │   ├── conversation.py     # NEW: Conversation model
│   │   ├── message.py          # NEW: Message model
│   │   ├── task.py             # EXISTING: Reuse
│   │   └── user.py             # EXISTING: Reuse
│   └── database/
│       └── database.py         # MODIFY: Add conversation/message tables
├── tests/
│   ├── integration/
│   │   └── test_chat.py        # NEW: Chat endpoint tests
│   ├── contract/
│   │   └── test_mcp_tools.py   # NEW: MCP tool tests
│   └── unit/
│       └── test_conversation.py # NEW: Conversation service tests

frontend/
├── src/
│   ├── app/
│   │   └── chat/
│   │       └── page.tsx        # NEW: ChatKit integration page
│   ├── services/
│   │   └── chat.ts             # NEW: Chat API service for ChatKit
│   └── types/
│       └── chat.ts             # NEW: Chat TypeScript types
```

**Structure Decision**: 
- MCP server at `backend/src/mcp/` (new directory)
- Chat router at `backend/src/api/chat_router.py` (new file)
- Conversation models at `backend/src/models/` (new files)
- Conversation service at `backend/src/services/conversation_service.py` (new file)
- ChatKit page at `frontend/src/app/chat/page.tsx`
- All modifications isolated to Phase 3 scope
- Existing Phase 1/2 code remains unchanged

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All requirements satisfied with existing patterns | N/A |

---

# Phase 0: Research & Unknowns Resolution

## Research Tasks

### R1: Official MCP SDK Integration with FastAPI

**Question**: How to integrate Official MCP SDK server with existing FastAPI application for MCP tool exposure?

**Research Findings**:
- Official MCP SDK supports `streamable_http` transport for HTTP-based MCP servers
- Can mount Official MCP SDK as a sub-application in FastAPI using `Mount`
- Must use `lifespan` context manager for session management
- Stateless mode (`stateless_http=True`) recommended for Phase 3
- JSON response format (`json_response=True`) for structured outputs

**Decision**: Mount Official MCP SDK server at `/mcp` path in FastAPI using Starlette Mount pattern. Use stateless HTTP mode with JSON responses.

### R2: OpenAI Agents SDK + MCP Client Integration

**Question**: How to integrate OpenAI Agents SDK with MCP server for tool calling?

**Research Findings**:
- OpenAI Agents SDK supports function tools via `@function_tool` decorator
- MCP client connects to MCP server using `streamablehttp_client`
- Agent receives tool definitions from MCP server and can invoke them
- Need to handle tool call responses and convert to agent-friendly format

**Decision**: Create a helper class `MCPToolClient` that:
- Connects to local MCP server via HTTP
- Exposes task operations as function tools for OpenAI Agents SDK
- Handles tool call serialization/deserialization

### R3: Conversation Model Design

**Question**: How to design Conversation and Message models for efficient history loading?

**Research Findings**:
- SQLModel supports relationships via `Relationship` field
- Conversation has many Messages (one-to-many)
- Need indexed foreign keys for performance
- User isolation via user_id on both Conversation and Message

**Decision**: Create models with:
- Conversation: user_id, id (PK), created_at, updated_at
- Message: user_id, id (PK), conversation_id (FK), role, content, created_at
- Indexes on user_id + created_at for efficient querying

### R4: Chat Endpoint Design

**Question**: What should the chat endpoint request/response format be?

**Research Findings**:
- Stateless design: load history per request
- Request: `{ conversation_id?: string, message: string }`
- Response: `{ conversation_id: string, response: string, messages: [...] }`
- Need to handle new conversation creation

**Decision**: Design as specified in spec with JWT auth via `CurrentUser` dependency.

### R5: OpenAI ChatKit Integration

**Question**: How to integrate OpenAI ChatKit with the backend chat endpoint?

**Research Findings**:
- ChatKit is an OpenAI React component for building AI-powered chat interfaces
- Frontend uses `@openai/chatkit-react` package with `useChatKit` hook and `ChatKit` component
- Backend provides a single POST endpoint at `/chatkit` that processes all requests
- Endpoint supports streaming responses via Server-Sent Events (text/event-stream)
- ChatKit sends messages in format: `{ role: 'user' | 'assistant', content: string }`
- Tools can be defined and passed to ChatKit for agent tool calling
- Client tools can be triggered via `onClientTool` callback

**Decision**:
- Create POST `/chatkit` endpoint for ChatKit communication
- Use streaming responses for real-time updates
- Store conversation history in PostgreSQL for persistence
- Load history on each request to maintain context
- Configure ChatKit with custom instructions for task management
- Use `onClientTool` callback for client-side tool execution

### ChatKit Frontend Integration

```typescript
// frontend/src/app/chat/page.tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatPage() {
  const { control } = useChatKit({
    api: {
      url: process.env.NEXT_PUBLIC_API_BASE_URL + '/chatkit',
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
    },
    startScreen: {
      greeting: 'Hi! I can help you manage your tasks. Try saying "Add buy groceries" or "Show me my tasks".',
      prompts: ['Add buy groceries', 'Show me my tasks', 'What do I have pending?'],
    },
    onClientTool: async (invocation) => {
      // Handle client-side tool calls if needed
      return { success: true };
    },
    onError: ({ error }) => {
      console.error('ChatKit error:', error);
    },
  });

  return <ChatKit control={control} className="h-[600px] w-full" />;
}
```

### ChatKit Backend Endpoint

```python
# backend/src/api/chatkit_router.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from chatkit.server import StreamingResult

@app.post("/chatkit")
async def chatkit_endpoint(request: Request) -> Response:
    """Handle all ChatKit requests with streaming responses"""
    payload = await request.body()
    result = await chatkit_server.process(payload, {"request": request})
    
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return JSONResponse(content=result.json)
    return JSONResponse(content=result)
```

**Status**: Resolved - ChatKit integration documented above

## Research Output

All unknowns resolved. See findings above.

---

# Phase 1: Design & Contracts

## Data Model

### New Models

#### Conversation

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | str | PK, UUID | Unique conversation identifier |
| user_id | str | FK → users.id, indexed | Owner of conversation |
| created_at | datetime | default=now(), indexed | Creation timestamp |
| updated_at | datetime | default=now() | Last activity timestamp |

#### Message

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | str | PK, UUID | Unique message identifier |
| user_id | str | FK → users.id, indexed | Owner of message |
| conversation_id | str | FK → conversations.id, indexed | Parent conversation |
| role | str | "user" or "assistant" | Message author role |
| content | str | max_length=10000 | Message text |
| created_at | datetime | default=now(), indexed | Message timestamp |

### Relationships

- User 1→N Conversations
- Conversation 1→N Messages
- Message belongs to User (for query isolation)

### Modifications to Existing Models

No modifications to existing Task, User models required.

## API Contracts

### Chat Endpoint

```
POST /api/chat
Auth: Bearer JWT (via CurrentUser dependency)
Content-Type: application/json

Request Body:
{
  "conversation_id": "integer (optional)",
  "message": "string (required)"
}

Success Response (200):
{
  "conversation_id": "integer",
  "response": "string",
  "tool_calls": "array"
}

Error Responses:
- 401: Unauthorized (invalid/missing JWT)
- 400: Bad Request (invalid input)
- 500: Internal Server Error
```

### ChatKit API Endpoint

```
POST /chatkit
Auth: Bearer JWT (via Authorization header)
Content-Type: application/json or text/event-stream

Request Body (raw payload processed by ChatKit server):
- messages: List of chat messages in ChatKit format
- tools: Optional list of available tools for agent

Request Example:
{
  "messages": [
    {"role": "user", "content": "Add buy groceries"}
  ],
  "tools": [
    {"name": "add_task", "description": "Add a new task", "parameters": {...}}
  ]
}

Response:
- Streaming response (text/event-stream) for real-time updates
- Event format: { "event": "thread.message.item.created", "data": {...} }
```

### Additional Conversation API Endpoints (for history management)

```
GET /api/chat/conversations
Auth: Bearer JWT
Response:
[
  {"id": "string", "created_at": "string", "updated_at": "string"}
]

GET /api/chat/conversations/{conversation_id}
Auth: Bearer JWT
Response:
{
  "messages": [
    {"id": "string", "role": "user|assistant", "content": "string", "created_at": "string"}
  ]
}
```

### MCP Tools Contract

Official MCP SDK server exposes 5 tools via MCP JSON Schema format:

**Tool: add_task**
- Purpose: Create a new task
- Parameters: title (string, required), description (string, optional)
- Returns: task_id, status, title
- Example: {"title": "Buy groceries", "description": "Milk, eggs, bread"} → {"task_id": 5, "status": "created", "title": "Buy groceries"}

**Tool: list_tasks**
- Purpose: Retrieve tasks from the list
- Parameters: status (string, optional: "all", "pending", "completed")
- Returns: Array of task objects
- Example: {"status": "pending"} → [{"id": 1, "title": "Buy groceries", "completed": false}, ...]

**Tool: complete_task**
- Purpose: Mark a task as complete
- Parameters: task_id (integer, required)
- Returns: task_id, status, title
- Example: {"task_id": 3} → {"task_id": 3, "status": "completed", "title": "Call mom"}

**Tool: delete_task**
- Purpose: Remove a task from the list
- Parameters: task_id (integer, required)
- Returns: task_id, status, title
- Example: {"task_id": 2} → {"task_id": 2, "status": "deleted", "title": "Old task"}

**Tool: update_task**
- Purpose: Modify task title or description
- Parameters: task_id (integer, required), title (string, optional), description (string, optional)
- Returns: task_id, status, title
- Example: {"task_id": 1, "title": "Buy groceries and fruits"} → {"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"}

Key Notes:
- user_id extracted from JWT context (not as parameter)
- task_id is UUID internally, 1-based index in user interface
- All tools use stateless HTTP transport with JSON responses


## Frontend Integration (OpenAI ChatKit)

### ChatKit Page

```typescript
// frontend/src/app/chat/page.tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatPage() {
  const { control } = useChatKit({
    api: {
      url: process.env.NEXT_PUBLIC_API_BASE_URL + '/chatkit',
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
    },
    theme: {
      colorScheme: 'light',
      radius: 'round',
      color: {
        accent: { primary: '#8B5CF6', level: 2 },
      },
    },
    header: {
      enabled: true,
      title: 'Task Manager',
    },
    history: {
      enabled: true,
      showDelete: true,
    },
    startScreen: {
      greeting: 'Hi! I can help you manage your tasks. Try saying "Add buy groceries" or "Show me my tasks".',
      prompts: ['Add buy groceries', 'Show me my tasks', 'What do I have pending?'],
    },
    composer: {
      placeholder: 'Ask me to manage your tasks...',
    },
    onClientTool: async (invocation) => {
      // Handle client-side tool calls if needed
      console.log('Client tool invoked:', invocation);
      return { success: true };
    },
    onError: ({ error }) => {
      console.error('ChatKit error:', error);
    },
  });

  return <ChatKit control={control} className="h-[600px] w-full" />;
}
```

### Chat Service (for conversation history API)

```
frontend/src/services/chat.ts
- getConversations(): Fetch list of conversations
- getConversationMessages(id): Fetch messages for a conversation
- JWT authentication handled via Better Auth context
```

## Quickstart Guide

### Prerequisites

- Python 3.13+
- PostgreSQL database (Neon)
- OpenAI API key
- Better Auth JWT configured
- Node.js 18+ for frontend
- OpenAI ChatKit React component

### Installation

```bash
# Backend
cd backend
pip install mcp openai agents chatkit

# Frontend
cd frontend
npm install @openai/chatkit-react
```

### Environment Variables

```bash
# Backend (Required)
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...

# Frontend (Required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Running the Server

```bash
# Backend
cd backend
uvicorn src.api.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Testing the Chat Endpoint

```bash
# With JWT token
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy groceries"}'
```

### Expected Response

```json
{
  "conversation_id": "uuid-here",
  "response": "Added task: Buy groceries",
  "messages": [...]
}
```

### Testing ChatKit

1. Navigate to http://localhost:3000/chat
2. ChatKit interface should load
3. Type "Add buy groceries"
4. Task should be created and response displayed

---

## Re-Check Constitution Post-Design

All principles continue to be satisfied. No violations detected.

**Constitution Check: PASS**

---

*Plan completed. Next step: `/sp.tasks` to generate implementation tasks.*
