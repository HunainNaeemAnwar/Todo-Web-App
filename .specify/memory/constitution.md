<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR)
  
  Modified principles:
  - None (new principles added)
  
  Added sections:
  - Phase III: AI-Powered Conversational Todo (Principles I-VI)
  - Phase-Specific Constraints (Section 2)
  
  Templates requiring updates:
  - ✅ .specify/templates/plan-template.md - No changes needed (Constitution Check section is template-agnostic)
  - ✅ .specify/templates/spec-template.md - No changes needed (structure remains valid)
  - ✅ .specify/templates/tasks-template.md - No changes needed (task organization unchanged)
  
  Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original ratification date unknown - needs historical lookup
-->

# TaskFlow Constitution

## Core Principles

### I. Stateless Server Architecture
The server MUST remain stateless — no in-memory conversation state is permitted. Every request
MUST be handled independently, with all necessary context loaded from persistent storage.
This ensures horizontal scalability, fault tolerance, and consistent behavior across restarts.

Rationale: Stateless design enables horizontal scaling, simplifies deployment, and ensures
that no user conversations are lost during server restarts or failures.

### II. Persistent Conversation History
All conversation history MUST be persisted in Neon PostgreSQL using Conversation and Message
tables. Full conversation context MUST be loaded from the database on every request to enable
multi-turn support. No conversation state is stored in memory between requests.

Rationale: Persistent history provides continuity across sessions, enables recovery from failures,
and allows for conversation analytics and search capabilities.

### III. Authentication & User Isolation
Authentication MUST use Better Auth JWT. Every request MUST include a valid JWT token, and
every tool execution and database query MUST filter by user_id extracted from the JWT. Cross-user
data access is strictly prohibited and MUST fail with an unauthorized error.

Rationale: User isolation is non-negotiable for multi-tenant applications. JWT provides stateless
authentication that scales without session storage requirements.

### IV. AI Interaction via OpenAI Agents SDK + MCP
AI interactions MUST ONLY occur through OpenAI Agents SDK with tools exposed via MCP. Direct AI
API calls from agent logic are prohibited. All task CRUD operations MUST go through defined MCP
tools, not direct database calls. The agent receives context through MCP tool definitions and
returns structured responses.

Rationale: MCP provides a secure, observable interface for AI-tool interaction. Centralizing tool
definitions ensures consistent behavior, logging, and access control.

### V. MCP Tool Security & Design
All MCP tools MUST be secure by design, idempotent where possible, and MUST always return
structured JSON. Tools MUST validate inputs, enforce user isolation, and handle errors gracefully.
Tool calls and responses MUST be logged for debugging purposes.

Rationale: MCP tools are the interface between AI and data. Consistent structured output enables
reliable parsing, while idempotency prevents duplicate operations.

### VI. Chat Experience & Error Handling
Chat responses MUST be friendly and confirmatory, including action feedback for completed
operations. Error messages MUST be graceful and specific: "task not found," "unauthorized,"
"invalid input." Never expose raw errors or system internals to users.

Rationale: User experience depends on clear, actionable feedback. Consistent error handling
builds trust and helps users recover from mistakes.

## Phase-Specific Constraints

### Phase III: AI-Powered Conversational Todo
This phase introduces conversational AI for task management with the following constraints:

**Frontend**: ChatKit ONLY — no custom chat UI components in this phase. Domain allowlist
MUST be configured before production deployment.

**Logging**: All MCP tool calls and final responses MUST be logged for debugging and audit
purposes. Logs MUST include request ID, user_id, tool name, and response status.

**Forbidden Patterns**:
- No direct database calls inside agent logic
- No in-memory conversation state
- No custom chat UI (use ChatKit only)
- No bypassing MCP tools for task operations

## Development Workflow

All PRs and code reviews MUST verify compliance with these principles. Complexity MUST be
justified in writing, with simpler alternatives documented and rejected. Use `.specify/memory/constitution.md`
for runtime development guidance.

**Constitution Compliance**: Violation of Phase III principles will break phase scoring.
All team members MUST strictly follow the above constraints.

## Governance

This constitution supersedes all other development practices. Amendments require documentation,
team approval, and a migration plan for existing code. All team members are responsible for
identifying and flagging potential violations during code review.

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-01-22
