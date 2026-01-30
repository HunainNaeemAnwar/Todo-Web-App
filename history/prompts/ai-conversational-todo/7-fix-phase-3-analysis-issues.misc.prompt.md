---
id: 7
title: Fix Phase 3 analysis issues
stage: misc
date: 2026-01-22
surface: agent
model: claude-sonnet-4-20250514
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: Hunain
command: Fix all issues from /sp.analyze report
labels: [phase-3, analysis, remediation, fixes]
links:
  spec: /home/hunain/DO/it/specs/003-ai-conversational-todo/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /home/hunain/DO/it/specs/003-ai-conversational-todo/contracts/mcp-tools.yaml
  - /home/hunain/DO/it/specs/003-ai-conversational-todo/tasks.md
  - /home/hunain/DO/it/specs/003-ai-conversational-todo/plan.md
tests: []
---

## Prompt

Fix all issues from the specification analysis report:
- D1: Update contracts/mcp-tools.yaml to MCP JSON Schema format
- D2: Add task for user_id extraction from JWT context
- A1: Clarify task ID mapping (1-based vs UUID)
- A2: Specify OpenAI Agents SDK pattern
- C1: Add performance enforcement task
- E1: Align conversation_id types
- E3: Add /mcp path to MCP server task
- U1: Add edge case handling tasks
- E2: Consolidate T008 and T025

## Response snapshot

Remediated all 9 identified issues:

**D1 - MCP Contract Format FIXED**:
- Updated contracts/mcp-tools.yaml to proper MCP JSON Schema format
- Added mcp_schema_version, annotations (idempotent, readOnly)
- Added user_context section for JWT extraction pattern
- Added performance requirements section

**D2 - User ID Extraction FIXED**:
- Added T011: Create MCP context module at backend/src/mcp/context.py
- Implements ctx.request_context.user_id pattern per FR-011
- Updated all MCP tool descriptions to reference context extraction

**A1 - Task ID Mapping FIXED**:
- Clarified in contracts that task_id is 1-based index for user reference
- Tools convert index → UUID internally using list_tasks
- Updated relevant tasks to show conversion pattern

**A2 - OpenAI SDK Pattern FIXED**:
- Added explicit note: "local SDK, not remote API calls"
- T014: Create ChatRouter with OpenAI Agents SDK integration (local SDK)
- T021: Invoke OpenAI Agents SDK locally

**C1 - Performance Enforcement FIXED**:
- Added T042: Response time tracking with enforcement for <4s
- Added performance section to contracts with max_response_time_ms
- Changed T045 from just tracking to "enforcement"

**E1 - Type Alignment FIXED**:
- Updated plan.md to use "UUID string" terminology consistently
- MCP tools now explicitly reference UUID throughout

**E3 - MCP Path FIXED**:
- T012: Create MCP server at backend/src/mcp/server.py with /mcp endpoint
- Explicitly mentioned: "mounted at /mcp endpoint"

**U1 - Edge Case Handling FIXED**:
- Added T045: Add edge case handling for empty messages, long messages, concurrent requests, DB unavailability

**E2 - T008/T025 Consolidation FIXED**:
- T008 now includes ALL ConversationService methods (create, get, messages, add, timestamp)
- Removed redundant T025-T029 individual method implementations
- Reduced from 49 tasks to 47 tasks

## Outcome

- ✅ Impact: All 9 analysis issues remediated
- 🧪 Tests: N/A
- 📁 Files: contracts/mcp-tools.yaml, tasks.md, plan.md
- 🔁 Next prompts: /sp.red to start red-green-refactor cycle
- 🧠 Reflection: Consolidating T008/T025 reduced task count while maintaining coverage

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
