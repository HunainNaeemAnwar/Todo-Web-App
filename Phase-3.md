# Phase 3: AI Conversational Todo Manager

**Status**: ✅ Complete
**Created**: 2026-01-14
**Updated**: 2026-02-09

## Overview

An AI-powered conversational interface for task management, enabling users to create, update, and query tasks using natural language. Powered by OpenAI Agents SDK with Google Gemini integration and Model Context Protocol (MCP) tools.

## Features Implemented

### Natural Language Processing
- ✅ Create tasks via conversation ("Add a task to buy groceries")
- ✅ Update tasks ("Mark task 1 as complete")
- ✅ Delete tasks ("Delete the grocery task")
- ✅ Query tasks ("Show me my high priority tasks")
- ✅ Filter understanding ("What's due today?")
- ✅ Context retention across conversation

### Intelligent Task Assignment
- ✅ Auto-categorization based on task content
- ✅ Priority detection from description
- ✅ Due date parsing ("due on Friday")
- ✅ Smart task suggestions

### AI Agent Integration
- ✅ OpenAI Agents SDK implementation
- ✅ Google Gemini model integration
- ✅ Function calling / tool use
- ✅ Conversation history management

### MCP (Model Context Protocol) Tools
- ✅ `add_task` - Create tasks
- ✅ `list_tasks` - Query tasks with filters
- ✅ `get_task` - Get specific task
- ✅ `update_task` - Update task properties
- ✅ `delete_task` - Delete tasks
- ✅ `complete_task` - Toggle completion

## Technology Stack

### AI & NLP
| Layer | Technology |
|-------|------------|
| Agent Framework | OpenAI Agents SDK |
| Language Model | Google Gemini 2.0 Flash |
| Function Calling | JSON Schema tools |
| MCP Server | FastMCP |

### Chat Interface
| Layer | Technology |
|-------|------------|
| Chat UI | OpenAI ChatKit |
| Streaming | Server-Sent Events (SSE) |
| Session | Conversation persistence |

## Architecture

```
Frontend                              Backend
┌─────────────────┐                  ┌─────────────────┐
│  ChatKit UI     │◄── SSE ─────────►│  ChatKit Router │
│  (React)        │    Streaming     │  (FastAPI)      │
└────────┬────────┘                  └────────┬────────┘
         │                                   │
         │ HTTP                              │
         ▼                                   │
┌─────────────────┐                  ┌─────────────────┐
│  Next.js API    │◄── JSON ────────►│  Agents SDK     │
│  /api/chatkit   │                  │  (with Gemini)  │
└─────────────────┘                  └────────┬────────┘
                                              │
                                              ▼
                                       ┌─────────────────┐
                                       │  MCP Tools      │
                                       │  add_task       │
                                       │  list_tasks     │
                                       │  update_task    │
                                       │  delete_task    │
                                       │  complete_task  │
                                       └─────────────────┘
```

## MCP Tools Specification

### add_task
```json
{
  "name": "add_task",
  "description": "Create a new task for the user",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "Task title" },
      "description": { "type": "string", "description": "Task description" },
      "priority": { "type": "string", "enum": ["high", "medium", "low"] },
      "category": { "type": "string", "enum": ["work", "personal", "study", "health", "finance"] },
      "due_date": { "type": "string", "description": "ISO date string" }
    },
    "required": ["title"]
  }
}
```

### list_tasks
```json
{
  "name": "list_tasks",
  "description": "List tasks with optional filtering",
  "parameters": {
    "type": "object",
    "properties": {
      "status": {
        "type": "string",
        "enum": ["all", "active", "completed", "pending", "overdue"]
      },
      "priority": { "type": "string" },
      "category": { "type": "string" },
      "due_date": { "type": "string" }
    }
  }
}
```

### update_task
```json
{
  "name": "update_task",
  "description": "Update an existing task",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": { "type": "string" },
      "title": { "type": "string" },
      "description": { "type": "string" },
      "priority": { "type": "string" },
      "category": { "type": "string" },
      "due_date": { "type": "string" }
    },
    "required": ["task_id"]
  }
}
```

### delete_task
```json
{
  "name": "delete_task",
  "description": "Delete a task",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": { "type": "string" }
    },
    "required": ["task_id"]
  }
}
```

### complete_task
```json
{
  "name": "complete_task",
  "description": "Mark a task as complete or incomplete",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": { "type": "string" },
      "completed": { "type": "boolean" }
    },
    "required": ["task_id", "completed"]
  }
}
```

## Natural Language Examples

### Task Creation
- "Add a task to buy groceries"
- "Create a high priority work task to review code"
- "Add a health task for dentist appointment on Feb 15"
- "I need to call mom this weekend"

### Task Querying
- "Show me my high priority tasks"
- "What's due today?"
- "List all work tasks"
- "Show overdue tasks"
- "What tasks are due this week?"

### Task Management
- "Mark task 1 as complete"
- "Delete the grocery task"
- "Update task 2 priority to high"
- "Unmark task 3 as done"

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── chatkit_router.py    # ChatKit SSE endpoint
│   ├── mcp/
│   │   ├── server.py            # MCP server setup
│   │   └── tools/
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── get_task.py
│   │       ├── update_task.py
│   │       ├── delete_task.py
│   │       └── complete_task.py
│   └── services/
│       └── conversation.py      # Conversation history

frontend/
├── src/
│   ├── app/
│   │   └── chat/
│   │       └── page.tsx         # Chat interface
│   ├── components/
│   │   └── chat/
│   │       ├── ChatContainer.tsx
│   │       ├── ChatWrapper.tsx
│   │       └── ChatModal.tsx
│   └── lib/
│       └── chatkit-config.ts    # ChatKit client config
│
└── specs/
    └── 003-ai-conversational-todo/
```

## Getting Started

### Prerequisites
- Phase 2 completed (database, auth, task CRUD)
- Gemini API key
- ChatKit credentials

### Environment Variables

```bash
# Backend
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Frontend
NEXT_PUBLIC_CHATKIT_API_URL=/api/chatkit
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=your-domain-key
```

### Running the AI Chat

```bash
# Start backend (MCP tools auto-loaded)
cd backend
uvicorn src.api.main:app --reload

# Start frontend
cd frontend
npm run dev

# Open http://localhost:3000/chat
```

## AI Agent Configuration

```python
# backend/src/mcp/server.py
from agents import Agent, Runner
from agents.models import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

# Configure Gemini via OpenAI-compatible endpoint
model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# Agent with MCP tools
agent = Agent(
    name="Task Manager",
    instructions="You are a helpful task management assistant...",
    model=model,
    tools=[add_task, list_tasks, update_task, delete_task, complete_task]
)
```

## ChatKit Integration

### Frontend (ChatKit React)
```tsx
import { ChatKit } from '@openai/chatkit-react'

<ChatKit
  domainKey={NEXT_PUBLIC_CHATKIT_DOMAIN_KEY}
  apiUrl={NEXT_PUBLIC_CHATKIT_API_URL}
/>
```

### Backend (ChatKit Router)
```python
# FastAPI endpoint for ChatKit session
@router.post("/chatkit/session")
async def create_chatkit_session(request: Request):
    # Create session with user context
    # Return domain_key and client_secret
```

## Conversation Context

The AI maintains conversation context:
- **Task context**: User's current tasks
- **History**: Previous messages in session
- **Preferences**: Past behavior patterns

### Context Injection
```python
async def get_user_context(user_id: str) -> str:
    tasks = await task_service.get_user_tasks(user_id, "active")
    stats = await user_service.get_stats(user_id)

    return f"""
    User: {user_id}
    Stats: {stats.total_tasks} total, {stats.completed_tasks} completed
    Active Tasks: {len(tasks)}
    Recent: {tasks[:3]}
    """
```

## Security

1. **Authentication**
   - All chat requests require valid JWT
   - User context isolated to authenticated user
   - Token extracted from cookies/headers

2. **Tool Permissions**
   - Tools only operate on authenticated user's data
   - No cross-user task access
   - Input validation on all tool parameters

3. **Prompt Injection Protection**
   - System prompts sandboxed
   - Output sanitization
   - Rate limiting on chat requests

## Performance

- **Streaming Responses**: SSE for real-time AI output
- **Context Window**: Efficient history management
- **Caching**: Frequently used queries cached
- **Async Operations**: Non-blocking tool calls

## Testing

```bash
# Test MCP tools
pytest tests/unit/test_mcp_server.py -v

# Test chat integration
pytest tests/integration/test_chat.py -v

# Test contract compliance
pytest tests/contract/test_mcp_tools.py -v
```

## Natural Language Support

### Supported Commands

| Category | Examples |
|----------|----------|
| Creation | "Add task", "Create task", "I need to..." |
| Querying | "Show", "List", "What's", "What are" |
| Update | "Change", "Update", "Modify", "Edit" |
| Completion | "Complete", "Finish", "Mark done" |
| Deletion | "Delete", "Remove", "Cancel" |
| Filtering | "Due today", "High priority", "Overdue" |

### Intent Recognition

The AI agent understands:
- **Direct commands**: Explicit task instructions
- **Implicit requests**: "I should..." → Create task
- **Questions**: "Can you..." → Query or explain
- **Conversational**: "Help me..." → Assist

## Analytics & Insights

The AI provides:
- **Productivity tips** based on completion patterns
- **Task suggestions** based on history
- **Time management** recommendations
- **Goal tracking** and reminders

## Deployment Considerations

1. **Model Availability**
   - Gemini free tier supported
   - Fallback to OpenAI if quota exhausted

2. **Cost Management**
   - Token usage tracking
   - Rate limiting per user
   - Caching to reduce API calls

3. **Latency**
   - Streaming for perceived speed
   - Prefetching common queries
   - Connection pooling

## Lessons Learned

1. **Tool Definition**: Clear JSON schemas essential for AI
2. **Context Management**: Balance context length vs. relevance
3. **Error Handling**: AI needs graceful fallbacks
4. **Prompt Engineering**: System prompts determine behavior
5. **Streaming UX**: Real-time updates improve experience

## Future Enhancements

- [ ] Voice input support
- [ ] Multi-language understanding
- [ ] Smart reminders
- [ ] Task suggestions
- [ ] Integration with calendars

## References

- [MCP Specification](https://modelcontextprotocol.io)
- [OpenAI Agents SDK](https://github.com/openai/agents-sdk)
- [Google Gemini](https://ai.google.dev/docs/gemini_api)
- [ChatKit Documentation](https://chatkit.io/docs)
- [Phase 2: Web App](Phase-2.md)

---

**Previous Phase**: [Phase 2 - Task Management Web App](Phase-2.md)
