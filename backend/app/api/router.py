"""Top-level API router."""

from fastapi import APIRouter

from app.api.routes.audit import router as audit_router
from app.api.routes.detection import router as detection_router
from app.api.routes.health import router as health_router
from app.api.routes.investigations import router as investigations_router
from app.api.routes.mps import router as mps_router
from app.api.routes.overview import router as overview_router
from app.api.routes.works import router as works_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(overview_router, tags=["overview"])
api_router.include_router(works_router, tags=["works"])
api_router.include_router(mps_router, tags=["mps"])
api_router.include_router(investigations_router, tags=["investigations"])
api_router.include_router(audit_router, tags=["audit"])
api_router.include_router(detection_router, tags=["detection"])
