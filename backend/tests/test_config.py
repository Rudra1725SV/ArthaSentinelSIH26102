from app.core.config import Settings


def test_builds_psycopg_url_from_postgres_variables() -> None:
    settings = Settings(
        database_url=None,
        postgres_host="db.internal",
        postgres_port=5433,
        postgres_db="artha",
        postgres_user="service user",
        postgres_password="safe/password",
    )
    assert settings.resolved_database_url() == (
        "postgresql+psycopg://service+user:safe%2Fpassword@db.internal:5433/artha"
    )


def test_explicit_database_url_is_preferred() -> None:
    settings = Settings(database_url="postgresql://user:password@db:5432/artha")
    assert settings.resolved_database_url() == "postgresql+psycopg://user:password@db:5432/artha"
