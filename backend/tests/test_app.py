"""
App-boot smoke test.

The other suites import services directly and never build the FastAPI app, so a
route-layer break (a bad handler signature, a broken import) would ship green.
This boots the app through TestClient and hits a few no-auth endpoints so that
kind of breakage fails a test instead of shipping.
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok():
    assert client.get("/health").status_code == 200


def test_openapi_registers_core_routes():
    paths = app.openapi()["paths"]
    for p in (
        "/api/v1/market/indices",
        "/api/v1/market/stocks",
        "/api/v1/insights/outlook",
        "/api/v1/portfolio",
        "/api/v1/auth/login/access-token",
    ):
        assert p in paths, f"missing route: {p}"


def test_public_endpoints_respond():
    # Snapshot-backed, no auth required — should return 200 with data.
    assert client.get("/api/v1/market/indices").status_code == 200
    # Portfolio serves the public demo fallback when unauthenticated.
    assert client.get("/api/v1/portfolio").status_code == 200
