---
id: 001
title: Fix Chatbot 404 Error
stage: general
date_iso: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: fix-chatbot
labels:
  - chat
  - frontend
  - api
  - bugfix
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml:
  - /home/hunain/DO/it/frontend/src/components/chat/ChatContainer.tsx
  - /home/hunain/DO/it/frontend/src/context/ChatContext.tsx
  - /home/hunain/DO/it/frontend/src/app/api/chat/route.ts
tests_yaml:
  - Test chat functionality after fixing 404 errors
prompt_text: |
  Fixed chatbot functionality that was giving 404 errors. The issue was that the frontend was trying to directly access backend endpoints instead of going through Next.js API routes. Changed the ChatKit component and ChatContext to use relative paths to Next.js proxy routes.
response_text: |
  Fixed the 404 error by updating the frontend to use Next.js API routes as proxies:
  1. Changed ChatContainer.tsx to use `/api/chat` instead of full backend URL
  2. Changed ChatContext.tsx to use `/api/chatkit/session` instead of full backend URL
  Now all requests go through proper Next.js proxy routes that forward to the backend.
outcome: |
  Chatbot functionality should now work properly without 404 errors.
evaluation: |
  Test the chat functionality in the UI to ensure messages are processed correctly.
---

# Fix Chatbot 404 Error

## Summary
Fixed chatbot functionality that was giving 404 errors. The issue was that the frontend was trying to directly access backend endpoints instead of going through Next.js API routes.

## Changes Made
1. Updated ChatContainer.tsx to use `/api/chat` (relative to frontend) instead of full backend URL
2. Updated ChatContext.tsx to use `/api/chatkit/session` (relative to frontend) instead of full backend URL

## Technical Details
- Frontend now properly uses Next.js API routes as proxies
- Next.js routes forward requests to backend with proper authentication
- Resolves CORS issues and ensures proper authentication header handling

## Testing
Test chat functionality to ensure messages are processed correctly through the proxy routes.