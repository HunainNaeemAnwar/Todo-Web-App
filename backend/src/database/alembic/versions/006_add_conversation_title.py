"""Add title column to conversations table

Revision ID: 006
Revises: 005
Create Date: 2026-02-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add title column to conversations table if it doesn't exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('conversations')]

    if 'title' not in columns:
        op.add_column('conversations', sa.Column('title', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Drop title column from conversations table if it exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('conversations')]

    if 'title' in columns:
        op.drop_column('conversations', 'title')
