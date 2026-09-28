"""Health response contracts."""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["healthy"]
    version: str
    database: Literal["connected"]
    pgvector: Literal["available", "not_enabled"]
