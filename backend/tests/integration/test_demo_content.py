"""Real Atlas snapshot isolation, GridFS ranges, account controls and live counts."""

import asyncio
from copy import deepcopy
from hashlib import sha256

import pytest

from app.api.content_dependencies import get_admin_service, get_audio_service, get_content_service
from app.commands.seed_demo_content import source_draft
from app.db.indexes import ensure_session_indexes, ensure_user_indexes
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository
from app.services.auth import AuthenticationError, AuthService
from tests.auth_support import SECRET, auth_harness, csrf_headers, register_and_login
from tests.demo_database import isolated_content

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_write_integration]


async def test_demo_http_atlas(settings_factory, user_test_collection, session_test_collection):
    await ensure_user_indexes(user_test_collection)
    await ensure_session_indexes(session_test_collection)
    auth = AuthService(
        UserRepository(user_test_collection),
        SessionRepository(session_test_collection),
        secret=SECRET,
    )
    h = auth_harness(settings_factory, service=auth)
    async with isolated_content(user_test_collection, session_test_collection) as services:
        h.app.dependency_overrides[get_content_service] = lambda: services.content
        h.app.dependency_overrides[get_audio_service] = lambda: services.audio
        h.app.dependency_overrides[get_admin_service] = lambda: services.admin
        draft = source_draft()
        repo = services.content.repository
        assert (await repo.initialize(draft)).upserted_id
        assert (await repo.initialize({**draft, "title": "must not replace"})).upserted_id is None
        audio = services.audio.repository
        payload = b"0123456789"  # Storage fixture, not claimed to be playable MP3.
        checksum = sha256(draft["places"][0]["description"].encode()).hexdigest()
        await audio.store(
            {
                "_id": "fixture",
                "filename": "fixture.mp3",
                "text_sha256": checksum,
                "bytes": len(payload),
                "language": "vi",
                "duration_seconds": 1,
            },
            payload,
        )
        async with h.client as client:
            login = await register_and_login(client)
            uid = login.json()["user"]["id"]
            assert (await client.get("/api/v1/admin/campus")).status_code == 403
            await user_test_collection.update_one({"_id": uid}, {"$set": {"role": "admin"}})
            response = await client.post(
                "/api/v1/admin/campus/publish",
                json={"revision": 1},
                headers=await csrf_headers(client),
            )
            assert response.status_code == 200
            public = (await client.get("/api/v1/content/campus")).json()
            assert public["places"][0]["audio_id"] == "fixture"
            url = f"/api/v1/audio/{public['release_id']}/{public['places'][0]['id']}"
            media = await client.get(url, headers={"Range": "bytes=3-6"})
            assert media.status_code == 206 and media.content == b"3456"
            assert (await client.head(url)).headers["content-length"] == "10"
            changed = deepcopy(draft)
            changed["places"][0]["description"] = "Nội dung mới"
            assert (
                await client.put(
                    "/api/v1/admin/campus",
                    json={"revision": 2, "draft": changed},
                    headers=await csrf_headers(client),
                )
            ).status_code == 200
            assert (await client.get("/api/v1/content/campus")).json() == public
            assert (
                await client.put(
                    "/api/v1/admin/campus",
                    json={"revision": 2, "draft": draft},
                    headers=await csrf_headers(client),
                )
            ).status_code == 409
            counts = (await client.get("/api/v1/admin/dashboard")).json()
            assert counts == {
                "users": 1,
                "active_users": 1,
                "audio_assets": 1,
                "draft_places": 10,
                "published_places": 10,
                "published_tours": 1,
            }
            accounts = (await client.get("/api/v1/admin/users")).json()
            assert len(accounts) == 1 and "password_hash" not in str(accounts)
            target = await auth.register("visitor", "another long password 1234")
            target_grant = await auth.login("visitor", "another long password 1234")
            update = await client.put(
                f"/api/v1/admin/users/{target.id}",
                json={"role": "creator", "is_active": False},
                headers=await csrf_headers(client),
            )
            assert update.status_code == 200 and not update.json()["is_active"]
            with pytest.raises(AuthenticationError):
                await auth.authenticate(target_grant.access_token)
            await client.put(
                f"/api/v1/admin/users/{target.id}",
                json={"role": "user", "is_active": True},
                headers=await csrf_headers(client),
            )
            with pytest.raises(AuthenticationError):
                await auth.authenticate(target_grant.access_token)
            await user_test_collection.update_one(
                {"_id": str(target.id)}, {"$set": {"role": "admin"}}
            )
            assert (
                await client.put(
                    f"/api/v1/admin/users/{target.id}",
                    json={"role": "user", "is_active": False},
                    headers=await csrf_headers(client),
                )
            ).status_code == 409
            denied = await client.put(
                f"/api/v1/admin/users/{uid}",
                json={"role": "user", "is_active": False},
                headers=await csrf_headers(client),
            )
            assert denied.status_code == 409
            await client.post(
                "/api/v1/admin/campus/unpublish",
                json={"revision": 3},
                headers=await csrf_headers(client),
            )
            assert (await client.get(url)).status_code == 404
            tour = await repo.get()
            raced = await asyncio.gather(repo.save(4, draft, uid), repo.publish(tour, uid))
            assert sum(result is not None for result in raced) == 1
