---
id: "001"
title: "Fix OpenAI Agent SDK tracing conflicts with Gemini API"
stage: "misc"
date: "2026-01-29"
---

# PHR: Fix OpenAI Agent SDK tracing conflicts with Gemini API

## Surface
Agent

## Model
sonnet-4-5

## Feature
ai-conversational-todo

## Branch
003-ai-conversational-todo

## User
hunain

## Command
openai-agent-sdk

## Labels
["openai-agents", "tracing", "gemini", "mcp", "fix"]

## Files
 - /home/hunain/DO/it/backend/src/api/main.py
 - /home/hunain/DO/it/backend/src/api/chat_router.py
 - /home/hunain/DO/it/backend/src/api/chatkit_router.py
 - /home/hunain/DO/it/backend/src/mcp/server.py
 - /home/hunain/DO/it/backend/src/startup_config.py

## Tests

## Links
SPEC: null
TICKET: null
ADR: null
PR: null

## Prompt Text
Fix the issue where OpenAI Agent SDK with Gemini API was causing tracing errors and module import warnings.

## Response Text
Fixed the OpenAI Agent SDK integration with Gemini API by:

1. Created a centralized startup configuration module (startup_config.py) that disables tracing before any imports
2. Updated main.py to import the startup configuration first
3. Updated chat_router.py and chatkit_router.py to properly disable tracing with RunConfig(tracing_disabled=True)
4. Updated mcp/server.py to import startup configuration and suppress import warnings
5. Added proper environment variable configuration to disable OpenAI tracing when using Gemini

The fixes address:
- Runtime warning about module import conflicts
- OpenAI tracing errors when using Google API keys
- Proper tracing configuration for non-OpenAI models

## Outcome

## Evaluation