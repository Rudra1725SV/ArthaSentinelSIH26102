"""Investigations endpoint — real flagged works and minimal agentic dossier generation."""

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.mplads import InvestigationListResponse
from app.services import mplads_query
from app.services.investigation_agent import generate_work_investigation_dossier

router = APIRouter()


@router.get("/investigations", response_model=InvestigationListResponse, summary="List active investigations")
def list_investigations(session: Session = Depends(get_db_session)) -> InvestigationListResponse:
    return mplads_query.get_investigations(session)


@router.get("/investigations/{work_id}/dossier", summary="Generate investigator-ready dossier via LangGraph")
def get_investigation_dossier(work_id: str, session: Session = Depends(get_db_session)) -> dict[str, Any]:
    """
    Assembles a minimal agentic intelligence dossier using LangGraph:
    Loads work metadata, compiles statistical peer evidence, computes pgvector semantic similarity,
    and returns a structured, explainable investigation dossier.
    """
    try:
        w_uuid = uuid.UUID(work_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid work UUID format")

    try:
        dossier = generate_work_investigation_dossier(session, w_uuid)
        return dossier
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dossier: {str(e)}")
