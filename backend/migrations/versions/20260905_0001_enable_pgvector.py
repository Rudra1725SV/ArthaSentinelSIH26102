"""Enable pgvector support.

Revision ID: 20260905_0001
Revises:
Create Date: 2026-09-05 00:00:00
"""

from alembic import op

revision = "20260905_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    # Extensions can be shared by later migrations, so do not remove it.
    pass
