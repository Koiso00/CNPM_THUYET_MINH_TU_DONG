"""Explicit, read-only connectivity test. Does not create or delete user data."""

from pathlib import Path

import pytest

from app.core.config import Settings
from app.db.mongodb import MongoConnection

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_integration]


async def test_configured_mongodb_can_be_reached():
    settings = Settings(_env_file=Path(__file__).resolve().parents[2] / ".env")
    if settings.mongodb_uri is None:
        pytest.fail("Configure MONGODB_URI in backend/.env before running the integration test.")
    connection = MongoConnection(settings)
    connection.start()
    try:
        if await connection.check() != "connected":
            pytest.fail(
                "MongoDB is unavailable. "
                "Check the cluster, credentials, IP access list and network."
            )
    finally:
        await connection.close()
