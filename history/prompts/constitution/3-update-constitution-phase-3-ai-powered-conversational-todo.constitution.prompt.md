---
id: 3
title: Update constitution for Phase III AI-Powered Conversational Todo
stage: constitution
date: 2026-01-22
surface: agent
model: claude-sonnet-4-20250514
feature: none
branch: main
user: Hunain
command: constitution update for Phase III
labels: [constitution, phase-3, ai-conversational-todo]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - CLAUDE.md
  - opencode.md
tests: []
---

## Prompt

Update the constitution with Phase III - AI-Powered Conversational Todo principles:

Core principles for this phase:
- The server MUST remain stateless — no in-memory conversation state
- All conversation history is persisted in Neon PostgreSQL (Conversation + Message tables)
- Authentication: Better Auth JWT → every request must include valid token
- User isolation is mandatory: every tool and query filters by user_id from JWT
- AI interaction ONLY through OpenAI Agents SDK + tools exposed via MCP
- No direct database calls allowed inside the agent logic
- All task CRUD operations MUST go through defined MCP tools
- MCP tools must be secure, idempotent where possible, and always return structured JSON
- Chat responses must be friendly, confirmatory and include action feedback
- Error handling: graceful messages for "task not found", "unauthorized", "invalid input"
- Multi-turn support: full history loaded from DB on every request
- Frontend: OpenAI ChatKit only (no custom chat UI in phase 3)
- Domain allowlist MUST be configured before production ChatKit works
- Logging: log tool calls + final response for debugging

Constitution violation will break phase scoring — strictly follow above.

## Response snapshot

Updated constitution to v2.0.0 with 6 new principles for Phase III:
- I. Stateless Server Architecture
- II. Persistent Conversation History
- III. Authentication & User Isolation
- IV. AI Interaction via OpenAI Agents SDK + MCP
- V. MCP Tool Security & Design
- VI. Chat Experience & Error Handling

Added Phase-Specific Constraints section documenting Phase III requirements including frontend (ChatKit only), logging mandates, and forbidden patterns. Updated CLAUDE.md and opencode.md to add Phase 3 section.

Version bumped 1.0.0 → 2.0.0 (MAJOR) due to fundamental architectural shift.

## Outcome

- ✅ Impact: Constitution updated with Phase III AI-powered conversational todo principles
- 🧪 Tests: N/A
- 📁 Files: .specify/memory/constitution.md, CLAUDE.md, opencode.md
- 🔁 Next prompts: None
- 🧠 Reflection: Template validation confirmed all templates remain compatible with new principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
