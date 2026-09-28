"""Overview metrics and validation summary endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.mplads import OverviewResponse, ValidationSummaryResponse
from app.services import mplads_query

router = APIRouter()


@router.get("/overview", response_model=OverviewResponse, summary="Get dataset overview KPIs and aggregates")
def get_overview_metrics(session: Session = Depends(get_db_session)) -> OverviewResponse:
    return mplads_query.get_overview(session)


@router.get("/validation/summary", response_model=ValidationSummaryResponse, summary="Get ML validation metrics baseline")
def get_validation_summary() -> ValidationSummaryResponse:
    return mplads_query.get_validation_summary()
