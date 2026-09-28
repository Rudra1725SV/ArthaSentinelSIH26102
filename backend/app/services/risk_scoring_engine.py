"""
Multi-Signal Risk Scoring Engine — ArthaSentinel
Reproduces notebook Step 7: recalibrated composite risk score (0–100).

Components:
  - Cost component:  from CostAnomalyResult
  - Text component:  from TextAnomalyResult (strong contextual duplicate signals)
  - Quality penalty: peer group size discount for small groups

Risk bands:
  CRITICAL: 80–100
  HIGH:     60–79
  MODERATE: 40–59
  LOW:      20–39
  NONE:     <20
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

RISK_BANDS = [
    (80.0, "CRITICAL"),
    (60.0, "HIGH"),
    (40.0, "MODERATE"),
    (20.0, "LOW"),
    (0.0, "NONE"),
]


def _risk_band(score: float) -> str:
    for threshold, band in RISK_BANDS:
        if score >= threshold:
            return band
    return "NONE"


def _peer_quality_factor(peer_group_size: int) -> float:
    """
    Discount the score for very small peer groups.
    Size >= 50: full score (1.0)
    Size 15–49: 0.85
    Size < 15:  0.65 (shouldn't happen with MIN_PEER_SIZE=15 but defensive)
    """
    if peer_group_size is None or peer_group_size <= 0:
        return 0.5
    if peer_group_size >= 50:
        return 1.0
    if peer_group_size >= 15:
        return 0.85
    return 0.65


@dataclass
class RiskResult:
    work_id: object
    risk_score: float
    risk_band: str
    primary_risk_reason: str
    risk_explanation: str
    is_flagged: bool
    cost_component: float
    text_component: float
    evidence: dict


def compute_risk_score(
    work_id: object,
    cost_anomaly_score: float,
    cost_anomaly_flag: bool,
    cost_evidence: str,
    text_anomaly_score: float,
    text_anomaly_flag: bool,
    text_evidence: str,
    peer_group_size: int,
    strong_contextual_duplicate: bool,
    very_high_similarity_flag: bool,
    high_frequency_duplicate_flag: bool,
    exact_duplicate_flag: bool,
    # optional extra
    nearest_similarity_score: float = 0.0,
    robust_z: float = 0.0,
    relative_deviation: float = 0.0,
    duplicate_pattern_strength: str = "NONE",
    pattern_record_count: int = 1,
    repetitive_pattern_flag: bool = False,
    pattern_evidence: str = "",
) -> RiskResult:
    """
    Combine detection signals into a composite 0–100 risk score.

    Weights (notebook Step 7 recalibrated):
      Cost component:    up to 70 points (cost anomaly score scaled)
      Text component:    up to 55 points (text signals)
      Pattern component: up to 15 points (duplicate project patterns)
      Capped at 100.
    """
    quality = _peer_quality_factor(peer_group_size)

    # ── Cost component (up to 70 pts) ────────────────────────────────────────
    cost_component = min(70.0, cost_anomaly_score * (70.0 / 100.0)) * quality

    # ── Text component (up to 55 pts, notebook: 45+10+15+5) ─────────────────
    text_component = 0.0
    if strong_contextual_duplicate:
        text_component += 45.0
    if very_high_similarity_flag:
        text_component += 10.0
    if high_frequency_duplicate_flag:
        text_component += 15.0
    if exact_duplicate_flag:
        text_component += 5.0
    text_component = min(55.0, text_component)

    # ── Pattern component (up to 15 pts) ─────────────────────────────────────
    pattern_component = 0.0
    if duplicate_pattern_strength == "VERY_HIGH":
        pattern_component = 15.0
    elif duplicate_pattern_strength == "HIGH":
        pattern_component = 10.0
    elif duplicate_pattern_strength == "MODERATE":
        pattern_component = 5.0

    # ── Composite (capped at 100) ─────────────────────────────────────────────
    raw_score = cost_component + text_component + pattern_component
    risk_score = round(min(100.0, raw_score), 2)
    band = _risk_band(risk_score)

    # ── Primary reason ────────────────────────────────────────────────────────
    reasons: list[tuple[float, str]] = []
    if cost_anomaly_flag:
        reasons.append((cost_component, "Cost deviation from peer baseline"))
    if strong_contextual_duplicate or text_anomaly_flag:
        reasons.append((text_component, "Potentially similar work in peer group"))
    if repetitive_pattern_flag:
        reasons.append((pattern_component, "Repetitive project specification pattern"))

    if reasons:
        primary_reason = max(reasons, key=lambda x: x[0])[1]
    else:
        primary_reason = "No significant anomaly detected"

    # ── Explanation ────────────────────────────────────────────────────────────
    parts = []
    if cost_evidence and cost_anomaly_flag:
        parts.append(f"Cost signal: {cost_evidence}")
    if text_evidence and text_anomaly_flag:
        parts.append(f"Text signal: {text_evidence}")
    if pattern_evidence and repetitive_pattern_flag:
        parts.append(f"Pattern signal: {pattern_evidence}")
    if not parts:
        parts.append("No anomaly signals above threshold")
    explanation = " | ".join(parts)

    is_flagged = risk_score >= 20.0

    evidence = {
        "cost_component": round(cost_component, 2),
        "text_component": round(text_component, 2),
        "pattern_component": round(pattern_component, 2),
        "raw_score": round(raw_score, 2),
        "peer_quality_factor": quality,
        "cost_anomaly": cost_anomaly_flag,
        "text_anomaly": text_anomaly_flag,
        "repetitive_pattern": repetitive_pattern_flag,
        "duplicate_pattern_strength": duplicate_pattern_strength,
        "pattern_record_count": pattern_record_count,
        "robust_z": round(robust_z, 3) if robust_z else None,
        "relative_deviation_pct": round(relative_deviation * 100, 1) if relative_deviation else None,
        "nearest_similarity": round(nearest_similarity_score, 3) if nearest_similarity_score else None,
        "peer_group_size": peer_group_size,
        "cost_evidence": cost_evidence,
        "text_evidence": text_evidence,
        "pattern_evidence": pattern_evidence,
    }

    return RiskResult(
        work_id=work_id,
        risk_score=risk_score,
        risk_band=band,
        primary_risk_reason=primary_reason,
        risk_explanation=explanation,
        is_flagged=is_flagged,
        cost_component=round(cost_component, 2),
        text_component=round(text_component, 2),
        evidence=evidence,
    )
