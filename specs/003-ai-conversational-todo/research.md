# Research: Phase 3 AI-Powered Conversational Todo

## R1: Official MCP SDK Integration with FastAPI

**Question**: How to integrate Official MCP SDK server with existing FastAPI application for MCP tool exposure?

### Findings

The Official MCP SDK provides a high-level API for creating MCP servers with the `Server` class. Key integration patterns:

1. **Streamable HTTP Transport**: Official MCP SDK uses `streamable-http` transport for HTTP-based communication, ideal for web deployments.

2. **Stateless Mode**: For Phase 3, use `stateless_http=True` to ensure no in-memory state between requests.

3. **JSON Responses**: Set `json_response=True` for structured, parseable outputs.

4. **Mounting in FastAPI**: Use Starlette's `Mount` to integrate with existing FastAPI app.

### Code Pattern

```python
from mcp import Server
from starlette.applications import Starlette
from starlette.routing import Mount
import contextlib

mcp = Server("TaskManager", stateless_http=True, json_response=True)

@mcp.tool()
def add_task(title: str, description: str = "") -> str:
    """Add a new task"""
    return json.dumps({"task_id": "...", "status": "created"})

@contextlib.asynccontextmanager
async def lifespan(app: Starlette):
    async with contextlib.AsyncExitStack() as stack:
        await stack.enter_async_context(mcp.session_manager.run())
        yield

app = Starlette(routes=[Mount("/mcp", mcp.streamable_http_app())], lifespan=lifespan)
```

### Decision

Mount Official MCP SDK server at `/mcp` path in FastAPI. Use stateless HTTP mode with JSON responses.

---

## R2: OpenAI Agents SDK + MCP Client Integration

**Question**: How to integrate OpenAI Agents SDK with MCP server for tool calling?

### Findings

1. **OpenAI Agents SDK**: Uses `@function_tool` decorator for defining tools.

2. **MCP Client**: Uses `streamablehttp_client` to connect to MCP servers.

3. **Integration Pattern**: Create a wrapper that translates MCP tool calls to OpenAI function tools.

### Code Pattern

```python
from openai import agents
from mcp.client.streams import streamablehttp_client

async def get_mcp_tools():
    async with streamablehttp_client("http://localhost:8000/mcp") as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            return [convert_to_agent_tool(t) for t in tools.tools]

@agents.function_tool
def add_task(title: str, description: str = "") -> str:
    """Add a new task to your todo list"""
    # Calls MCP tool via client
    result = await mcp_client.call("add_task", title=title, description=description)
    return result
```

### Decision

Create `MCPToolClient` class that:
- Maintains MCP client session
- Exposes task operations as `@function_tool` decorated functions
- Handles serialization/deserialization

---

## R3: Conversation Model Design

**Question**: How to design Conversation and Message models for efficient history loading?

### Findings

1. **SQLModel Relationships**: Use `Relationship` field for foreign key navigation.

2. **Indexing**: Critical for performance on user_id + created_at queries.

3. **User Isolation**: Store user_id on both Conversation and Message for query efficiency.

### Model Pattern

```python
from sqlmodel import SQLModel, Field, Relationship

class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: list["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    conversation_id: str = Field(foreign_key="conversations.id", index=True)
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    conversation: Conversation = Relationship(back_populates="messages")
```

### Decision

Create Conversation and Message models with:
- UUID primary keys
- Indexed foreign keys (user_id, conversation_id, created_at)
- User isolation via user_id on both tables

---

## R4: Chat Endpoint Design

**Question**: What should the chat endpoint request/response format be?

### Findings

1. **Stateless Design**: Load conversation history on every request from database.

2. **Request Format**: Simple structure with optional conversation_id and required message.

3. **Response Format**: Return conversation_id (for continuity), response text, and tool calls made.

4. **Authentication**: Use existing `CurrentUser` dependency for JWT extraction.

### API Contract

```python
class ChatRequest(SQLModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=10000)

class ChatResponse(SQLModel):
    conversation_id: str
    response: str
    tool_calls: list[str]
```

### Decision

Implement endpoint as specified in spec with JWT auth via `CurrentUser`.

---

## R5: OpenAI ChatKit Integration (2026-01-22)

**Question**: How to integrate OpenAI ChatKit with the backend chat endpoint?

### Findings

1. **ChatKit is OpenAI's official React chat component**:
   - Package: `@openai/chatkit-react` for React
   - Backend package: `chatkit` Python SDK
   - Uses `useChatKit` hook for initialization
   - `<ChatKit>` component for rendering

2. **Backend Endpoint Pattern**:
   - Single POST endpoint at `/chatkit`
   - Returns streaming responses via Server-Sent Events (`text/event-stream`)
   - Uses `StreamingResult` for event streaming
   - Raw payload processed by ChatKit server

3. **Frontend Integration**:
   ```typescript
   import { ChatKit, useChatKit } from '@openai/chatkit-react';

   const { control } = useChatKit({
     api: {
       url: process.env.NEXT_PUBLIC_API_BASE_URL + '/chatkit',
       domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
     },
     startScreen: {
       greeting: 'Hi! I can help you manage your tasks.',
       prompts: ['Add buy groceries', 'Show me my tasks'],
     },
     onClientTool: async (invocation) => {
       // Handle client-side tool calls
       return { success: true };
     },
   });

   return <ChatKit control={control} className="h-[600px] w-full" />;
   ```

4. **Response Format**:
   - Streaming: `text/event-stream` with event data
   - Event: `{ "event": "thread.message.item.created", "data": {...} }`

### Backend Implementation Pattern

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from chatkit.server import StreamingResult

@app.post("/chatkit")
async def chatkit_endpoint(request: Request) -> Response:
    payload = await request.body()
    result = await chatkit_server.process(payload, {"request": request})
    
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return JSONResponse(content=result.json)
    return JSONResponse(content=result)
```

### Decision

- Create POST `/chatkit` endpoint with streaming responses
- Use `chatkit` Python SDK for server-side processing
- Frontend uses `@openai/chatkit-react` with `useChatKit` hook
- Configure with custom instructions for task management

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Official MCP SDK Integration | Mount at `/mcp` in FastAPI | Leverages existing infrastructure |
| MCP Transport | Streamable HTTP, stateless, JSON | Scalable, Phase 3 compliant |
| OpenAI Integration | MCPToolClient wrapper | Clean separation of concerns |
| Conversation Models | SQLModel with indexed FKs | Efficient queries, user isolation |
| Chat Endpoint | POST /api/chat, JWT auth | Simple, secure, stateless |
| ChatKit Integration | POST /chatkit with streaming | Official OpenAI chat component |
