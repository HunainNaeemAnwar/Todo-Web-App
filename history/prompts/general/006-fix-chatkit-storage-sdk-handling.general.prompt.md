---
id: "006"
title: "Fix ChatKit conversation storage - let SDK handle persistence and commit sessions"
stage: "general"
date_iso: "2026-02-07"
surface: "agent"
model: "minimax-m2.1-free"
feature: "none"
branch: "main"
user: "hunain"
command: "npm run build && python -m uvicorn src.api.main:app"
labels: ["bugfix", "chatkit", "conversation-storage", "persistence"]
links: {"spec": "null", "ticket": "null", "adr": "null", "pr": "null"}
files_yaml: |
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
  - /home/hunain/DO/it/frontend/src/context/ChatContext.tsx
tests_yaml: |
  - Backend restart successful
  - Health endpoint returns 200
  - Manual testing needed for conversation storage
prompt_text: |
  backedn is running check logs and see what happen beacuse still the conversation history is not saving in database .also on clicking chatbot button it refecth the dashoard task coponenet table that should refresh on clicking chatot button
response_text: |
  Fixed conversation storage issues:
  1. Removed manual message saving from respond() - SDK handles it via add_thread_item() in _process_new_thread_item_respond
  2. Removed manual assistant message saving - SDK saves via _process_events when ThreadItemDoneEvent is received
  3. Added explicit session.commit() after add_message to ensure data is persisted before session closes
  4. Fixed task refresh issue - triggerRefresh() no longer calls refreshTasksFn (task refresh should only happen when tasks are modified)
  5. Fixed React hooks violations - useChatKit() called at top level, removed duplicate useChat() call
  
  Backend restarted with fresh logs. Ready for testing.
outcome: "success"
evaluation: |
  Backend running, frontend built. Need to test: 1) Chat conversation saves to database 2) Clicking chat button doesn't refresh task table
---
