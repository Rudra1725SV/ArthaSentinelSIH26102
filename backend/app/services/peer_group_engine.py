"""
Peer Group Engine — ArthaSentinel
Reproduces notebook Step 3: 7-level hierarchical peer group construction.

Minimum peer group size = 15 (consistent with notebook methodology).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

MIN_PEER_SIZE = 15


@dataclass
class PeerStats:
    """Statistics for a single peer group."""
    peer_group_id: str
    peer_group_level: int
    peer_group_size: int
    peer_median: float
    peer_mean: float
    peer_q1: float
    peer_q3: float
    peer_iqr: float
    peer_mad: float
    peer_effective_mad: float


@dataclass
class WorkPeerResult:
    """Peer assignment and statistics for one work."""
    work_id: Any            # UUID or string
    source_work_id: str
    cost: float
    peer_stats: PeerStats | None = None


def _effective_mad(mad: float, median: float, fallback_factor: float = 0.05) -> float:
    """
    Stabilize MAD=0 using a fraction of the median as the fallback.
    This prevents division-by-zero without marking zero-MAD groups as outliers.
    """
    if mad > 0:
        return mad
    # When MAD=0, the peer group is highly homogeneous — use fraction of median
    if median > 0:
        return median * fallback_factor
    return 1.0  # degenerate safety fallback


def _compute_peer_stats(
    group_id: str,
    level: int,
    costs: np.ndarray
) -> PeerStats:
    """Compute IQR, MAD, and robust statistics for a peer group."""
    costs = costs[np.isfinite(costs)]
    n = len(costs)
    median = float(np.median(costs))
    mean = float(np.mean(costs))
    q1 = float(np.percentile(costs, 25))
    q3 = float(np.percentile(costs, 75))
    iqr = q3 - q1
    mad = float(np.median(np.abs(costs - median)))
    eff_mad = _effective_mad(mad, median)

    return PeerStats(
        peer_group_id=group_id,
        peer_group_level=level,
        peer_group_size=n,
        peer_median=median,
        peer_mean=mean,
        peer_q1=q1,
        peer_q3=q3,
        peer_iqr=iqr,
        peer_mad=mad,
        peer_effective_mad=eff_mad,
    )


def _normalize(val: Any) -> str:
    """Normalize a field value to uppercase string, treating nulls as UNKNOWN."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return "UNKNOWN"
    return str(val).strip().upper()


def _make_group_id(level: int, fields: tuple[str, ...]) -> str:
    return f"L{level}::" + "||".join(fields)


def build_peer_groups(
    works_df: pd.DataFrame,
) -> dict[Any, PeerStats]:
    """
    Build 7-level peer groups from a DataFrame containing ingested works.

    Required columns:
        work_id, sanctioned_cost (or cost), category_normalized,
        geo_district_normalized, completion_year, house

    Returns:
        dict mapping work_id → PeerStats
    """
    df = works_df.copy()

    # Resolve cost column name
    if "sanctioned_cost" in df.columns:
        df["cost"] = pd.to_numeric(df["sanctioned_cost"], errors="coerce")
    elif "cost" in df.columns:
        df["cost"] = pd.to_numeric(df["cost"], errors="coerce")
    else:
        raise ValueError("DataFrame must have 'sanctioned_cost' or 'cost' column")

    # Normalize grouping fields
    df["_cat"] = df.get("category_normalized", df.get("category", pd.Series(["UNKNOWN"] * len(df)))).apply(_normalize)
    df["_dist"] = df.get("geo_district_normalized", df.get("geo_district", pd.Series(["UNKNOWN"] * len(df)))).apply(_normalize)
    df["_state"] = df.get("state_normalized", df.get("state", df.get("downloaded_state", pd.Series(["UNKNOWN"] * len(df))))).apply(_normalize)
    df["_house"] = df.get("house", pd.Series(["UNKNOWN"] * len(df))).apply(
        lambda x: x.value if hasattr(x, "value") else _normalize(x)
    )
    df["_year"] = df.get("completion_year", pd.Series([0] * len(df))).fillna(0).astype(int).astype(str)

    # 7-level hierarchy (from notebook Step 3)
    LEVELS: list[list[str]] = [
        ["_cat", "_dist", "_year", "_house"],   # L1 — most specific
        ["_cat", "_dist", "_year"],             # L2
        ["_cat", "_dist"],                      # L3
        ["_cat", "_state", "_year"],            # L4
        ["_cat", "_state"],                     # L5
        ["_cat", "_house"],                     # L6
        ["_cat"],                               # L7 — broadest
    ]

    # Group-level stats cache
    stats_cache: dict[str, PeerStats] = {}

    def _get_or_compute(group_id: str, level: int, mask: pd.Series) -> PeerStats:
        if group_id not in stats_cache:
            costs = df.loc[mask, "cost"].dropna().values
            stats_cache[group_id] = _compute_peer_stats(group_id, level, costs)
        return stats_cache[group_id]

    # Precompute group sizes per level for quick lookup
    # We assign each work to the FIRST level where group size >= MIN_PEER_SIZE
    result: dict[Any, PeerStats] = {}
    unassigned_mask = pd.Series([True] * len(df), index=df.index)

    for level_idx, level_fields in enumerate(LEVELS):
        level_num = level_idx + 1
        if unassigned_mask.sum() == 0:
            break

        # Compute group keys for currently unassigned
        group_keys = df[unassigned_mask][level_fields].apply(
            lambda row: tuple(row.values), axis=1
        )

        # Count group sizes across FULL dataframe (not just unassigned)
        full_keys = df[level_fields].apply(lambda row: tuple(row.values), axis=1)
        size_map = full_keys.value_counts()

        for idx in df[unassigned_mask].index:
            key = tuple(df.loc[idx, level_fields].values)
            size = size_map.get(key, 0)

            if size >= MIN_PEER_SIZE or level_num == 7:
                # Assign to this level
                gid = _make_group_id(level_num, key)
                # Compute stats over ALL works in this group (not just unassigned)
                full_mask = full_keys == key
                ps = _get_or_compute(gid, level_num, full_mask)
                result[df.loc[idx, "work_id"]] = ps
                unassigned_mask.at[idx] = False

    logger.info(
        "Peer group assignment: %d works assigned, %d unassigned",
        len(result),
        unassigned_mask.sum(),
    )
    return result
