"""Real HTTP and crypto over isolated Atlas user/session collections."""

import asyncio
from types import SimpleNamespace

import pytest

from app.core.security import ACCESS_COOKIE, REFRESH_COOKIE, token_digest
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository
from app.services.auth import AuthenticationError, AuthService
from tests.auth_support import PASSWORD, SECRET, auth_harness, csrf_headers, register_and_login

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_write_integration]


async def test_http_auth_with_real_atlas(
    settings_factory, user_test_collection, session_test_collection
):
    from app.db.indexes import ensure_session_indexes, ensure_user_indexes

    await ensure_user_indexes(user_test_collection)
    await ensure_session_indexes(session_test_collection)
    service = AuthService(
        UserRepository(user_test_collection),
        SessionRepository(session_test_collection),
        secret=SECRET,
    )
    h = auth_harness(settings_factory, service=service)
    # Exercise production dependency construction, using only our two isolated collections.
    h.app.dependency_overrides.clear()
    h.app.state.mongodb = SimpleNamespace(
        database={
            "users": user_test_collection,
            "sessions": session_test_collection,
        }
    )
    async with h.client as client:
        login = await register_and_login(client)
        uid = login.json()["user"]["id"]
        stored = await user_test_collection.find_one({"_id": uid})
        assert stored["password_hash"].startswith("$argon2id$")
        assert PASSWORD not in stored["password_hash"]
        duplicate = await client.post(
            "/api/v1/auth/register",
            headers=await csrf_headers(client),
            json={"username": "phong", "password": PASSWORD},
        )
        assert duplicate.status_code == 409
        assert (await client.get("/api/v1/auth/me")).status_code == 200
        old_refresh = client.cookies.get(REFRESH_COOKIE)
        old_access = client.cookies.get(ACCESS_COOKIE)
        refreshed = await client.post("/api/v1/auth/refresh", headers=await csrf_headers(client))
        assert refreshed.status_code == 200
        assert refreshed.json()["session_expires_at"] == login.json()["session_expires_at"]
        session = await session_test_collection.find_one({"user_id": uid})
        assert session["refresh_token_hash"] == token_digest(client.cookies.get(REFRESH_COOKIE))
        assert session["refresh_token_hash"] != token_digest(old_refresh)
        assert old_refresh not in str(session)
        assert (
            await client.post("/api/v1/auth/logout", headers=await csrf_headers(client))
        ).status_code == 204
        assert (
            await client.get("/api/v1/auth/me", headers={"Cookie": f"{ACCESS_COOKIE}={old_access}"})
        ).status_code == 401
        session = await session_test_collection.find_one({"user_id": uid})
        assert session["revoked_at"] is not None


async def test_concurrent_service_refresh_on_atlas(user_test_collection, session_test_collection):
    from app.db.indexes import ensure_session_indexes, ensure_user_indexes

    await ensure_user_indexes(user_test_collection)
    await ensure_session_indexes(session_test_collection)
    service = AuthService(
        UserRepository(user_test_collection),
        SessionRepository(session_test_collection),
        secret=SECRET,
    )
    await service.register("concurrency", PASSWORD)
    original = await service.login("CONCURRENCY", PASSWORD)
    results = await asyncio.gather(
        service.refresh(original.refresh_token),
        service.refresh(original.refresh_token),
        return_exceptions=True,
    )
    assert sum(isinstance(result, AuthenticationError) for result in results) == 1
    winners = [result for result in results if not isinstance(result, BaseException)]
    assert len(winners) == 1
    assert winners[0].session.expires_at == original.session.expires_at
    assert (await service.authenticate(winners[0].access_token)).user.username == "concurrency"
