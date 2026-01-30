"""
Phase 3 TDD - Database Migration Tests (RED Phase)

Tests for database migration that creates conversations and messages tables.
Target: 100% migration coverage.

These tests verify that the migration script correctly:
- Creates the conversations table with required columns
- Creates the messages table with required columns
- Creates the correct indexes for performance
"""

import pytest
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


class TestConversationMigration:
    """Test that migration creates conversations table correctly."""

    def test_migration_script_file_exists(self):
        """T009R-1: Migration script file must exist."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        assert migration_path.exists(), "Migration script 003_add_conversations.py must exist"

    def test_migration_creates_conversations_table(self):
        """T009R-2: Migration must create conversations table."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "conversations" in content.lower(), "Migration must reference conversations table"
        assert "op.create_table" in content, "Migration must use op.create_table for conversations"

    def test_conversations_has_required_columns(self):
        """T009R-3: Conversations table must have required columns."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        required_columns = ["id", "user_id", "created_at", "updated_at"]
        for col in required_columns:
            assert col in content, f"Conversations table must have {col} column"

    def test_conversations_has_user_id_foreign_key(self):
        """T009R-4: Conversations must have user_id foreign key to users table."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "users.id" in content or "foreign_key" in content, "Conversations must reference users.id"


class TestMessageMigration:
    """Test that migration creates messages table correctly."""

    def test_migration_creates_messages_table(self):
        """T009R-5: Migration must create messages table."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "messages" in content.lower(), "Migration must reference messages table"
        assert content.count("op.create_table") >= 2, "Migration must create both conversations and messages tables"

    def test_messages_has_required_columns(self):
        """T009R-6: Messages table must have required columns."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        required_columns = ["id", "user_id", "conversation_id", "role", "content", "created_at"]
        for col in required_columns:
            assert col in content, f"Messages table must have {col} column"

    def test_messages_has_conversation_foreign_key(self):
        """T009R-7: Messages must have conversation_id foreign key."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "conversations.id" in content or "conversation_id" in content, "Messages must reference conversations.id"


class TestMigrationIndexes:
    """Test that migration creates correct indexes."""

    def test_conversations_has_user_id_index(self):
        """T009R-8: Conversations must have user_id index."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "index" in content.lower(), "Migration must create indexes"
        assert "user_id" in content, "Index must include user_id"

    def test_messages_has_composite_index(self):
        """T009R-9: Messages should have composite index on conversation_id + created_at."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        has_composite = (
            ("conversation_id" in content and "created_at" in content) or
            "ix_messages" in content
        )
        assert has_composite, "Messages should have index on conversation_id and created_at"

    def test_migration_has_downgrade(self):
        """T009R-10: Migration must have downgrade function."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "def downgrade" in content, "Migration must have downgrade function"
        assert "op.drop_table" in content or "drop_index" in content, "Downgrade must drop created tables/indexes"


class TestMigrationStructure:
    """Test migration script structure."""

    def test_migration_follows_alembic_pattern(self):
        """T009R-11: Migration must follow Alembic patterns."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "def upgrade()" in content, "Migration must have upgrade function"
        assert "def downgrade()" in content, "Migration must have downgrade function"
        assert "from alembic" in content or "import alembic" in content, "Migration must import alembic"

    def test_migration_uses_op_for_ddl(self):
        """T009R-12: Migration must use op for DDL operations."""
        migration_path = Path(__file__).parent.parent.parent / "src" / "database" / "alembic" / "versions" / "003_add_conversations.py"
        content = migration_path.read_text()
        
        assert "op." in content, "Migration must use op for DDL operations (op.create_table, op.create_index, etc.)"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
