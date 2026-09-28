"""Audit trail endpoint backed by ingestion logs and reviewer activities."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.mplads import AuditTrailResponse
from app.services import mplads_query

router = APIRouter()


@router.get("/audit", response_model=AuditTrailResponse, summary="Get full audit trail of pipeline runs and observations")
def get_audit_trail(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_db_session),
) -> AuditTrailResponse:
    return mplads_query.get_audit_trail(session=session, page=page, limit=limit)
