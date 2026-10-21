"""Cryptographic primitives only; authentication state lives in MongoDB."""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from functools import lru_cache
from uuid import uuid4

import jwt
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from app.models.common import record_key

ISSUER = "sgu-campus-guide"
AUDIENCE = "sgu-campus-guide-web"
ACCESS_COOKIE = "sgu_access"
REFRESH_COOKIE = "sgu_refresh"
CSRF_COOKIE = "sgu_csrf"
COOKIE_PATH = "/api/v1"


@lru_cache(maxsize=1)
def passwords() -> PasswordHash:
    return PasswordHash.recommended()


@lru_cache(maxsize=1)
def dummy_password_hash() -> str:
    return passwords().hash(secrets.token_urlsafe(32))


def verify_password(password: str, encoded: str | None) -> bool:
    try:
        matched = passwords().verify(password, encoded or dummy_password_hash())
    except (UnknownHashError, ValueError):
        return False
    return encoded is not None and matched


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_refresh_token(session_id: str) -> str:
    return f"{session_id}.{secrets.token_urlsafe(32)}"


def refresh_session_id(token: str | None) -> str | None:
    if not token or len(token) > 128:
        return None
    parts = token.split(".")
    if len(parts) != 2 or len(parts[1]) != 43:
        return None
    if any(
        c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"
        for c in parts[1]
    ):
        return None
    return record_key(parts[0])


def encode_access(
    *, secret: str, user_id: str, session_id: str, now: datetime, expires_at: datetime
) -> str:
    return jwt.encode(
        {
            "sub": user_id,
            "sid": session_id,
            "iat": now,
            "exp": expires_at,
            "iss": ISSUER,
            "aud": AUDIENCE,
            "type": "access",
            "jti": str(uuid4()),
        },
        secret,
        algorithm="HS256",
    )


def decode_access(token: str, *, secret: str, now: datetime) -> dict:
    # Expiration uses the injected clock, while signature/issuer/audience remain library-checked.
    claims = jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        issuer=ISSUER,
        audience=AUDIENCE,
        options={
            "require": ["sub", "sid", "iat", "exp", "iss", "aud", "type", "jti"],
            "verify_exp": False,
            "verify_iat": False,
        },
    )
    if (
        claims["type"] != "access"
        or record_key(claims["sub"]) is None
        or record_key(claims["sid"]) is None
        or type(claims["exp"]) is not int
        or type(claims["iat"]) is not int
        or not claims["iat"] <= now.timestamp() < claims["exp"]
        or claims["exp"] - claims["iat"] > 900
    ):
        raise jwt.InvalidTokenError("Invalid access claims.")
    return claims


def csrf_signature(secret: str, session_id: str, payload: str) -> str:
    message = f"csrf-v1:{session_id}:{payload}".encode()
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def new_csrf_token(secret: str, session_id: str, now: datetime) -> str:
    payload = f"{int((now + timedelta(days=7)).timestamp())}.{secrets.token_urlsafe(32)}"
    return f"{payload}.{csrf_signature(secret, session_id, payload)}"


def valid_csrf_token(token: str, *, secret: str, session_id: str, now: datetime) -> bool:
    if len(token) > 160 or not token.isascii():
        return False
    parts = token.split(".")
    if len(parts) != 3 or not parts[0].isdigit() or len(parts[0]) > 12:
        return False
    payload = ".".join(parts[:2])
    return int(parts[0]) > now.timestamp() and hmac.compare_digest(
        parts[2], csrf_signature(secret, session_id, payload)
    )
