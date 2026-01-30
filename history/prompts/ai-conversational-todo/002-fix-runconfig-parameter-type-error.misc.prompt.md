---
id: "002"
title: "Fix RunConfig parameter type error in chatkit router"
stage: "misc"
date: "2026-01-29"
---

# PHR: Fix RunConfig parameter type error in chatkit router

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
["openai-agents", "runconfig", "chatkit", "fix"]

## Files
 - /home/hunain/DO/it/backend/src/api/chatkit_router.py

## Tests

## Links
SPEC: null
TICKET: null
ADR: null
PR: null

## Prompt Text
Fix the RunConfig parameter type error in chatkit router where a dict was passed instead of RunConfig object.

## Response Text
Fixed the RunConfig parameter type error by importing RunConfig from agents.run and passing a proper RunConfig object instead of a dictionary. The error occurred because the Runner.run_streamed method expected a RunConfig object but received a dict, causing AttributeError: 'dict' object has no attribute 'workflow_name'.

## Outcome

## Evaluation