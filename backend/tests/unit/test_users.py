"""Username identity, persisted types, privacy and default account permissions."""

from datetime import UTC, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.models.user import UserRecord, UserRole

TEST_HASH = "test-only-encoded-password-hash-not-a-real-account"


def make_user(**fields):
    return UserRecord(password_hash=TEST_HASH, **fields)


def test_case_insensitive_username_key_and_default_role():
    user = make_user(username="  Phong  ")
    assert user.username == "Phong"
    assert user.username_key == "phong"
    assert user.role is UserRole.USER
    assert user.is_active is True


@pytest.mark.parametrize("name", ["", "   ", "bad\nname", "a" * 129])
def test_invalid_username(name):
    with pytest.raises(ValidationError):
        make_user(username=name)


def test_stored_key_cannot_disagree_with_username():
    with pytest.raises(ValidationError, match="does not match"):
        make_user(username="Phong", username_key="another-user")


def test_password_hash_stays_out_of_repr_and_general_serialization():
    user = make_user(username="Phong")
    assert TEST_HASH not in repr(user)
    assert "password_hash" not in user.model_dump()
    assert TEST_HASH not in user.model_dump_json()
    assert user.to_document()["password_hash"] == TEST_HASH


def test_plain_password_field_is_not_part_of_storage_schema():
    with pytest.raises(ValidationError):
        make_user(username="Phong", password="should-not-be-stored")


def test_empty_hash_is_rejected():
    with pytest.raises(ValidationError):
        UserRecord(username="Phong", password_hash="")


def test_role_and_active_flag_are_validated():
    with pytest.raises(ValidationError):
        make_user(username="Phong", role="superuser")
    with pytest.raises(ValidationError):
        make_user(username="Phong", is_active="false")


def test_naive_datetime_is_rejected():
    with pytest.raises(ValidationError):
        make_user(username="Phong", created_at=datetime(2026, 1, 1))


def test_timestamps_use_utc_and_bson_milliseconds():
    local = datetime(2026, 1, 1, 8, 0, 0, 123456, tzinfo=timezone(timedelta(hours=7)))
    user = make_user(username="Phong", created_at=local, updated_at=local)
    assert user.created_at == datetime(2026, 1, 1, 1, 0, 0, 123000, tzinfo=UTC)
    assert user.created_at.microsecond % 1000 == 0


def test_updated_at_cannot_precede_creation():
    with pytest.raises(ValidationError):
        make_user(
            username="Phong",
            created_at=datetime(2026, 1, 2, tzinfo=UTC),
            updated_at=datetime(2026, 1, 1, tzinfo=UTC),
        )


def test_document_round_trip_preserves_types_without_native_bson_uuid():
    user = make_user(username="Phong")
    document = user.to_document()
    assert isinstance(document["_id"], str)
    restored = UserRecord.model_validate(document)
    assert restored == user


def test_user_identity_is_immutable():
    user = make_user(username="Phong")
    with pytest.raises(ValidationError):
        user.id = uuid4()
