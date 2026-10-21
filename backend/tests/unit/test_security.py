"""Reject tampered or mis-scoped credentials, including correctly signed wrong claims."""

from datetime import timedelta
from uuid import uuid4

import jwt
import pytest
from pydantic import ValidationError

from app.core.security import (
    AUDIENCE,
    ISSUER,
    decode_access,
    encode_access,
    new_csrf_token,
    new_refresh_token,
    refresh_session_id,
    token_digest,
    valid_csrf_token,
    verify_password,
)
from app.models.common import utc_now
from tests.auth_support import SECRET


def access_claims(now):
    return {
        "sub": str(uuid4()),
        "sid": str(uuid4()),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=15)).timestamp()),
        "iss": ISSUER,
        "aud": AUDIENCE,
        "type": "access",
        "jti": str(uuid4()),
    }


@pytest.mark.parametrize(
    "change",
    [
        {"aud": "other"},
        {"iss": "other"},
        {"type": "refresh"},
        {"sub": "invalid"},
        {"sid": "invalid"},
        {"exp": "bad"},
        {"iat": "bad"},
        {"jti": 3},
    ],
)
def test_reject_wrong_signed_claims(change):
    now = utc_now()
    token = jwt.encode({**access_claims(now), **change}, SECRET, algorithm="HS256")
    with pytest.raises(jwt.InvalidTokenError):
        decode_access(token, secret=SECRET, now=now)


@pytest.mark.parametrize(
    "mode", ["missing-exp", "future", "expired", "too-long", "wrong-key", "unsigned", "tampered"]
)
def test_access_temporal_and_signature_guards(mode):
    now = utc_now()
    claims = access_claims(now)
    key, algorithm = SECRET, "HS256"
    if mode == "missing-exp":
        del claims["exp"]
    elif mode == "future":
        claims["iat"] = int((now + timedelta(minutes=1)).timestamp())
    elif mode == "expired":
        claims["exp"] = int(now.timestamp())
    elif mode == "too-long":
        claims["exp"] += 1
    elif mode == "wrong-key":
        key += "other"
    elif mode == "unsigned":
        key, algorithm = "", "none"
    token = jwt.encode(claims, key, algorithm=algorithm)
    if mode == "tampered":
        token = token.split(".")[0] + ".e30." + token.split(".")[2]
    with pytest.raises(jwt.InvalidTokenError):
        decode_access(token, secret=SECRET, now=now)


def test_valid_access_and_refresh_tokens():
    now = utc_now()
    uid, sid = str(uuid4()), str(uuid4())
    token = encode_access(
        secret=SECRET, user_id=uid, session_id=sid, now=now, expires_at=now + timedelta(minutes=15)
    )
    assert decode_access(token, secret=SECRET, now=now)["sub"] == uid
    refresh = new_refresh_token(sid)
    assert refresh_session_id(refresh) == sid
    assert len(token_digest(refresh)) == 64
    assert new_refresh_token(sid) != refresh


@pytest.mark.parametrize(
    "token", [None, "", "bad", "x" * 129, f"{uuid4()}.short", f"{uuid4()}." + "!" * 43]
)
def test_refresh_structure_rejected(token):
    assert refresh_session_id(token) is None


def test_csrf_has_expiry_signature_and_session_binding():
    now = utc_now()
    token = new_csrf_token(SECRET, "session-a", now)
    assert valid_csrf_token(token, secret=SECRET, session_id="session-a", now=now)
    assert not valid_csrf_token(token, secret=SECRET, session_id="session-b", now=now)
    assert not valid_csrf_token(token, secret=SECRET + "wrong", session_id="session-a", now=now)
    assert not valid_csrf_token(
        token, secret=SECRET, session_id="session-a", now=now + timedelta(days=7)
    )
    assert not valid_csrf_token("١.bad.bad", secret=SECRET, session_id="", now=now)


def test_unknown_password_hash_rejected():
    assert not verify_password("password", "not-a-password-hash")
    assert not verify_password("password", None)


def test_jwt_secret_configuration_hidden(settings_factory):
    settings = settings_factory(jwt_secret=SECRET)
    assert SECRET not in repr(settings) + settings.model_dump_json()
    assert "jwt_secret" not in settings.model_dump()
    assert settings_factory(jwt_secret="").jwt_secret is None
    with pytest.raises(ValidationError) as caught:
        settings_factory(jwt_secret="private-short-value")
    assert "private-short-value" not in str(caught.value)


@pytest.mark.parametrize(
    "origin",
    [
        "*",
        "https://testserver/",
        "ftp://testserver",
        "https://u:p@testserver",
        "https://testserver?x=1",
    ],
)
def test_origin_configuration_requires_exact_origin(settings_factory, origin):
    with pytest.raises(ValidationError):
        settings_factory(auth_allowed_origins=[origin])
