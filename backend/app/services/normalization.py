"""Pure normalization and validation for authoritative MPLADS JSON records.

This module deliberately does not infer project types, risk, geographic data,
or ML features. It preserves source values alongside normalized comparison keys.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any

from app.models.enums import House

_PLACEHOLDERS = {"", "N/A", "NA", "NULL", "NONE", "-", "NOT AVAILABLE"}


@dataclass(frozen=True)
class NormalizedWork:
    source_record_id: str
    source_work_id: str
    house: House
    representative_name: str
    representative_name_normalized: str
    representative_name_hi: str | None
    source_party_label: str | None
    constituency_name: str
    constituency_normalized: str
    state: str
    state_normalized: str
    district: str
    district_normalized: str
    geo_district: str | None
    geo_district_normalized: str | None
    work_description: str
    work_description_normalized: str
    work_description_hi: str | None
    category: str
    category_normalized: str
    category_hi: str | None
    sanctioned_cost: Decimal
    completion_date: date | None
    completion_year: int | None
    beneficiaries: int | None
    location: str | None
    location_hi: str | None
    source_district_hi: str | None
    state_hi: str | None
    downloaded_state: str | None
    raw_payload: dict[str, Any]


@dataclass(frozen=True)
class ValidationFailure:
    reasons: list[str]


def clean_text(value: Any, *, upper: bool = False) -> str | None:
    if value is None:
        return None
    text = " ".join(str(value).split()).strip()
    if text.upper() in _PLACEHOLDERS:
        return None
    return text.upper() if upper else text


def normalized_key(value: Any) -> str | None:
    return clean_text(value, upper=True)


def normalized_description(value: Any) -> str | None:
    """Notebook-compatible clean text: whitespace-normalized and lowercased."""
    text = clean_text(value)
    return text.lower() if text is not None else None


def parse_cost(value: Any) -> Decimal | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        amount = Decimal(str(value).replace(",", "").replace("₹", "").strip())
    except (InvalidOperation, AttributeError):
        return None
    return amount if amount > 0 else None


def parse_completion_date(value: Any) -> date | None:
    text = clean_text(value)
    if text is None:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def parse_year(value: Any) -> int | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        year = int(value)
    except (TypeError, ValueError):
        return None
    return year if 1900 <= year <= 2200 else None


def extract_geo_district(location: Any, raw_district: str | None, house: House) -> str | None:
    """Extract administrative geographic district matching downstream notebook methodology.

    For Lok Sabha, raw_district is already the primary district.
    For Rajya Sabha, raw_district is often 'Sitting Rajya Sabha', while location
    starts with the actual district before parentheses, e.g. 'Y.S.R. Kadapa(DISTRICT...)'.
    """
    if house == House.RAJYA_SABHA and location:
        loc_str = str(location).strip()
        if "(" in loc_str:
            extracted = clean_text(loc_str.split("(", 1)[0])
            if extracted:
                return extracted
        cleaned_loc = clean_text(loc_str)
        if cleaned_loc:
            return cleaned_loc
    return clean_text(raw_district)


def normalize_record(raw: Any, house: House) -> NormalizedWork | ValidationFailure:
    if not isinstance(raw, dict):
        return ValidationFailure(["record_must_be_an_object"])

    mp = raw.get("mp_details")
    if not isinstance(mp, dict):
        mp = {}
    source_record_id = clean_text(raw.get("_id"))
    work_id = raw.get("work_id")
    work_id_text = clean_text(work_id)
    name = clean_text(mp.get("name"))
    constituency = clean_text(mp.get("constituency"))
    state = clean_text(raw.get("state"))
    district = clean_text(raw.get("district"))
    description = clean_text(raw.get("work_description"))
    category = clean_text(raw.get("category"))
    cost = parse_cost(raw.get("cost"))
    completion_date = parse_completion_date(raw.get("completion_date"))
    completion_year = parse_year(raw.get("completion_year"))

    required = {
        "missing_source_record_id": source_record_id,
        "missing_work_id": work_id_text,
        "missing_representative_name": name,
        "missing_constituency": constituency,
        "missing_state": state,
        "missing_district": district,
        "missing_work_description": description,
        "missing_category": category,
        "missing_or_invalid_cost": cost,
        "missing_or_invalid_completion_date": completion_date,
        "missing_or_invalid_completion_year": completion_year,
    }
    reasons = [reason for reason, value in required.items() if value is None]
    if completion_date and completion_year and completion_date.year != completion_year:
        reasons.append("completion_year_does_not_match_completion_date")
    if reasons:
        return ValidationFailure(reasons)

    beneficiaries = raw.get("beneficiaries")
    try:
        beneficiaries_value = int(beneficiaries) if beneficiaries is not None else None
    except (TypeError, ValueError):
        beneficiaries_value = None

    geo_district_val = extract_geo_district(raw.get("location"), district, house)

    return NormalizedWork(
        source_record_id=source_record_id or "",
        source_work_id=work_id_text or "",
        house=house,
        representative_name=name or "",
        representative_name_normalized=normalized_key(name) or "",
        representative_name_hi=clean_text(mp.get("name_hi")),
        source_party_label=clean_text(mp.get("party")),
        constituency_name=constituency or "",
        constituency_normalized=normalized_key(constituency) or "",
        state=state or "",
        state_normalized=normalized_key(state) or "",
        district=district or "",
        district_normalized=normalized_key(district) or "",
        geo_district=geo_district_val,
        geo_district_normalized=normalized_key(geo_district_val),
        work_description=description or "",
        work_description_normalized=normalized_description(description) or "",
        work_description_hi=clean_text(raw.get("work_description_hi")),
        category=category or "",
        category_normalized=normalized_key(category) or "",
        category_hi=clean_text(raw.get("category_hi")),
        sanctioned_cost=cost or Decimal("0"),
        completion_date=completion_date,
        completion_year=completion_year,
        beneficiaries=beneficiaries_value,
        location=clean_text(raw.get("location")),
        location_hi=clean_text(raw.get("location_hi")),
        source_district_hi=clean_text(raw.get("district_hi")),
        state_hi=clean_text(raw.get("state_hi")),
        downloaded_state=clean_text(raw.get("downloaded_state")),
        raw_payload=raw,
    )
