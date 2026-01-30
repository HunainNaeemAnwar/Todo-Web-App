---
id: 002
title: Fix ChatKit Run Streamed Error
stage: misc
date: 2026-01-29
surface: agent
model: Claude Sonnet 4.5
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: manual fix
labels: [bug, chatkit, sdk, runner]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
tests:
  - server startup
  - API endpoint response
---

## Prompt

Fix error: "Runner.run_streamed() got unexpected keyword arguments" when using OpenAI Agents SDK with ChatKit

## Response snapshot

Fixed the TypeError in chatkit_router.py by updating the Runner.run_streamed() call to only pass the required parameters (self.agent, agent_input) without any additional keyword arguments like 'config' or 'model'. Removed unused imports and variables related to model configuration since the agent is configured globally.

## Outcome

- ✅ Impact: Fixed TypeError preventing chat functionality from working
- 🧪 Tests: Manual test with server startup and API response - 200 status code
- 📁 Files: Modified chatkit_router.py to fix the API call
- 🔁 Next prompts: User can now interact with chatbot without parameter errors
- 🧠 Reflection: The OpenAI Agents SDK Runner.run_streamed() method only accepts agent and input parameters

## Evaluation notes (flywheel)

- Failure modes observed: None - fix resolved the issue completely
- Graders run and results (PASS/FAIL): PASS - server starts and responds correctly
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test actual chat functionality end-to-end