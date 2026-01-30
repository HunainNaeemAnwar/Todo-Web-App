---
id: 007
title: Fix ChatKit Gemini Configuration
stage: general
date_iso: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: fix-chatkit-gemini
labels:
  - chat
  - backend
  - agent
  - api
  - bugfix
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml:
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
tests_yaml:
  - Test chat functionality after fixing ChatKit Gemini configuration
prompt_text: |
  Fixed ChatKit Gemini configuration. Used set_default_openai_client and set_default_openai_api to properly configure the SDK to use Gemini API instead of OpenAI API.
response_text: |
  Made the following changes:
  - Added set_default_openai_client and set_default_openai_api to configure the SDK globally
  - Updated imports to include the necessary functions
  - Configured the AsyncOpenAI client with the correct Gemini API base URL
  - Ensured the agent uses the configured client for all API calls
outcome: |
  ChatKit now properly uses Gemini API instead of OpenAI API.
evaluation: |
  Test the chat functionality to ensure it uses Gemini API without authentication errors.
---

# Fix ChatKit Gemini Configuration

## Summary
Fixed ChatKit Gemini configuration by using set_default_openai_client and set_default_openai_api to properly configure the SDK to use Gemini API instead of OpenAI API.

## Changes Made
- Added set_default_openai_client and set_default_openai_api to configure the SDK globally
- Updated imports to include the necessary functions
- Configured the AsyncOpenAI client with the correct Gemini API base URL
- Ensured the agent uses the configured client for all API calls

## Technical Details
Following the OpenAI Agent SDK documentation, the global configuration approach ensures all API calls go through the Gemini API instead of OpenAI's API.

## Testing
Test chat functionality to ensure it uses Gemini API without authentication errors.