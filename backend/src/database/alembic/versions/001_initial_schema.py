"""
Alembic Migration: Initial Schema Setup

Revision ID: 001
Revises: None
Create Date: 2026-01-23

This migration creates the initial database schema with users and tasks tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial tables: users and tasks."""

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(64), primary_key=True, nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(64), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.String(2000), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),  # pending, in_progress, completed
        sa.Column('priority', sa.String(10), nullable=False, default='medium'),  # low, medium, high
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
    )

    # Create indexes for efficient queries
    op.create_index('ix_tasks_user_status', 'tasks', ['user_id', 'status'])
    op.create_index('ix_tasks_user_created', 'tasks', ['user_id', 'created_at'])
    op.create_index('ix_users_email', 'users', ['email'])


def downgrade() -> None:
    """Drop initial tables."""

    # Drop indexes
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_tasks_user_created', table_name='tasks')
    op.drop_index('ix_tasks_user_status', table_name='tasks')

    # Drop tables
    op.drop_table('tasks')
    op.drop_table('users')