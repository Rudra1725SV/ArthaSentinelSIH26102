"""Pydantic contracts for ingestion tracking and reporting."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import House, IngestionStatus


class IngestionRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dataset_id: UUID
    house: House
    source_file: str
    status: IngestionStatus
    started_at: datetime
    completed_at: datetime | None
    total_rows: int
    inserted_rows: int
    rejected_rows: int
    duplicate_rows: int
    error_summary: str | None


class IngestionSummary(BaseModel):
    ingestion_run_id: UUID
    house: House
    source_file: str
    total_rows: int
    inserted_rows: int
    rejected_rows: int
    duplicate_rows: int
    status: IngestionStatus
