"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.config import get_settings
from app.core.errors import database_exception_handler, validation_exception_handler
from app.db.session import dispose_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Open connections lazily: the app can surface a clear readiness error if
    # PostgreSQL is temporarily unavailable during startup.
    yield
    dispose_engine()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    )
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, database_exception_handler)
    # /api/health matches the existing frontend API base. /health is a direct
    # infrastructure-facing alias.
    # Mount on both /api (frontend convention) and /api/v1 (versioned convention)
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    if settings.api_v1_prefix != "/api/v1":
        app.include_router(api_router, prefix="/api/v1")
    app.include_router(health_router, tags=["health"])
    return app


app = create_app()
