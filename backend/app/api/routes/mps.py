"""MP (Representative) directory endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.mplads import MPDetailDTO, PaginatedMPsResponse
from app.services import mplads_query

router = APIRouter()


@router.get("/mps", response_model=PaginatedMPsResponse, summary="List representatives with pagination and filters")
def list_mps(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
    search: str | None = Query(default=None),
    house: str | None = Query(default=None),
    state: str | None = Query(default=None),
    sort: str | None = Query(default=None),
    session: Session = Depends(get_db_session),
) -> PaginatedMPsResponse:
    return mplads_query.get_mps_paginated(
        session=session,
        page=page,
        limit=limit,
        search=search,
        house=house,
        state=state,
        sort=sort,
    )


@router.get("/mps/{mp_id}", response_model=MPDetailDTO, summary="Get MP detail dossier and their allocated works")
def get_mp(
    mp_id: str,
    session: Session = Depends(get_db_session),
) -> MPDetailDTO:
    detail = mplads_query.get_mp_detail(session, mp_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Representative '{mp_id}' not found",
        )
    return detail
