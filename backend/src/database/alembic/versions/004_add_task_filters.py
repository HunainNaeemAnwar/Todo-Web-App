"""Add priority, category, and due_date to tasks

Revision ID: 004
Revises: 003
Create Date: 2026-01-30 22:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(length=20), nullable=True, server_default='medium'))
    op.add_column('tasks', sa.Column('category', sa.String(length=20), nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
    
    # Create indexes for better query performance
    op.create_index('ix_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('ix_tasks_user_category', 'tasks', ['user_id', 'category'])
    op.create_index('ix_tasks_user_due_date', 'tasks', ['user_id', 'due_date'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_tasks_user_due_date', table_name='tasks')
    op.drop_index('ix_tasks_user_category', table_name='tasks')
    op.drop_index('ix_tasks_user_priority', table_name='tasks')
    
    # Drop columns
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'category')
    op.drop_column('tasks', 'priority')
