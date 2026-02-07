"""Add notifications and notification_preferences tables

Revision ID: 005
Revises: 004
Create Date: 2026-02-02 18:50:00.000000

"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create notification_preferences table
    op.create_table(
        "notification_preferences",
        sa.Column(
            "user_id", sa.String(64), sa.ForeignKey("users.id"), primary_key=True
        ),
        sa.Column("notify_due_soon", sa.Boolean, default=True),
        sa.Column("notify_overdue", sa.Boolean, default=True),
        sa.Column("notify_streaks", sa.Boolean, default=True),
    )

    # Create notifications table
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), index=True),
        sa.Column("type", sa.String(32)),
        sa.Column("title", sa.String(255)),
        sa.Column("message", sa.String(1000)),
        sa.Column("task_id", sa.String(64), sa.ForeignKey("tasks.id"), nullable=True),
        sa.Column("read", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), index=True),
    )

    # Create composite index for unread notifications
    op.create_index(
        "ix_notifications_user_read", "notifications", ["user_id", "read", "created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_table("notifications")
    op.drop_table("notification_preferences")
