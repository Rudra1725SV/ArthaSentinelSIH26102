"""DetectionResult — persisted per-work anomaly detection output."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DetectionResult(Base):
    """
    Stores the complete detection pipeline output for a single MPLADS work.
    One row per work (1:1 with works.id).
    """
    __tablename__ = "detection_results"
    __table_args__ = (
        UniqueConstraint("work_id", name="uq_detection_work_id"),
        Index("ix_detection_risk_score", "risk_score"),
        Index("ix_detection_risk_band", "risk_band"),
        Index("ix_detection_representative", "representative_id"),
        Index("ix_detection_flagged", "is_flagged"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    work_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("works.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    representative_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("representatives.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # ── Peer group baseline ──────────────────────────────────────────────────
    peer_group_id: Mapped[str | None] = mapped_column(String(512))
    peer_group_level: Mapped[int | None] = mapped_column(Integer)   # 1–7 hierarchy level
    peer_group_size: Mapped[int | None] = mapped_column(Integer)
    peer_median: Mapped[float | None] = mapped_column(Float)
    peer_mean: Mapped[float | None] = mapped_column(Float)
    peer_q1: Mapped[float | None] = mapped_column(Float)
    peer_q3: Mapped[float | None] = mapped_column(Float)
    peer_iqr: Mapped[float | None] = mapped_column(Float)
    peer_mad: Mapped[float | None] = mapped_column(Float)
    peer_effective_mad: Mapped[float | None] = mapped_column(Float)

    # ── Cost anomaly signals ─────────────────────────────────────────────────
    cost_to_peer_median_ratio: Mapped[float | None] = mapped_column(Float)
    relative_deviation: Mapped[float | None] = mapped_column(Float)   # (cost - median) / median
    robust_z: Mapped[float | None] = mapped_column(Float)
    iqr_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mad_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cost_anomaly_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cost_anomaly_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cost_evidence: Mapped[str | None] = mapped_column(Text)

    # ── Text / semantic signals ───────────────────────────────────────────────
    nearest_related_work_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    nearest_similarity_score: Mapped[float | None] = mapped_column(Float)
    semantic_duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    exact_duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    high_frequency_duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    very_high_similarity_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    strong_contextual_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    text_anomaly_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    text_anomaly_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    text_evidence: Mapped[str | None] = mapped_column(Text)

    # ── Pattern signals ───────────────────────────────────────────────────────
    duplicate_pattern_strength: Mapped[str | None] = mapped_column(String(32))   # NONE/LOW/MODERATE/HIGH/VERY_HIGH
    pattern_record_count: Mapped[int | None] = mapped_column(Integer)
    repetitive_pattern_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Composite risk ────────────────────────────────────────────────────────
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    risk_band: Mapped[str] = mapped_column(String(16), default="NONE", nullable=False)   # NONE/LOW/MODERATE/HIGH/CRITICAL
    primary_risk_reason: Mapped[str | None] = mapped_column(String(255))
    risk_explanation: Mapped[str | None] = mapped_column(Text)
    evidence: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    # ── Review / workflow ─────────────────────────────────────────────────────
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    review_status: Mapped[str] = mapped_column(String(64), default="Pending Review", nullable=False)

    # ── Processing metadata ───────────────────────────────────────────────────
    pipeline_version: Mapped[str] = mapped_column(String(32), default="1.0", nullable=False)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
