# Research & Technical Decisions: User Analytics Dashboard

**Branch**: `004-user-analytics-dashboard`  
**Created**: 2026-02-02

## Technology Selection Decisions

### Charting Library

| Library | Decision | Rationale |
|---------|----------|-----------|
| **Recharts** | ✅ Selected | React-native, tree-shakeable bundle, popular (20k+ stars), excellent TypeScript support |
| Chart.js | ❌ Rejected | More framework-agnostic, less React-optimized |
| Chartist | ❌ Rejected | Less active maintenance, fewer features |

### Date Manipulation Library

| Library | Decision | Rationale |
|---------|----------|-----------|
| **date-fns** | ✅ Selected | Tree-shakeable (import only what you need), functional API, excellent TypeScript |
| Day.js | ❌ Rejected | Similar to date-fns but date-fns has better tree-shaking |
| Moment.js | ❌ Rejected | Large bundle size, deprecated maintenance mode |

### PDF Generation

| Library | Decision | Rationale |
|---------|----------|-----------|
| **jsPDF (frontend)** | ✅ Selected | Client-side generation, no server load, instant downloads, smaller bundle than server alternatives |
| reportlab (backend) | ✅ Backup | Server-side option if client-side insufficient |
| WeasyPrint | ❌ Rejected | Requires system dependencies (GTK), harder to deploy |
| PDFKit | ❌ Rejected | Node.js focused, less Python integration |

### Notification Strategy

| Approach | Decision | Rationale |
|----------|----------|-----------|
| **Database + Polling** | ✅ Selected | Simple, reliable, no WebSocket server needed, works with existing infrastructure |
| WebSockets | ❌ Rejected | Additional server complexity, connection management overhead |
| Server-Sent Events | ❌ Rejected | Good alternative but polling sufficient for this use case |

## Pattern Decisions

### Statistics Calculation

**Pattern**: On-demand computation with caching

**Rationale**: 
- Simpler than pre-aggregation tables for MVP
- 10k tasks/user is within acceptable compute range
- Can optimize with materialized views later if needed

### Streak Calculation

**Algorithm**: Consecutive days with at least one completed task

**Implementation**:
```python
def calculate_streak(tasks: list[Task]) -> int:
    completed_dates = sorted(set(
        t.completed_at.date() 
        for t in tasks 
        if t.completed
    ))
    # Count consecutive days from today backwards
```

### Auto-Overdue Detection

**Pattern**: Derived/computed field (not stored)

**Rationale**:
- Simpler data model (no sync needed)
- Always accurate (no stale data)
- Query: `WHERE due_date < NOW() AND completed = FALSE`

## Implementation Patterns

### API Response Patterns

**Pagination**: Cursor-based for notifications
```python
class PaginationParams:
    limit: int = 20
    cursor: str | None = None  # last notification ID
```

**Error Handling**: Standard FastAPI HTTPException with user-friendly messages

### Frontend State Management

**Charts**: Local component state + SWR for data fetching
**Notifications**: SWR with interval polling (30 seconds)
**User Stats**: React Query or SWR with cache

## Alternatives Considered and Rejected

| Alternative | Why Rejected |
|-------------|--------------|
| Pre-aggregated analytics tables | Over-engineering for 10k tasks/user |
| Real-time notifications (WebSockets) | Adds server complexity, polling sufficient |
| Server-side PDF generation | Adds server load, client-side sufficient |
| Interactive calendar grid | Out of scope per spec (list views only) |

## Security Considerations

- All endpoints require authentication (Better Auth)
- User isolation enforced at database level (user_id filter)
- Export endpoints return only user's own data
- Input validation on all user inputs
- Rate limiting on export endpoints (prevent abuse)

## Performance Considerations

- Analytics queries optimized with indexes on created_at, completed_at
- Pagination on notification list
- Client-side PDF generation (no server bottleneck)
- Efficient streak calculation (single DB query)
