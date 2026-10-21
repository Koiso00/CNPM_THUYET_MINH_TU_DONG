"""Real Atlas writes, uniqueness and BSON round trips in disposable collections only."""

import asyncio

import pytest

from app.db.indexes import ensure_user_indexes
from app.models.user import UserRecord
from app.repositories.users import DuplicateUserIdError, DuplicateUsernameError, UserRepository

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_write_integration]
TEST_HASH = "test-only-encoded-password-hash-not-a-real-account"


async def test_unique_username_index_is_idempotent(user_test_collection):
    await ensure_user_indexes(user_test_collection)
    await ensure_user_indexes(user_test_collection)
    indexes = await user_test_collection.index_information()
    unique_index = indexes["uq_users_username_key"]
    assert unique_index["unique"] is True
    assert unique_index["key"] == [("username_key", 1)]


async def test_normalized_identity_is_unique_under_concurrent_inserts(user_test_collection):
    await ensure_user_indexes(user_test_collection)
    repository = UserRepository(user_test_collection)
    first = UserRecord(username="Phong", password_hash=TEST_HASH)
    second = UserRecord(username="phong", password_hash=TEST_HASH)
    results = await asyncio.gather(
        repository.insert(first), repository.insert(second), return_exceptions=True
    )
    assert sum(isinstance(result, UserRecord) for result in results) == 1
    assert sum(isinstance(result, DuplicateUsernameError) for result in results) == 1
    assert await user_test_collection.count_documents({}) == 1


async def test_user_round_trip_and_case_insensitive_lookup(user_test_collection):
    await ensure_user_indexes(user_test_collection)
    repository = UserRepository(user_test_collection)
    user = UserRecord(username="Phong", password_hash=TEST_HASH)
    await repository.insert(user)
    by_id = await repository.find_by_id(user.id)
    by_name = await repository.find_by_username("  PHONG  ")
    assert by_id == by_name == user
    document = await user_test_collection.find_one({"_id": str(user.id)})
    assert isinstance(document["_id"], str)
    assert document["created_at"].tzinfo is not None


async def test_duplicate_id_is_distinct_from_duplicate_username(user_test_collection):
    await ensure_user_indexes(user_test_collection)
    repository = UserRepository(user_test_collection)
    first = UserRecord(username="Phong", password_hash=TEST_HASH)
    second = UserRecord(id=first.id, username="AnotherName", password_hash=TEST_HASH)
    await repository.insert(first)
    with pytest.raises(DuplicateUserIdError):
        await repository.insert(second)
