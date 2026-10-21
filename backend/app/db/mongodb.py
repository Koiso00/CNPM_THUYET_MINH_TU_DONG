"""One async connection pool per application lifespan, with bounded readiness checks."""

import asyncio
from typing import Any, Literal

from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError

from app.core.config import Settings

MongoStatus = Literal["connected", "not_configured", "unavailable"]


class MongoConnection:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: AsyncMongoClient[dict[str, Any]] | None = None

    def start(self) -> None:
        """Allocate the pool in the running application's context, without doing writes."""
        if self._client is not None:
            raise RuntimeError("MongoDB connection has already been started.")
        if self._settings.mongodb_uri is None:
            return
        try:
            self._client = AsyncMongoClient(
                self._settings.mongodb_uri.get_secret_value(),
                appname="sgu-campus-guide-api",
                connect=False,
                tz_aware=True,
                serverSelectionTimeoutMS=self._settings.mongodb_timeout_ms,
                connectTimeoutMS=self._settings.mongodb_timeout_ms,
                socketTimeoutMS=self._settings.mongodb_timeout_ms,
            )
        except (PyMongoError, ValueError):
            # Driver errors may contain connection details; do not expose the original error.
            raise RuntimeError("Invalid MongoDB configuration. Check backend/.env.") from None

    @property
    def database(self) -> AsyncDatabase[dict[str, Any]] | None:
        if self._client is None:
            return None
        return self._client[self._settings.mongodb_database]

    async def check(self) -> MongoStatus:
        if self._settings.mongodb_uri is None:
            return "not_configured"
        database = self.database
        if database is None:
            return "unavailable"
        try:
            async with asyncio.timeout(self._settings.mongodb_timeout_ms / 1000):
                await database.command("ping")
        except (PyMongoError, OSError, TimeoutError):
            return "unavailable"
        return "connected"

    async def close(self) -> None:
        client, self._client = self._client, None
        if client is not None:
            await client.close()
