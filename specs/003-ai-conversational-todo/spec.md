# Feature Specification: AI-Powered Conversational Todo Interface

**Feature Branch**: `003-ai-conversational-todo`
**Created**: 2026-01-22
**Status**: Draft
**Input**: User description: "create specs for phase 3 ai-powered conversational todo interface with mcp server"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Task Management (Priority: P1)

As a user, I want to manage my todo list using natural language messages so that I can quickly add, view, complete, delete, and update tasks without navigating a complex UI.

**Why this priority**: This is the core value proposition of the feature. Without natural language task management, there is no reason for this feature to exist.

**Independent Test**: Can be fully tested by sending a natural language message like "Add buy groceries" and verifying the task appears in the user's task list with the correct title.

**Acceptance Scenarios**:

1. **Given** a user has an authenticated session, **When** they send "Add buy groceries", **Then** a new task with title "Buy groceries" is created in their task list.

2. **Given** a user has tasks in their list, **When** they ask "Show me all my tasks", **Then** the system returns all their tasks with titles, completion status, and details.

3. **Given** a user has multiple tasks, **When** they say "Mark task 3 as complete", **Then** task #3 is marked as completed and the system confirms the action.

4. **Given** a user wants to modify a task, **When** they say "Change task 1 to Call mom tonight", **Then** task #1's title is updated and the system confirms the change.

---

### User Story 2 - Conversation Continuity (Priority: P1)

As a returning user, I want my conversation history to be preserved so that I can resume my chat session after server restarts or closing the browser.

**Why this priority**: Conversation continuity is essential for a meaningful chat experience. Without it, users lose context and must repeat themselves.

**Independent Test**: Can be fully tested by creating a conversation with multiple messages, restarting the server, sending a new message with the same conversation_id, and verifying the full history is loaded and the assistant acknowledges previous context.

**Acceptance Scenarios**:

1. **Given** a user has an active conversation with multiple messages, **When** the server restarts, **Then** sending a new message with the same conversation_id loads all previous messages and the assistant maintains context.

2. **Given** a user sends multiple messages in a conversation, **When** they ask a follow-up question referencing earlier context, **Then** the assistant understands the reference based on loaded conversation history.

3. **Given** a user has multiple conversations, **When** they provide a conversation_id, **Then** only that conversation's history is loaded, not other conversations.

---

### User Story 3 - Conversational Error Handling (Priority: P2)

As a user, I want to receive friendly, helpful error messages when something goes wrong so that I understand what happened and how to fix it.

**Why this priority**: Good error handling prevents user frustration and abandoned conversations. Poor error handling creates negative user experience.

**Independent Test**: Can be fully tested by sending invalid requests (non-existent task IDs, unauthorized actions) and verifying the assistant responds with friendly, actionable messages rather than technical errors.

**Acceptance Scenarios**:

1. **Given** a user asks to complete a non-existent task, **When** they say "Mark task 999 as complete", **Then** the assistant responds "I couldn't find task #999 in your list. You have [N] tasks total."

2. **Given** a user attempts an action without proper authentication, **When** the JWT token is missing or invalid, **Then** the request is rejected with appropriate error and no conversation data is exposed.

3. **Given** a user sends an unclear message, **When** the assistant cannot determine the intent, **Then** the assistant asks a clarifying question like "Did you want to add, list, or update tasks?"

---

### User Story 4 - Multi-Turn Task Operations (Priority: P2)

As a user, I want to chain multiple related tasks in a single conversation turn so that I can efficiently manage several items at once.

**Why this priority**: Users often want to accomplish multiple related tasks quickly. Chaining operations improves efficiency and user satisfaction.

**Independent Test**: Can be fully tested by sending a message like "Add buy milk and eggs, then show me my pending tasks" and verifying both operations complete successfully.

**Acceptance Scenarios**:

1. **Given** a user wants to add multiple tasks, **When** they say "Add buy milk, add call mom, add finish report", **Then** all three tasks are created and the assistant confirms each.

2. **Given** a user wants to delete multiple completed tasks, **When** they say "Delete all completed tasks", **Then** all completed tasks are deleted and the count is reported.

3. **Given** a user wants to check status and act, **When** they say "What do I have pending? Mark the first one done", **Then** the list is shown and the specified task is completed.

---

## Technology Stack

Component | Technology
----------|-----------
Frontend | OpenAI ChatKit
Backend | Python FastAPI
AI Framework | OpenAI Agents SDK
MCP Server | Official MCP SDK
ORM | SQLModel
Database | Neon Serverless PostgreSQL
Authentication | Better Auth

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a stateless chat endpoint that accepts natural language messages and returns AI-generated responses.

- **FR-002**: System MUST authenticate all chat requests using Better Auth JWT tokens and extract user_id from the token.

- **FR-003**: System MUST persist all conversation history to Neon PostgreSQL using Conversation and Message tables.

- **FR-004**: System MUST load complete conversation history from the database on every request to maintain multi-turn context.

- **FR-005**: System MUST expose task management tools via Model Context Protocol (MCP) server using Official MCP SDK.

- **FR-006**: System MUST provide MCP tool: `add_task(title, description)` that creates a task for the authenticated user.

- **FR-007**: System MUST provide MCP tool: `list_tasks(status)` that returns tasks filtered by status ("all", "pending", "completed").

- **FR-008**: System MUST provide MCP tool: `complete_task(task_id)` that marks a task as completed.

- **FR-009**: System MUST provide MCP tool: `delete_task(task_id)` that removes a task.

- **FR-010**: System MUST provide MCP tool: `update_task(task_id, title, description)` that modifies an existing task.

- **FR-011**: System MUST extract user_id from JWT context inside MCP tools, NOT accept user_id as a parameter from the agent.

- **FR-012**: System MUST enforce user isolation - every MCP tool query MUST filter by user_id from JWT, preventing cross-user access.

- **FR-013**: System MUST return friendly, confirmatory responses including action feedback (e.g., "Added task: Buy groceries").

- **FR-014**: System MUST return graceful error messages for "task not found", "unauthorized", and "invalid input" scenarios.

- **FR-015**: System MUST support resuming conversations after server restart using persisted history.

- **FR-016**: System MUST respond within 4 seconds including tool execution time.

- **FR-017**: System MUST NOT make duplicate tool calls in a single turn unless explicitly necessary.

- **FR-018**: System MUST NOT expose raw errors or system internals to users.

- **FR-019**: System MUST log all MCP tool calls and responses for debugging purposes.

### Frontend Requirements (OpenAI ChatKit)

- **FR-020**: Frontend MUST use OpenAI ChatKit component for the chat interface.

- **FR-021**: Frontend MUST provide API endpoints for ChatKit to communicate with:
  - `POST /api/chat` - Send message, receive response
  - `GET /api/chat/conversations` - List user's conversations
  - `GET /api/chat/conversations/{id}` - Get conversation messages

- **FR-022**: Backend MUST format responses compatible with ChatKit's expected message format.

- **FR-023**: Chat history MUST be stored in PostgreSQL and loaded for ChatKit display.

- **FR-024**: ChatKit MUST be configured with custom instructions for task management behavior.

### Key Entities

- **Task**: Represents a todo item owned by a user. Attributes: user_id (FK), id (PK), title, description, completed, created_at, updated_at.

- **Conversation**: Represents a chat session owned by a user. Attributes: user_id (FK), id (PK), created_at, updated_at.

- **Message**: Represents a single message within a conversation. Attributes: user_id (FK), id (PK), conversation_id (FK), role ("user" or "assistant"), content, created_at.

### Assumptions

- Frontend uses OpenAI ChatKit component for chat UI (no custom chat UI).
- Domain allowlist is configured in OpenAI platform before production deployment.
- OpenAI Agents SDK handles AI logic and tool invocation.
- Task IDs mentioned by users refer to the ordinal position in their task list (1-based index).
- Natural language understanding handles common phrasings: "add/create/remember" for tasks, "show/list/display" for viewing, "mark done/complete/finish" for completion, "delete/remove/cancel" for deletion, "change/update/rename" for editing.

## Success Criteria *(mandurable)*

### Measurable Outcomes

- **SC-001**: Users can successfully complete a todo management task (add, list, complete, delete, update) through natural language on first attempt with 95% success rate.

- **SC-002**: Conversation history is preserved and accessible after server restart - users can resume conversations without losing context.

- **SC-003**: 90% of chat responses are returned within 4 seconds including tool execution.

- **SC-004**: Zero cross-user data access incidents - all tool queries are properly isolated by authenticated user_id.

- **SC-005**: Users receive friendly, actionable feedback for 100% of actions and errors (no raw technical errors exposed).

- **SC-006**: Conversation continuity is maintained across turns - assistant acknowledges previous context when relevant.

- **SC-007**: OpenAI ChatKit renders correctly and displays conversation history.

- **SC-008**: Chat messages persist to database and reload correctly in ChatKit.

### Out of Scope

- Custom chat UI components (ChatKit only).
- Voice or multimedia messages (text only).
- Task sharing or collaboration between users.
- Rich task metadata beyond title, description, and completion status.
- Integration with external calendars or third-party services.

## Database Models

Model | Fields | Description
------|--------|------------
Task | user_id, id, title, description, completed, created_at, updated_at | Todo items
Conversation | user_id, id, created_at, updated_at | Chat session
Message | user_id, id, conversation_id, role (user/assistant), content, created_at | Chat history

## Chat API Endpoint

Method | Endpoint | Description
-------|----------|-------------
POST | /api/chat | Send message & get AI response

### Request

Field | Type | Required | Description
------|------|----------|-------------
conversation_id | integer | No | Existing conversation ID (creates new if not provided)
message | string | Yes | User's natural language message

### Response

Field | Type | Description
------|------|-------------
conversation_id | integer | The conversation ID
response | string | AI assistant's response
tool_calls | array | List of MCP tools invoked

## MCP Tools Specification

The MCP server must expose the following tools for the AI agent:

### Tool: add_task
**Purpose**: Create a new task  
**Parameters**: title (string, required), description (string, optional)  
**Returns**: task_id, status, title  
**Example Input**: {"title": "Buy groceries", "description": "Milk, eggs, bread"}  
**Example Output**: {"task_id": 5, "status": "created", "title": "Buy groceries"}

### Tool: list_tasks
**Purpose**: Retrieve tasks from the list  
**Parameters**: status (string, optional: "all", "pending", "completed")  
**Returns**: Array of task objects  
**Example Input**: {"status": "pending"}  
**Example Output**: [{"id": 1, "title": "Buy groceries", "completed": false}, ...]

### Tool: complete_task
**Purpose**: Mark a task as complete  
**Parameters**: task_id (integer, required)  
**Returns**: task_id, status, title  
**Example Input**: {"task_id": 3}  
**Example Output**: {"task_id": 3, "status": "completed", "title": "Call mom"}

### Tool: delete_task
**Purpose**: Remove a task from the list  
**Parameters**: task_id (integer, required)  
**Returns**: task_id, status, title  
**Example Input**: {"task_id": 2}  
**Example Output**: {"task_id": 2, "status": "deleted", "title": "Old task"}

### Tool: update_task
**Purpose**: Modify task title or description  
**Parameters**: task_id (integer, required), title (string, optional), description (string, optional)  
**Returns**: task_id, status, title  
**Example Input**: {"task_id": 1, "title": "Buy groceries and fruits"}  
**Example Output**: {"task_id": 1, "status": "updated", "title": "Buy groceries and fruits"}

## Agent Behavior Specification

Behavior | Description
---------|-------------
Task Creation | When user mentions adding/creating/remembering something, use add_task
Task Listing | When user asks to see/show/list tasks, use list_tasks with appropriate filter
Task Completion | When user says done/complete/finished, use complete_task
Task Deletion | When user says delete/remove/cancel, use delete_task
Task Update | When user says change/update/rename, use update_task
Confirmation | Always confirm actions with friendly response
Error Handling | Gracefully handle task not found and other errors

## Conversation Flow (Stateless Request Cycle)

1. Receive user message
2. Fetch conversation history from database
3. Build message array for agent (history + new message)
4. Store user message in database
5. Run agent with MCP tools
6. Agent invokes appropriate MCP tool(s)
7. Store assistant response in database
8. Return response to client
9. Server holds NO state (ready for next request)

## Natural Language Commands

The chatbot should understand and respond to:

User Says | Agent Should
----------|-------------
"Add a task to buy groceries" | Call add_task with title "Buy groceries"
"Show me all my tasks" | Call list_tasks with status "all"
"What's pending?" | Call list_tasks with status "pending"
"Mark task 3 as complete" | Call complete_task with task_id 3
"Delete the meeting task" | Call list_tasks first, then delete_task
"Change task 1 to 'Call mom tonight'" | Call update_task with new title
"I need to remember to pay bills" | Call add_task with title "Pay bills"
"What have I completed?" | Call list_tasks with status "completed"

## Deliverables

GitHub repository with:
- /frontend – ChatKit-based UI
- /backend – FastAPI + Agents SDK + MCP
- /specs – Specification files for agent and MCP tools
- Database migration scripts
- README with setup instructions

Working chatbot that can:
- Manage tasks through natural language via MCP tools
- Maintain conversation context via database (stateless server)
- Provide helpful responses with action confirmations
- Handle errors gracefully
- Resume conversations after server restart

## OpenAI ChatKit Setup & Deployment

### Domain Allowlist Configuration (Required for Hosted ChatKit)

Before deploying your chatbot frontend, you must configure OpenAI's domain allowlist for security:

1. Deploy your frontend first to get a production URL:
   - Vercel: `https://your-app.vercel.app`
   - GitHub Pages: `https://username.github.io/repo-name`
   - Custom domain: `https://yourdomain.com`

2. Add your domain to OpenAI's allowlist:
   - Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
   - Click "Add domain"
   - Enter your frontend URL (without trailing slash)
   - Save changes

3. Get your ChatKit domain key:
   - After adding the domain, OpenAI will provide a domain key
   - Pass this key to your ChatKit configuration

**Environment Variables**
```
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here
```

Note: The hosted ChatKit option only works after adding the correct domains under Security → Domain Allowlist. Local development (`localhost`) typically works without this configuration.

## Key Architecture Benefits

Aspect | Benefit
-------|--------
MCP Tools | Standardized interface for AI to interact with your app
Single Endpoint | Simpler API — AI handles routing to tools
Stateless Server | Scalable, resilient, horizontally scalable
Tool Composition | Agent can chain multiple tools in one turn

## Key Stateless Architecture Benefits

- **Scalability**: Any server instance can handle any request
- **Resilience**: Server restarts don't lose conversation state
- **Horizontal scaling**: Load balancer can route to any backend
- **Testability**: Each request is independent and reproducible
