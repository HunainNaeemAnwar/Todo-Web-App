---
id: 006
title: Fix Gemini API Configuration
stage: general
date_iso: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: fix-gemini-api
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
  - Test chat functionality after fixing Gemini API configuration
prompt_text: |
  Fixed Gemini API configuration issues. The system was trying to connect to OpenAI's API instead of Gemini API. Updated to use proper OpenAIChatCompletionsModel with RunConfig and ensured tracing is disabled.
response_text: |
  Made the following changes:
  - Added fallback to GOOGLE_API_KEY if GEMINI_API_KEY is not set
  - Added validation to ensure API key exists
  - Updated respond method to use OpenAIChatCompletionsModel with RunConfig
  - Disabled tracing to prevent OpenAI API calls
  - Passed proper config to Runner.run_streamed
outcome: |
  System now properly uses Gemini API instead of OpenAI API.
evaluation: |
  Test the chat functionality to ensure it uses Gemini API without authentication errors.
---

# Fix Gemini API Configuration

## Summary
Fixed Gemini API configuration issues that caused the system to try connecting to OpenAI's API instead of Gemini API. Updated to use proper OpenAIChatCompletionsModel with RunConfig and ensured tracing is disabled.

## Changes Made
- Added fallback to GOOGLE_API_KEY if GEMINI_API_KEY is not set
- Added validation to ensure API key exists
- Updated respond method to use OpenAIChatCompletionsModel with RunConfig
- Disabled tracing to prevent OpenAI API calls
- Passed proper config to Runner.run_streamed

## Technical Details
The OpenAI Agents SDK requires using RunConfig with OpenAIChatCompletionsModel and tracing_disabled=True to properly configure non-OpenAI providers like Gemini.

## Testing
Test chat functionality to ensure it uses Gemini API without authentication errors.