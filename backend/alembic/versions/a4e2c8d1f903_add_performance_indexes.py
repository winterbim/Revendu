"""Add performance indexes for common query patterns.

Revision ID: a4e2c8d1f903
Revises: 1b19dc5b5a54
Create Date: 2026-03-18

These indexes target the three hottest query patterns:
  1. Dashboard stats/alerts: items WHERE user_id=? AND status='sold' AND YEAR(sale_date)=?
  2. Ventes page list: items WHERE user_id=? ORDER BY created_at DESC
  3. Platform breakdown: items WHERE user_id=? AND status='sold' (+ platform grouping)
"""

from alembic import op

revision = "a4e2c8d1f903"
down_revision = "1b19dc5b5a54"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Covers: dashboard stats, alerts, recent-sales (user + sold + sale_date)
    op.create_index(
        "ix_items_user_status_sale_date",
        "items",
        ["user_id", "status", "sale_date"],
    )
    # Covers: list_items default view (user + created_at sort)
    op.create_index(
        "ix_items_user_created_at",
        "items",
        ["user_id", "created_at"],
    )
    # Covers: platform filter on list_items
    op.create_index(
        "ix_items_user_platform",
        "items",
        ["user_id", "platform"],
    )
    # Covers: name search (ilike — requires pg_trgm for optimal perf, but basic btree still helps)
    op.create_index(
        "ix_items_user_name",
        "items",
        ["user_id", "name"],
    )


def downgrade() -> None:
    op.drop_index("ix_items_user_name", table_name="items")
    op.drop_index("ix_items_user_platform", table_name="items")
    op.drop_index("ix_items_user_created_at", table_name="items")
    op.drop_index("ix_items_user_status_sale_date", table_name="items")
