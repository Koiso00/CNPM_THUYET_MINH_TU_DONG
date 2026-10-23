"""Create only randomly named test collections and clean up exactly those collections."""

from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

import pytest
from pymongo.errors import PyMongoError

from app.core.config import Settings
from app.db.mongodb import MongoConnection


@asynccontextmanager
async def temporary_collection(kind: str):
    if kind not in {
        "users",
        "sessions",
        "tours",
        "tour_releases",
        "assets",
        "audio_selections",
        "content_submissions",
        "usage_events",
    }:
        raise ValueError("Unsupported isolated test collection kind.")
    settings = Settings(_env_file=Path(__file__).resolve().parents[2] / ".env")
    if settings.mongodb_uri is None:
        pytest.fail("Configure MONGODB_URI before running isolated MongoDB write tests.")
    connection = MongoConnection(settings)
    connection.start()
    prefix = f"__test_p12_{kind}_"
    name = prefix + uuid4().hex
    created = False
    try:
        database = connection.database
        if database is None:
            pytest.fail("MongoDB is not configured.")
        try:
            collection = await database.create_collection(name)
        except PyMongoError:
            pytest.fail("Cannot create the isolated test collection. Check database access.")
        created = True
        yield collection
    finally:
        try:
            if created:
                # Never enumerate and delete by prefix; only remove our one created collection.
                suffix = name[len(prefix) :]
                if (
                    not name.startswith(prefix)
                    or len(suffix) != 32
                    or any(character not in "0123456789abcdef" for character in suffix)
                ):
                    raise RuntimeError("Refusing cleanup for an unexpected collection name.")
                await connection.database.drop_collection(name)
                remaining = await connection.database.list_collection_names(filter={"name": name})
                if remaining:
                    raise RuntimeError("Temporary test collection cleanup did not complete.")
        finally:
            await connection.close()


@pytest.fixture
async def user_test_collection():
    async with temporary_collection("users") as collection:
        yield collection


@pytest.fixture
async def session_test_collection():
    async with temporary_collection("sessions") as collection:
        yield collection
