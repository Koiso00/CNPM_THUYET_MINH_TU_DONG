"""Malformed identities and clocks must not reach MongoDB; errors must stay private."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from pymongo.errors import DuplicateKeyError

from app.models.user import UserRecord
from app.repositories.sessions import SessionRepository
from app.repositories.users import DuplicateUsernameError, UserRepository

pytestmark = pytest.mark.anyio


async def test_invalid_user_id_does_not_issue_database_query():
    collection = MagicMock()
    collection.find_one = AsyncMock()
    assert await UserRepository(collection).find_by_id('{"$ne": null}') is None
    collection.find_one.assert_not_awaited()


async def test_invalid_session_id_does_not_issue_database_query():
    collection = MagicMock()
    collection.find_one = AsyncMock()
    assert (
        await SessionRepository(collection).find_active(
            "not-a-record-id", now=datetime(2026, 10, 21)
        )
        is None
    )
    collection.find_one.assert_not_awaited()


async def test_naive_session_clock_is_rejected_before_query():
    collection = MagicMock()
    collection.find_one = AsyncMock()
    with pytest.raises(ValueError, match="timezone-aware"):
        await SessionRepository(collection).find_active(uuid4(), now=datetime(2026, 10, 21))
    collection.find_one.assert_not_awaited()


async def test_duplicate_username_error_does_not_expose_driver_document():
    collection = MagicMock()
    collection.insert_one = AsyncMock(
        side_effect=DuplicateKeyError(
            "private-driver-document",
            details={"keyPattern": {"username_key": 1}},
        )
    )
    user = UserRecord(username="Phong", password_hash="test-only-hash")
    with pytest.raises(DuplicateUsernameError) as caught:
        await UserRepository(collection).insert(user)
    assert "private-driver-document" not in str(caught.value)
    assert caught.value.__suppress_context__ is True
