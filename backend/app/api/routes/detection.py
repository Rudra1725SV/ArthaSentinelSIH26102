"""Detection pipeline routes — run, status, flagged works, benchmark."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, distinct, func, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.models.detection_result import DetectionResult
from app.models.mplads import Representative, Work, Constituency

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Response Schemas ──────────────────────────────────────────────────────────

class RiskDistributionItem(BaseModel):
    band: str
    count: int
    percentage: float


class DetectionSummaryResponse(BaseModel):
    total_works: int
    analyzed_works: int
    flagged_works: int
    review_worthy_works: int  # risk_score >= 20
    risk_distribution: list[RiskDistributionItem]
    cost_anomaly_count: int
    text_anomaly_count: int
    pipeline_status: str
    pipeline_version: str | None = None


class FlaggedWorkItem(BaseModel):
    work_id: str
    source_work_id: str
    mp_name: str
    constituency: str
    state: str
    description: str
    category: str
    sanctioned_cost: float
    risk_score: float
    risk_band: str
    primary_risk_reason: str
    cost_anomaly: bool
    text_anomaly: bool
    peer_median: float | None
    relative_deviation_pct: float | None
    nearest_similarity: float | None
    evidence: dict
    review_status: str


class PaginatedFlaggedResponse(BaseModel):
    works: list[FlaggedWorkItem]
    total: int
    page: int
    limit: int
    total_pages: int


class RunPipelineResponse(BaseModel):
    message: str
    status: str
    works_analyzed: int = 0
    flagged_count: int = 0
    risk_distribution: dict[str, int] = Field(default_factory=dict)
    errors: list[str] = Field(default_factory=list)
    processing_time_seconds: float = 0.0


class BenchmarkClassResult(BaseModel):
    anomaly_class: str
    count: int
    detected: int
    detection_rate_pct: float


class BenchmarkResponse(BaseModel):
    label: str = "Detection Benchmark / Synthetic Validation"
    n_synthetic: int
    n_cost_cases: int
    n_text_cases: int
    cost_detection_rate_pct: float
    text_detection_rate_pct: float
    by_class: list[BenchmarkClassResult]
    note: str = "Synthetic records are never stored in production database."


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _ensure_table(session: Session):
    """Create detection_results table if not exists."""
    from app.db.base import Base
    from app.models import detection_result  # ensure model is imported
    try:
        Base.metadata.create_all(bind=session.bind, checkfirst=True)
    except Exception as e:
        logger.warning("Table creation check: %s", e)


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/detection/run", response_model=RunPipelineResponse, tags=["detection"])
def run_detection_pipeline(
    batch_size: int = Query(default=5000, ge=100, le=25000),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_db_session),
):
    """
    Trigger the ArthaSentinel anomaly detection pipeline.
    Runs synchronously (suitable for demo). For large datasets use background task.
    """
    _ensure_table(session)
    try:
        from app.services.detection_graph import run_detection_pipeline
        result = run_detection_pipeline(session, batch_size=batch_size, offset=offset)
        return RunPipelineResponse(
            message="Detection pipeline completed successfully",
            status="completed",
            **result,
        )
    except Exception as e:
        logger.error("Detection pipeline error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/detection/summary", response_model=DetectionSummaryResponse, tags=["detection"])
def get_detection_summary(session: Session = Depends(get_db_session)):
    """Return aggregate detection stats from persisted results."""
    _ensure_table(session)

    total_works = session.execute(select(func.count(Work.id))).scalar() or 0
    analyzed_works = session.execute(select(func.count(DetectionResult.id))).scalar() or 0

    if analyzed_works == 0:
        return DetectionSummaryResponse(
            total_works=total_works,
            analyzed_works=0,
            flagged_works=0,
            review_worthy_works=0,
            risk_distribution=[],
            cost_anomaly_count=0,
            text_anomaly_count=0,
            pipeline_status="Awaiting Detection Run",
        )

    flagged_works = session.execute(
        select(func.count(DetectionResult.id)).where(DetectionResult.is_flagged == True)
    ).scalar() or 0

    review_worthy = session.execute(
        select(func.count(DetectionResult.id)).where(DetectionResult.risk_score >= 20.0)
    ).scalar() or 0

    cost_anomaly_count = session.execute(
        select(func.count(DetectionResult.id)).where(DetectionResult.cost_anomaly_flag == True)
    ).scalar() or 0

    text_anomaly_count = session.execute(
        select(func.count(DetectionResult.id)).where(DetectionResult.text_anomaly_flag == True)
    ).scalar() or 0

    # Risk distribution
    band_rows = session.execute(
        select(DetectionResult.risk_band, func.count(DetectionResult.id).label("cnt"))
        .group_by(DetectionResult.risk_band)
        .order_by(desc("cnt"))
    ).all()

    band_order = ["CRITICAL", "HIGH", "MODERATE", "LOW", "NONE"]
    band_map = {b: 0 for b in band_order}
    for band, cnt in band_rows:
        if band in band_map:
            band_map[band] = cnt

    dist = [
        RiskDistributionItem(
            band=b,
            count=band_map[b],
            percentage=round(band_map[b] / max(analyzed_works, 1) * 100, 2),
        )
        for b in band_order
    ]

    version = session.execute(
        select(DetectionResult.pipeline_version).limit(1)
    ).scalar()

    return DetectionSummaryResponse(
        total_works=total_works,
        analyzed_works=analyzed_works,
        flagged_works=flagged_works,
        review_worthy_works=review_worthy,
        risk_distribution=dist,
        cost_anomaly_count=cost_anomaly_count,
        text_anomaly_count=text_anomaly_count,
        pipeline_status="Active — Results Available",
        pipeline_version=version,
    )


@router.get("/detection/flagged", response_model=PaginatedFlaggedResponse, tags=["detection"])
def get_flagged_works(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    risk_band: str | None = Query(default=None),
    min_risk_score: float = Query(default=20.0),
    sort_by: str = Query(default="risk_score_desc"),
    session: Session = Depends(get_db_session),
):
    """Return paginated list of works with detected anomalies."""
    _ensure_table(session)

    base_q = (
        select(
            DetectionResult,
            Work.source_work_id,
            Work.work_description,
            Work.category,
            Work.sanctioned_cost,
            Representative.name.label("mp_name"),
            Constituency.name.label("constituency"),
            Constituency.state.label("state"),
        )
        .join(Work, DetectionResult.work_id == Work.id)
        .join(Representative, Work.representative_id == Representative.id)
        .join(Constituency, Work.constituency_id == Constituency.id)
        .where(DetectionResult.risk_score >= min_risk_score)
    )

    count_q = (
        select(func.count(DetectionResult.id))
        .join(Work, DetectionResult.work_id == Work.id)
        .where(DetectionResult.risk_score >= min_risk_score)
    )

    if risk_band and risk_band.upper() not in ("ALL", ""):
        base_q = base_q.where(DetectionResult.risk_band == risk_band.upper())
        count_q = count_q.where(DetectionResult.risk_band == risk_band.upper())

    total = session.execute(count_q).scalar() or 0

    # Sorting
    if sort_by == "risk_score_asc":
        base_q = base_q.order_by(DetectionResult.risk_score.asc())
    else:
        base_q = base_q.order_by(desc(DetectionResult.risk_score))

    offset = (page - 1) * limit
    rows = session.execute(base_q.offset(offset).limit(limit)).all()

    items = []
    for dr, src_wid, desc_text, cat, cost, mp_name, const_name, state_name in rows:
        rel_dev = None
        if dr.relative_deviation is not None:
            rel_dev = round(dr.relative_deviation * 100, 1)

        items.append(FlaggedWorkItem(
            work_id=str(dr.work_id),
            source_work_id=str(src_wid),
            mp_name=mp_name or "Unknown",
            constituency=const_name or "Unknown",
            state=state_name or "Unknown",
            description=(desc_text or "")[:300],
            category=cat or "Unknown",
            sanctioned_cost=float(cost or 0),
            risk_score=round(dr.risk_score, 2),
            risk_band=dr.risk_band,
            primary_risk_reason=dr.primary_risk_reason or "Potential anomaly requiring human review",
            cost_anomaly=bool(dr.cost_anomaly_flag),
            text_anomaly=bool(dr.text_anomaly_flag),
            peer_median=round(dr.peer_median, 2) if dr.peer_median else None,
            relative_deviation_pct=rel_dev,
            nearest_similarity=round(dr.nearest_similarity_score, 3) if dr.nearest_similarity_score else None,
            evidence=dr.evidence or {},
            review_status=dr.review_status or "Pending Review",
        ))

    return PaginatedFlaggedResponse(
        works=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if limit else 1,
    )


@router.get("/detection/work/{work_id}", tags=["detection"])
def get_work_detection_result(work_id: str, session: Session = Depends(get_db_session)):
    """Return detection result for a specific work."""
    _ensure_table(session)
    try:
        import uuid as _uuid
        wuuid = _uuid.UUID(work_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid work UUID")

    dr = session.execute(
        select(DetectionResult).where(DetectionResult.work_id == wuuid)
    ).scalar_one_or_none()

    if not dr:
        return {"status": "not_analyzed", "work_id": work_id}

    return {
        "work_id": str(dr.work_id),
        "risk_score": dr.risk_score,
        "risk_band": dr.risk_band,
        "primary_risk_reason": dr.primary_risk_reason,
        "risk_explanation": dr.risk_explanation,
        "is_flagged": dr.is_flagged,
        "cost_anomaly_flag": dr.cost_anomaly_flag,
        "cost_anomaly_score": dr.cost_anomaly_score,
        "cost_evidence": dr.cost_evidence,
        "peer_group_id": dr.peer_group_id,
        "peer_group_size": dr.peer_group_size,
        "peer_median": dr.peer_median,
        "robust_z": dr.robust_z,
        "relative_deviation": dr.relative_deviation,
        "text_anomaly_flag": dr.text_anomaly_flag,
        "text_anomaly_score": dr.text_anomaly_score,
        "text_evidence": dr.text_evidence,
        "nearest_similarity_score": dr.nearest_similarity_score,
        "evidence": dr.evidence,
        "review_status": dr.review_status,
        "processed_at": dr.processed_at.isoformat(),
    }


@router.get("/detection/benchmark", response_model=BenchmarkResponse, tags=["detection"])
def run_benchmark(
    session: Session = Depends(get_db_session),
    n_synthetic: int = Query(default=300, ge=50, le=500),
):
    """
    Run the synthetic anomaly benchmark.
    Generates controlled synthetic anomalies from real data, runs detection, reports rates.
    Synthetic records are NEVER stored in the database.
    """
    _ensure_table(session)

    # Load a representative sample of real works for benchmark base
    from app.models.mplads import Work, Constituency
    rows = session.execute(
        select(
            Work.id,
            Work.source_work_id,
            Work.sanctioned_cost,
            Work.work_description,
            Work.category_normalized,
            Work.geo_district_normalized,
            Work.completion_year,
            Constituency.state_normalized,
        )
        .join(Work.constituency)
        .limit(5000)   # use up to 5k works as benchmark base
    ).all()

    works_records = [
        {
            "work_id": r.id,
            "source_work_id": r.source_work_id,
            "sanctioned_cost": float(r.sanctioned_cost),
            "work_description": r.work_description or "",
            "category_normalized": r.category_normalized or "UNKNOWN",
            "geo_district_normalized": r.geo_district_normalized or "UNKNOWN",
            "completion_year": r.completion_year,
            "state_normalized": r.state_normalized or "UNKNOWN",
        }
        for r in rows
    ]

    if len(works_records) < 50:
        raise HTTPException(status_code=400, detail="Insufficient real works for benchmark (need ≥50)")

    # Build peer groups from real data
    import pandas as pd
    from app.services.peer_group_engine import build_peer_groups
    from app.services.synthetic_benchmark import generate_and_benchmark

    real_df = pd.DataFrame(works_records)
    peer_map = build_peer_groups(real_df)

    bench = generate_and_benchmark(works_records, peer_map, n_synthetic=n_synthetic)

    return BenchmarkResponse(
        n_synthetic=bench.n_synthetic,
        n_cost_cases=bench.n_cost_cases,
        n_text_cases=bench.n_text_cases,
        cost_detection_rate_pct=bench.cost_detection_rate,
        text_detection_rate_pct=bench.text_detection_rate,
        by_class=[
            BenchmarkClassResult(
                anomaly_class=cls,
                count=stats["count"],
                detected=stats["detected"],
                detection_rate_pct=stats["detection_rate_pct"],
            )
            for cls, stats in bench.by_class.items()
        ],
    )


@router.get("/detection/mp-summary", tags=["detection"])
def get_mp_detection_summary(session: Session = Depends(get_db_session)):
    """Return per-MP aggregated anomaly stats from detection results."""
    _ensure_table(session)

    rows = session.execute(
        select(
            Representative.id.label("rep_id"),
            Representative.name.label("mp_name"),
            Constituency.state.label("state"),
            func.count(DetectionResult.id).label("analyzed_works"),
            func.count(DetectionResult.id).filter(DetectionResult.is_flagged == True).label("flagged_works"),
            func.avg(DetectionResult.risk_score).label("avg_risk_score"),
            func.max(DetectionResult.risk_score).label("max_risk_score"),
            func.count(DetectionResult.id).filter(DetectionResult.cost_anomaly_flag == True).label("cost_anomalies"),
            func.count(DetectionResult.id).filter(DetectionResult.text_anomaly_flag == True).label("text_anomalies"),
        )
        .join(Work, DetectionResult.representative_id == Representative.id)
        .join(Constituency, Representative.constituency_id == Constituency.id)
        .group_by(Representative.id, Representative.name, Constituency.state)
        .order_by(desc("avg_risk_score"))
    ).all()

    return [
        {
            "mp_id": str(r.rep_id),
            "mp_name": r.mp_name,
            "state": r.state,
            "analyzed_works": r.analyzed_works,
            "flagged_works": r.flagged_works or 0,
            "anomaly_rate": round((r.flagged_works or 0) / max(r.analyzed_works, 1) * 100, 2),
            "avg_risk_score": round(float(r.avg_risk_score or 0), 2),
            "max_risk_score": round(float(r.max_risk_score or 0), 2),
            "cost_anomalies": r.cost_anomalies or 0,
            "text_anomalies": r.text_anomalies or 0,
        }
        for r in rows
    ]
