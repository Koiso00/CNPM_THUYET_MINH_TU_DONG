"""Session expiry, token privacy and the user-selected absolute lifetime."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.core.auth_policy import ACCESS_TOKEN_TTL, SESSION_MAX_AGE
from app.models.session import SessionRecord

HASH_A = "a" * 64
NOW = datetime(2026, 10, 21, 8, 0, tzinfo=UTC)


def new_session(**kwargs):
    return SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=NOW, **kwargs)


def test_new_session_uses_user_selected_absolute_expiry():
    session = new_session()
    assert session.created_at == session.updated_at == NOW
    assert session.expires_at == NOW + timedelta(days=7)
    assert ACCESS_TOKEN_TTL == timedelta(minutes=15)
    assert SESSION_MAX_AGE == timedelta(days=7)


def test_secret_digest_is_not_part_of_general_serialization():
    session = new_session()
    assert HASH_A not in repr(session)
    assert "refresh_token_hash" not in session.model_dump()
    assert HASH_A not in session.model_dump_json()
    assert session.to_document()["refresh_token_hash"] == HASH_A


@pytest.mark.parametrize("digest", ["raw-token-value", "a" * 63, "A" * 64, ""])
def test_storage_rejects_raw_or_malformed_refresh_token(digest):
    with pytest.raises(ValidationError):
        SessionRecord.new(user_id=uuid4(), refresh_token_hash=digest, now=NOW)


@pytest.mark.parametrize("expiry", [NOW, NOW - timedelta(seconds=1), NOW + timedelta(days=8)])
def test_invalid_or_extended_expiry_is_rejected(expiry):
    document = new_session().to_document()
    document["expires_at"] = expiry
    with pytest.raises(ValidationError):
        SessionRecord.model_validate(document)


def test_no_plain_refresh_token_field_is_accepted():
    document = new_session().to_document()
    document["refresh_token"] = "must-not-be-stored"
    with pytest.raises(ValidationError):
        SessionRecord.model_validate(document)


def test_is_active_uses_strict_expiry_boundary_and_creation_time():
    session = new_session()
    assert not session.is_active_at(NOW - timedelta(milliseconds=1))
    assert session.is_active_at(NOW)
    assert not session.is_active_at(session.expires_at)


def test_revoked_session_is_inactive():
    document = new_session().to_document()
    document["revoked_at"] = NOW + timedelta(minutes=1)
    document["updated_at"] = document["revoked_at"]
    session = SessionRecord.model_validate(document)
    assert not session.is_active_at(NOW + timedelta(minutes=2))


def test_invalid_revocation_order_is_rejected():
    document = new_session().to_document()
    document["revoked_at"] = NOW - timedelta(seconds=1)
    with pytest.raises(ValidationError):
        SessionRecord.model_validate(document)


def test_naive_clock_is_rejected_even_outside_pydantic_validation():
    with pytest.raises(ValueError, match="timezone-aware"):
        SessionRecord.new(user_id=uuid4(), refresh_token_hash=HASH_A, now=datetime(2026, 10, 21))
    with pytest.raises(ValueError, match="timezone-aware"):
        new_session().is_active_at(datetime(2026, 10, 21))


def test_session_document_round_trip_uses_string_ids():
    session = new_session()
    document = session.to_document()
    assert isinstance(document["_id"], str)
    assert isinstance(document["user_id"], str)
    assert SessionRecord.model_validate(document) == session
