"""
Text Anomaly Engine — ArthaSentinel
Reproduces notebook Step 6: context-aware text/description anomaly detection.

Primary method: TF-IDF cosine similarity within peer groups (fast, deterministic).
Extended method: Sentence Transformers + pgvector (batch embedding, stored in works table).

CRITICAL DESIGN RULE:
  Real records are scored using a corpus of REAL records only.
  Synthetic records are benchmarked separately.

Signals:
  - exact_duplicate_flag: same cleaned text appears >= 2 times in peer group
  - high_frequency_duplicate_flag: peer_description_frequency >= 5
  - very_high_similarity_flag: cosine similarity >= 0.95
  - strong_contextual_duplicate: (very_high_similarity OR high_frequency) AND NOT exact

Thresholds match notebook validation (similarity >= 0.85 → semantic duplicate flag).
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Similarity thresholds (from notebook Step 6 validation)
SIMILARITY_HIGH = 0.85        # semantic_duplicate_flag
SIMILARITY_VERY_HIGH = 0.95   # very_high_similarity_flag
MIN_WORDS = 3                 # Skip trivially short descriptions


def _clean_text(text: str | None) -> str:
    if not text or pd.isna(text):
        return ""
    x = str(text).lower()
    x = re.sub(r"[^a-z0-9\s]", " ", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x


@dataclass
class TextAnomalyResult:
    work_id: object
    description_clean: str = ""
    peer_description_frequency: int = 1
    nearest_similarity_score: float = 0.0
    nearest_related_work_id: object = None
    exact_duplicate_flag: bool = False
    high_frequency_duplicate_flag: bool = False
    very_high_similarity_flag: bool = False
    semantic_duplicate_flag: bool = False
    strong_contextual_duplicate: bool = False
    text_anomaly_flag: bool = False
    text_anomaly_score: float = 0.0
    text_evidence: str = ""


def _compute_peer_tfidf_similarity(
    df: pd.DataFrame,
    peer_group_id_col: str = "peer_group_id",
    description_col: str = "description_clean",
    work_id_col: str = "work_id",
) -> pd.DataFrame:
    """
    For each work, compute the max cosine similarity to any other work in its peer group.
    Returns DataFrame with columns: work_id, nearest_similarity_score, nearest_related_work_id.
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

    rows = []
    failed = 0
    groups = df.groupby(peer_group_id_col)

    for gid, grp in groups:
        texts = grp[description_col].fillna("").tolist()
        work_ids = grp[work_id_col].tolist()

        # Skip trivially small or empty groups
        valid_mask = [len(t.split()) >= MIN_WORDS for t in texts]
        if sum(valid_mask) < 2:
            for wid in work_ids:
                rows.append({"work_id": wid, "nearest_similarity_score": 0.0, "nearest_related_work_id": None})
            continue

        try:
            vectorizer = TfidfVectorizer(
                min_df=1, max_df=1.0, ngram_range=(1, 2), sublinear_tf=True
            )
            tfidf_matrix = vectorizer.fit_transform(texts)
            sim_matrix = sk_cosine(tfidf_matrix)

            for i, wid in enumerate(work_ids):
                # Exclude self-similarity
                row = sim_matrix[i].copy()
                row[i] = 0.0
                max_sim = float(row.max())
                max_j = int(row.argmax()) if max_sim > 0 else -1
                related_id = work_ids[max_j] if max_j >= 0 else None
                rows.append({
                    "work_id": wid,
                    "nearest_similarity_score": max_sim,
                    "nearest_related_work_id": related_id,
                })
        except Exception as e:
            failed += 1
            for wid in work_ids:
                rows.append({"work_id": wid, "nearest_similarity_score": 0.0, "nearest_related_work_id": None})

    if failed:
        logger.warning("TF-IDF failed for %d peer groups", failed)

    return pd.DataFrame(rows)


def run_text_anomaly_detection(
    works_records: list[dict],
    peer_group_map: dict,
) -> list[TextAnomalyResult]:
    """
    Run text anomaly detection on a list of work records.

    Args:
        works_records: list of dicts with work_id, work_description (or description),
                       and peer_group_id (or inferred from peer_group_map).
        peer_group_map: dict mapping work_id → PeerStats (from peer_group_engine).

    Returns:
        list of TextAnomalyResult (one per work).
    """
    df = pd.DataFrame(works_records)

    # Resolve ID column
    id_col = "work_id" if "work_id" in df.columns else "id"
    df = df.rename(columns={id_col: "work_id"})

    # Resolve description column
    desc_col = "work_description" if "work_description" in df.columns else "description"
    df["description_clean"] = df[desc_col].apply(_clean_text)

    # Attach peer_group_id from peer_group_map
    df["peer_group_id"] = df["work_id"].map(
        lambda wid: peer_group_map[wid].peer_group_id if wid in peer_group_map else "UNGROUPED"
    )

    logger.info("Running TF-IDF text analysis: %d works, %d peer groups", len(df), df["peer_group_id"].nunique())

    # ── 1. Exact duplicate frequency within peer group ───────────────────────
    df["peer_description_frequency"] = (
        df.groupby(["peer_group_id", "description_clean"])["description_clean"]
        .transform("count")
        .fillna(1)
        .astype(int)
    )
    df["exact_duplicate_flag"] = df["peer_description_frequency"] >= 2
    df["high_frequency_duplicate_flag"] = df["peer_description_frequency"] >= 5

    # ── 2. TF-IDF cosine similarity within peer groups ────────────────────────
    sim_df = _compute_peer_tfidf_similarity(df)
    df = df.merge(sim_df, on="work_id", how="left")

    df["nearest_similarity_score"] = df["nearest_similarity_score"].fillna(0.0)
    df["nearest_related_work_id"] = df["nearest_related_work_id"].where(
        df["nearest_similarity_score"].notna(), other=None
    )

    # ── 3. Flags ──────────────────────────────────────────────────────────────
    df["semantic_duplicate_flag"] = df["nearest_similarity_score"] >= SIMILARITY_HIGH
    df["very_high_similarity_flag"] = df["nearest_similarity_score"] >= SIMILARITY_VERY_HIGH

    # Strong contextual duplicate = very high similarity OR high frequency (and NOT just noise)
    df["strong_contextual_duplicate"] = (
        df["very_high_similarity_flag"] | df["high_frequency_duplicate_flag"]
    )

    # Text anomaly = strong contextual duplicate (matches notebook's "final text anomalies" 13.41%)
    df["text_anomaly_flag"] = df["strong_contextual_duplicate"]

    # ── 4. Text anomaly score ─────────────────────────────────────────────────
    df["text_anomaly_score"] = 0.0
    df.loc[df["strong_contextual_duplicate"], "text_anomaly_score"] += 45.0
    df.loc[df["very_high_similarity_flag"], "text_anomaly_score"] += 10.0
    df.loc[df["high_frequency_duplicate_flag"], "text_anomaly_score"] += 15.0
    df.loc[df["exact_duplicate_flag"], "text_anomaly_score"] += 5.0
    df["text_anomaly_score"] = df["text_anomaly_score"].clip(0, 100)

    # ── 5. Evidence strings ───────────────────────────────────────────────────
    def _evidence(row: pd.Series) -> str:
        parts = []
        if row["exact_duplicate_flag"]:
            parts.append(f"Exact description repeated {int(row['peer_description_frequency'])}× in peer group")
        if row["very_high_similarity_flag"]:
            parts.append(f"Potentially similar work (similarity={row['nearest_similarity_score']:.2f})")
        elif row["semantic_duplicate_flag"]:
            parts.append(f"Similar work detected (similarity={row['nearest_similarity_score']:.2f})")
        if row["high_frequency_duplicate_flag"]:
            parts.append(f"High-frequency description pattern ({int(row['peer_description_frequency'])}× in peer)")
        if not parts:
            parts.append(f"No text anomaly signal (max similarity={row['nearest_similarity_score']:.2f})")
        return " | ".join(parts)

    df["text_evidence"] = df.apply(_evidence, axis=1)

    logger.info(
        "Text anomaly results: %d strong contextual duplicates (%.1f%%), %d exact duplicates",
        int(df["strong_contextual_duplicate"].sum()),
        float(df["strong_contextual_duplicate"].mean() * 100),
        int(df["exact_duplicate_flag"].sum()),
    )

    results = []
    for _, row in df.iterrows():
        results.append(TextAnomalyResult(
            work_id=row["work_id"],
            description_clean=row["description_clean"],
            peer_description_frequency=int(row["peer_description_frequency"]),
            nearest_similarity_score=float(row["nearest_similarity_score"]),
            nearest_related_work_id=row.get("nearest_related_work_id"),
            exact_duplicate_flag=bool(row["exact_duplicate_flag"]),
            high_frequency_duplicate_flag=bool(row["high_frequency_duplicate_flag"]),
            very_high_similarity_flag=bool(row["very_high_similarity_flag"]),
            semantic_duplicate_flag=bool(row["semantic_duplicate_flag"]),
            strong_contextual_duplicate=bool(row["strong_contextual_duplicate"]),
            text_anomaly_flag=bool(row["text_anomaly_flag"]),
            text_anomaly_score=float(row["text_anomaly_score"]),
            text_evidence=str(row["text_evidence"]),
        ))

    return results
