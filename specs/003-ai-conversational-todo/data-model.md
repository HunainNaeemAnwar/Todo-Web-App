# Data Model: Phase 3 AI-Powered Conversational Todo

## Overview

This document defines the data models for the conversational todo feature. Phase 3 introduces two new models: `Conversation` and `Message`. The existing `Task` model from Phase 2 remains unchanged.

## Models

### Conversation

Represents a chat session between the user and the AI assistant.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | str | PK, max_length=64 | UUID | Unique conversation identifier |
| user_id | str | FK → users.id, max_length=64, index | - | Owner of conversation |
| created_at | datetime | index | now(utc) | Creation timestamp |
| updated_at | datetime | - | now(utc) | Last activity timestamp |

#### SQLModel Definition

```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=64
    )
    user_id: str = Field(
        foreign_key="users.id",
        max_length=64,
        index=True
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
```

#### Indexes

- `ix_conversations_user_created`: (user_id, created_at) - For fetching user's conversations ordered by time

---

### Message

Represents a single message within a conversation.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | str | PK, max_length=64 | UUID | Unique message identifier |
| user_id | str | FK → users.id, max_length=64, index | - | Owner of message |
| conversation_id | str | FK → conversations.id, max_length=64, index | - | Parent conversation |
| role | str | max_length=20 | - | "user" or "assistant" |
| content | str | max_length=10000 | - | Message text content |
| created_at | datetime | index | now(utc) | Message timestamp |

#### SQLModel Definition

```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"
    
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=64
    )
    user_id: str = Field(
        foreign_key="users.id",
        max_length=64,
        index=True
    )
    conversation_id: str = Field(
        foreign_key="conversations.id",
        max_length=64,
        index=True
    )
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str = Field(max_length=10000)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True
    )
```

#### Indexes

- `ix_messages_conversation_created`: (conversation_id, created_at) - For loading conversation history
- `ix_messages_user_created`: (user_id, created_at) - For user-level queries

---

### Task (Existing - Phase 2)

No changes required for Phase 3. Reuses existing Task model.

| Field | Type | Description |
|-------|------|-------------|
| id | str | Task identifier |
| user_id | str | Owner |
| title | str | Task title |
| description | str | Optional description |
| completed | bool | Completion status |
| created_at | datetime | Creation time |
| updated_at | datetime | Last update time |

---

## Relationships

```
User (1) ────< (N) Conversation
    │
    └───< (N) Message
             │
             └───> (1) Conversation
```

- A User can have multiple Conversations
- A Conversation belongs to one User
- A Conversation has multiple Messages
- A Message belongs to one Conversation and one User

---

## Database Migrations

### Create Tables (Alembic)

```python
# backend/src/database/alembic/versions/003_add_conversations.py

def upgrade():
    # Create conversations table
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), index=True),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    
    # Create messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), index=True),
        sa.Column("conversation_id", sa.String(64), sa.ForeignKey("conversations.id"), index=True),
        sa.Column("role", sa.String(20)),
        sa.Column("content", sa.String(10000)),
        sa.Column("created_at", sa.DateTime(timezone=True), index=True),
    )
    
    # Create composite index for efficient history queries
    op.create_index("ix_messages_conversation_created", "messages", ["conversation_id", "created_at"])

def downgrade():
    op.drop_index("ix_messages_conversation_created", table_name="messages")
    op.drop_table("messages")
    op.drop_table("conversations")
```

---

## Service Layer

### ConversationService

```python
class ConversationService:
    """Handles conversation and message CRUD operations"""
    
    async def create_conversation(self, user_id: str) -> Conversation:
        """Create a new conversation for a user"""
    
    async def get_conversation(self, conversation_id: str, user_id: str) -> Conversation | None:
        """Get a conversation if owned by user"""
    
    async def get_conversation_messages(
        self, 
        conversation_id: str, 
        user_id: str,
        limit: int = 100
    ) -> list[Message]:
        """Get message history for a conversation (user-isolated)"""
    
    async def add_message(
        self,
        conversation_id: str,
        user_id: str,
        role: str,  # "user" or "assistant"
        content: str
    ) -> Message:
        """Add a message to a conversation"""
    
    async def update_conversation_timestamp(self, conversation_id: str, user_id: str):
        """Update updated_at when new message is added"""
```

---

## Key Design Decisions

1. **user_id on Message**: Included for direct user isolation queries without joins
2. **Indexed created_at**: Critical for efficient history loading ordered by time
3. **No soft delete**: Messages are permanent (conversation continuity)
4. **Max content length**: 10,000 chars per message (prevents abuse)
5. **UUID IDs**: Distributed ID generation without DB sequence bottlenecks
