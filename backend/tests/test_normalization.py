from app.models.enums import House
from app.services.normalization import ValidationFailure, normalize_record


def valid_record() -> dict[str, object]:
    return {
        "_id": "source-1",
        "work_id": 42,
        "work_description": "  Repair   school building ",
        "category": "Normal/Others",
        "cost": 125000.5,
        "completion_date": "2025-02-03T00:00:00.000Z",
        "completion_year": 2025,
        "district": "Example District",
        "state": "Example State",
        "mp_details": {"name": "Example MP", "constituency": "Example Constituency", "party": "Lok Sabha"},
    }


def test_normalizes_source_identifiers_and_notebook_compatible_text() -> None:
    result = normalize_record(valid_record(), House.LOK_SABHA)
    assert not isinstance(result, ValidationFailure)
    assert result.source_work_id == "42"
    assert result.work_description == "Repair school building"
    assert result.work_description_normalized == "repair school building"
    assert str(result.sanctioned_cost) == "125000.5"


def test_rejects_placeholder_description_with_explicit_reason() -> None:
    record = valid_record()
    record["work_description"] = "N/A"
    result = normalize_record(record, House.RAJYA_SABHA)
    assert isinstance(result, ValidationFailure)
    assert "missing_work_description" in result.reasons


def test_rejects_completion_year_date_conflict() -> None:
    record = valid_record()
    record["completion_year"] = 2024
    result = normalize_record(record, House.LOK_SABHA)
    assert isinstance(result, ValidationFailure)
    assert "completion_year_does_not_match_completion_date" in result.reasons


def test_extracts_geo_district_for_rajya_sabha_location() -> None:
    record = valid_record()
    record["district"] = "Sitting Rajya Sabha"
    record["location"] = "Y.S.R. Kadapa(DISTRICT COLLECTOR CUDDAPAH_IDA)"
    result = normalize_record(record, House.RAJYA_SABHA)
    assert not isinstance(result, ValidationFailure)
    assert result.district == "Sitting Rajya Sabha"
    assert result.geo_district == "Y.S.R. Kadapa"
    assert result.geo_district_normalized == "Y.S.R. KADAPA"


def test_extracts_geo_district_for_lok_sabha_defaults_to_district() -> None:
    record = valid_record()
    record["district"] = "TIRUPATI"
    record["location"] = "Tirupati(DISTRICT COLLECTOR TIRUPATI_IDA)"
    result = normalize_record(record, House.LOK_SABHA)
    assert not isinstance(result, ValidationFailure)
    assert result.district == "TIRUPATI"
    assert result.geo_district == "TIRUPATI"
    assert result.geo_district_normalized == "TIRUPATI"

