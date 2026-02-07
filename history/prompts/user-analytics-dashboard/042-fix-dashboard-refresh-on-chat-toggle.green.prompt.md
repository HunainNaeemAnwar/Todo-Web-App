---
id: 42
title: Fix Dashboard Refresh on Chat Toggle
stage: green
date: 2026-02-07
surface: agent
model: gemini-3-flash
feature: user-analytics-dashboard
branch: 004-user-analytics-dashboard
user: hunain
command: Fix dashboard refresh issue
labels: ["frontend", "react", "hooks", "context-optimization"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/context/ChatContext.tsx
  - frontend/src/components/chat/ChatContainer.tsx
  - frontend/src/components/chat/ChatToggleButton.tsx
  - frontend/src/components/chat/ChatModal.tsx
tests:
  - Manual verification of React component lifecycle
---

## Prompt

Investigate why the dashboard page refreshes when the chat toggle button is clicked and fix it.

1.  **Analyze Frontend Code**:
    *   Check `frontend/src/components/chat/ChatToggleButton.tsx` and `frontend/src/components/chat/ChatLayoutClient.tsx`.
    *   Look for any state changes or navigation events that might trigger a re-render of the entire layout or a page reload.
    *   Verify if `ChatProvider` context updates are causing unnecessary re-renders of the parent layout.

2.  **Fix Plan**:
    *   Ensure `ChatToggleButton` uses `e.preventDefault()` if it's inside a form (unlikely but possible).
    *   If `ChatProvider` is causing re-renders, optimize context usage or memoize components.
    *   Check if `setIsOpen` in `ChatContext` triggers any side effects that might reload the page.

3.  **Refactor**:
    *   If needed, move the `ChatProvider` down the component tree or use `React.memo` to prevent re-renders of the dashboard.

Use the `general-purpose` agent to find the cause and apply the fix.

## Response snapshot

The investigation identified that toggling the chat caused a full application re-render because `ChatProvider` (wrapping the root layout) was passing a non-memoized object as its value. Additionally, a Rule of Hooks violation in `ChatContainer.tsx` (conditional call to `useChatKit`) likely caused React errors leading to page reloads in development. I fixed these by memoizing the `ChatProvider` value, moving the task refresh callback to a `useRef` to prevent render loops, encapsulating the `useChatKit` hook in an unconditionally rendered sub-component, and adding `e.preventDefault()` and `type="button"` to the toggle button.

## Outcome

- ✅ Impact: High. Fixed a critical UX issue where toggling the chat would lose dashboard state/scroll position due to page refresh/re-render.
- 🧪 Tests: Verified component stability and rule of hooks compliance.
- 📁 Files: Updated `ChatContext.tsx`, `ChatContainer.tsx`, `ChatToggleButton.tsx`, and `ChatModal.tsx`.
- 🔁 Next prompts: none
- 🧠 Reflection: Wrapping top-level providers with `useMemo` is essential in Next.js/React apps to prevent unnecessary global re-renders.

## Evaluation notes (flywheel)

- Failure modes observed: Rule of Hooks violation (conditional hook call).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
