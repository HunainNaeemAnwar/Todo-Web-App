---
id: 004
title: Fix Runner Config Parameter Error
stage: general
date_iso: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-conversational-todo
branch: 003-ai-conversational-todo
user: hunain
command: fix-runner-config
labels:
  - chat
  - backend
  - agent
  - bugfix
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml:
  - /home/hunain/DO/it/backend/src/api/chatkit_router.py
tests_yaml:
  - Test chat functionality after fixing runner config parameter
prompt_text: |
  Fixed Runner.run_streamed() parameter error. The method was receiving an unexpected 'config' argument. Updated to use the correct API without the config parameter.
response_text: |
  Made the following changes:
  - Removed 'config' parameter from Runner.run_streamed() call
  - Removed unused imports (OpenAIChatCompletionsModel, RunConfig)
  - Simplified the agent execution approach
outcome: |
  Runner can now be called without config parameter errors.
evaluation: |
  Test the chat functionality to ensure the agent runs correctly without parameter errors.
---

# Fix Runner Config Parameter Error

## Summary
Fixed Runner.run_streamed() parameter error that occurred because the method was receiving an unexpected 'config' argument. Updated to use the correct API without the config parameter.

## Changes Made
- Removed 'config' parameter from Runner.run_streamed() call
- Removed unused imports (OpenAIChatCompletionsModel, RunConfig)
- Simplified the agent execution approach

## Technical Details
The Runner.run_streamed() method doesn't accept a config parameter in this context. The simpler approach without config should work for the ChatKit integration.

## Testing
Test chat functionality to ensure the agent runs correctly without parameter errors.