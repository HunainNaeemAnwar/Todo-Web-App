---
id: 1
title: Fix ChatKit history persistence
stage: green
date: 2026-02-07
surface: agent
model: gemini-3-flash
feature: none
branch: 004-user-analytics-dashboard
user: hunain
command: general-purpose
labels: ["chatkit", "persistence", "fastapi", "sqlmodel"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/models/conversation.py
  - backend/src/api/chatkit_router.py
  - backend/src/services/conversation_service.py
tests:
  - backend/check_chat_history.py (manual)
  - backend/inspect_chatkit_types.py (manual)
---

## Prompt

Investigate why the ChatKit conversation history is not being stored in the database.
Steps:
1. Analyze Backend Logic
2. Analyze Database Operations
3. Frontend Check
4. Fix Plan

## Response snapshot

I have fixed the ChatKit conversation history issue by adding a missing 'title' column to the conversations table, implementing robust session management in the ChatKit router, and ensuring full serialization of ThreadMetadata so the frontend correctly displays past chats.

## Outcome

- ✅ Impact: Users can now see and resume their past conversations.
- 🧪 Tests: Verified with database inspection scripts that messages and titles are being saved.
- 📁 Files: backend/src/models/conversation.py, backend/src/api/chatkit_router.py, backend/src/services/conversation_service.py
- 🧠 Reflection: The combination of missing schema fields and improper session handling during streaming was preventing reliable history resumption.
