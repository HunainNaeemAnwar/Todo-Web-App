---
id: "0033"
title: "Fix Analytics Authentication Flow"
stage: "general"
date_iso: "2026-02-06"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "fix analytics authentication"
labels: ["authentication", "analytics", "cookies", "authorization"]
spec: null
ticket: null
adr: null
pr: null
---

# Fix Analytics Authentication Flow

## User Prompt
but i m authenticated and still t redirect me to sign in page .fix this

## Assistant Response
Fixed the authentication issue where authenticated users were being redirected to the sign-in page when accessing the analytics route.

### Problem Identified
The issue was in the frontend axios configuration. The axios interceptors were trying to manually extract the authentication token from cookies to add to the Authorization header, but the backend sets HTTP-only cookies that cannot be accessed by JavaScript. This caused the token to be null, resulting in 401 Unauthorized responses for analytics API calls.

### Solution Applied
Modified the axios configuration in `/frontend/src/lib/axiosConfig.ts`:
- Removed the request interceptor that tried to manually add the Authorization header
- Added `withCredentials: true` to the axios configuration to ensure cookies are automatically sent with requests
- Kept the response interceptor for handling 401 errors properly

### Additional Backend Consistency
The analytics router already had proper dual authentication handling (checking both Authorization header and cookies), which is consistent with other routers.

### Result
- Analytics API calls now properly authenticate using HTTP-only cookies
- Authenticated users can access the analytics page without being redirected
- The authentication flow is now consistent across all API endpoints

## Files Modified
- /home/hunain/DO/it/frontend/src/lib/axiosConfig.ts

## Outcome
Analytics route now properly recognizes authenticated users and displays the analytics dashboard instead of redirecting to the sign-in page.