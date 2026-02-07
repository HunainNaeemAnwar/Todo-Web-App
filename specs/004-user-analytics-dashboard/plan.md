# Implementation Plan: User Analytics Dashboard

**Branch**: `004-user-analytics-dashboard` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)

## Summary

The User Analytics Dashboard feature provides users with profile management, task statistics visualization, productivity charts, and notification management. Built on the existing FastAPI backend and Next.js frontend, this feature adds:
- User profile viewing and editing at `/user`
- Task statistics with streaks, completion rates, and weekly activity charts
- In-app notification system with preferences
- Productivity analytics and export capabilities

## Technical Context

**Language/Version**: Python 3.12+, TypeScript 5.0+, JavaScript ES2022  
**Primary Dependencies**: FastAPI, SQLModel, Next.js 16+, Recharts, date-fns, jsPDF  
**Storage**: Neon Serverless PostgreSQL (users, tasks, sessions, notifications tables)  
**Testing**: pytest (backend), Jest/Playwright (frontend)  
**Target Platform**: Web browser (responsive)  
**Project Type**: Full-stack web application (backend + frontend)  
**Performance Goals**: <200ms API response p95, optimistic UI updates  
**Constraints**: JWT authentication required for all user endpoints  
**Scale/Scope**: Single-tenant task management, ~100 tasks per user

## Constitution Check

✅ All constraints satisfied from `.specify/memory/constitution.md`

## Project Structure

```
specs/004-user-analytics-dashboard/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology research
├── data-model.md        # Database schema designs
├── quickstart.md        # Development guide
├── contracts/           # API contracts
└── tasks.md             # Implementation tasks (75 total)

backend/
├── src/
│   ├── models/
│   │   ├── notification.py
│   │   └── notification_preference.py
│   ├── services/
│   │   ├── analytics_service.py
│   │   ├── notification_service.py
│   │   └── export_service.py
│   └── api/
│       └── user_router.py
└── tests/
    ├── unit/
    │   ├── test_user_profile_endpoints.py
    │   └── test_analytics_service.py
    └── integration/
        └── test_user_profile_flow.py

frontend/
├── src/
│   ├── components/
│   │   └── user/
│   │       ├── UserProfile.tsx
│   │       ├── StatisticsCard.tsx
│   │       └── StreakDisplay.tsx
│   ├── services/
│   │   └── userService.ts
│   └── app/
│       └── user/
│           └── page.tsx
```

## Implementation Progress

### Phase 1: Setup ✅
- Dependencies installed (recharts, date-fns, jsPDF, jspdf-autotable)
- Database migration created (notifications, notification_preferences)

### Phase 2: Foundational ✅
- Notification model and service
- NotificationPreference model
- AnalyticsService with streak calculation
- ExportService for CSV generation

### Phase 3: User Profile Management ✅
- GET/PUT /api/user/profile endpoints
- Statistics endpoint at /api/user/stats
- UserProfile React component
- Profile page at /user
- Unit and integration tests

### Phase 4: Task Statistics Dashboard ✅
- StatisticsCard component with KPIs
- StreakDisplay component with visual indicators
- ProductivityOverview with weekly charts
- Streak calculation tests

### Phase 5: Auto-Overdue ✅
- is_overdue computed property in Task model
- Overdue count in analytics stats
- Dashboard overdue indicators
- Integration tests for overdue status

### Phase 6: Productivity Analytics & Charts ✅
- analytics_router with productivity endpoints
- ProductivityChart component with Recharts
- /analytics route page
- Period selector (week/month/quarter)
- CSV export endpoint
- Integration tests for analytics endpoints

### Phase 7: Weekly & Monthly Reports ✅
- Weekly report endpoint with daily breakdown
- Monthly report endpoint with 30-day trend
- WeeklyReport component
- MonthlyReport component with bar visualization
- Tabbed interface on Analytics page
- Integration tests for reports

### Phase 8: In-App Notifications ✅
- NotificationType enum and model updates
- NotificationService with trigger methods (due_soon, overdue, streak)
- NotificationBell component with badge
- NotificationCenter with dropdown list
- useNotifications hook with polling
- Unit tests for notification triggers

### Phase 9: Calendar View (Pending)
- TBD

### Phase 10: CSV Export ✅
- /api/analytics/export/csv endpoint
- analyticsService.ts with export methods
- Export button on Dashboard

### Phase 11: PDF Export ✅
- jsPDF + jspdf-autotable (already installed)
- pdfGenerator.ts utility with multiple report formats
- PDF export button on Analytics page
- Unit tests for PDF generation

### Phase 9: Calendar View ✅
- /api/tasks/calendar endpoint with today/week/month periods
- CalendarFilter component with period selector
- TaskGroupByDay component for list view
- CalendarView component for grid view
- /calendar route page with date navigation
- Calendar link in sidebar
- Integration tests for calendar filtering

### Phase 12: Polish & Cross-Cutting Concerns ✅
- T110: Update sidebar navigation (DONE)
- T111: Run full integration test suite (DONE)
- T112: Fix any bugs discovered during testing (DONE)
- T113: Update README with new feature documentation (DONE)

### Remaining Phases
- Phase 6: Productivity Charts (Recharts)
- Phase 7: Weekly/Monthly Reports
- Phase 8: In-App Notifications
- Phase 9: Calendar View
- Phase 10: CSV Export
- Phase 11: PDF Export
- Phase 12: Polish

## API Endpoints Implemented

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/profile` | GET | Get user profile |
| `/api/user/profile` | PUT | Update username |
| `/api/user/stats` | GET | Get task statistics |
| `/api/user/notifications` | GET | List notifications (paginated) |
| `/api/user/notifications/{id}/read` | PUT | Mark single read |
| `/api/user/notifications/read-all` | PUT | Mark all read |
| `/api/user/notifications/preferences` | GET/PUT | Notification settings |

## Key Services

### AnalyticsService
- `get_user_stats()` - Returns total, completed, completion_rate, streaks
- `calculate_streak()` - Current and best consecutive days
- `get_weekly_activity()` - Daily completion counts for 8 weeks
- `get_productivity_data()` - Chart-ready data for daily/weekly/monthly

### NotificationService
- `create_notification()` - Create notification for user
- `get_user_notifications()` - Paginated list with cursor
- `mark_as_read()` / `mark_all_as_read()` - Update read status
- `get_user_preferences()` / `update_user_preferences()` - User settings

## Progress Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 75 |
| Completed | 14 (19%) |
| In Progress | 0 |
| Remaining | 61 |

**Current Phase**: Phase 4 Complete - Moving to Phase 5
