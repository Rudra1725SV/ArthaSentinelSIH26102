"""
Pattern Analysis Service — ArthaSentinel
Reproduces notebook Cell 42: Duplicate Project Pattern & Repetitive Analysis.

A repeated feature combination across DIFFERENT work IDs is not automatically
a duplicate project and is NOT a fraud decision. It is retained as supporting
investigation context only.

Pattern strength thresholds:
  VERY_HIGH: repeated 10+ times
  HIGH:      repeated 5–9 times
  MODERATE:  repeated 3–4 times
  LOW:       repeated 2 times
  NONE:      unique (1)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class PatternSignalResult:
    work_id: Any
    duplicate_pattern_strength: str  # NONE, LOW, MODERATE, HIGH, VERY_HIGH
    pattern_record_count: int
    repetitive_pattern_flag: bool
    pattern_evidence: str


def compute_pattern_signals(works_df: pd.DataFrame) -> dict[Any, PatternSignalResult]:
    """
    Compute duplicate project patterns from notebook Cell 42 methodology.

    Fields:
      house, work_description_clean, category_normalized, state_normalized,
      geo_district_normalized, sanctioned_cost, completion_year
    """
    df = works_df.copy()

    # Prepare normalized fields
    cols_to_use = []
    for c in ["house", "category_normalized", "state_normalized", "geo_district_normalized"]:
        if c in df.columns:
            df[f"_{c}"] = df[c].fillna("UNKNOWN").astype(str).str.strip().str.upper()
            cols_to_use.append(f"_{c}")

    if "work_description" in df.columns:
        df["_desc"] = (
            df["work_description"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )
        cols_to_use.append("_desc")

    if "completion_year" in df.columns:
        df["_year"] = df["completion_year"].fillna(-1).astype(int)
        cols_to_use.append("_year")

    # Group and count pattern frequency
    pattern_counts = df.groupby(cols_to_use)["work_id"].transform("count").fillna(1).astype(int)
    df["_pattern_count"] = pattern_counts

    results: dict[Any, PatternSignalResult] = {}
    for idx, row in df.iterrows():
        wid = row["work_id"]
        cnt = int(row["_pattern_count"])

        if cnt >= 10:
            strength = "VERY_HIGH"
            is_rep = True
            ev = f"Identical project signature repeated across {cnt} works in dataset (Very High Repetition)"
        elif cnt >= 5:
            strength = "HIGH"
            is_rep = True
            ev = f"Identical project signature repeated across {cnt} works in dataset (High Repetition)"
        elif cnt >= 3:
            strength = "MODERATE"
            is_rep = True
            ev = f"Identical project signature repeated across {cnt} works in dataset (Moderate Repetition)"
        elif cnt == 2:
            strength = "LOW"
            is_rep = False
            ev = "Identical project signature appears in 2 works in dataset"
        else:
            strength = "NONE"
            is_rep = False
            ev = "Unique project specification pattern"

        results[wid] = PatternSignalResult(
            work_id=wid,
            duplicate_pattern_strength=strength,
            pattern_record_count=cnt,
            repetitive_pattern_flag=is_rep,
            pattern_evidence=ev,
        )

    logger.info(
        "Pattern analysis complete: %d works processed, %d repetitive (count >= 3)",
        len(results),
        sum(1 for r in results.values() if r.repetitive_pattern_flag),
    )
    return results
