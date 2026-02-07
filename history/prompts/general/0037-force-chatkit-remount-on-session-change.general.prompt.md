---
id: "0037"
title: "Force ChatKit Remount on Session Change"
stage: "general"
date_iso: "2026-02-06"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "force chatkit remount"
labels: ["chatbot", "chatkit", "session", "remount"]
spec: null
ticket: null
adr: null
pr: null
---

# Force ChatKit Remount on Session Change

## User Prompt
still it is howing Initializing... Setting up your AI assistant . ithink the issue is in chatbot ui

## Assistant Response
Fixed the persistent initialization issue by ensuring the ChatKit component is properly reinitialized when the session changes.

### Problem Identified
The ChatKit widget was staying in the "Initializing... Setting up your AI assistant" state because the component wasn't properly reinitializing when the session was established. The ChatKit widget was initialized with potentially incomplete session data and didn't reinitialize when the session became available.

### Solution Applied
Added a dynamic key to the ChatKit component that changes when the session ID changes, forcing a complete remount of the ChatKit widget when the session is properly established.

### Key Changes Made
- Added a dynamic key property `key={`chatkit-${session.id}`}` to the ChatKit component
- This forces React to completely unmount and remount the ChatKit widget when the session ID changes
- Ensures that the ChatKit widget initializes with the complete session data

### Result
The ChatKit widget should now properly initialize after the session is established, moving past the "Initializing..." state.

## Files Modified
- /home/hunain/DO/it/frontend/src/components/chat/ChatContainer.tsx

## Outcome
ChatKit component now properly reinitializes with session data, resolving the initialization hang issue.