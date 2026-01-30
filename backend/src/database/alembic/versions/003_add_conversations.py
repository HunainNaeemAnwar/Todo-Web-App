"""
Alembic Migration: Add Conversations and Messages Tables

Revision ID: 003
Revises: 002
Create Date: 2026-01-22

This migration creates the conversations and messages tables for Phase 3
AI-Powered Conversational Todo Interface.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '003'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create conversations and messages tables with required indexes."""
    
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(64), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    
    # Create composite index for efficient user conversation queries
    op.create_index('ix_conversations_user_created', 'conversations', ['user_id', 'created_at'])
    
    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(64), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('conversation_id', sa.String(64), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', sa.String(20), nullable=False),  # "user" or "assistant"
        sa.Column('content', sa.String(10000), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, index=True),
    )
    
    # Create composite index for efficient conversation history queries
    op.create_index('ix_messages_conversation_created', 'messages', ['conversation_id', 'created_at'])
    
    # Create composite index for user-level message queries
    op.create_index('ix_messages_user_created', 'messages', ['user_id', 'created_at'])


def downgrade() -> None:
    """Drop conversations and messages tables and indexes."""
    
    # Drop indexes first (order matters for foreign key constraints)
    op.drop_index('ix_messages_user_created', table_name='messages')
    op.drop_index('ix_messages_conversation_created', table_name='messages')
    op.drop_index('ix_conversations_user_created', table_name='conversations')
    
    # Drop tables
    op.drop_table('messages')
    op.drop_table('conversations')
