---
id: "0029"
title: "Add get_session backward compatibility"
stage: "continuation"
date: "2026-02-06"
surface: "agent"
model: "minimax-m2.1-free"
feature: "none"
branch: "004-user-analytics-dashboard"
user: "hunain"
command: "Fix ImportError for get_session"
labels: ["backend","import","fix","backward-compatibility"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "backend/src/database/database.py"
tests:
  - "Server starts successfully"
  - "All imports work correctly"
---

## Prompt

Server failed to start with ImportError: cannot import name 'get_session' from 'src.database.database'

## Response snapshot

Fixed by adding `get_session()` function to `database.py` for backward compatibility.

### Added function:

```python
def get_session():
    """
    Simple session getter for backward compatibility.

    Returns a session that should be used with context manager
    or explicitly closed after use.
    """
    engine = get_engine()
    if engine is None:
        raise Exception("Database engine not available")
    session = Session(engine)
    session.execute(text("SELECT 1"))
    return session
```

## Outcome

- ✅ Impact: Server starts successfully
- 🧪 Tests: All imports work correctly
- 📁 Files: Updated database.py with backward-compatible function
- 🔁 Next prompts: Verify analytics endpoints work without generator errors

## Evaluation notes (flywheel)

- Failure modes observed: ImportError when server tried to start
- Graders run and results (PASS/FAIL): Server: PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test analytics endpoints for generator errors
