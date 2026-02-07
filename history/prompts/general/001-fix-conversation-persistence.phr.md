---
id: "001"
title: "Fix conversation history not saving to database"
stage: "fix"
date_iso: "2026-02-07"
surface: "agent"
model: "minimax-m2.1-free"
feature: "none"
branch: "swe/_fix"
user: "Developer"
command: "Fix chatbot conversation history not saving to database"
labels: ["bug-fix", "database", "chatbot", "conversation-history", "fastapi", "session-management"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
tests_yaml: |
  - Database operations verified working
  - Session lifecycle management improved
  - Streaming response handling fixed
prompt_text: |
  In my chatbot one problem, the conversation history is not saving in database that why in ui it show "You don't have any past chats". It is not saving in database. Use appropriate skill to fix this.
response_text: |
  Fixed conversation persistence issue by changing session management from Depends(get_session) to asynccontextmanager.

  Root Cause: FastAPI's Depends() with generator-based dependencies closes the session when the endpoint function returns, but for StreamingResponse, the session needs to remain open until the stream is fully consumed by the client.

  Solution: Replaced Depends(get_session) with an asynccontextmanager that keeps the session open during the entire streaming lifecycle. This ensures messages are saved before the session closes.

  Key changes in /home/hunain/DO/it/backend/src/api/chatkit_router.py:
  1. Removed session: Session = Depends(get_session) from endpoint signature
  2. Added asynccontextmanager decorator with session_lifecycle() function
  3. Session now stays open until StreamingResponse is fully consumed
  4. Database operations (add_message, commit) work correctly within the context

  Verified that:
  - Database operations work correctly (conversations and messages are saved)
  - Session stays open during simulated streaming
  - Multiple messages are saved and retrieved successfully
---
