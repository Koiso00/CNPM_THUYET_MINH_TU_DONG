"""HTTP contracts must distinguish a live process from a usable database."""

import pytest
from pymongo.errors import ServerSelectionTimeoutError

pytestmark = pytest.mark.anyio


async def test_liveness_does_not_report_database_readiness(settings_factory, api_client):
    async with api_client(settings_factory()) as client:
        live = await client.get("/api/v1/health")
        ready = await client.get("/api/v1/health/ready")
    assert live.status_code == 200
    assert live.json() == {
        "status": "ok",
        "service": "SGU Campus Guide",
        "environment": "test",
    }
    assert ready.status_code == 503
    assert ready.json() == {"status": "not_ready", "database": "not_configured"}
    assert live.headers["cache-control"] == ready.headers["cache-control"] == "no-store"


async def test_readiness_checks_configured_database(settings_factory, api_client, mongodb_double):
    async with api_client(settings_factory(mongodb_uri="mongodb://cluster.invalid/")) as client:
        response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "connected"}
    mongodb_double.database.command.assert_awaited_once_with("ping")
    mongodb_double.client.close.assert_awaited_once()


async def test_database_can_recover_without_application_restart(
    settings_factory, api_client, mongodb_double, caplog
):
    mongodb_double.database.command.side_effect = [
        ServerSelectionTimeoutError("mongodb://user:private-password@host.invalid/"),
        {"ok": 1},
    ]
    async with api_client(settings_factory(mongodb_uri="mongodb://cluster.invalid/")) as client:
        failed = await client.get("/api/v1/health/ready")
        live = await client.get("/api/v1/health")
        recovered = await client.get("/api/v1/health/ready")
    assert failed.status_code == 503
    assert failed.json() == {"status": "not_ready", "database": "unavailable"}
    assert "private-password" not in failed.text + caplog.text
    assert live.status_code == 200
    assert recovered.status_code == 200


async def test_api_readiness_stays_accessible_with_static_frontend(
    settings_factory, api_client, tmp_path
):
    (tmp_path / "index.html").write_text("<html>test frontend</html>", encoding="utf-8")
    async with api_client(settings_factory(frontend_dist=tmp_path)) as client:
        root = await client.get("/")
        ready = await client.get("/api/v1/health/ready")
        unknown = await client.get("/api/v1/content/tours")
    assert root.status_code == 200
    assert ready.status_code == 503
    assert ready.headers["content-type"] == "application/json"
    assert unknown.status_code == 404


async def test_openapi_documents_readiness_failure(settings_factory, api_client):
    async with api_client(settings_factory()) as client:
        schema = (await client.get("/openapi.json")).json()
    assert {"/api/v1/health", "/api/v1/health/ready"} <= set(schema["paths"])
    assert "503" in schema["paths"]["/api/v1/health/ready"]["get"]["responses"]
