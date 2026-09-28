"""
LangGraph Detection Pipeline — ArthaSentinel

StateGraph orchestrating the full anomaly detection pipeline:
  START → Load Works → Build Peer Groups → Cost Anomaly → Text Anomaly
        → Risk Aggregation → Persist Results → END

LangGraph coordinates the services. It does NOT perform calculations.
Statistical calculations happen in:
  - peer_group_engine.py
  - cost_anomaly_engine.py
  - text_anomaly_engine.py
  - risk_scoring_engine.py
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, TypedDict

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# ─── State ────────────────────────────────────────────────────────────────────

class DetectionState(TypedDict, total=False):
    """Shared state passed between LangGraph nodes."""

    # Input
    session: Any              # SQLAlchemy Session
    batch_size: int
    offset: int
    pipeline_version: str

    # Loaded works
    works_df: Any             # pandas DataFrame
    works_count: int

    # Peer groups
    peer_map: dict            # work_id → PeerStats

    # Cost signals
    cost_results: list[dict]  # one dict per work

    # Text signals
    text_results: list        # list[TextAnomalyResult]

    # Risk results
    risk_results: list        # list[RiskResult]

    # Persistence
    persisted_count: int
    errors: list[str]

    # Summary
    flagged_count: int
    risk_distribution: dict[str, int]
    processing_time_seconds: float


# ─── Node functions ───────────────────────────────────────────────────────────

def node_load_works(state: DetectionState) -> dict:
    """Load a batch of works from PostgreSQL into a pandas DataFrame."""
    import pandas as pd
    from sqlalchemy import select, text
    from app.models.mplads import Work, Representative, Constituency

    session: Session = state["session"]
    batch_size = state.get("batch_size", 5000)
    offset = state.get("offset", 0)

    logger.info("Loading works batch: size=%d offset=%d", batch_size, offset)

    # Load raw fields needed for peer grouping and detection
    rows = session.execute(
        select(
            Work.id,
            Work.source_work_id,
            Work.house,
            Work.sanctioned_cost,
            Work.work_description,
            Work.work_description_normalized,
            Work.category_normalized,
            Work.geo_district_normalized,
            Work.completion_year,
            Work.representative_id,
            Constituency.state_normalized,
        )
        .join(Work.constituency)
        .offset(offset)
        .limit(batch_size)
    ).all()

    records = []
    for r in rows:
        records.append({
            "work_id": r.id,
            "source_work_id": r.source_work_id,
            "house": r.house.value if hasattr(r.house, "value") else str(r.house),
            "sanctioned_cost": float(r.sanctioned_cost) if r.sanctioned_cost else 0.0,
            "work_description": r.work_description or "",
            "category_normalized": r.category_normalized or "UNKNOWN",
            "geo_district_normalized": r.geo_district_normalized or "UNKNOWN",
            "completion_year": r.completion_year,
            "representative_id": r.representative_id,
            "state_normalized": r.state_normalized or "UNKNOWN",
        })

    df = pd.DataFrame(records)
    logger.info("Loaded %d works", len(df))

    return {"works_df": df, "works_count": len(df), "errors": []}


def node_build_peer_groups(state: DetectionState) -> dict:
    """Build hierarchical peer groups for all loaded works."""
    from app.services.peer_group_engine import build_peer_groups

    df = state["works_df"]
    logger.info("Building peer groups for %d works", len(df))

    peer_map = build_peer_groups(df)
    logger.info("Peer groups built: %d works assigned", len(peer_map))

    return {"peer_map": peer_map}


def node_cost_anomaly(state: DetectionState) -> dict:
    """Run cost anomaly detection for all works."""
    from app.services.cost_anomaly_engine import batch_detect_cost_anomalies

    df = state["works_df"]
    peer_map = state["peer_map"]

    works_list = df.to_dict("records")
    cost_results = batch_detect_cost_anomalies(works_list, peer_map)

    flagged = sum(1 for r in cost_results if r["cost_anomaly_flag"])
    logger.info("Cost anomaly: %d flagged / %d total (%.1f%%)", flagged, len(cost_results), flagged / max(len(cost_results), 1) * 100)

    return {"cost_results": cost_results}


def node_text_anomaly(state: DetectionState) -> dict:
    """Run text/semantic anomaly detection for all works."""
    from app.services.text_anomaly_engine import run_text_anomaly_detection

    df = state["works_df"]
    peer_map = state["peer_map"]

    works_list = df.to_dict("records")
    text_results = run_text_anomaly_detection(works_list, peer_map)

    flagged = sum(1 for r in text_results if r.text_anomaly_flag)
    logger.info("Text anomaly: %d flagged / %d total (%.1f%%)", flagged, len(text_results), flagged / max(len(text_results), 1) * 100)

    return {"text_results": text_results}


def node_pattern_signals(state: DetectionState) -> dict:
    """Analyze contextual repetition and duplicate project patterns (Notebook Cell 42)."""
    from app.services.pattern_analysis_service import compute_pattern_signals

    df = state["works_df"]
    pattern_map = compute_pattern_signals(df)
    return {"pattern_map": pattern_map}


def node_semantic_embeddings(state: DetectionState) -> dict:
    """Run Sentence Transformers semantic duplicate analysis and store embeddings."""
    from app.services.semantic_embedding_service import (
        batch_semantic_analysis_with_transformer,
        generate_and_store_embeddings,
    )

    session: Session = state["session"]
    df = state["works_df"]

    try:
        # Run fast in-memory Sentence Transformer cosine similarity
        semantic_map = batch_semantic_analysis_with_transformer(df)

        # Store embeddings in background/sample for persistent pgvector lookups
        generate_and_store_embeddings(session, limit=100, batch_size=50)
        logger.info("Sentence Transformer semantic analysis and pgvector embedding completed")
    except Exception as e:
        logger.warning("Semantic embedding step fallback: %s", e)
        semantic_map = {}

    return {"pgvector_map": semantic_map}


def node_risk_aggregation(state: DetectionState) -> dict:
    """Combine cost + text + pattern + pgvector signals into composite risk scores."""
    from app.services.risk_scoring_engine import compute_risk_score

    cost_results = state["cost_results"]
    text_results = state["text_results"]
    peer_map = state["peer_map"]
    pattern_map = state.get("pattern_map", {})
    pgvector_map = state.get("pgvector_map", {})

    # Build lookup maps
    cost_map = {r["work_id"]: r for r in cost_results}
    text_map = {r.work_id: r for r in text_results}

    risk_results = []
    band_counts: dict[str, int] = {"CRITICAL": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0, "NONE": 0}

    all_work_ids = {r["work_id"] for r in cost_results}

    for wid in all_work_ids:
        cr = cost_map.get(wid, {})
        tr = text_map.get(wid)
        ps = peer_map.get(wid)
        pat = pattern_map.get(wid)
        pg = pgvector_map.get(wid)

        # Merge pgvector findings with TF-IDF signals if available
        sim_score = tr.nearest_similarity_score if tr else 0.0
        nearest_id = tr.nearest_related_work_id if tr else None
        sem_flag = tr.semantic_duplicate_flag if tr else False
        t_evidence = tr.text_evidence if tr else ""

        if pg and pg.nearest_similarity_score > sim_score:
            sim_score = pg.nearest_similarity_score
            nearest_id = pg.nearest_related_work_id
            sem_flag = sem_flag or pg.semantic_duplicate_flag
            if pg.semantic_evidence:
                t_evidence = f"{t_evidence} | [pgvector: {pg.semantic_evidence}]"

        rr = compute_risk_score(
            work_id=wid,
            cost_anomaly_score=cr.get("cost_anomaly_score", 0.0),
            cost_anomaly_flag=cr.get("cost_anomaly_flag", False),
            cost_evidence=cr.get("cost_evidence", ""),
            text_anomaly_score=tr.text_anomaly_score if tr else 0.0,
            text_anomaly_flag=tr.text_anomaly_flag if tr else False,
            text_evidence=t_evidence,
            peer_group_size=ps.peer_group_size if ps else 0,
            strong_contextual_duplicate=tr.strong_contextual_duplicate if tr else False,
            very_high_similarity_flag=tr.very_high_similarity_flag if tr else False,
            high_frequency_duplicate_flag=tr.high_frequency_duplicate_flag if tr else False,
            exact_duplicate_flag=tr.exact_duplicate_flag if tr else False,
            nearest_similarity_score=sim_score,
            robust_z=cr.get("robust_z") or 0.0,
            relative_deviation=cr.get("relative_deviation") or 0.0,
            duplicate_pattern_strength=pat.duplicate_pattern_strength if pat else "NONE",
            pattern_record_count=pat.pattern_record_count if pat else 1,
            repetitive_pattern_flag=pat.repetitive_pattern_flag if pat else False,
            pattern_evidence=pat.pattern_evidence if pat else "",
        )
        risk_results.append(rr)
        band_counts[rr.risk_band] = band_counts.get(rr.risk_band, 0) + 1

    flagged_count = sum(1 for r in risk_results if r.is_flagged)
    logger.info(
        "Risk scoring complete: flagged=%d | bands=%s",
        flagged_count,
        band_counts,
    )

    return {
        "risk_results": risk_results,
        "flagged_count": flagged_count,
        "risk_distribution": band_counts,
    }


def node_persist_results(state: DetectionState) -> dict:
    """Persist detection results into detection_results table."""
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    from app.models.detection_result import DetectionResult

    session: Session = state["session"]
    cost_map = {r["work_id"]: r for r in state["cost_results"]}
    text_map = {r.work_id: r for r in state["text_results"]}
    peer_map = state["peer_map"]
    risk_results = state["risk_results"]
    version = state.get("pipeline_version", "1.0")

    # Load representative_id from works_df
    df = state["works_df"]
    rep_map = dict(zip(df["work_id"].tolist(), df.get("representative_id", [None] * len(df)).tolist()))

    persisted = 0
    errors: list[str] = list(state.get("errors", []))
    rows_to_persist: list[dict] = []

    for rr in risk_results:
        wid = rr.work_id
        cr = cost_map.get(wid, {})
        tr = text_map.get(wid)
        ps = peer_map.get(wid)

        try:
            row = {
                "id": uuid.uuid4(),
                "work_id": wid,
                "representative_id": rep_map.get(wid),

                # Peer
                "peer_group_id": ps.peer_group_id if ps else None,
                "peer_group_level": ps.peer_group_level if ps else None,
                "peer_group_size": ps.peer_group_size if ps else None,
                "peer_median": ps.peer_median if ps else None,
                "peer_mean": ps.peer_mean if ps else None,
                "peer_q1": ps.peer_q1 if ps else None,
                "peer_q3": ps.peer_q3 if ps else None,
                "peer_iqr": ps.peer_iqr if ps else None,
                "peer_mad": ps.peer_mad if ps else None,
                "peer_effective_mad": ps.peer_effective_mad if ps else None,

                # Cost
                "cost_to_peer_median_ratio": cr.get("cost_to_peer_median_ratio"),
                "relative_deviation": cr.get("relative_deviation"),
                "robust_z": cr.get("robust_z"),
                "iqr_anomaly": cr.get("iqr_anomaly", False),
                "mad_anomaly": cr.get("mad_anomaly", False),
                "cost_anomaly_flag": cr.get("cost_anomaly_flag", False),
                "cost_anomaly_score": cr.get("cost_anomaly_score", 0.0),
                "cost_evidence": cr.get("cost_evidence", ""),

                # Text
                "nearest_related_work_id": tr.nearest_related_work_id if tr else None,
                "nearest_similarity_score": tr.nearest_similarity_score if tr else 0.0,
                "semantic_duplicate_flag": tr.semantic_duplicate_flag if tr else False,
                "exact_duplicate_flag": tr.exact_duplicate_flag if tr else False,
                "high_frequency_duplicate_flag": tr.high_frequency_duplicate_flag if tr else False,
                "very_high_similarity_flag": tr.very_high_similarity_flag if tr else False,
                "strong_contextual_duplicate": tr.strong_contextual_duplicate if tr else False,
                "text_anomaly_flag": tr.text_anomaly_flag if tr else False,
                "text_anomaly_score": tr.text_anomaly_score if tr else 0.0,
                "text_evidence": tr.text_evidence if tr else "",

                # Pattern
                "duplicate_pattern_strength": rr.evidence.get("duplicate_pattern_strength", "NONE"),
                "pattern_record_count": rr.evidence.get("pattern_record_count", 1),
                "repetitive_pattern_flag": rr.evidence.get("repetitive_pattern", False),

                # Risk
                "risk_score": rr.risk_score,
                "risk_band": rr.risk_band,
                "primary_risk_reason": rr.primary_risk_reason,
                "risk_explanation": rr.risk_explanation,
                "evidence": rr.evidence,
                "is_flagged": rr.is_flagged,
                "review_status": "Pending Review" if rr.is_flagged else "No Action Required",
                "pipeline_version": version,
            }
            rows_to_persist.append(row)
        except Exception as e:
            errors.append(f"work_id={wid}: {str(e)[:100]}")

    chunk_size = 500
    for i in range(0, len(rows_to_persist), chunk_size):
        chunk = rows_to_persist[i : i + chunk_size]
        try:
            insert_stmt = pg_insert(DetectionResult).values(chunk)
            update_cols = {
                c.name: c
                for c in insert_stmt.excluded
                if c.name not in ("id", "work_id")
            }
            stmt = insert_stmt.on_conflict_do_update(
                index_elements=["work_id"],
                set_=update_cols,
            )
            session.execute(stmt)
            session.commit()
            persisted += len(chunk)
            logger.info("Persisted chunk %d - %d / %d", i, i + len(chunk), len(rows_to_persist))
        except Exception as e:
            session.rollback()
            logger.error("Error persisting chunk %d: %s", i, e)
            errors.append(f"chunk_{i}: {str(e)[:100]}")

    logger.info("Persisted %d total detection results (%d errors)", persisted, len(errors))
    return {"persisted_count": persisted, "errors": errors}


# ─── Graph Builder ────────────────────────────────────────────────────────────

def build_detection_graph():
    """Build and compile the LangGraph StateGraph for anomaly detection."""
    try:
        from langgraph.graph import StateGraph, END

        graph = StateGraph(DetectionState)

        graph.add_node("load_works", node_load_works)
        graph.add_node("build_peer_groups", node_build_peer_groups)
        graph.add_node("cost_anomaly", node_cost_anomaly)
        graph.add_node("text_anomaly", node_text_anomaly)
        graph.add_node("pattern_signals", node_pattern_signals)
        graph.add_node("semantic_embeddings", node_semantic_embeddings)
        graph.add_node("risk_aggregation", node_risk_aggregation)
        graph.add_node("persist_results", node_persist_results)

        graph.set_entry_point("load_works")
        graph.add_edge("load_works", "build_peer_groups")
        graph.add_edge("build_peer_groups", "cost_anomaly")
        graph.add_edge("cost_anomaly", "text_anomaly")
        graph.add_edge("text_anomaly", "pattern_signals")
        graph.add_edge("pattern_signals", "semantic_embeddings")
        graph.add_edge("semantic_embeddings", "risk_aggregation")
        graph.add_edge("risk_aggregation", "persist_results")
        graph.add_edge("persist_results", END)

        return graph.compile()
    except ImportError:
        logger.warning("LangGraph not available, returning sequential fallback runner")
        return None


def run_detection_pipeline(
    session: Session,
    batch_size: int = 5000,
    offset: int = 0,
    pipeline_version: str = "1.0",
) -> dict:
    """
    Run the full detection pipeline.
    Uses LangGraph if available, falls back to sequential execution.
    """
    start = time.time()

    initial_state: DetectionState = {
        "session": session,
        "batch_size": batch_size,
        "offset": offset,
        "pipeline_version": pipeline_version,
        "errors": [],
    }

    graph = build_detection_graph()

    if graph is not None:
        # LangGraph orchestrated run
        final_state = graph.invoke(initial_state)
    else:
        # Sequential fallback
        state = initial_state
        state.update(node_load_works(state))
        state.update(node_build_peer_groups(state))
        state.update(node_cost_anomaly(state))
        state.update(node_text_anomaly(state))
        state.update(node_pattern_signals(state))
        state.update(node_semantic_embeddings(state))
        state.update(node_risk_aggregation(state))
        state.update(node_persist_results(state))
        final_state = state

    elapsed = time.time() - start
    final_state["processing_time_seconds"] = elapsed

    logger.info(
        "Detection pipeline complete: %d works in %.1fs | flagged=%d | distribution=%s",
        final_state.get("works_count", 0),
        elapsed,
        final_state.get("flagged_count", 0),
        final_state.get("risk_distribution", {}),
    )

    return {
        "works_analyzed": final_state.get("works_count", 0),
        "flagged_count": final_state.get("flagged_count", 0),
        "risk_distribution": final_state.get("risk_distribution", {}),
        "persisted_count": final_state.get("persisted_count", 0),
        "errors": final_state.get("errors", []),
        "processing_time_seconds": elapsed,
        "pipeline_version": pipeline_version,
    }
