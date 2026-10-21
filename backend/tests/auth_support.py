"""In-memory repositories for HTTP/service tests, never evidence of MongoDB behavior."""

from datetime import timedelta
from types import SimpleNamespace

import httpx
from fastapi import Depends

from app.api.dependencies import get_auth_service, require_roles
from app.application import create_app
from app.models.common import utc_now
from app.models.session import SessionRecord
from app.models.user import UserRole, username_key
from app.repositories.users import DuplicateUsernameError
from app.services.auth import AuthService

SECRET = "test-only-secret-material-at-least-32-bytes"
PASSWORD = "mật khẩu kiểm thử 12345"


class MemoryUsers:
    def __init__(self):
        self.records = {}

    async def insert(self, user):
        if any(u.username_key == user.username_key for u in self.records.values()):
            raise DuplicateUsernameError()
        self.records[str(user.id)] = user
        return user

    async def find_by_username(self, name):
        return next(
            (u for u in self.records.values() if u.username_key == username_key(name)), None
        )

    async def find_by_id(self, user_id):
        return self.records.get(str(user_id))


class MemorySessions:
    def __init__(self):
        self.records = {}

    async def insert(self, session):
        self.records[str(session.id)] = session
        return session

    async def find_active(self, session_id, *, now):
        session = self.records.get(str(session_id))
        return session if session and session.is_active_at(now) else None

    async def rotate_refresh(self, session_id, *, expected_hash, replacement_hash, now):
        session = await self.find_active(session_id, now=now)
        if session is None or session.refresh_token_hash.get_secret_value() != expected_hash:
            return None
        updated = SessionRecord.model_validate(
            {**session.to_document(), "refresh_token_hash": replacement_hash, "updated_at": now}
        )
        self.records[str(session.id)] = updated
        return updated

    async def revoke(self, session_id, *, user_id, now):
        session = self.records.get(str(session_id))
        if not session or session.user_id != user_id or session.revoked_at:
            return False
        self.records[str(session.id)] = SessionRecord.model_validate(
            {**session.to_document(), "revoked_at": now, "updated_at": now}
        )
        return True

    async def revoke_all(self, user_id, *, now):
        count = 0
        for session in list(self.records.values()):
            count += await self.revoke(session.id, user_id=user_id, now=now)
        return count


class Clock:
    def __init__(self):
        self.now = utc_now()

    def __call__(self):
        return self.now

    def advance(self, **kwargs):
        self.now += timedelta(**kwargs)


def auth_harness(settings_factory, *, service=None, production=False):
    settings = settings_factory(
        jwt_secret=SECRET,
        auth_allowed_origins=["https://testserver"] if production else ["http://testserver"],
    )
    if production:
        settings.environment = "production"
    clock = Clock()
    service = service or AuthService(MemoryUsers(), MemorySessions(), secret=SECRET, clock=clock)
    app = create_app(settings)
    app.dependency_overrides[get_auth_service] = lambda: service

    @app.get("/api/v1/test/admin", dependencies=[Depends(require_roles(UserRole.ADMIN))])
    async def admin_probe():
        return {"allowed": True}

    @app.get(
        "/api/v1/test/creator",
        dependencies=[Depends(require_roles(UserRole.CREATOR, UserRole.ADMIN))],
    )
    async def creator_probe():
        return {"allowed": True}

    client = httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="https://testserver" if production else "http://testserver",
    )
    return SimpleNamespace(client=client, service=service, clock=clock, app=app)


async def csrf_headers(client):
    response = await client.get("/api/v1/auth/csrf")
    assert response.status_code == 200
    return {"X-CSRF-Token": response.json()["csrf_token"]}


async def register_and_login(client, *, username="Phong"):
    payload = {"username": username, "password": PASSWORD}
    registered = await client.post(
        "/api/v1/auth/register", json=payload, headers=await csrf_headers(client)
    )
    assert registered.status_code == 201
    logged_in = await client.post(
        "/api/v1/auth/login", json=payload, headers=await csrf_headers(client)
    )
    assert logged_in.status_code == 200
    return logged_in
