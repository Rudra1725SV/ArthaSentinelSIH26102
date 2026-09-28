"""
Synthetic Anomaly Benchmark — ArthaSentinel
Reproduces notebook Step 5: controlled synthetic anomaly injection and validation.

IMPORTANT:
  Synthetic records NEVER enter production PostgreSQL.
  They are held in memory, run through the same detection pipeline,
  and discarded after benchmark scoring.

Anomaly classes (notebook distribution):
  cost_outlier:         35%  → cost × (5–20×)
  combined:             25%  → cost_outlier + semantic_duplicate
  repetitive_pattern:   20%  → reuse description from same peer group
  semantic_duplicate:   20%  → near-identical description

Notebook results:
  Cost anomaly detection rate: 97.73%
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

N_SYNTHETIC = 300
ANOMALY_TYPES = ["cost_outlier", "combined", "repetitive_pattern", "semantic_duplicate"]
ANOMALY_PROBS = [0.35, 0.25, 0.20, 0.20]  # must sum to 1.0


@dataclass
class BenchmarkResult:
    n_synthetic: int
    n_cost_cases: int          # cost_outlier + combined
    n_text_cases: int          # semantic_duplicate + repetitive_pattern + combined
    cost_detected: int
    text_detected: int
    cost_detection_rate: float
    text_detection_rate: float
    by_class: dict             # class → {"count", "detected", "rate"}


def _inject_cost_outlier(row: dict, rng: np.random.Generator, real_df: pd.DataFrame) -> dict:
    """Multiply cost by a random large factor (5–20×)."""
    multiplier = rng.uniform(5.0, 20.0)
    row["sanctioned_cost"] = float(row["sanctioned_cost"]) * multiplier
    row["synthetic_change"] = f"cost_multiplied_x{multiplier:.1f}"
    return row


def _inject_semantic_duplicate(row: dict, rng: np.random.Generator, real_df: pd.DataFrame) -> dict:
    """Replace description with a near-identical copy from the same peer group."""
    peer_id = row.get("peer_group_id", "UNGROUPED")
    peer_descs = real_df.loc[real_df["peer_group_id"] == peer_id, "work_description"].dropna().values
    if len(peer_descs) > 0:
        chosen = rng.choice(peer_descs)
        # Minor variation: swap a word
        words = chosen.split()
        if len(words) > 3:
            i = rng.integers(1, len(words) - 1)
            words[i] = words[i]  # keep same (exact duplicate for validation)
        row["work_description"] = " ".join(words)
        row["synthetic_change"] = "description_duplicated_from_peer"
    return row


def _inject_repetitive_pattern(row: dict, rng: np.random.Generator, real_df: pd.DataFrame) -> dict:
    """Reuse an exact description that already appears multiple times."""
    # Find the most common description in the real dataset
    common = real_df["work_description"].value_counts()
    if len(common) > 0:
        # Pick one of the top 50 most common descriptions
        top_n = min(50, len(common))
        chosen_desc = rng.choice(common.index[:top_n])
        row["work_description"] = str(chosen_desc)
        row["synthetic_change"] = "description_reused_common_pattern"
    return row


def generate_and_benchmark(
    real_works_records: list[dict],
    peer_map: dict,
    n_synthetic: int = N_SYNTHETIC,
    seed: int = 42,
) -> BenchmarkResult:
    """
    Generate synthetic anomalies from real records, run detection, report rates.

    Args:
        real_works_records: list of real work dicts (must include work_id, sanctioned_cost, work_description)
        peer_map:           dict mapping work_id → PeerStats (from peer_group_engine)
        n_synthetic:        number of synthetic records to generate
        seed:               random seed for reproducibility

    Returns:
        BenchmarkResult with detection rates per anomaly class.
    """
    from app.services.cost_anomaly_engine import batch_detect_cost_anomalies
    from app.services.text_anomaly_engine import run_text_anomaly_detection
    from app.services.risk_scoring_engine import compute_risk_score
    from app.services.peer_group_engine import PeerStats

    rng = np.random.default_rng(seed)
    real_df = pd.DataFrame(real_works_records)

    # Attach peer_group_id for description injection
    real_df["peer_group_id"] = real_df["work_id"].map(
        lambda wid: peer_map[wid].peer_group_id if wid in peer_map else "UNGROUPED"
    )

    # Sample n_synthetic works from real data
    n = min(n_synthetic, len(real_df))
    chosen_idx = rng.choice(real_df.index, size=n, replace=False)
    synthetic_df = real_df.loc[chosen_idx].copy().reset_index(drop=True)

    # Assign anomaly types
    anomaly_types = rng.choice(ANOMALY_TYPES, size=n, p=ANOMALY_PROBS)
    synthetic_df["synthetic_anomaly_type"] = anomaly_types
    synthetic_df["synthetic_label"] = 1
    synthetic_df["synthetic_change"] = ""

    # Give synthetic records new unique IDs (never overlap with real)
    synthetic_df["work_id"] = [uuid.uuid4() for _ in range(n)]

    # Inject synthetic anomalies
    records = synthetic_df.to_dict("records")
    injected: list[dict] = []
    for row in records:
        atype = row["synthetic_anomaly_type"]
        if atype == "cost_outlier":
            row = _inject_cost_outlier(row, rng, real_df)
        elif atype == "semantic_duplicate":
            row = _inject_semantic_duplicate(row, rng, real_df)
        elif atype == "repetitive_pattern":
            row = _inject_repetitive_pattern(row, rng, real_df)
        elif atype == "combined":
            row = _inject_cost_outlier(row, rng, real_df)
            row = _inject_semantic_duplicate(row, rng, real_df)
        injected.append(row)

    injected_df = pd.DataFrame(injected)

    # Build peer_map for synthetic records — inherit from their source real peer group
    synth_peer_map: dict = {}
    for row in injected:
        wid = row["work_id"]
        # Use the source real work's peer stats
        source_wid = row.get("work_id")  # already replaced; use peer_group_id
        pgid = row.get("peer_group_id", "UNGROUPED")
        # Find a real work with the same peer_group_id
        matching = [ps for rwid, ps in peer_map.items() if ps.peer_group_id == pgid]
        if matching:
            synth_peer_map[wid] = matching[0]

    # Run detection pipeline on synthetic records only
    cost_results = batch_detect_cost_anomalies(injected, synth_peer_map)
    text_results = run_text_anomaly_detection(injected, synth_peer_map)

    cost_map = {r["work_id"]: r for r in cost_results}
    text_map = {r.work_id: r for r in text_results}

    # Score and classify
    by_class: dict[str, dict] = {t: {"count": 0, "cost_detected": 0, "text_detected": 0} for t in ANOMALY_TYPES}

    for row in injected:
        wid = row["work_id"]
        atype = row["synthetic_anomaly_type"]
        cr = cost_map.get(wid, {})
        tr = text_map.get(wid)

        by_class[atype]["count"] += 1

        if cr.get("cost_anomaly_flag", False):
            by_class[atype]["cost_detected"] += 1

        if tr and tr.text_anomaly_flag:
            by_class[atype]["text_detected"] += 1

    # Aggregate metrics
    cost_cases = ["cost_outlier", "combined"]
    text_cases = ["semantic_duplicate", "repetitive_pattern", "combined"]

    n_cost_cases = sum(by_class[t]["count"] for t in cost_cases)
    cost_detected = sum(by_class[t]["cost_detected"] for t in cost_cases)
    n_text_cases = sum(by_class[t]["count"] for t in text_cases)
    text_detected = sum(by_class[t]["text_detected"] for t in text_cases)

    cost_rate = (cost_detected / n_cost_cases * 100) if n_cost_cases > 0 else 0.0
    text_rate = (text_detected / n_text_cases * 100) if n_text_cases > 0 else 0.0

    logger.info(
        "Synthetic benchmark: cost_detection=%.1f%% (%d/%d), text_detection=%.1f%% (%d/%d)",
        cost_rate, cost_detected, n_cost_cases,
        text_rate, text_detected, n_text_cases,
    )

    # Compute per-class rates
    class_results = {}
    for t, stats in by_class.items():
        n_c = stats["count"]
        if t in cost_cases:
            det = stats["cost_detected"]
        else:
            det = stats["text_detected"]
        class_results[t] = {
            "count": n_c,
            "detected": det,
            "detection_rate_pct": round(det / n_c * 100, 1) if n_c > 0 else 0.0,
        }

    return BenchmarkResult(
        n_synthetic=n,
        n_cost_cases=n_cost_cases,
        n_text_cases=n_text_cases,
        cost_detected=cost_detected,
        text_detected=text_detected,
        cost_detection_rate=round(cost_rate, 1),
        text_detection_rate=round(text_rate, 1),
        by_class=class_results,
    )
