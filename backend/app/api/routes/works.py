"""Works endpoints for paginated browsing, filtering, and reviewer actions."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.mplads import (
    PaginatedWorksResponse,
    ReviewerActionRequest,
    ReviewerActionResponse,
    WorkItemDTO,
)
from app.services import mplads_query

router = APIRouter()


@router.get("/works", response_model=PaginatedWorksResponse, summary="Browse paginated works with filters")
def list_works(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
    search: str | None = Query(default=None),
    house: str | None = Query(default=None),
    state: str | None = Query(default=None),
    category: str | None = Query(default=None),
    mp_id: str | None = Query(default=None),
    sort_by: str | None = Query(default=None),
    session: Session = Depends(get_db_session),
) -> PaginatedWorksResponse:
    return mplads_query.get_works_paginated(
        session=session,
        page=page,
        limit=limit,
        search=search,
        house=house,
        state=state,
        category=category,
        mp_id=mp_id,
        sort_by=sort_by,
    )


@router.get("/works/{work_id}", response_model=WorkItemDTO, summary="Get details for a single MPLADS work")
def get_work_details(
    work_id: str,
    session: Session = Depends(get_db_session),
) -> WorkItemDTO:
    work = mplads_query.get_work_by_id(session, work_id)
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work record '{work_id}' not found",
        )
    return work


@router.post("/works/{work_id}/action", response_model=ReviewerActionResponse, summary="Submit a reviewer action or audit observation")
def submit_reviewer_action(
    work_id: str,
    payload: ReviewerActionRequest,
) -> ReviewerActionResponse:
    record = mplads_query.record_reviewer_action(work_id=work_id, action=payload.action, note=payload.note)
    return ReviewerActionResponse(success=True, auditRecord=record)
