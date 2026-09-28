"""Declarative base; MPLADS domain models are intentionally deferred."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
