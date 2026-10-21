"""Real Atlas tests for index behavior, refresh races and explicit expiry."""

import asyncio
from datetime import timedelta
from uuid import uuid4

import pytest

from app.db.indexes import ensure_session_indexes
from app.models.common import utc_now
from app.models.session import SessionRecord
from app.repositories.sessions import DuplicateSessionError, SessionRepository

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_write_integration]
HASH_A, HASH_B, HASH_C = "a" * 64, "b" * 64, "c" * 64


async def test_session_indexes_are_unique_ttl_and_idempotent(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    await ensure_session_indexes(session_test_collection)
    indexes = await session_test_collection.index_information()
    assert indexes["uq_sessions_refresh_token_hash"]["unique"] is True
    assert indexes["ttl_sessions_expires_at"]["key"] == [("expires_at", 1)]
    assert indexes["ttl_sessions_expires_at"]["expireAfterSeconds"] == 0
    assert indexes["ix_sessions_user_id"]["key"] == [("user_id", 1)]


async def test_session_round_trip_and_expiry_do_not_depend_on_ttl(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    now = utc_now()
    session = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=now)
    await repository.insert(session)
    assert await repository.find_active(session.id, now=now) == session
    # Expiry is seven days in the server's future, so TTL has not removed this document.
    assert await repository.find_active(session.id, now=session.expires_at) is None
    assert await session_test_collection.find_one({"_id": str(session.id)}) is not None


async def test_only_one_concurrent_refresh_can_rotate_same_token(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    now = utc_now()
    session = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=now)
    await repository.insert(session)
    first, second = await asyncio.gather(
        repository.rotate_refresh(
            session.id,
            expected_hash=HASH_A,
            replacement_hash=HASH_B,
            now=now + timedelta(seconds=1),
        ),
        repository.rotate_refresh(
            session.id,
            expected_hash=HASH_A,
            replacement_hash=HASH_C,
            now=now + timedelta(seconds=1),
        ),
    )
    winners = [result for result in (first, second) if result is not None]
    assert len(winners) == 1
    assert winners[0].expires_at == session.expires_at
    assert (
        await repository.rotate_refresh(
            session.id,
            expected_hash=HASH_A,
            replacement_hash="d" * 64,
            now=now + timedelta(seconds=2),
        )
        is None
    )


async def test_revocation_checks_owner_and_is_idempotent(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    now = utc_now()
    session = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=now)
    await repository.insert(session)
    assert not await repository.revoke(session.id, user_id=uuid4(), now=now + timedelta(seconds=1))
    assert await repository.find_active(session.id, now=now) is not None
    assert await repository.revoke(
        session.id, user_id=session.user_id, now=now + timedelta(seconds=1)
    )
    assert not await repository.revoke(
        session.id, user_id=session.user_id, now=now + timedelta(seconds=2)
    )
    assert await repository.find_active(session.id, now=now + timedelta(seconds=2)) is None
    assert (
        await repository.rotate_refresh(
            session.id,
            expected_hash=HASH_A,
            replacement_hash=HASH_B,
            now=now + timedelta(seconds=2),
        )
        is None
    )


async def test_revoke_all_does_not_affect_another_owner(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    now = utc_now()
    owner, other = uuid4(), uuid4()
    first = SessionRecord.new(user_id=owner, refresh_token_hash=HASH_A, now=now)
    second = SessionRecord.new(user_id=owner, refresh_token_hash=HASH_B, now=now)
    unrelated = SessionRecord.new(user_id=other, refresh_token_hash=HASH_C, now=now)
    for session in (first, second, unrelated):
        await repository.insert(session)
    moment = now + timedelta(seconds=1)
    assert await repository.revoke_all(owner, now=moment) == 2
    assert await repository.find_active(first.id, now=moment) is None
    assert await repository.find_active(second.id, now=moment) is None
    assert await repository.find_active(unrelated.id, now=moment) is not None


async def test_refresh_hash_cannot_be_reused_between_sessions(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    first = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A)
    second = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A)
    await repository.insert(first)
    with pytest.raises(DuplicateSessionError):
        await repository.insert(second)


async def test_expired_session_cannot_refresh_or_extend_its_expiry(session_test_collection):
    await ensure_session_indexes(session_test_collection)
    repository = SessionRepository(session_test_collection)
    now = utc_now()
    session = SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=now)
    await repository.insert(session)
    assert (
        await repository.rotate_refresh(
            session.id, expected_hash=HASH_A, replacement_hash=HASH_B, now=session.expires_at
        )
        is None
    )
    stored = await session_test_collection.find_one({"_id": str(session.id)})
    assert stored["expires_at"] == session.expires_at
    assert stored["refresh_token_hash"] == HASH_A
