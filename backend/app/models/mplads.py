"""Normalized MPLADS representative, constituency, and work models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import House, house_enum


class Constituency(Base):
    __tablename__ = "constituencies"
    __table_args__ = (
        UniqueConstraint("house", "state_normalized", "district_normalized", "name_normalized", name="uq_constituency_natural_key"),
        Index("ix_constituency_filter", "house", "state_normalized", "district_normalized"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    house: Mapped[House] = mapped_column(house_enum(), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_normalized: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    state_normalized: Mapped[str] = mapped_column(String(128), nullable=False)
    district: Mapped[str] = mapped_column(String(255), nullable=False)
    district_normalized: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    representatives: Mapped[list["Representative"]] = relationship(back_populates="constituency")
    works: Mapped[list["Work"]] = relationship(back_populates="constituency")


class Representative(Base):
    __tablename__ = "representatives"
    __table_args__ = (
        UniqueConstraint("house", "name_normalized", "constituency_id", name="uq_representative_natural_key"),
        Index("ix_representative_ranking", "house", "constituency_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    house: Mapped[House] = mapped_column(house_enum(), nullable=False, index=True)
    constituency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("constituencies.id", ondelete="RESTRICT"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_normalized: Mapped[str] = mapped_column(String(255), nullable=False)
    name_hi: Mapped[str | None] = mapped_column(String(255))
    source_party_label: Mapped[str | None] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    constituency: Mapped[Constituency] = relationship(back_populates="representatives")
    works: Mapped[list["Work"]] = relationship(back_populates="representative")


class Work(Base):
    __tablename__ = "works"
    __table_args__ = (
        UniqueConstraint("house", "source_work_id", name="uq_work_house_source_work_id"),
        UniqueConstraint("source_record_id", name="uq_work_source_record_id"),
        Index("ix_work_peer_dimensions", "house", "category_normalized", "completion_year", "constituency_id"),
        Index("ix_work_geo_peer_dimensions", "house", "geo_district_normalized", "category_normalized", "completion_year"),
        Index("ix_work_cost_analysis", "completion_year", "sanctioned_cost"),
        Index("ix_work_search_dimensions", "representative_id", "category_normalized", "completion_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("datasets.id", ondelete="RESTRICT"), nullable=False, index=True)
    house: Mapped[House] = mapped_column(house_enum(), nullable=False, index=True)
    constituency_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("constituencies.id", ondelete="RESTRICT"), nullable=False, index=True)
    representative_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("representatives.id", ondelete="RESTRICT"), nullable=False, index=True)
    source_record_id: Mapped[str] = mapped_column(String(128), nullable=False)
    source_work_id: Mapped[str] = mapped_column(String(128), nullable=False)
    source_row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    work_description: Mapped[str] = mapped_column(Text, nullable=False)
    work_description_normalized: Mapped[str] = mapped_column(Text, nullable=False)
    work_description_hi: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    category_normalized: Mapped[str] = mapped_column(String(255), nullable=False)
    category_hi: Mapped[str | None] = mapped_column(String(255))
    sanctioned_cost: Mapped[Decimal] = mapped_column(Numeric(16, 2), nullable=False)
    completion_date: Mapped[date | None] = mapped_column(Date)
    completion_year: Mapped[int | None] = mapped_column(Integer, index=True)
    beneficiaries: Mapped[int | None] = mapped_column(Integer)
    location: Mapped[str | None] = mapped_column(Text)
    location_hi: Mapped[str | None] = mapped_column(Text)
    source_district: Mapped[str | None] = mapped_column(String(255))
    source_district_hi: Mapped[str | None] = mapped_column(String(255))
    geo_district: Mapped[str | None] = mapped_column(String(255), index=True)
    geo_district_normalized: Mapped[str | None] = mapped_column(String(255), index=True)
    state_hi: Mapped[str | None] = mapped_column(String(128))
    downloaded_state: Mapped[str | None] = mapped_column(String(128))
    raw_payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    # Reserved only: ingestion never generates an embedding in Step 3.
    description_embedding: Mapped[Any | None] = mapped_column(Vector(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    constituency: Mapped[Constituency] = relationship(back_populates="works")
    representative: Mapped[Representative] = relationship(back_populates="works")
