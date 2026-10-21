"""Authentication orchestration; routers own cookies, repositories own persistence."""

import hmac
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

import jwt
from starlette.concurrency import run_in_threadpool

from app.core.auth_policy import ACCESS_TOKEN_TTL
from app.core.security import (
    decode_access,
    encode_access,
    new_refresh_token,
    passwords,
    refresh_session_id,
    token_digest,
    verify_password,
)
from app.models.common import utc_now
from app.models.session import SessionRecord
from app.models.user import UserRecord
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository


class AuthenticationError(Exception):
    """Generic failure deliberately does not identify a username/password mismatch."""


@dataclass(frozen=True, repr=False)
class AuthGrant:
    user: UserRecord
    session: SessionRecord
    access_token: str
    refresh_token: str
    access_expires_at: datetime


@dataclass(frozen=True)
class Principal:
    user: UserRecord
    session: SessionRecord


class AuthService:
    def __init__(
        self,
        users: UserRepository,
        sessions: SessionRepository,
        *,
        secret: str,
        clock: Callable[[], datetime] = utc_now,
    ):
        self.users, self.sessions = users, sessions
        self.secret, self.clock = secret, clock

    async def register(self, username: str, password: str) -> UserRecord:
        # Roles never come from the client. Registration does not log in implicitly.
        encoded = await run_in_threadpool(passwords().hash, password)
        return await self.users.insert(UserRecord(username=username, password_hash=encoded))

    def _grant(
        self, user: UserRecord, session: SessionRecord, refresh: str, now: datetime
    ) -> AuthGrant:
        expiry = min(now + ACCESS_TOKEN_TTL, session.expires_at)
        token = encode_access(
            secret=self.secret,
            user_id=str(user.id),
            session_id=str(session.id),
            now=now,
            expires_at=expiry,
        )
        return AuthGrant(user, session, token, refresh, expiry)

    async def login(self, username: str, password: str) -> AuthGrant:
        user = await self.users.find_by_username(username)
        matched = await run_in_threadpool(
            verify_password, password, user.password_hash.get_secret_value() if user else None
        )
        if not matched or user is None or not user.is_active:
            raise AuthenticationError()
        now = self.clock()
        session_id = uuid4()
        refresh = new_refresh_token(str(session_id))
        session = SessionRecord.new(
            user_id=user.id, refresh_token_hash=token_digest(refresh), now=now
        )
        session = SessionRecord.model_validate({**session.to_document(), "_id": str(session_id)})
        await self.sessions.insert(session)
        return self._grant(user, session, refresh, now)

    async def authenticate(self, token: str | None) -> Principal:
        try:
            claims = decode_access(token or "", secret=self.secret, now=self.clock())
        except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
            raise AuthenticationError() from None
        session = await self.sessions.find_active(claims["sid"], now=self.clock())
        if session is None or str(session.user_id) != claims["sub"]:
            raise AuthenticationError()
        user = await self.users.find_by_id(session.user_id)
        if user is None or not user.is_active:
            raise AuthenticationError()
        return Principal(user, session)

    async def refresh(self, token: str | None) -> AuthGrant:
        sid = refresh_session_id(token)
        if sid is None:
            raise AuthenticationError()
        now = self.clock()
        session = await self.sessions.find_active(sid, now=now)
        if session is None or not hmac.compare_digest(
            session.refresh_token_hash.get_secret_value(), token_digest(token)
        ):
            raise AuthenticationError()
        user = await self.users.find_by_id(session.user_id)
        if user is None or not user.is_active:
            raise AuthenticationError()
        replacement = new_refresh_token(sid)
        rotated = await self.sessions.rotate_refresh(
            sid,
            expected_hash=token_digest(token),
            replacement_hash=token_digest(replacement),
            now=now,
        )
        if rotated is None:
            raise AuthenticationError()
        return self._grant(user, rotated, replacement, now)

    async def logout(self, token: str | None) -> None:
        sid = refresh_session_id(token)
        if sid is None:
            return
        now = self.clock()
        session = await self.sessions.find_active(sid, now=now)
        if session is not None and hmac.compare_digest(
            session.refresh_token_hash.get_secret_value(), token_digest(token)
        ):
            await self.sessions.revoke(sid, user_id=session.user_id, now=now)
