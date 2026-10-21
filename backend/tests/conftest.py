"""Deterministic unit tests; real MongoDB reads and isolated writes require explicit flags."""

from contextlib import asynccontextmanager
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from app.application import create_app
from app.core.config import Settings


def pytest_addoption(parser):
    parser.addoption(
        "--run-mongodb-integration",
        action="store_true",
        default=False,
        help="Run read-only MongoDB connectivity tests using backend/.env.",
    )
    parser.addoption(
        "--run-mongodb-write-integration",
        action="store_true",
        default=False,
        help="Run MongoDB tests that create and remove isolated temporary collections.",
    )


def pytest_collection_modifyitems(config, items):
    for item in items:
        if item.get_closest_marker("mongodb_integration") and not config.getoption(
            "--run-mongodb-integration"
        ):
            item.add_marker(
                pytest.mark.skip(reason="Real MongoDB test requires --run-mongodb-integration.")
            )
        if item.get_closest_marker("mongodb_write_integration") and not config.getoption(
            "--run-mongodb-write-integration"
        ):
            item.add_marker(
                pytest.mark.skip(
                    reason="Isolated MongoDB writes require --run-mongodb-write-integration."
                )
            )


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def settings_factory(monkeypatch):
    for key in (
        "APP_NAME",
        "ENVIRONMENT",
        "FRONTEND_DIST",
        "MONGODB_URI",
        "MONGODB_DATABASE",
        "MONGODB_TIMEOUT_MS",
        "JWT_SECRET",
        "AUTH_ALLOWED_ORIGINS",
    ):
        monkeypatch.delenv(key, raising=False)

    def build(**kwargs):
        return Settings(_env_file=None, environment="test", **kwargs)

    return build


@pytest.fixture
def mongodb_double(monkeypatch):
    database = MagicMock()
    database.command = AsyncMock(return_value={"ok": 1})
    client = MagicMock()
    client.__getitem__.return_value = database
    client.close = AsyncMock()
    factory = MagicMock(return_value=client)
    monkeypatch.setattr("app.db.mongodb.AsyncMongoClient", factory)
    return SimpleNamespace(database=database, client=client, factory=factory)


@pytest.fixture
def api_client():
    @asynccontextmanager
    async def open_client(settings):
        app = create_app(settings)
        async with app.router.lifespan_context(app):
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                yield client

    return open_client
