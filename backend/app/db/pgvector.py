"""pgvector helpers for a later semantic-similarity module."""

from sqlalchemy import Connection, text


def enable_pgvector(connection: Connection) -> None:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))


def pgvector_is_available(connection: Connection) -> bool:
    return bool(connection.execute(text("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')")).scalar_one())
