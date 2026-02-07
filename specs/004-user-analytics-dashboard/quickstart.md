# Quickstart: User Analytics Dashboard

**Branch**: `004-user-analytics-dashboard`  
**Created**: 2026-02-02

## Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- PostgreSQL database (Neon)
- Existing task management app running

## Installation

### Frontend Dependencies

```bash
cd frontend
npm install recharts@2.12.0 date-fns@3.3.0 jspdf@2.5.1 jspdf-autotable@3.8.1
```

### Backend Dependencies

```bash
cd backend
pip install reportlab==4.0.0
```

### Database Migrations

```bash
cd backend
alembic upgrade head
```

## Development Server

### Frontend

```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000

### Backend

```bash
cd backend
python -m uvicorn src.api.main:app --reload
```

API at: http://localhost:8000

## Testing

### Frontend Tests

```bash
cd frontend
npm run test        # Run tests
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage
```

### Backend Tests

```bash
cd backend
pytest tests/ -v           # Run all tests
pytest tests/ -v --cov     # With coverage
pytest tests/unit/ -v      # Unit tests only
pytest tests/integration/ -v  # Integration tests
```

## Key Routes

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/user` | User profile and statistics |
| `/analytics` | Productivity charts and reports |
| `/` | Dashboard with overdue count |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update username |
| GET | `/api/user/stats` | Get user statistics |
| GET | `/api/user/notifications` | List notifications |
| PUT | `/api/user/notifications/{id}/read` | Mark read |
| PUT | `/api/user/notifications/read-all` | Mark all read |
| GET | `/api/analytics/productivity` | Chart data |
| GET | `/api/analytics/weekly-report` | Weekly report |
| GET | `/api/analytics/monthly-report` | Monthly report |
| GET | `/api/tasks/calendar` | Filtered tasks |
| GET | `/api/tasks/export/csv` | CSV export |

## Feature Walkthrough

### 1. User Profile

1. Navigate to `/user`
2. View current username, email, join date
3. Update username and save
4. See updated name across app

### 2. Statistics Dashboard

1. Navigate to `/user` or `/analytics`
2. View total tasks, completed, completion rate
3. See current streak and best streak
4. View weekly activity chart

### 3. Overdue Tasks

1. Create task with past due date
2. Navigate to Dashboard
3. See overdue count in stats
4. Task shows overdue indicator (red border/badge)

### 4. Productivity Charts

1. Navigate to `/analytics`
2. View daily completion chart (default)
3. Toggle between daily/weekly/monthly views
4. See completion trends

### 5. Reports

1. Navigate to `/analytics`
2. View weekly report summary
3. View monthly report with comparisons
4. See daily breakdown and trends

### 6. Notifications

1. Create task due tomorrow
2. See notification bell with badge
3. Click bell to open notification center
4. View, dismiss, or mark as read notifications

### 7. Calendar Views

1. On Dashboard, use calendar filter
2. Toggle: Today / This Week / This Month / All
3. See tasks grouped by day
4. Clear date labels

### 8. Export Tasks

1. On Dashboard, click Export CSV
2. Download CSV file
3. Open in spreadsheet to verify data
4. Click Export PDF for PDF report

## Troubleshooting

### Frontend Issues

| Issue | Solution |
|-------|----------|
| Charts not rendering | Check Recharts installation, console for errors |
| Date formatting issues | Verify date-fns import, check timezone |
| PDF not downloading | Check jsPDF installation, browser console |

### Backend Issues

| Issue | Solution |
|-------|----------|
| API 404 | Verify route paths, check router registration |
| Database errors | Run migrations, check connection string |
| Statistics wrong | Check streak calculation logic, run tests |

### Common Fixes

```bash
# Clear frontend cache
cd frontend
rm -rf .next node_modules/.cache

# Reset database
cd backend
alembic downgrade -1
alembic upgrade head

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## API Testing

### cURL Examples

```bash
# Get user profile
curl -X GET http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer <token>"

# Update username
curl -X PUT http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Username"}'

# Get stats
curl -X GET http://localhost:8000/api/user/stats \
  -H "Authorization: Bearer <token>"

# Export CSV
curl -X GET http://localhost:8000/api/tasks/export/csv \
  -H "Authorization: Bearer <token>" \
  -o tasks.csv
```

## Performance Targets

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Profile load | < 500ms | Network tab, API response time |
| Stats API | < 500ms | API timing, database query |
| Charts load | < 3 seconds | Browser dev tools |
| Export (10k) | < 10 seconds | Download time |
| Notifications | < 10 seconds | Polling interval + render |
