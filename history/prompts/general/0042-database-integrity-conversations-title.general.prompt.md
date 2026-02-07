---
ID: 0042
TITLE: Database Integrity: Add Conversations Title Column
STAGE: general
DATE_ISO: 2026-02-07
SURFACE: agent
MODEL: gemini-3-flash
FEATURE: none
BRANCH: 004-user-analytics-dashboard
USER: hunain
COMMAND: Check if the 'title' column exists in the 'conversations' table in the database...
LABELS: ["database", "alembic", "migrations", "chatkit"]
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML: |
  - backend/src/database/alembic/versions/006_add_conversation_title.py
  - backend/src/api/chatkit_router.py
TESTS_YAML: |
  - alembic upgrade head
PROMPT_TEXT: |
  Check if the 'title' column exists in the 'conversations' table in the database.
  1. List alembic versions in `backend/src/database/alembic/versions/`.
  2. Check if there's a migration for adding the 'title' column.
  3. If not, generate a new migration using alembic.
  4. Apply the migration.

  Also, verify if `backend/src/api/chatkit_router.py` is correctly implementing `load_threads` to return the title in metadata.
RESPONSE_TEXT: |
  Verified that the `title` column was defined in the `Conversation` model but missing from the Alembic migration history. Although the column existed in the physical database, I created and applied a defensive migration (`006_add_conversation_title.py`) to synchronize the Alembic state. Additionally, I updated `backend/src/api/chatkit_router.py` to ensure the `title` is included in the `metadata` for both `load_thread` and `load_threads` methods, as required by the frontend.
OUTCOME: SUCCESS
EVALUATION: |
  The database schema is now in sync with the models and the migration history. The ChatKit router correctly serves the title in the metadata, improving frontend compatibility.
---
