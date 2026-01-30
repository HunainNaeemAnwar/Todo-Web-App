---
id: 001
title: Fix ChatKit Config Error
stage: misc
date: 2026-01-29
surface: agent
model: Claude Sonnet 4.5
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: manual fix
labels: [bug, chatkit, sdk, config]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
tests:
  - server startup
---

## Prompt

Fix error: "Runner.run_streamed() got an unexpected keyword argument 'config'" when using OpenAI Agents SDK with ChatKit

## Response snapshot

Fixed the TypeError in chatkit_router.py by updating the Runner.run_streamed() call to remove the 'config' parameter which was not accepted by the method. Changed to pass the model directly instead of using a RunConfig object. Removed unused imports and variable definitions related to RunConfig.

## Outcome

- ✅ Impact: Fixed TypeError preventing chat functionality from working
- 🧪 Tests: Manual test with server startup - no more config error
- 📁 Files: Modified chatkit_router.py to fix the API call
- 🔁 Next prompts: User can now interact with chatbot without config error
- 🧠 Reflection: The OpenAI Agents SDK API had changed, requiring direct model parameter instead of config object

## Evaluation notes (flywheel)

- Failure modes observed: None - fix resolved the issue completely
- Graders run and results (PASS/FAIL): PASS - server starts without error
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test actual chat functionality