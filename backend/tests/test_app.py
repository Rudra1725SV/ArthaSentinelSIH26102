from fastapi.testclient import TestClient

from app.main import create_app


def test_openapi_exposes_both_health_routes() -> None:
    client = TestClient(create_app())
    paths = client.get("/openapi.json").json()["paths"]
    assert "/health" in paths
    assert "/api/health" in paths
