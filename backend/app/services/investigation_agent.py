"""
Minimal Agentic Investigation Flow — ArthaSentinel
LangGraph StateGraph for assembling investigator-ready dossiers for flagged works.

Flow:
  START
   ↓
  Load flagged work
   ↓
  Gather statistical evidence (peer baselines, IQR fences, Robust Z)
   ↓
  Gather semantic & pgvector evidence (nearest similar work, cosine similarity)
   ↓
  Assemble evidence & structured audit facts
   ↓
  Synthesize investigator-ready dossier (strictly adhering to evidence)
   ↓
  END

Compliant terminology:
  - "Potential anomaly requiring human review"
  - "Potentially similar work"
  - "Cost deviation from peer baseline"
  (Strictly no fraud allegations or fabricated numbers)
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, TypedDict

from langgraph.graph import StateGraph, END
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.detection_result import DetectionResult
from app.models.mplads import Work, Representative, Constituency
from app.services.semantic_embedding_service import find_nearest_works_pgvector

logger = logging.getLogger(__name__)


class InvestigationState(TypedDict, total=False):
    """Shared state for the investigation graph."""
    session: Any               # SQLAlchemy Session
    work_id: uuid.UUID

    # Raw work data
    work_record: dict[str, Any]

    # Pre-calculated detection result
    detection_result: dict[str, Any]

    # Statistical evidence
    stats_evidence: dict[str, Any]

    # Semantic evidence
    semantic_evidence: dict[str, Any]

    # Assembled dossier
    dossier: dict[str, Any]


def node_load_flagged_work(state: InvestigationState) -> dict:
    """Load work metadata, representative, and existing detection result."""
    session: Session = state["session"]
    wid = state["work_id"]

    work = session.execute(
        select(Work, Representative, Constituency)
        .join(Representative, Work.representative_id == Representative.id)
        .join(Constituency, Work.constituency_id == Constituency.id)
        .where(Work.id == wid)
    ).first()

    if not work:
        raise ValueError(f"Work ID {wid} not found in database")

    w, rep, const = work
    work_dict = {
        "id": str(w.id),
        "source_work_id": w.source_work_id,
        "house": w.house.value if hasattr(w.house, "value") else str(w.house),
        "description": w.work_description,
        "category": w.category,
        "sanctioned_cost": float(w.sanctioned_cost),
        "completion_year": w.completion_year,
        "mp_name": rep.name,
        "party": rep.source_party_label or "Independent/Other",
        "constituency": const.name,
        "state": const.state,
        "district": const.district,
    }

    # Load detection result if exists
    dr = session.execute(
        select(DetectionResult).where(DetectionResult.work_id == wid)
    ).scalar_one_or_none()

    det_dict = {}
    if dr:
        det_dict = {
            "risk_score": dr.risk_score,
            "risk_band": dr.risk_band,
            "primary_risk_reason": dr.primary_risk_reason,
            "is_flagged": dr.is_flagged,
            "review_status": dr.review_status,
            "peer_group_id": dr.peer_group_id,
            "peer_group_size": dr.peer_group_size,
            "peer_median": dr.peer_median,
            "peer_iqr": dr.peer_iqr,
            "peer_effective_mad": dr.peer_effective_mad,
            "robust_z": dr.robust_z,
            "relative_deviation": dr.relative_deviation,
            "cost_anomaly_flag": dr.cost_anomaly_flag,
            "cost_evidence": dr.cost_evidence,
            "text_anomaly_flag": dr.text_anomaly_flag,
            "text_evidence": dr.text_evidence,
            "duplicate_pattern_strength": dr.duplicate_pattern_strength,
            "evidence": dr.evidence,
        }

    return {"work_record": work_dict, "detection_result": det_dict}


def node_gather_statistical_evidence(state: InvestigationState) -> dict:
    """Compile statistical peer baseline and cost anomaly evidence."""
    det = state.get("detection_result", {})
    work = state.get("work_record", {})

    cost = work.get("sanctioned_cost", 0.0)
    median = det.get("peer_median") or 0.0
    rel_dev_pct = (det.get("relative_deviation") or 0.0) * 100

    stats = {
        "cost": cost,
        "peer_median": median,
        "deviation_pct": round(rel_dev_pct, 1),
        "peer_group_id": det.get("peer_group_id", "General Cohort"),
        "peer_group_size": det.get("peer_group_size", 0),
        "robust_z_score": round(det.get("robust_z") or 0.0, 2),
        "iqr_flag": det.get("cost_anomaly_flag", False),
        "summary": det.get("cost_evidence") or f"Cost ₹{cost:,.0f} compared to peer median ₹{median:,.0f}",
    }
    return {"stats_evidence": stats}


def node_gather_semantic_evidence(state: InvestigationState) -> dict:
    """Query pgvector for nearest works and assemble semantic duplicate evidence."""
    session: Session = state["session"]
    wid = state["work_id"]

    sem_res = find_nearest_works_pgvector(session, wid, top_k=3, min_threshold=0.60)

    matches_list = []
    for m in sem_res.all_matches:
        matches_list.append({
            "related_work_id": str(m.related_work_id),
            "source_work_id": m.source_work_id,
            "description": m.work_description,
            "sanctioned_cost": m.sanctioned_cost,
            "similarity_score": round(m.similarity_score, 3),
            "is_potential_duplicate": m.semantic_duplicate_flag,
            "evidence_note": m.evidence,
        })

    semantic_dict = {
        "nearest_similarity": round(sem_res.nearest_similarity_score, 3),
        "semantic_duplicate_flag": sem_res.semantic_duplicate_flag,
        "evidence_summary": sem_res.semantic_evidence,
        "top_matches": matches_list,
    }
    return {"semantic_evidence": semantic_dict}


def node_assemble_dossier(state: InvestigationState) -> dict:
    """Generate the structured, investigator-ready dossier document."""
    w = state["work_record"]
    det = state["detection_result"]
    stats = state["stats_evidence"]
    sem = state["semantic_evidence"]

    risk_score = det.get("risk_score", 0.0)
    risk_band = det.get("risk_band", "NONE")
    primary_reason = det.get("primary_risk_reason", "Potential anomaly requiring human review")

    findings = []
    if det.get("cost_anomaly_flag"):
        findings.append(f"Cost Outlier: Project sanctioned cost of ₹{stats['cost']:,.0f} deviates {stats['deviation_pct']:+.1f}% from peer baseline median of ₹{stats['peer_median']:,.0f} (Robust Z = {stats['robust_z_score']}).")

    if sem.get("semantic_duplicate_flag"):
        findings.append(f"Semantic Overlap: High textual similarity ({sem['nearest_similarity']:.2f}) detected against matching work in the repository. {sem['evidence_summary']}.")

    if det.get("duplicate_pattern_strength") in ("HIGH", "VERY_HIGH"):
        findings.append(f"Pattern Repetition: High-frequency project specification pattern identified ({det.get('duplicate_pattern_strength')}).")

    if not findings:
        findings.append("No statistical or textual anomaly signals exceed scrutiny thresholds. Standard review applies.")

    dossier = {
        "work_id": w["id"],
        "source_work_id": w["source_work_id"],
        "title": f"Parliamentary Scrutiny Dossier — Work #{w['source_work_id']}",
        "mp_name": w["mp_name"],
        "constituency": f"{w['constituency']}, {w['state']}",
        "category": w["category"],
        "sanctioned_cost": w["sanctioned_cost"],
        "risk_score": risk_score,
        "risk_band": risk_band,
        "primary_signal": primary_reason,
        "scrutiny_status": det.get("review_status", "Pending Review"),
        "key_findings": findings,
        "statistical_baseline": stats,
        "semantic_baseline": sem,
        "investigator_guidance": (
            "This automated intelligence dossier identifies potential anomalies requiring human review. "
            "It does not constitute a determination of irregularity. Recommended action: Verify field measurement books, "
            "tender award documentation, and physical asset geotags with the district authority."
        ),
    }

    return {"dossier": dossier}


def build_investigation_graph():
    """Build the LangGraph investigation workflow."""
    graph = StateGraph(InvestigationState)

    graph.add_node("load_work", node_load_flagged_work)
    graph.add_node("gather_stats", node_gather_statistical_evidence)
    graph.add_node("gather_semantic", node_gather_semantic_evidence)
    graph.add_node("assemble_dossier", node_assemble_dossier)

    graph.set_entry_point("load_work")
    graph.add_edge("load_work", "gather_stats")
    graph.add_edge("gather_stats", "gather_semantic")
    graph.add_edge("gather_semantic", "assemble_dossier")
    graph.add_edge("assemble_dossier", END)

    return graph.compile()


def generate_work_investigation_dossier(session: Session, work_id: uuid.UUID) -> dict[str, Any]:
    """Execute the investigation graph for a given work."""
    graph = build_investigation_graph()
    state = graph.invoke({"session": session, "work_id": work_id})
    return state.get("dossier", {})
