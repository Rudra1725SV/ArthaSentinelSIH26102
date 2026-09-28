"""Repeatable JSON-to-PostgreSQL ingestion for MPLADS source datasets."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.dataset import Dataset, IngestionRun, RejectedRecord
from app.models.enums import House, IngestionStatus
from app.models.mplads import Constituency, Representative, Work
from app.schemas.ingestion import IngestionSummary
from app.services.normalization import NormalizedWork, ValidationFailure, normalize_record


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json_records(path: Path) -> list[object]:
    with path.open("r", encoding="utf-8") as source:
        parsed = json.load(source)
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        for key in ("data", "records", "results", "works"):
            if isinstance(parsed.get(key), list):
                return parsed[key]
    raise ValueError("JSON must contain a record list or a supported list wrapper")


def _get_or_create_constituency(session: Session, work: NormalizedWork, cache: dict[tuple[str, ...], Constituency]) -> Constituency:
    key = (work.house.value, work.state_normalized, work.district_normalized, work.constituency_normalized)
    if key not in cache:
        entity = session.scalar(select(Constituency).where(
            Constituency.house == work.house,
            Constituency.state_normalized == work.state_normalized,
            Constituency.district_normalized == work.district_normalized,
            Constituency.name_normalized == work.constituency_normalized,
        ))
        if entity is None:
            entity = Constituency(house=work.house, name=work.constituency_name, name_normalized=work.constituency_normalized, state=work.state, state_normalized=work.state_normalized, district=work.district, district_normalized=work.district_normalized)
            session.add(entity)
            session.flush()
        cache[key] = entity
    return cache[key]


def _get_or_create_representative(session: Session, work: NormalizedWork, constituency: Constituency, cache: dict[tuple[str, ...], Representative]) -> Representative:
    key = (work.house.value, work.representative_name_normalized, str(constituency.id))
    if key not in cache:
        entity = session.scalar(select(Representative).where(
            Representative.house == work.house,
            Representative.name_normalized == work.representative_name_normalized,
            Representative.constituency_id == constituency.id,
        ))
        if entity is None:
            entity = Representative(house=work.house, constituency_id=constituency.id, name=work.representative_name, name_normalized=work.representative_name_normalized, name_hi=work.representative_name_hi, source_party_label=work.source_party_label)
            session.add(entity)
            session.flush()
        cache[key] = entity
    return cache[key]


def ingest_json_file(session: Session, path: Path, house: House) -> IngestionSummary:
    """Ingest one authoritative JSON file without modifying it.

    Existing `(house, source_work_id)` rows are counted as duplicates. Invalid
    source rows are persisted with their reasons and complete raw payload.
    """
    records = load_json_records(path)
    file_hash = sha256_file(path)
    dataset = session.scalar(select(Dataset).where(Dataset.house == house, Dataset.sha256 == file_hash))
    if dataset is None:
        dataset = Dataset(house=house, source_file=path.name, sha256=file_hash, source_row_count=len(records))
        session.add(dataset)
        session.flush()
    run = IngestionRun(dataset_id=dataset.id, house=house, source_file=path.name, status=IngestionStatus.RUNNING, total_rows=len(records))
    session.add(run)
    session.flush()

    existing_ids = set(session.scalars(select(Work.source_work_id).where(Work.house == house)).all())
    seen_ids: set[str] = set()
    seen_payloads: set[str] = set()

    # Pre-populate caches to avoid redundant database round-trips across 20k+ rows
    constituency_cache: dict[tuple[str, ...], Constituency] = {
        (c.house.value, c.state_normalized, c.district_normalized, c.name_normalized): c
        for c in session.scalars(select(Constituency).where(Constituency.house == house)).all()
    }
    representative_cache: dict[tuple[str, ...], Representative] = {
        (rep.house.value, rep.name_normalized, str(rep.constituency_id)): rep
        for rep in session.scalars(select(Representative).where(Representative.house == house)).all()
    }

    try:
        for row_number, raw in enumerate(records, start=1):
            raw_fingerprint = json.dumps(raw, sort_keys=True, ensure_ascii=False, separators=(",", ":")) if isinstance(raw, dict) else repr(raw)
            if raw_fingerprint in seen_payloads:
                run.duplicate_rows += 1
                continue
            seen_payloads.add(raw_fingerprint)
            normalized = normalize_record(raw, house)
            if isinstance(normalized, ValidationFailure):
                run.rejected_rows += 1
                session.add(RejectedRecord(
                    ingestion_run_id=run.id,
                    source_row_number=row_number,
                    source_record_id=str(raw.get("_id")) if isinstance(raw, dict) and raw.get("_id") is not None else None,
                    rejection_reasons=normalized.reasons,
                    raw_payload=raw if isinstance(raw, dict) else {"value": raw},
                ))
                continue
            if normalized.source_work_id in seen_ids or normalized.source_work_id in existing_ids:
                run.duplicate_rows += 1
                continue
            seen_ids.add(normalized.source_work_id)
            constituency = _get_or_create_constituency(session, normalized, constituency_cache)
            representative = _get_or_create_representative(session, normalized, constituency, representative_cache)
            session.add(Work(
                dataset_id=dataset.id,
                house=house,
                constituency_id=constituency.id,
                representative_id=representative.id,
                source_record_id=normalized.source_record_id,
                source_work_id=normalized.source_work_id,
                source_row_number=row_number,
                work_description=normalized.work_description,
                work_description_normalized=normalized.work_description_normalized,
                work_description_hi=normalized.work_description_hi,
                category=normalized.category,
                category_normalized=normalized.category_normalized,
                category_hi=normalized.category_hi,
                sanctioned_cost=normalized.sanctioned_cost,
                completion_date=normalized.completion_date,
                completion_year=normalized.completion_year,
                beneficiaries=normalized.beneficiaries,
                location=normalized.location,
                location_hi=normalized.location_hi,
                source_district=normalized.district,
                source_district_hi=normalized.source_district_hi,
                geo_district=normalized.geo_district,
                geo_district_normalized=normalized.geo_district_normalized,
                state_hi=normalized.state_hi,
                downloaded_state=normalized.downloaded_state,
                raw_payload=normalized.raw_payload,
            ))
            run.inserted_rows += 1

            # Periodic flush every 500 records keeps memory and transaction size optimal
            if (run.inserted_rows + run.rejected_rows) % 500 == 0:
                session.flush()

        run.status = IngestionStatus.COMPLETED_WITH_REJECTIONS if run.rejected_rows else IngestionStatus.COMPLETED
        run.completed_at = datetime.now(timezone.utc)
        session.commit()
    except Exception as exc:
        session.rollback()
        raise RuntimeError(f"Ingestion failed for {path.name}: {exc}") from exc

    return IngestionSummary(
        ingestion_run_id=run.id,
        house=house,
        source_file=path.name,
        total_rows=run.total_rows,
        inserted_rows=run.inserted_rows,
        rejected_rows=run.rejected_rows,
        duplicate_rows=run.duplicate_rows,
        status=run.status,
    )
