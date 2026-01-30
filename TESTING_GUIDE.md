# Testing Guide - All Changes

## Summary of Changes

### 1. Database Connection Fixes ✅
- **Issue**: Neon PostgreSQL connections closing unexpectedly
- **Fix**: Connection pool recycle time reduced to 300s (5 minutes)
- **Result**: No more "connection closed unexpectedly" errors

### 2. MCP Tool Retry Logic ✅
- **Issue**: MCP tools timing out after 30 seconds
- **Fix**: Added automatic retry logic (2 retries, 0.5s delay)
- **Result**: No more "Timed out while waiting for response" errors

### 3. Enhanced Agent Instructions ✅
- **Feature**: Agent now generates detailed task descriptions automatically
- **Behavior**: When user provides only a title, agent creates 2-4 sentence description
- **Example**: "Buy groceries" → Full description with actionable details

### 4. Refresh Button ✅
- **Feature**: Refresh button in task list section
- **Behavior**: Refreshes only the task list (no page reload)
- **UI**: Shows spinning icon during loading, disabled while fetching

---

## How to Run

### Terminal 1: Start Backend
```bash
cd /home/hunain/DO/it/backend
./start_backend.sh
# OR
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Start Frontend
```bash
cd /home/hunain/DO/it/frontend
./start_frontend.sh
# OR
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Testing Each Feature

### Test 1: Database Connection Stability
**What to test**: Database connections should not fail after 5+ minutes of inactivity

**Steps**:
1. Start the backend server
2. Create a task via the UI
3. Wait 6-7 minutes without any activity
4. Try to create another task or refresh the task list
5. **Expected**: Task creation/refresh works without errors
6. **Before fix**: Would see "connection closed unexpectedly" error

**Verification**:
```bash
# Check connection pool settings
cd /home/hunain/DO/it/backend
python3 -c "from src.database.database import engine; print(f'Pool recycle: {engine.pool._recycle}s')"
# Should show: Pool recycle: 300s
```

---

### Test 2: MCP Tool Reliability
**What to test**: MCP tools should automatically retry on connection failures

**Steps**:
1. Open the AI chat assistant in the UI
2. Ask: "List my tasks"
3. **Expected**: Tasks are listed successfully
4. **Before fix**: Would timeout after 30 seconds

**Verification**:
```bash
# Check MCP timeout setting
cd /home/hunain/DO/it/backend
grep "client_session_timeout_seconds" src/api/chatkit_router.py
# Should show: client_session_timeout_seconds=60
```

**Monitor logs for retry messages**:
```bash
tail -f /tmp/mcp_server.log
# Look for: "retrying (1/2)" or "retrying (2/2)"
```

---

### Test 3: Agent Generates Descriptive Descriptions
**What to test**: Agent should create detailed descriptions even when user only provides a title

**Steps**:
1. Open the AI chat assistant
2. Say: "Add a task: Buy groceries"
3. **Expected**: Agent creates task with detailed description like:
   - Title: "Buy groceries"
   - Description: "Purchase weekly groceries including fresh vegetables, fruits, dairy products, and pantry staples. Check the refrigerator before shopping to avoid duplicates. Remember to bring reusable bags and check for any sales or coupons."

**More test cases**:
- "Add task: Fix login bug" → Should get detailed technical description
- "Create task: Call dentist" → Should get appointment scheduling details
- "New task: Update documentation" → Should get specific documentation steps

**Verification**:
```bash
# Verify agent instructions include guidelines
cd /home/hunain/DO/it/backend
grep -A 5 "Task Creation Guidelines" src/api/chatkit_router.py
# Should show the detailed guidelines
```

---

### Test 4: Refresh Button
**What to test**: Refresh button should update task list without page reload

**Steps**:
1. Open the dashboard at http://localhost:3000
2. Create a task using the form
3. Click the refresh button (🔄) next to "Your Tasks"
4. **Expected**: 
   - Icon spins while loading
   - Task list updates with latest data
   - Page does NOT reload
   - URL stays the same
   - No flash/blink of entire page

**Visual indicators**:
- Button shows spinning icon during refresh
- Button is disabled (grayed out) while loading
- Task count updates if tasks were added/removed

**Test edge cases**:
- Click refresh multiple times rapidly → Should handle gracefully
- Refresh while offline → Should show error message
- Refresh with no tasks → Should show "No tasks yet" message

---

## Troubleshooting

### Backend Issues

**Issue**: "Module not found" errors
```bash
cd /home/hunain/DO/it/backend
export PYTHONPATH=$PWD
uvicorn src.main:app --reload
```

**Issue**: Database connection errors
```bash
# Check .env file has correct DATABASE_URL
cat .env | grep DATABASE_URL
# Should show Neon PostgreSQL connection string
```

**Issue**: MCP server not starting
```bash
# Check MCP server logs
tail -f /tmp/mcp_server.log
```

### Frontend Issues

**Issue**: "Module not found" errors
```bash
cd /home/hunain/DO/it/frontend
rm -rf node_modules .next
npm install
npm run dev
```

**Issue**: Refresh button not appearing
```bash
# Verify the component was updated
grep "RefreshCw" src/components/Dashboard.tsx
# Should show the import and usage
```

**Issue**: API connection errors
```bash
# Check .env.local has correct API URL
cat .env.local | grep NEXT_PUBLIC_API_BASE_URL
# Should show: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Verification Checklist

Before considering testing complete, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create tasks via UI form
- [ ] Can create tasks via AI chat
- [ ] AI generates detailed descriptions for tasks
- [ ] Refresh button appears in task list section
- [ ] Clicking refresh updates task list without page reload
- [ ] Refresh button shows loading state (spinning icon)
- [ ] No database connection errors after 5+ minutes
- [ ] MCP tools respond within 60 seconds
- [ ] Task list updates when tasks are added/deleted

---

## Performance Expectations

### Database Operations
- Task creation: < 500ms
- Task list fetch: < 300ms
- Task update: < 400ms
- Task deletion: < 300ms

### MCP Tool Operations
- list_tasks: < 5s (including retries)
- add_task: < 5s (including retries)
- complete_task: < 5s (including retries)
- delete_task: < 5s (including retries)
- update_task: < 5s (including retries)

### UI Responsiveness
- Refresh button click → Loading state: < 100ms
- Task list update after refresh: < 2s
- Page interactions remain responsive during refresh

---

## Success Criteria

All features are working correctly if:

1. ✅ No database connection errors in logs
2. ✅ No MCP timeout errors in logs
3. ✅ Agent creates descriptive task descriptions
4. ✅ Refresh button updates task list without page reload
5. ✅ All CRUD operations work smoothly
6. ✅ AI chat assistant responds within reasonable time
7. ✅ UI remains responsive during all operations

---

## Additional Notes

### Database Connection Pool
- Pool size: 5 connections
- Max overflow: 10 connections
- Recycle time: 300 seconds (5 minutes)
- Pre-ping enabled: Yes
- TCP keepalives: Enabled

### MCP Configuration
- Timeout: 60 seconds
- Retry attempts: 2
- Retry delay: 0.5 seconds
- Connection error detection: Automatic

### Agent Behavior
- Always generates descriptions for tasks
- Uses 2-4 sentences for descriptions
- Includes actionable details and context
- Follows examples provided in instructions

