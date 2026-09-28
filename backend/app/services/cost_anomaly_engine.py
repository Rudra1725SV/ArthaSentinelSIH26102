"""
Cost Anomaly Engine — ArthaSentinel
Reproduces notebook Step 4 methodology.

Detection hierarchy:
  1. IQR anomaly       → PRIMARY signal (60 pts)
  2. Stabilized MAD    → SUPPORTING signal (30 pts)
  3. Relative deviation → SEVERITY only (up to 10 pts)

Final anomaly flag: IQR anomaly OR MAD anomaly.
Relative deviation ALONE cannot create an anomaly.

MAD = 0 is handled with stabilized fallback — does NOT auto-flag.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.services.peer_group_engine import PeerStats

logger = logging.getLogger(__name__)

# IQR fence multiplier (notebook: 1.5)
IQR_FENCE_MULTIPLIER = 1.5

# Robust Z threshold (notebook uses |robust_z| > 2.5 as MAD anomaly)
ROBUST_Z_THRESHOLD = 2.5

# Relative deviation thresholds for severity scoring only
DEVIATION_MODERATE = 0.5   # 50% above median
DEVIATION_HIGH = 1.0       # 100% above median
DEVIATION_VERY_HIGH = 2.0  # 200% above median


@dataclass
class CostAnomalyResult:
    cost: float
    peer_stats: PeerStats

    # IQR
    iqr_lower_fence: float = 0.0
    iqr_upper_fence: float = 0.0
    iqr_anomaly: bool = False

    # MAD / Robust-Z
    robust_z: float = 0.0
    mad_anomaly: bool = False

    # Relative deviation (severity only)
    relative_deviation: float = 0.0
    cost_to_peer_median_ratio: float = 0.0

    # Final composite
    cost_anomaly_flag: bool = False
    cost_anomaly_score: float = 0.0
    cost_evidence: str = ""


def detect_cost_anomaly(cost: float, peer_stats: PeerStats) -> CostAnomalyResult:
    """
    Run the full cost anomaly detection for a single work.

    Args:
        cost:       Sanctioned cost of the work (must be positive).
        peer_stats: Pre-computed statistics for the work's peer group.

    Returns:
        CostAnomalyResult with all signals populated.
    """
    result = CostAnomalyResult(cost=cost, peer_stats=peer_stats)

    # ── Guard: insufficient data ─────────────────────────────────────────────
    if peer_stats.peer_group_size < 2 or cost <= 0 or peer_stats.peer_median <= 0:
        result.cost_evidence = "Insufficient peer data — no anomaly detected"
        return result

    # ── IQR Fence (Primary signal) ───────────────────────────────────────────
    lower_fence = peer_stats.peer_q1 - IQR_FENCE_MULTIPLIER * peer_stats.peer_iqr
    upper_fence = peer_stats.peer_q3 + IQR_FENCE_MULTIPLIER * peer_stats.peer_iqr
    result.iqr_lower_fence = lower_fence
    result.iqr_upper_fence = upper_fence
    result.iqr_anomaly = (cost < lower_fence or cost > upper_fence)

    # ── Robust Z-Score / MAD (Supporting signal) ─────────────────────────────
    eff_mad = peer_stats.peer_effective_mad
    robust_z = (cost - peer_stats.peer_median) / (1.4826 * eff_mad)
    result.robust_z = float(robust_z)
    result.mad_anomaly = abs(robust_z) > ROBUST_Z_THRESHOLD

    # ── Relative Deviation (Severity only) ───────────────────────────────────
    rel_dev = (cost - peer_stats.peer_median) / peer_stats.peer_median
    result.relative_deviation = float(rel_dev)
    result.cost_to_peer_median_ratio = float(cost / peer_stats.peer_median)

    # ── Final flag: IQR OR MAD ────────────────────────────────────────────────
    result.cost_anomaly_flag = result.iqr_anomaly or result.mad_anomaly

    # ── Score (0–100) ─────────────────────────────────────────────────────────
    score = 0.0

    if result.iqr_anomaly:
        score += 60.0

    if result.mad_anomaly:
        score += 30.0

    # Severity bonus (up to 10 pts) — relative deviation only, never standalone
    if result.cost_anomaly_flag:
        abs_dev = abs(rel_dev)
        if abs_dev >= DEVIATION_VERY_HIGH:
            score += 10.0
        elif abs_dev >= DEVIATION_HIGH:
            score += 7.0
        elif abs_dev >= DEVIATION_MODERATE:
            score += 4.0

    result.cost_anomaly_score = min(100.0, score)

    # ── Evidence string ────────────────────────────────────────────────────────
    parts: list[str] = []
    if result.iqr_anomaly:
        direction = "above" if cost > upper_fence else "below"
        parts.append(f"Cost {direction} IQR fence (fence: ₹{upper_fence:,.0f}, cost: ₹{cost:,.0f})")
    if result.mad_anomaly:
        parts.append(f"Robust Z = {robust_z:.2f} (threshold ±{ROBUST_Z_THRESHOLD})")
    if abs(rel_dev) >= DEVIATION_MODERATE:
        pct = rel_dev * 100
        direction = "above" if rel_dev > 0 else "below"
        parts.append(f"Cost {pct:+.1f}% {direction} peer median (₹{peer_stats.peer_median:,.0f})")

    if parts:
        result.cost_evidence = " | ".join(parts)
    else:
        result.cost_evidence = f"Within peer range. Peer median: ₹{peer_stats.peer_median:,.0f}"

    return result


def batch_detect_cost_anomalies(
    works: list[dict],
    peer_map: dict,
) -> list[dict]:
    """
    Batch cost anomaly detection.

    Args:
        works:    List of work dicts with at least 'work_id' and 'sanctioned_cost' (or 'cost').
        peer_map: Dict mapping work_id → PeerStats (from peer_group_engine).

    Returns:
        List of dicts with all cost anomaly fields added.
    """
    results = []
    for w in works:
        wid = w.get("work_id") or w.get("id")
        cost = float(w.get("sanctioned_cost") or w.get("cost") or 0)
        ps = peer_map.get(wid)
        if ps and cost > 0:
            r = detect_cost_anomaly(cost, ps)
            results.append({
                "work_id": wid,
                "cost_to_peer_median_ratio": r.cost_to_peer_median_ratio,
                "relative_deviation": r.relative_deviation,
                "robust_z": r.robust_z,
                "iqr_anomaly": r.iqr_anomaly,
                "mad_anomaly": r.mad_anomaly,
                "cost_anomaly_flag": r.cost_anomaly_flag,
                "cost_anomaly_score": r.cost_anomaly_score,
                "cost_evidence": r.cost_evidence,
            })
        else:
            results.append({
                "work_id": wid,
                "cost_to_peer_median_ratio": None,
                "relative_deviation": None,
                "robust_z": None,
                "iqr_anomaly": False,
                "mad_anomaly": False,
                "cost_anomaly_flag": False,
                "cost_anomaly_score": 0.0,
                "cost_evidence": "No peer group available" if not ps else "Invalid cost",
            })
    return results
