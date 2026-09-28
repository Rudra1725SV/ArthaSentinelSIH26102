"""Create the normalized real MPLADS data foundation.

Revision ID: 20260905_0002
Revises: 20260905_0001
Create Date: 2026-09-05 00:00:01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

revision = "20260905_0002"
down_revision = "20260905_0001"
branch_labels = None
depends_on = None

house_type = postgresql.ENUM("Lok Sabha", "Rajya Sabha", name="house_type", create_type=False)
ingestion_status = postgresql.ENUM("running", "completed", "completed_with_rejections", "failed", name="ingestion_status", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    postgresql.ENUM("Lok Sabha", "Rajya Sabha", name="house_type").create(bind, checkfirst=True)
    postgresql.ENUM("running", "completed", "completed_with_rejections", "failed", name="ingestion_status").create(bind, checkfirst=True)

    op.create_table(
        "datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("house", house_type, nullable=False),
        sa.Column("source_file", sa.String(length=512), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("source_row_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("house", "sha256", name="uq_dataset_house_sha256"),
    )
    op.create_index("ix_datasets_house", "datasets", ["house"])
    op.create_table(
        "constituencies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("house", house_type, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("name_normalized", sa.String(length=255), nullable=False),
        sa.Column("state", sa.String(length=128), nullable=False),
        sa.Column("state_normalized", sa.String(length=128), nullable=False),
        sa.Column("district", sa.String(length=255), nullable=False),
        sa.Column("district_normalized", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("house", "state_normalized", "district_normalized", "name_normalized", name="uq_constituency_natural_key"),
    )
    op.create_index("ix_constituency_filter", "constituencies", ["house", "state_normalized", "district_normalized"])
    op.create_table(
        "representatives",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("house", house_type, nullable=False),
        sa.Column("constituency_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("name_normalized", sa.String(length=255), nullable=False),
        sa.Column("name_hi", sa.String(length=255)),
        sa.Column("source_party_label", sa.String(length=128)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["constituency_id"], ["constituencies.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("house", "name_normalized", "constituency_id", name="uq_representative_natural_key"),
    )
    op.create_index("ix_representatives_house", "representatives", ["house"])
    op.create_index("ix_representatives_constituency_id", "representatives", ["constituency_id"])
    op.create_index("ix_representative_ranking", "representatives", ["house", "constituency_id"])
    op.create_table(
        "ingestion_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("house", house_type, nullable=False),
        sa.Column("source_file", sa.String(length=512), nullable=False),
        sa.Column("status", ingestion_status, nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("total_rows", sa.Integer(), nullable=False),
        sa.Column("inserted_rows", sa.Integer(), nullable=False),
        sa.Column("rejected_rows", sa.Integer(), nullable=False),
        sa.Column("duplicate_rows", sa.Integer(), nullable=False),
        sa.Column("error_summary", sa.Text()),
        sa.ForeignKeyConstraint(["dataset_id"], ["datasets.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_ingestion_runs_dataset_id", "ingestion_runs", ["dataset_id"])
    op.create_index("ix_ingestion_runs_house", "ingestion_runs", ["house"])
    op.create_index("ix_ingestion_runs_status", "ingestion_runs", ["status"])
    op.create_table(
        "works",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("house", house_type, nullable=False),
        sa.Column("constituency_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("representative_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_record_id", sa.String(length=128), nullable=False),
        sa.Column("source_work_id", sa.String(length=128), nullable=False),
        sa.Column("source_row_number", sa.Integer(), nullable=False),
        sa.Column("work_description", sa.Text(), nullable=False),
        sa.Column("work_description_normalized", sa.Text(), nullable=False),
        sa.Column("work_description_hi", sa.Text()),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column("category_normalized", sa.String(length=255), nullable=False),
        sa.Column("category_hi", sa.String(length=255)),
        sa.Column("sanctioned_cost", sa.Numeric(16, 2), nullable=False),
        sa.Column("completion_date", sa.Date()),
        sa.Column("completion_year", sa.Integer()),
        sa.Column("beneficiaries", sa.Integer()),
        sa.Column("location", sa.Text()),
        sa.Column("location_hi", sa.Text()),
        sa.Column("source_district", sa.String(length=255)),
        sa.Column("source_district_hi", sa.String(length=255)),
        sa.Column("geo_district", sa.String(length=255)),
        sa.Column("geo_district_normalized", sa.String(length=255)),
        sa.Column("state_hi", sa.String(length=128)),
        sa.Column("downloaded_state", sa.String(length=128)),
        sa.Column("raw_payload", postgresql.JSONB(), nullable=False),
        sa.Column("description_embedding", Vector(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["dataset_id"], ["datasets.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["constituency_id"], ["constituencies.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["representative_id"], ["representatives.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("house", "source_work_id", name="uq_work_house_source_work_id"),
        sa.UniqueConstraint("source_record_id", name="uq_work_source_record_id"),
    )
    op.create_index("ix_works_dataset_id", "works", ["dataset_id"])
    op.create_index("ix_works_house", "works", ["house"])
    op.create_index("ix_works_constituency_id", "works", ["constituency_id"])
    op.create_index("ix_works_representative_id", "works", ["representative_id"])
    op.create_index("ix_works_source_record_id", "works", ["source_record_id"])
    op.create_index("ix_works_completion_year", "works", ["completion_year"])
    op.create_index("ix_works_geo_district", "works", ["geo_district"])
    op.create_index("ix_works_geo_district_normalized", "works", ["geo_district_normalized"])
    op.create_index("ix_work_peer_dimensions", "works", ["house", "category_normalized", "completion_year", "constituency_id"])
    op.create_index("ix_work_geo_peer_dimensions", "works", ["house", "geo_district_normalized", "category_normalized", "completion_year"])
    op.create_index("ix_work_cost_analysis", "works", ["completion_year", "sanctioned_cost"])
    op.create_index("ix_work_search_dimensions", "works", ["representative_id", "category_normalized", "completion_year"])
    op.create_table(
        "rejected_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("ingestion_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_row_number", sa.Integer(), nullable=False),
        sa.Column("source_record_id", sa.String(length=128)),
        sa.Column("rejection_reasons", postgresql.JSONB(), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ingestion_run_id"], ["ingestion_runs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("ingestion_run_id", "source_row_number", name="uq_rejected_run_row"),
    )
    op.create_index("ix_rejected_records_ingestion_run_id", "rejected_records", ["ingestion_run_id"])
    op.create_index("ix_rejected_records_source_record_id", "rejected_records", ["source_record_id"])


def downgrade() -> None:
    op.drop_table("rejected_records")
    op.drop_table("works")
    op.drop_table("ingestion_runs")
    op.drop_table("representatives")
    op.drop_table("constituencies")
    op.drop_table("datasets")
    bind = op.get_bind()
    postgresql.ENUM(name="ingestion_status").drop(bind, checkfirst=True)
    postgresql.ENUM(name="house_type").drop(bind, checkfirst=True)
