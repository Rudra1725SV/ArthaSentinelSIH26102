"""Liveness and database-readiness endpoint."""

import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.pgvector import pgvector_is_available
from app.db.session import get_engine
from app.schemas.health import HealthResponse

logger = logging.getLogger(__name__)
router = APIRouter()


def check_health() -> HealthResponse:
    """Verify PostgreSQL connectivity without creating application data."""
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
            vector_status = "available" if pgvector_is_available(connection) else "not_enabled"
    except (RuntimeError, SQLAlchemyError) as exc:
        logger.warning("Health check failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable or not configured",
        ) from exc
    return HealthResponse(status="healthy", version="0.1.0", database="connected", pgvector=vector_status)


@router.get("/health", response_model=HealthResponse, summary="Check API and database readiness")
def health() -> HealthResponse:
    return check_health()
