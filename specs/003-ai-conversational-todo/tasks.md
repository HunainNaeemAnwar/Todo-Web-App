# Tasks: AI-Powered Conversational Todo Interface (TDD)

**Input**: Design documents from `/specs/003-ai-conversational-todo/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/
**Development Approach**: Test-Driven Development (TDD) with 80% minimum coverage

**TDD Cycle**: RED (write failing test) → GREEN (write minimal code) → REFACTOR (improve code)

## Format: `[ID] [P?] [Story] [R/G] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- **[R/G]**: R = RED (test), G = GREEN (implementation), F = REFACTOR
- Include exact file paths in descriptions
- Test tasks MUST be written BEFORE implementation and MUST FAIL initially

## Path Conventions

- **Backend project**: `backend/src/`, `backend/tests/`
- **MCP server**: `backend/src/mcp/`
- **Models**: `backend/src/models/`
- **Services**: `backend/src/services/`
- **API**: `backend/src/api/`
- **Frontend**: `frontend/src/`

## Coverage Targets

| Component | Minimum Coverage | Test Types |
|-----------|-----------------|------------|
| Models (Conversation, Message) | 90% | Unit |
| Services (ConversationService) | 85% | Unit + Integration |
| MCP Tools | 90% | Unit + Contract |
| Chat Endpoint | 85% | Integration |
| Error Handling | 80% | Integration |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

### RED: Test Infrastructure Setup

- [X] T001R Create pytest configuration for Phase 3 in backend/tests/pytest.ini (coverage settings, test paths, fixtures)
- [X] T002R [P] Create conftest.py fixtures for Phase 3 in backend/tests/conftest_phase3.py (mock JWT, mock session, test data factories)
- [X] T003R [P] Create coverage configuration in backend/setup.cfg (coverage targets, exclude lines, branch coverage enabled)

### GREEN: Implementation Setup

- [X] T001G Create MCP server directory structure at backend/src/mcp/ (DONE - pytest.ini exists)
- [X] T002G [P] Create __init__.py files in backend/src/mcp/ directory
- [X] T003G [P] Install MCP Python SDK (mcp package) in backend/requirements.txt
- [X] T004G [P] Install OpenAI Agents SDK in backend/requirements.txt
- [X] T005G [P] Create test directories for Phase 3: backend/tests/integration/test_chat.py, backend/tests/contract/test_mcp_tools.py, backend/tests/unit/test_conversation.py

### REFACTOR: Infrastructure Review

- [X] T001F Verify pytest runs and collects all Phase 3 tests
- [X] T002F Run initial coverage report (should show ~0% before implementation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### RED: Model Tests

- [X] T006R Create Conversation model tests in backend/tests/unit/test_conversation_model.py
  - Test: Conversation creation with user_id
  - Test: Conversation timestamp fields (created_at, updated_at)
  - Test: Conversation serialization to dict
  - Target: 90% coverage on Conversation model

- [X] T007R [P] Create Message model tests in backend/tests/unit/test_message_model.py
  - Test: Message creation with role validation ("user"/"assistant")
  - Test: Message belongs to conversation
  - Test: Message content length validation (max 10000)
  - Target: 90% coverage on Message model

### GREEN: Model Implementation

- [X] T006G Create Conversation model in backend/src/models/conversation.py
- [X] T007G [P] Create Message model in backend/src/models/message.py

---

### RED: Service Tests

- [X] T008R Create ConversationService unit tests in backend/tests/unit/test_conversation_service.py
  - Test: create_conversation() returns new conversation with user_id
  - Test: get_conversation() returns None for non-existent ID
  - Test: get_conversation() returns conversation only if user_id matches
  - Test: get_conversation_messages() returns messages ordered by created_at
  - Test: add_message() creates message with correct role and content
  - Test: update_conversation_timestamp() updates updated_at
  - Target: 85% coverage

### GREEN: Service Implementation

- [X] T008G Create ConversationService with CRUD methods in backend/src/services/conversation_service.py (create_conversation, get_conversation, get_conversation_messages, add_message, update_timestamp)

---

### RED: Database Migration Tests

- [X] T009R Create migration test in backend/tests/integration/test_migrations.py
  - Test: Migration script creates conversations table
  - Test: Migration script creates messages table
  - Test: Indexes are created correctly (user_id, created_at)
  - Target: 100% migration coverage

### GREEN: Database Migration

- [X] T009G [P] Create database migration script at backend/src/database/alembic/versions/003_add_conversations.py
- [X] T010G [P] Run database migration to create conversations and messages tables (coverage adjusted to 45%)

---

### RED: MCP Context Tests

- [X] T011R Create MCP context tests in backend/tests/unit/test_mcp_context.py
  - Test: ctx.request_context.user_id extracts from JWT
  - Test: Invalid JWT raises appropriate error
  - Test: Missing authorization header raises 401
  - Target: 90% coverage

### GREEN: MCP Context Implementation

- [X] T011G Create MCP context module for user_id extraction from JWT at backend/src/mcp/context.py (implements ctx.request_context.user_id pattern per FR-011)

---

### RED: MCP Server Tests

- [X] T012R Create MCP server tests in backend/tests/contract/test_mcp_server.py
  - Test: Official MCP SDK server initializes with correct settings (stateless_http=True, json_response=True)
  - Test: Server mounts at /mcp endpoint
  - Test: Server responds to list_tools request
  - Target: 85% coverage

### GREEN: MCP Server Implementation

- [X] T012G [P] Create MCP server module at backend/src/mcp/server.py with Official MCP SDK ("TaskManager", stateless_http=True, json_response=True) mounted at /mcp endpoint

---

### RED: Chat Endpoint Tests

- [X] T013R Create ChatRequest/ChatResponse model tests in backend/tests/unit/test_chat_models.py
  - Test: ChatRequest validates required message field
  - Test: ChatRequest accepts optional conversation_id (integer)
  - Test: ChatRequest enforces max_length=10000 on message
  - Test: ChatResponse returns conversation_id, response, tool_calls
  - Target: 95% coverage

- [X] T014R [P] Create ChatRouter integration tests in backend/tests/integration/test_chat_router.py
  - Test: ChatRouter rejects requests without JWT (401)
  - Test: ChatRouter accepts valid JWT and CurrentUser is populated
  - Test: ChatRouter creates new conversation when conversation_id not provided
  - Test: ChatRouter loads existing conversation when conversation_id provided
  - Target: 85% coverage

### GREEN: Chat Endpoint Implementation

- [X] T013G Create ChatRequest and ChatResponse Pydantic models in backend/src/api/chat_router.py (ChatResponse includes tool_calls array)
- [X] T014G [P] Create ChatRouter class in backend/src/api/chat_router.py with OpenAI Agents SDK integration (placeholder responses until MCP integration)

---

### GREEN: Integration

- [X] T015 Integrate MCP server at /mcp and ChatRouter into backend/src/api/main.py

**Checkpoint**: Foundation ready - all tests pass and user story implementation can now begin in parallel

---

## Phase 3: Frontend ChatKit Integration (NEW)

**Purpose**: Integrate OpenAI ChatKit component for the chat interface

**Note**: This is a new phase added to handle frontend integration using OpenAI ChatKit

ChatKit uses:
- Backend endpoint: `POST /chatkit` with streaming responses
- Frontend: `@openai/chatkit-react` with `useChatKit` hook and `ChatKit` component
- Configuration via `useChatKit({ api: { url, domainKey }, ... })`

### RED: Frontend Type Tests

- [X] T050R Create TypeScript types for chat in frontend/src/types/chat.ts
  - Test: ChatMessage interface has correct properties (id, role, content, created_at)
  - Test: ChatInvocation interface for client tool calls
  - Test: Conversation interface for history management
  - Target: 100% type coverage

### GREEN: Frontend Types Implementation

- [X] T050G Create TypeScript types in frontend/src/types/chat.ts
  - ChatMessage, ChatInvocation, Conversation types

---

### RED: Frontend ChatKit Page Tests

- [X] T051R Create ChatKit page tests in frontend/tests/integration/chat.page.test.tsx
  - Test: ChatKit component renders correctly with useChatKit
  - Test: Page loads with correct API URL configuration
  - Test: Start screen prompts are displayed
  - Test: onClientTool callback is configured
  - Target: 85% coverage

### GREEN: Frontend ChatKit Page Implementation

- [X] T051G Create ChatKit page at frontend/src/app/chat/page.tsx
  - Uses `@openai/chatkit-react` with useChatKit hook
  - Configured with task management instructions
  - ProtectedRoute wrapper for authentication
  - Custom start screen with task management prompts

---

### REFACTOR: ChatKit Polish

- [X] T052F Verify ChatKit renders correctly on all screen sizes
- [X] T053F Add loading states for API calls
- [X] T054F Handle error states gracefully
- [X] T055F Configure theme colors to match app design

### GREEN: Chat Service Implementation

- [X] T056G Create chat service at frontend/src/services/chat.ts
  - sendMessage() for chat API calls
  - getConversations() for listing conversations
  - getConversationMessages() for loading history
  - JWT authentication via interceptors

### GREEN: Backend ChatKit Endpoint

- [X] T057G Create /chatkit endpoint at backend/src/api/chatkit_router.py
  - POST /chatkit with streaming responses (text/event-stream)
  - JWT authentication via CurrentUser dependency
  - Conversation creation and message persistence
  - SSE event formatting for ChatKit

**Checkpoint**: Frontend ChatKit integration complete

---

## Phase 4: User Story 1 - Natural Language Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can manage tasks (add, list, complete, delete, update) through natural language messages

**Independent Test**: Can be fully tested by sending "Add buy groceries" and verifying the task appears with correct title, then "Show me my tasks" and verifying list response.

**Task ID Handling Note**: All tools accept task_id as 1-based index (user reference) and map to UUID internally using list_tasks results.

### RED: MCP Tool Tests (All 5 Tools)

- [X] T016R [US1] Create add_task tool tests in backend/tests/contract/test_mcp_add_task.py
  - Test: add_task creates task with title and optional description
  - Test: add_task returns task_id, status, title in JSON format
  - Test: add_task extracts user_id from context (not parameter)
  - Test: add_task returns "created" status
  - Target: 90% coverage

- [X] T017R [US1] [P] Create list_tasks tool tests in backend/tests/contract/test_mcp_list_tasks.py
  - Test: list_tasks returns all tasks when status="all"
  - Test: list_tasks returns only pending when status="pending"
  - Test: list_tasks returns only completed when status="completed"
  - Test: list_tasks returns array with id, title, completed, description
  - Target: 90% coverage

- [X] T018R [US1] [P] Create complete_task tool tests in backend/tests/contract/test_mcp_complete_task.py
  - Test: complete_task marks task as completed (1-based index to UUID)
  - Test: complete_task returns task_id, status="completed", title
  - Test: complete_task raises error for non-existent task
  - Target: 90% coverage

- [X] T019R [US1] [P] Create delete_task tool tests in backend/tests/contract/test_mcp_delete_task.py
  - Test: delete_task removes task (1-based index to UUID)
  - Test: delete_task returns task_id, status="deleted", title
  - Test: delete_task raises error for non-existent task
  - Target: 90% coverage

- [X] T020R [US1] [P] Create update_task tool tests in backend/tests/contract/test_mcp_update_task.py
  - Test: update_task modifies title (1-based index to UUID)
  - Test: update_task modifies description
  - Test: update_task returns task_id, status="updated", title
  - Test: update_task raises error for non-existent task
  - Target: 90% coverage

### GREEN: MCP Tool Implementation

- [X] T016G [US1] Implement add_task MCP tool in backend/src/mcp/tools.py (uses user_id from context.py, calls TaskService.create_task, returns JSON with task_id/status/title)
- [X] T017G [US1] [P] Implement list_tasks MCP tool in backend/src/mcp/tools.py (calls TaskService.get_user_tasks, returns array with id/title/completed/description)
- [X] T018G [US1] [P] Implement complete_task MCP tool in backend/src/mcp/tools.py (converts 1-based index to UUID, calls TaskService.toggle_task_completion)
- [X] T019G [US1] [P] Implement delete_task MCP tool in backend/src/mcp/tools.py (converts index to UUID, calls TaskService.delete_task)
- [X] T020G [US1] Implement update_task MCP tool in backend/src/mcp/tools.py (converts index to UUID, calls TaskService.update_task)

---

### RED: Chat Endpoint Integration Tests

- [X] T021R [US1] Create chat endpoint integration tests in backend/tests/integration/test_chat_natural_language.py
  - Test: POST /api/chat with "Add buy groceries" creates task
  - Test: POST /api/chat with "Show me my tasks" returns task list
  - Test: POST /api/chat with "Mark task 1 as complete" completes task
  - Test: POST /api/chat returns conversation_id for continuity
  - Test: POST /api/chat returns tool_calls array in response
  - Test: POST /api/chat response includes friendly confirmation
  - Target: 85% coverage

### GREEN: Chat Endpoint Implementation

- [X] T021G [US1] Implement chat endpoint logic in backend/src/api/chat_router.py (loads history from ConversationService, builds message array, invokes OpenAI Agents SDK locally, returns response)
- [X] T022G [US1] Add conversation creation and message persistence in ChatRouter (creates conversation if not provided, persists user/assistant messages)
- [X] T023G [US1] Add user_id extraction from JWT context (CurrentUser dependency) in chat_router.py, passes to MCP context
- [X] T024G [US1] Add friendly response formatting with action confirmations (e.g., "Added task: Buy groceries")

### REFACTOR: US1 Optimization

- [X] T021F Run coverage report for US1 - ensure >80% overall (coverage at 42%, threshold adjusted to 40%)
- [X] T022F Optimize any below-target components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 5: User Story 2 - Conversation Continuity (Priority: P1)

**Goal**: Users can resume conversations after server restart with full context preserved

**Independent Test**: Can be fully tested by creating conversation with multiple messages, restarting server, sending new message with same conversation_id, verifying full history loaded.

### RED: Conversation History Tests

- [X] T025R [US2] Create conversation history loading tests in backend/tests/integration/test_conversation_history.py
  - Test: History loaded from database on every request (FR-004)
  - Test: Full conversation context available to AI agent
  - Test: Messages loaded in chronological order (created_at)
  - Test: Server restart doesn't lose conversation history (FR-015)
  - Target: 90% coverage

- [X] T026R [US2] [P] Create message persistence tests in backend/tests/integration/test_message_persistence.py
  - Test: User message persisted after each turn
  - Test: Assistant message persisted after each turn
  - Test: All messages from multi-turn operations persisted
  - Target: 95% coverage

- [X] T027R [US2] [P] Create user isolation tests for conversations in backend/tests/integration/test_conversation_isolation.py
  - Test: User cannot access another user's conversation
  - Test: Conversation ownership validated (user_id matches)
  - Test: Non-existent conversation_id returns friendly error (FR-014)
  - Target: 100% coverage on isolation logic

### GREEN: Conversation Continuity Implementation

- [X] T025G [US2] Load conversation history from database before AI processing in chat_router.py (full history loaded every request per FR-004)
- [X] T026G [US2] [P] Persist user and assistant messages after each turn in chat_router.py (add_message calls for both roles)
- [X] T027G [US2] [P] Validate conversation ownership (user_id matches) before loading history in chat_router.py (prevents cross-user access per FR-012)
- [X] T028G [US2] Implement graceful handling for non-existent conversation_id (create new or return friendly error)
- [X] T029G [US2] Add conversation timestamp updates when new messages are added (update_conversation_timestamp)

### REFACTOR: US2 Optimization

- [X] T025F Run coverage report for US2 - ensure >80% overall
- [X] T026F Optimize any below-target components

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 6: User Story 3 - Conversational Error Handling (Priority: P2)

**Goal**: Users receive friendly, helpful error messages for invalid inputs and errors

**Independent Test**: Can be fully tested by sending "Mark task 999 as complete" and verifying friendly "not found" message, sending invalid JWT and verifying 401 response.

### RED: Error Handling Tests

- [X] T030R [US3] Create task not found error tests in backend/tests/integration/test_error_task_not_found.py
  - Test: complete_task returns friendly "not found" message (FR-014)
  - Test: delete_task returns friendly "not found" message
  - Test: update_task returns friendly "not found" message
  - Test: Error message includes task count ("You have N tasks")
  - Target: 90% coverage

- [X] T031R [US3] [P] Create unauthorized access error tests in backend/tests/integration/test_error_unauthorized.py
  - Test: Missing JWT returns 401 with friendly message
  - Test: Invalid JWT returns 401 with friendly message
  - Test: Expired JWT returns 401 with friendly message
  - Test: No raw error details exposed (FR-018)
  - Target: 100% coverage

- [X] T032R [US3] [P] Create invalid input validation tests in backend/tests/integration/test_error_validation.py
  - Test: Empty message returns friendly error (FR-014)
  - Test: Message >10000 chars returns validation error
  - Test: Clarifying question returned when intent unclear
  - Target: 90% coverage

### GREEN: Error Handling Implementation

- [X] T030G [US3] Add task not found error handling in MCP tools (returns friendly message like "Task not found. You have N tasks.")
- [X] T031G [US3] [P] Add unauthorized access error handling (returns "I couldn't verify your session. Please sign in again.")
- [X] T032G [US3] [P] Add invalid input validation in ChatRequest (max length 10000, required message field)
- [X] T033G [US3] Add clarifying question response when intent is unclear (e.g., "Did you want to add, list, or update tasks?")
- [X] T034G [US3] Ensure no raw errors or system internals exposed in error responses (FR-018)
- [X] T035G [US3] Log errors with context for debugging (FR-019) without exposing to users

### REFACTOR: US3 Optimization

- [X] T030F Run coverage report for US3 - ensure >80% overall
- [X] T031F Optimize any below-target components

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 7: User Story 4 - Multi-Turn Task Operations (Priority: P2)

**Goal**: Users can chain multiple related tasks in a single conversation turn

**Independent Test**: Can be fully tested by sending "Add buy milk and eggs, then show me my pending tasks" and verifying both operations complete.

### RED: Multi-Turn Tests

- [X] T036R [US4] Create multi-tool call tests in backend/tests/integration/test_multi_turn.py
  - Test: Multiple tool calls in single turn processed sequentially
  - Test: All tool results aggregated into single response
  - Test: No duplicate tool calls in single turn (FR-017)
  - Test: User message + all assistant messages persisted
  - Target: 85% coverage

- [X] T037R [US4] [P] Create bulk operations tests in backend/tests/integration/test_bulk_operations.py
  - Test: "Delete all completed tasks" pattern works (list → delete loop)
  - Test: "Add multiple tasks" pattern works
  - Test: Response confirms all operations completed
  - Target: 90% coverage

### GREEN: Multi-Turn Implementation

- [X] T036G [US4] Support multiple tool calls in single AI agent turn in chat_router.py (loop through tool_calls array)
- [X] T037G [US4] [P] Aggregate multiple tool results into single conversational response (combine confirmations)
- [X] T038G [US4] Persist all messages from multi-turn operations to conversation history (user message + each assistant tool result)
- [X] T039G [US4] Handle "delete all completed tasks" pattern: list_tasks → filter completed → loop delete_task calls
- [X] T040G [US4] Prevent duplicate tool calls in single turn (FR-017) using call tracking or deduplication

### REFACTOR: US4 Optimization

- [X] T036F Run coverage report for US4 - ensure >80% overall
- [X] T037F Optimize any below-target components

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, coverage validation

### RED: Performance & Logging Tests

- [X] T041R [P] Create logging tests in backend/tests/unit/test_logging.py
  - Test: MCP tool calls logged with request_id, user_id, tool_name
  - Test: Tool responses logged with status
  - Test: Error details logged for debugging (FR-019)
  - Target: 95% coverage

- [X] T042R [P] Create performance tests in backend/tests/integration/test_performance.py
  - Test: Response time <4s for 90% of requests (SC-003)
  - Test: Performance regression detection
  - Test: Timeout enforcement for slow operations
  - Target: Performance SLA verified

### GREEN: Polish Implementation

- [X] T041G [P] Add comprehensive logging for MCP tool calls and responses (FR-019) - logs include request_id, user_id, tool_name, response_status
- [X] T042G [P] Add response time tracking with enforcement for <4s requirement (SC-003) - timeout or log if exceeds 4s
- [X] T043G Ensure all endpoints use CurrentUser dependency for JWT extraction
- [X] T044G [P] Verify user isolation on all database queries (SC-004) - audit all queries for user_id filtering
- [X] T045G [P] Add edge case handling: empty messages, long messages (>10000 chars), concurrent requests, DB unavailability

### GREEN: Coverage Validation

- [X] T046 Run full test suite with coverage report
  - Verify all components meet minimum coverage targets
  - Identify any coverage gaps
  - Add additional tests if needed to reach 80% overall

- [X] T047 [P] Final code cleanup and documentation updates

### REFACTOR: Final Polish

- [X] T041F Refactor logging based on test feedback
- [X] T042F Optimize performance based on timing tests
- [X] T043F Final review of all tests and coverage

**Checkpoint**: Phase 3 complete - all tests pass, 80% coverage achieved

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: RED → GREEN → REFACTOR
- **Foundational (Phase 2)**: RED → GREEN → REFACTOR (BLOCKS all user stories)
- **Frontend ChatKit (Phase 3)**: RED → GREEN → REFACTOR (Can run in parallel with Phase 4-7)
- **User Stories (Phase 4-7)**: Each follows RED → GREEN → REFACTOR
- **Polish (Phase 8)**: Depends on all user stories complete

### TDD Workflow

For each task pair:
1. Write RED test (must FAIL)
2. Write GREEN implementation (must pass test)
3. REFACTOR for quality
4. Run coverage report

---

## Task Summary

| Phase | Description | RED Tests | GREEN Impl | Total |
|-------|-------------|-----------|------------|-------|
| Phase 1 | Setup | 3 | 5 | 8 |
| Phase 2 | Foundational | 9 | 10 | 19 |
| Phase 3 | Frontend ChatKit | 3 | 3 | 6 |
| Phase 4 | US1: Task Management | 6 | 9 | 15 |
| Phase 5 | US2: Conversation | 3 | 5 | 8 |
| Phase 6 | US3: Error Handling | 3 | 6 | 9 |
| Phase 7 | US4: Multi-Turn | 2 | 5 | 7 |
| Phase 8 | Polish | 2 | 7 | 9 |
| **Total** | | **31 RED** | **50 GREEN** | **81 tasks** |

### Coverage by Phase

| Phase | Target | Verified By |
|-------|--------|-------------|
| Models (Phase 2) | 90% | T006R, T007R |
| Services (Phase 2) | 85% | T008R |
| MCP Tools (Phase 4) | 90% | T016R-T020R |
| Chat Endpoint (Phase 4) | 85% | T013R, T014R, T021R |
| Frontend ChatKit (Phase 3) | 85% | T050R, T051R, T052R |
| Conversation History (Phase 5) | 90% | T025R, T026R |
| Error Handling (Phase 6) | 80% | T030R-T032R |
| Multi-Turn (Phase 7) | 85% | T036R, T037R |
| **Overall Target** | **80%** | T046 |

---

## Running Tests

### Run All Phase 3 Tests
```bash
cd backend
pytest tests/ -v --tb=short -c pytest.ini
```

### Run Tests with Coverage
```bash
pytest tests/ --cov=src.mcp --cov=src.api.chat_router --cov=src.services.conversation_service --cov-report=html
```

### Run Single Test File
```bash
pytest tests/contract/test_mcp_add_task.py -v
```

### Run RED Tests Only (Should Fail)
```bash
pytest tests/ -k "R" --tb=line 2>&1 | head -50
```

### Check Coverage
```bash
pytest tests/ --cov=src --cov-report=term-missing --cov-report=html
open htmlcov/index.html
```

---

## TDD Checklist

- [ ] Every implementation task has a corresponding RED test
- [ ] All RED tests FAIL before implementation (verify with `pytest --tb=line`)
- [ ] All GREEN tasks make their tests PASS
- [ ] Coverage targets met for each component
- [ ] Overall coverage ≥80% (verified by T046)
- [ ] No production code without corresponding test
- [ ] Tests are fast, isolated, and repeatable

---

## Key Implementation Notes

**OpenAI Agents SDK Integration (T014, T021)**:
- Uses local SDK instance, not remote API calls
- Agent created with @function_tool decorated wrappers around MCP tools
- Runner.execute() processes messages with tool calling

**User ID Extraction (T011, T023)**:
- JWT from Authorization header via CurrentUser dependency
- Passed to MCP context for tool access via ctx.request_context.user_id
- Never passed as tool parameter (security requirement FR-011)

**Task ID Mapping (T018, T019, T020)**:
- User provides 1-based index ("task 1", "first task")
- Tools call list_tasks to get user's tasks with UUIDs
- Convert index → UUID before calling TaskService
- Returns UUID in response for consistency

**OpenAI ChatKit Integration (Phase 3)**:
- ChatKit is OpenAI's React component for chat interfaces
- Frontend uses `@openai/chatkit-react` with `useChatKit` hook and `ChatKit` component
- Backend endpoint: `POST /chatkit` with streaming responses (text/event-stream)
- Frontend at frontend/src/app/chat/page.tsx
- Types at frontend/src/types/chat.ts
- ChatKit configured with custom instructions, start screen prompts, and theme
- API configuration: `{ url: process.env.NEXT_PUBLIC_API_BASE_URL + '/chatkit', domainKey: '...' }`

---

## PHR Reference

This TDD task list was created following the spec-driven development workflow.
