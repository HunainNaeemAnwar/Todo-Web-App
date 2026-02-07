# Feature Specification: User Analytics Dashboard

**Feature Branch**: `004-user-analytics-dashboard`  
**Created**: 2026-02-02  
**Status**: Draft  
**Input**: User description: "Add a /user route where the user can change their username and view their complete history since they first logged in to the website. This should include how many tasks the user has created, how many have been completed, and how consistent the user is in completing tasks over time.

In addition, add the following features to the application:

Due date reminders with notifications

Analytics and reports

Productivity charts

Task completion rate

Weekly and monthly reports

Export tasks (CSV / PDF)

Task deadlines management

Rule-based actions

Example: If a due date has passed, automatically mark the task as overdue

Calendar view (daily / weekly / monthly)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Profile Management (Priority: P1)

As a registered user, I want to view and update my profile information so that I can keep my account details current.

**Why this priority**: Profile management is fundamental to any user-facing application. Users expect to be able to update their display name and view their account information. Without this, users cannot personalize their experience.

**Independent Test**: Can be fully tested by accessing the /user route, viewing profile information, updating the username field, and verifying the change is persisted and reflected across the application.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they navigate to `/user`, **Then** they should see their current username, email, account creation date, and profile statistics.

2. **Given** a user is on the profile page, **When** they update their username and save, **Then** the new username should be displayed and persisted across sessions.

3. **Given** a user enters an empty username, **When** they attempt to save, **Then** the system should show an error message and prevent the update.

---

### User Story 2 - Task Statistics Dashboard (Priority: P1)

As a user, I want to view my task statistics so that I can understand my productivity patterns and track my progress over time.

**Why this priority**: Statistics provide motivation and insight. Users need to see their total tasks, completion rate, and consistency metrics to measure their productivity. This is the core value proposition of the analytics feature.

**Independent Test**: Can be fully tested by creating tasks, completing some of them, and verifying the statistics reflect accurate counts and percentages on the user profile or analytics page.

**Acceptance Scenarios**:

1. **Given** a user has created tasks, **When** they view their statistics, **Then** they should see: total tasks created, tasks completed, and overall completion percentage.

2. **Given** a user wants to see their consistency, **When** they view their history, **Then** they should see: average tasks per day, current streak (consecutive days with completed tasks), best streak, and weekly activity summary.

3. **Given** a user has no completed tasks, **When** they view statistics, **Then** the completion rate should display as 0% and streak data should show appropriate empty states.

---

### User Story 3 - Auto-Overdue Task Management (Priority: P1)

As a user, I want the system to automatically mark tasks as overdue when their due date passes so that I can quickly identify tasks that need immediate attention.

**Why this priority**: This is a critical productivity feature. Users should not need to manually mark tasks as overdue—the system should handle this automatically. This reduces user cognitive load and ensures nothing falls through the cracks.

**Independent Test**: Can be fully tested by creating a task with a past due date and verifying it is automatically marked as overdue with appropriate visual indicators.

**Acceptance Scenarios**:

1. **Given** a task has a due date that has passed and the task is not completed, **When** the task is viewed, **Then** it should be visually identified as overdue (e.g., red border, overdue badge, or similar indicator).

2. **Given** a user completes an overdue task, **When** the task is updated, **Then** the overdue status should be cleared and the completion recorded.

3. **Given** a user creates a task without a due date, **When** the task is viewed, **Then** it should not show any overdue status.

4. **Given** multiple tasks are overdue, **When** the user views their dashboard, **Then** an overdue count should be displayed in the stats section.

---

### User Story 4 - Productivity Analytics & Charts (Priority: P2)

As a user, I want to see visual representations of my productivity so that I can easily understand my trends and patterns over time.

**Why this priority**: Visual analytics help users identify patterns they might miss in raw numbers. Charts make data actionable and engaging, encouraging users to maintain their productivity streaks.

**Independent Test**: Can be fully tested by creating and completing tasks over multiple days/weeks, then verifying the analytics page displays accurate charts showing daily, weekly, and monthly completion trends.

**Acceptance Scenarios**:

1. **Given** a user has completed tasks over the past 30 days, **When** they view the productivity chart, **Then** they should see a line or bar chart showing daily completion counts.

2. **Given** a user wants to see weekly patterns, **When** they toggle to weekly view, **Then** they should see a summary of completions per week for the past 8-12 weeks.

3. **Given** a user wants to compare productivity periods, **When** they view monthly data, **Then** they should see a monthly trend chart comparing this month to previous months.

---

### User Story 5 - Weekly & Monthly Reports (Priority: P2)

As a user, I want to receive summary reports of my productivity so that I can review my progress without manually compiling data.

**Why this priority**: Reports provide value at a glance. Weekly reports help users stay accountable, while monthly reports offer a broader perspective on productivity trends. This feature turns raw data into actionable insights.

**Independent Test**: Can be fully tested by requesting weekly and monthly reports and verifying they contain accurate summaries of tasks created, completed, completion rate, and key metrics.

**Acceptance Scenarios**:

1. **Given** a user requests a weekly report, **When** the report is generated, **Then** it should include: total tasks created this week, tasks completed, daily breakdown, and completion rate.

2. **Given** a user requests a monthly report, **When** the report is generated, **Then** it should include: monthly totals, weekly breakdown, month-over-month comparison, and productivity trend.

3. **Given** a user has no activity in a period, **When** they request a report, **Then** the report should clearly indicate zero activity with appropriate messaging.

---

### User Story 6 - In-App Notifications (Priority: P2)

As a user, I want to receive notifications about upcoming task deadlines so that I can stay on top of my commitments without checking the app constantly.

**Why this priority**: Notifications are essential for task management. Users need reminders before tasks are due to plan their time effectively. In-app notifications are the most immediate and accessible form of reminder.

**Independent Test**: Can be fully tested by creating a task with a due date approaching, verifying a notification appears, and confirming the notification can be viewed and dismissed.

**Acceptance Scenarios**:

1. **Given** a task is due tomorrow, **When** the due date approaches, **Then** the user should receive an in-app notification reminding them of the upcoming deadline.

2. **Given** a user has overdue tasks, **When** they log in or refresh, **Then** they should see an overdue alert notification.

3. **Given** a user views a notification, **When** they acknowledge it, **Then** it should be marked as read and removed from the unread count.

4. **Given** a user completes a streak milestone, **When** the achievement is reached, **Then** they should receive a congratulatory notification.

---

### User Story 7 - Calendar View with Time Filters (Priority: P3)

As a user, I want to view my tasks organized by time periods so that I can plan my schedule effectively.

**Why this priority**: Calendar views are a common expectation in task management apps. While not as critical as core task management, it significantly improves user experience by providing temporal context to tasks.

**Independent Test**: Can be fully tested by toggling between time filters (Today, This Week, This Month, All Tasks) and verifying tasks are correctly grouped and displayed for each time period.

**Acceptance Scenarios**:

1. **Given** a user is on the tasks page, **When** they select "Today", **Then** they should see only tasks due today.

2. **Given** a user selects "This Week", **When** the view updates, **Then** they should see tasks due this week, grouped by day.

3. **Given** a user selects "This Month", **When** the view updates, **Then** they should see all tasks due this month, with days clearly labeled.

4. **Given** a user selects "All Tasks", **When** the view updates, **Then** they should see all tasks regardless of due date.

---

### User Story 8 - Export Tasks to CSV (Priority: P3)

As a user, I want to export my tasks to a CSV file so that I can use the data in other applications or maintain a backup.

**Why this priority**: Data portability is important for users who want to analyze their tasks in external tools (spreadsheets, databases) or maintain personal archives. This is a low-effort, high-value feature.

**Independent Test**: Can be fully tested by clicking the export CSV button and verifying the downloaded file contains all tasks with correct data in spreadsheet format.

**Acceptance Scenarios**:

1. **Given** a user clicks "Export to CSV", **When** the export is generated, **Then** a CSV file should download containing all tasks with columns: title, description, priority, category, due_date, completed status, created_at.

2. **Given** a user has many tasks, **When** they export to CSV, **Then** the download should complete within a reasonable time (under 10 seconds for up to 10,000 tasks).

3. **Given** a user has no tasks, **When** they export to CSV, **Then** an empty CSV with headers should download.

---

### User Story 9 - Export Tasks to PDF (Priority: P3)

As a user, I want to export a formatted report of my tasks to PDF so that I can share or print my task summaries.

**Why this priority**: PDF export provides a professional, printable format for reports. Useful for formal reporting, sharing with others, or maintaining printed records of productivity.

**Independent Test**: Can be fully tested by clicking the export PDF button and verifying the downloaded file contains a formatted report with summary and task list.

**Acceptance Scenarios**:

1. **Given** a user clicks "Export to PDF", **When** the export is generated, **Then** a PDF file should download containing: productivity summary (total tasks, completed, rate), followed by a formatted task list.

2. **Given** a user exports to PDF, **When** the file opens, **Then** the formatting should be clean and readable with clear section headers.

3. **Given** a user has no tasks, **When** they export to PDF, **Then** a minimal PDF with empty state messaging should download.

---

### Edge Cases

- **What happens when user has no tasks?** Display appropriate empty states with helpful messaging and guidance on creating first task.
- **How does system handle missing due dates?** Tasks without due dates should not appear in calendar views or overdue checks.
- **What happens when notification data cannot be loaded?** Show fallback UI and log error without breaking the page.
- **How does system handle concurrent exports?** Queue exports to prevent server overload; show loading state during generation.
- **What happens with timezone differences?** Store all timestamps in UTC; display in user's local timezone.
- **How are notifications cleared?** Users can dismiss notifications individually or mark all as read.
- **What if PDF generation fails?** Show error message and offer retry option; ensure partial downloads are not created.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a `/user` route accessible to authenticated users displaying their profile information.
- **FR-002**: System MUST allow users to update their display name via the profile page.
- **FR-003**: System MUST calculate and display user statistics: total tasks created, tasks completed, completion percentage.
- **FR-004**: System MUST calculate and display consistency metrics: average tasks per day, current streak, best streak, weekly activity summary.
- **FR-005**: System MUST automatically mark tasks as overdue when their due date passes and the task is not completed.
- **FR-006**: System MUST visually distinguish overdue tasks in all task list views (e.g., red border, badge, or icon).
- **FR-007**: System MUST display overdue task count in the dashboard statistics.
- **FR-008**: System MUST display productivity charts showing completion trends over time (daily, weekly, monthly views).
- **FR-009**: System MUST generate weekly reports showing: total created, total completed, daily breakdown, completion rate.
- **FR-010**: System MUST generate monthly reports showing: monthly totals, weekly breakdown, month-over-month comparison.
- **FR-011**: System MUST send in-app notifications for tasks due within 24 hours.
- **FR-012**: System MUST send in-app notifications when tasks become overdue.
- **FR-013**: System MUST provide a notification center accessible via bell icon showing all notifications with read/unread status.
- **FR-014**: System MUST allow users to mark notifications as read individually or all at once.
- **FR-015**: System MUST provide calendar views with time filters: Today, This Week, This Month, All Tasks.
- **FR-016**: System MUST group tasks by day in calendar views with clear date labels.
- **FR-017**: System MUST export all tasks to CSV format with columns: title, description, priority, category, due_date, completed, created_at.
- **FR-018**: System MUST export task productivity summary to PDF format with formatted report layout.
- **FR-019**: System MUST validate all user inputs (username, filters, export requests) and return appropriate error messages.
- **FR-020**: System MUST return empty state messages when no data exists for requested views (analytics, reports, calendar).

### Key Entities

- **User**: Existing entity. Updated to support profile management and statistics aggregation.
- **Task**: Existing entity. New computed/derived attributes: is_overdue, overdue_notified.
- **Notification**: New entity for storing in-app notifications.
  - Attributes: id, user_id, type (due_soon, overdue, streak_milestone), title, message, task_id (optional), read (boolean), created_at
- **NotificationPreference**: New entity for user notification settings.
  - Attributes: user_id, notify_due_soon (boolean), notify_overdue (boolean), notify_streaks (boolean)

### API Requirements

- **API-001**: `GET /api/user/profile` - Returns user profile data including name, email, created_at.
- **API-002**: `PUT /api/user/profile` - Updates user profile (name). Requires validation.
- **API-003**: `GET /api/user/stats` - Returns user statistics: total_tasks, completed_tasks, completion_rate, streak_current, streak_best, avg_tasks_per_day.
- **API-004**: `GET /api/user/notifications` - Returns paginated list of user notifications.
- **API-005**: `PUT /api/user/notifications/{id}/read` - Marks a notification as read.
- **API-006**: `PUT /api/user/notifications/read-all` - Marks all notifications as read.
- **API-007**: `GET /api/analytics/productivity?period=week|month|quarter` - Returns productivity chart data.
- **API-008**: `GET /api/analytics/weekly-report` - Returns weekly productivity report data.
- **API-009**: `GET /api/analytics/monthly-report` - Returns monthly productivity report data.
- **API-010**: `GET /api/tasks/calendar?filter=today|week|month|all` - Returns tasks filtered by time period.
- **API-011**: `GET /api/tasks/export/csv` - Returns CSV file of all tasks.
- **API-012**: `GET /api/tasks/export/pdf` - Returns PDF report of productivity summary and tasks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users CAN access their profile and update username within 5 seconds of page load.
- **SC-002**: Users CAN view accurate task statistics reflecting their actual data within 2 seconds of page load.
- **SC-003**: 95% of users CAN complete profile update without errors on first attempt.
- **SC-004**: Overdue tasks ARE automatically marked within 5 minutes of due date passing.
- **SC-005**: Users RECEIVE in-app notifications for approaching deadlines at least 24 hours before due date.
- **SC-006**: Productivity charts LOAD within 3 seconds and display accurate data trends.
- **SC-007**: 90% of users CAN generate and download exports (CSV/PDF) without errors.
- **SC-008**: Export files (CSV/PDF) DOWNLOAD within 10 seconds for up to 10,000 tasks.
- **SC-009**: Users CAN filter tasks by time period (today/week/month) with results displayed within 2 seconds.
- **SC-010**: Notification center displays new notifications within 10 seconds of trigger event.
- **SC-011**: All statistics (completion rate, streaks) are calculated accurately with 100% data consistency.
- **SC-012**: Users CAN understand their productivity trends from visual charts without additional documentation.

## Assumptions

1. In-app notifications are stored in database (no external email service integration required).
2. Auto-overdue check runs on task fetch and via background job for real-time updates.
3. Calendar uses list-grouped views with date headers (not interactive grid).
4. PDF export uses HTML-to-PDF conversion (e.g., jsPDF, pdfkit, or similar library).
5. Analytics data is computed on-demand for MVP (no pre-aggregation tables).
6. All timestamps stored in UTC, displayed in user's local timezone.
7. User authentication is already implemented (existing Better Auth integration).
8. Task model already exists with required fields (due_date, completed, priority, category).
9. Frontend already has component library (Tailwind CSS, lucide icons).
10. Notification badge shown in header is sufficient for notification awareness.

## Dependencies

- **Existing Systems**:
  - Better Auth authentication system (session management, user context)
  - SQLModel database layer (Task, User models)
  - FastAPI backend with existing task routers
  - Next.js frontend with existing component library

- **External Dependencies**:
  - PDF generation library (e.g., jsPDF for frontend or pdfkit for backend)
  - Charting library (e.g., Recharts, Chart.js) - verify existing usage in project
  - Date manipulation library (e.g., date-fns) - verify existing usage

- **Database Migrations Required**:
  - Create `notifications` table
  - Create `notification_preferences` table
  - Add `overdue_notified` column to `tasks` table (optional, can be derived)

## Out of Scope

The following are explicitly NOT included in this specification:

1. Email notifications (only in-app notifications per user clarification).
2. User-created automation rules (only auto-overdue behavior per user clarification).
3. Interactive calendar grid with drag-and-drop (list views only per user clarification).
4. Push notifications for mobile devices.
5. Task sharing or collaboration features.
6. Recurring task automation (single instance handling only).
7. Custom notification sounds or preferences beyond on/off toggles.
8. Export to formats other than CSV and PDF.
9. Real-time notification updates (polling acceptable).
10. Gamification features beyond basic streak tracking.

## Timeline & Phasing

### Phase 1 (Core - 1-2 weeks)
- User profile page (/user route)
- Username update functionality
- User statistics calculation and display
- Auto-overdue logic and visual indicators
- Overdue count in dashboard stats

### Phase 2 (Analytics - 1-2 weeks)
- Productivity charts (daily, weekly, monthly)
- Weekly report generation
- Monthly report generation
- Completion rate visualization

### Phase 3 (Notifications - 1 week)
- Notification database storage
- In-app notification system
- Notification center UI
- Due date reminder triggers

### Phase 4 (Calendar & Export - 1 week)
- Calendar view with time filters
- CSV export functionality
- PDF export functionality

**Total Estimated Time**: 4-7 weeks depending on team velocity and priorities.

## Security Considerations

- **Authentication**: All new endpoints MUST require authentication (existing Better Auth integration).
- **Authorization**: Users can ONLY access their own notifications, stats, and data (user isolation).
- **Input Validation**: All user inputs (username, filters, exports) MUST be validated and sanitized.
- **Rate Limiting**: Export endpoints SHOULD have rate limiting to prevent abuse.
- **Data Privacy**: User statistics and history MUST NOT be accessible to other users.
- **Export Security**: Exports MUST only include the requesting user's data.

## Performance Requirements

- **API Response Times**:
  - Profile/stats endpoints: < 500ms
  - Analytics chart data: < 2 seconds
  - Export generation: < 10 seconds for 10,000 tasks
  - Notification list: < 1 second

- **Database**:
  - Efficient indexes on notification user_id, created_at
  - Indexed queries for overdue tasks
  - Pagination for notification list

- **Scalability**:
  - Support up to 10,000 tasks per user
  - Support up to 1,000 notifications per user
  - Handle concurrent export requests
