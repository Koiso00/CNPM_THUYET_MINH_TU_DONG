"""Exercise actual HTTP contracts and crypto using deterministic storage doubles."""

from datetime import timedelta

import pytest
from pymongo.errors import ServerSelectionTimeoutError

from app.core.security import (
    ACCESS_COOKIE,
    CSRF_COOKIE,
    REFRESH_COOKIE,
    encode_access,
    new_csrf_token,
)
from app.models.user import UserRecord, UserRole
from tests.auth_support import PASSWORD, SECRET, auth_harness, csrf_headers, register_and_login

pytestmark = pytest.mark.anyio
PREFIX = "/api/v1/auth"


async def test_register_login_refresh_logout_flow(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        login = await register_and_login(client)
        assert set(login.json()) == {
            "user",
            "access_expires_at",
            "session_expires_at",
            "csrf_token",
        }
        user = next(iter(h.service.users.records.values()))
        assert user.role == UserRole.USER
        assert user.password_hash.get_secret_value().startswith("$argon2id$")
        assert PASSWORD not in user.password_hash.get_secret_value()
        old_access = client.cookies.get(ACCESS_COOKIE)
        old_refresh = client.cookies.get(REFRESH_COOKIE)
        assert (await client.get(PREFIX + "/me")).json()["id"] == str(user.id)
        assert (await client.get("/api/v1/test/admin")).status_code == 403
        assert (await client.get("/api/v1/test/creator")).status_code == 403
        h.clock.advance(minutes=16)
        assert (await client.get(PREFIX + "/me")).status_code == 401
        refreshed = await client.post(PREFIX + "/refresh", headers=await csrf_headers(client))
        assert refreshed.status_code == 200
        assert refreshed.json()["session_expires_at"] == login.json()["session_expires_at"]
        assert old_refresh != client.cookies.get(REFRESH_COOKIE)
        assert (await client.get(PREFIX + "/me")).status_code == 200
        current_access = client.cookies.get(ACCESS_COOKIE)
        rejected = await client.post(
            PREFIX + "/refresh",
            headers={
                "X-CSRF-Token": client.cookies.get(CSRF_COOKIE),
                "Cookie": (
                    f"{REFRESH_COOKIE}={old_refresh}; "
                    f"{CSRF_COOKIE}={client.cookies.get(CSRF_COOKIE)}"
                ),
            },
        )
        assert rejected.status_code == 401
        assert "set-cookie" not in rejected.headers
        logged_out = await client.post(PREFIX + "/logout", headers=await csrf_headers(client))
        assert logged_out.status_code == 204 and not logged_out.content
        assert client.cookies.get(ACCESS_COOKIE) is None
        assert (
            await client.get(
                PREFIX + "/me", headers={"Cookie": f"{ACCESS_COOKIE}={current_access}"}
            )
        ).status_code == 401
        assert (
            await client.get(PREFIX + "/me", headers={"Cookie": f"{ACCESS_COOKIE}={old_access}"})
        ).status_code == 401


@pytest.mark.parametrize(
    "field,value", [("role", "admin"), ("is_active", True), ("password_hash", "forged")]
)
async def test_registration_rejects_privilege_fields(settings_factory, field, value):
    h = auth_harness(settings_factory)
    async with h.client as client:
        response = await client.post(
            PREFIX + "/register",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": PASSWORD, field: value},
        )
        assert response.status_code == 422
        assert PASSWORD not in response.text
        assert all("input" not in error for error in response.json()["detail"])
        assert not h.service.users.records


@pytest.mark.parametrize(
    "password,expected",
    [("a" * 14, 422), ("a" * 15, 201), ("a" * 128, 201), ("a" * 129, 422), (" " * 15, 201)],
)
async def test_registration_password_boundaries(settings_factory, password, expected):
    h = auth_harness(settings_factory)
    async with h.client as client:
        response = await client.post(
            PREFIX + "/register",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": password},
        )
        assert response.status_code == expected
        if expected == 422:
            assert password not in response.text


async def test_case_insensitive_duplicate_and_login(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        duplicate = await client.post(
            PREFIX + "/register",
            headers=await csrf_headers(client),
            json={"username": "phong", "password": PASSWORD},
        )
        assert duplicate.status_code == 409
        lower = await client.post(
            PREFIX + "/login",
            headers=await csrf_headers(client),
            json={"username": "  pHoNg  ", "password": PASSWORD},
        )
        assert lower.status_code == 200


async def test_login_failure_same_for_missing_wrong_or_inactive(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        results = []
        for name, password in [("missing", PASSWORD), ("Phong", "wrong password")]:
            response = await client.post(
                PREFIX + "/login",
                headers=await csrf_headers(client),
                json={"username": name, "password": password},
            )
            results.append((response.status_code, response.json()))
        user = next(iter(h.service.users.records.values()))
        h.service.users.records[str(user.id)] = UserRecord.model_validate(
            {**user.to_document(), "is_active": False}
        )
        response = await client.post(
            PREFIX + "/login",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": PASSWORD},
        )
        assert (response.status_code, response.json()) == results[0] == results[1]
        assert response.status_code == 401
        assert (await client.get(PREFIX + "/me")).status_code == 401
        assert (
            await client.post(PREFIX + "/refresh", headers=await csrf_headers(client))
        ).status_code == 401


@pytest.mark.parametrize(
    "mode",
    [
        "missing",
        "mismatch",
        "unsigned",
        "expired",
        "foreign-session",
        "foreign-origin",
        "cross-site",
    ],
)
async def test_csrf_rejection(settings_factory, mode):
    h = auth_harness(settings_factory)
    async with h.client as client:
        headers = await csrf_headers(client)
        if mode == "missing":
            headers = {}
        elif mode == "mismatch":
            headers["X-CSRF-Token"] = "mismatch"
        elif mode in {"unsigned", "expired", "foreign-session"}:
            token = "unsigned"
            if mode == "expired":
                token = new_csrf_token(SECRET, "", h.clock.now - timedelta(days=8))
            elif mode == "foreign-session":
                token = new_csrf_token(SECRET, "other-session", h.clock.now)
            headers = {"X-CSRF-Token": token, "Cookie": f"{CSRF_COOKIE}={token}"}
        elif mode == "foreign-origin":
            headers["Origin"] = "https://evil.invalid"
        elif mode == "cross-site":
            headers["Sec-Fetch-Site"] = "cross-site"
        result = await client.post(
            PREFIX + "/register", headers=headers, json={"username": "Phong", "password": PASSWORD}
        )
        assert result.status_code == 403
        assert result.headers["cache-control"] == "no-store"
        assert not h.service.users.records


async def test_seven_day_absolute_expiry_and_capped_access(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        session = next(iter(h.service.sessions.records.values()))
        h.clock.now = session.expires_at - timedelta(minutes=1)
        result = await client.post(PREFIX + "/refresh", headers=await csrf_headers(client))
        assert result.status_code == 200
        assert result.json()["access_expires_at"] == result.json()["session_expires_at"]
        h.clock.now = session.expires_at
        assert (await client.get(PREFIX + "/me")).status_code == 401
        assert (
            await client.post(PREFIX + "/refresh", headers=await csrf_headers(client))
        ).status_code == 401


async def test_roles_read_from_database_not_token(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        user = next(iter(h.service.users.records.values()))
        for role, admin_status, creator_status in [
            (UserRole.CREATOR, 403, 200),
            (UserRole.ADMIN, 200, 200),
            (UserRole.USER, 403, 403),
        ]:
            h.service.users.records[str(user.id)] = UserRecord.model_validate(
                {**user.to_document(), "role": role}
            )
            assert (await client.get("/api/v1/test/admin")).status_code == admin_status
            assert (await client.get("/api/v1/test/creator")).status_code == creator_status


async def test_logout_all_revokes_multiple_sessions(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        old_access = client.cookies.get(ACCESS_COOKIE)
        await client.post(
            PREFIX + "/login",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": PASSWORD},
        )
        result = await client.post(PREFIX + "/logout-all", headers=await csrf_headers(client))
        assert result.status_code == 204
        assert all(s.revoked_at is not None for s in h.service.sessions.records.values())
        assert (
            await client.get(PREFIX + "/me", headers={"Cookie": f"{ACCESS_COOKIE}={old_access}"})
        ).status_code == 401


async def test_secure_cookie_flags_and_no_store(settings_factory):
    h = auth_harness(settings_factory, production=True)
    async with h.client as client:
        response = await register_and_login(client)
        for cookie in response.headers.get_list("set-cookie"):
            assert "HttpOnly" in cookie and "Secure" in cookie and "SameSite=lax" in cookie
            assert "Path=/api/v1" in cookie and "Domain=" not in cookie
        assert response.headers["cache-control"] == "no-store"
        assert (await client.get(PREFIX + "/me")).headers["cache-control"] == "no-store"


async def test_missing_config_is_safe_503(settings_factory, api_client):
    async with api_client(settings_factory()) as client:
        assert (await client.get(PREFIX + "/csrf")).status_code == 503
        assert (await client.get(PREFIX + "/me")).status_code == 503
    async with api_client(settings_factory(jwt_secret=SECRET)) as client:
        result = await client.post(
            PREFIX + "/register",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": PASSWORD},
        )
        assert result.status_code == 503


async def test_database_failure_does_not_expose_driver_error(settings_factory):
    h = auth_harness(settings_factory)

    async def broken(name):
        raise ServerSelectionTimeoutError("private-driver-password-and-host")

    h.service.users.find_by_username = broken
    async with h.client as client:
        result = await client.post(
            PREFIX + "/login",
            headers=await csrf_headers(client),
            json={"username": "Phong", "password": PASSWORD},
        )
        assert result.status_code == 503
        assert "private-driver" not in result.text


async def test_signed_access_cannot_impersonate_other_session_owner(settings_factory):
    h = auth_harness(settings_factory)
    async with h.client as client:
        await register_and_login(client)
        other = await h.service.register("other", PASSWORD)
        session = next(iter(h.service.sessions.records.values()))
        forged = encode_access(
            secret=SECRET,
            user_id=str(other.id),
            session_id=str(session.id),
            now=h.clock.now,
            expires_at=h.clock.now + timedelta(minutes=15),
        )
        assert (
            await client.get(PREFIX + "/me", headers={"Cookie": f"{ACCESS_COOKIE}={forged}"})
        ).status_code == 401
