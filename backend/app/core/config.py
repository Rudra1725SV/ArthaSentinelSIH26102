"""Environment-backed application configuration."""

from functools import lru_cache
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Credentials have no defaults; use DATABASE_URL or all POSTGRES_* fields."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "ArthaSentinel API"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    database_url: str | None = None
    postgres_host: str | None = None
    postgres_port: int = 5432
    postgres_db: str | None = None
    postgres_user: str | None = None
    postgres_password: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [value.strip() for value in self.cors_origins.split(",") if value.strip()]

    def resolved_database_url(self) -> str:
        """Return a SQLAlchemy psycopg URL or a clear configuration error."""
        if self.database_url:
            if self.database_url.startswith("postgres://"):
                return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
            if self.database_url.startswith("postgresql://"):
                return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
            return self.database_url

        required = {
            "POSTGRES_HOST": self.postgres_host,
            "POSTGRES_DB": self.postgres_db,
            "POSTGRES_USER": self.postgres_user,
            "POSTGRES_PASSWORD": self.postgres_password,
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError("Database configuration is incomplete. Set DATABASE_URL or: " + ", ".join(missing))
        return (
            "postgresql+psycopg://"
            f"{quote_plus(self.postgres_user or '')}:{quote_plus(self.postgres_password or '')}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
