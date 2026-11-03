"""Actual HTTP/auth/CSRF over deterministic content storage doubles."""

from copy import deepcopy
from hashlib import sha256
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.api.content_dependencies import (
    get_audio_service,
    get_content_service,
)
from app.models.user import UserRecord, UserRole
from app.schemas.content import CampusDraft, Point, SaveCampus
from app.services.audio import AudioService
from tests.auth_support import auth_harness, csrf_headers, register_and_login
from tests.content_support import content_service

pytestmark = pytest.mark.anyio


def attach(h):
    service = content_service()
    h.app.dependency_overrides[get_content_service] = lambda: service
    h.app.dependency_overrides[get_audio_service] = lambda: AudioService(service.audio, service)
    return service


def role(h, value):
    user = next(iter(h.service.users.records.values()))
    h.service.users.records[str(user.id)] = UserRecord.model_validate(
        {
            **user.to_document(),
            "role": value,
        }
    )


async def test_draft_publish_edit_conflict_unpublish(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    async with h.client as client:
        assert (await client.get("/api/v1/content/campus")).status_code == 404
        await register_and_login(client)
        assert (await client.get("/api/v1/content/campus")).status_code == 404
        assert (await client.get("/api/v1/admin/campus")).status_code == 403
        role(h, UserRole.ADMIN)
        saved = (await client.get("/api/v1/admin/campus")).json()
        assert len(saved["draft"]["places"]) == 10
        original = deepcopy(saved["draft"])
        assert (
            await client.post("/api/v1/admin/campus/publish", json={"revision": 1})
        ).status_code == 403
        published = await client.post(
            "/api/v1/admin/campus/publish", json={"revision": 1}, headers=await csrf_headers(client)
        )
        assert published.status_code == 200
        public = (await client.get("/api/v1/content/campus")).json()
        assert public["places"][0]["description"] == original["places"][0]["description"]
        assert "draft" not in public and "updated_by" not in public
        saved["draft"]["places"][0]["description"] = "Bản nháp mới chưa công bố"
        edit = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 2, "draft": saved["draft"]},
            headers=await csrf_headers(client),
        )
        assert edit.status_code == 200
        assert (await client.get("/api/v1/content/campus")).json() == public
        conflict = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 2, "draft": original},
            headers=await csrf_headers(client),
        )
        assert conflict.status_code == 409
        assert (
            await client.post(
                "/api/v1/admin/campus/publish",
                json={"revision": 2},
                headers=await csrf_headers(client),
            )
        ).status_code == 409
        assert (
            await client.post(
                "/api/v1/admin/campus/unpublish",
                json={"revision": 3},
                headers=await csrf_headers(client),
            )
        ).status_code == 200
        assert (await client.get("/api/v1/content/campus")).status_code == 404
        assert len(service.repository.releases) == 1


async def test_admin_cannot_add_or_remove_places_but_can_edit_existing(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        draft = deepcopy(service.repository.tour["draft"])
        added = deepcopy(draft["places"][0])
        added["id"] = str(uuid4())
        draft["places"].append(added)
        response = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 1, "draft": draft},
            headers=await csrf_headers(client),
        )
        assert response.status_code == 422
        assert len(service.repository.tour["draft"]["places"]) == 10
        draft["places"].pop()
        draft["places"].pop()
        response = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 1, "draft": draft},
            headers=await csrf_headers(client),
        )
        assert response.status_code == 422
        draft = deepcopy(service.repository.tour["draft"])
        draft["places"][0]["description"] = "Nội dung được chỉnh sửa"
        response = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 1, "draft": draft},
            headers=await csrf_headers(client),
        )
        assert response.status_code == 200
        assert len(response.json()["draft"]["places"]) == 10
        assert response.json()["draft"]["places"][0]["description"] == "Nội dung được chỉnh sửa"


async def test_admin_account_management_routes_are_not_available(settings_factory):
    h = auth_harness(settings_factory)
    attach(h)
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        assert (await client.get("/api/v1/admin/users")).status_code == 404
        response = await client.put(
            f"/api/v1/admin/users/{uuid4()}",
            json={"role": "admin", "is_active": True},
            headers=await csrf_headers(client),
        )
        assert response.status_code == 404


async def test_creator_routes_and_review_workflow_removed(settings_factory):
    h = auth_harness(settings_factory)
    attach(h)
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        for path in ("/creator/campus", "/creator/submissions", "/admin/submissions"):
            assert (await client.get("/api/v1" + path)).status_code == 404
        for action in ("review", "apply"):
            response = await client.post(
                f"/api/v1/admin/submissions/{uuid4()}/{action}",
                json={},
                headers=await csrf_headers(client),
            )
            assert response.status_code == 404


@pytest.mark.parametrize("value", [UserRole.USER, UserRole.CREATOR])
async def test_nonadmin_cannot_read_or_write_admin_features(settings_factory, value):
    h = auth_harness(settings_factory)
    attach(h)
    async with h.client as client:
        await register_and_login(client)
        role(h, value)
        for path in ("campus", "dashboard", "audio", "audio/private"):
            assert (await client.get("/api/v1/admin/" + path)).status_code == 403
        creator_response = await client.get("/api/v1/creator/campus")
        assert creator_response.status_code == 404
        assert (await client.get("/api/v1/creator/submissions")).status_code == 404
        for method, path, body in (
            ("PUT", "campus", {"revision": 1, "draft": {}}),
            ("POST", "campus/publish", {"revision": 1}),
        ):
            response = await client.request(
                method, "/api/v1/admin/" + path, json=body, headers=await csrf_headers(client)
            )
            assert response.status_code == 403


async def test_published_audio_range_and_private_assets(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    description = service.repository.tour["draft"]["places"][0]["description"]
    service.audio.attach_test_audio(description)
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        await client.post(
            "/api/v1/admin/campus/publish", json={"revision": 1}, headers=await csrf_headers(client)
        )
        public = (await client.get("/api/v1/content/campus")).json()
        place = public["places"][0]
        url = f"/api/v1/audio/{public['release_id']}/{place['id']}"
        role(h, UserRole.USER)
        response = await client.get(url, headers={"Range": "bytes=2-5"})
        assert response.status_code == 206 and response.content == b"2345"
        assert response.headers["content-range"] == "bytes 2-5/10"
        assert response.headers["cache-control"] == "no-store"
        assert (await client.head(url)).headers["content-length"] == "10"
        assert (await client.get(url, headers={"Range": "bytes=12-"})).status_code == 416
        assert (await client.get("/api/v1/admin/audio/test-asset")).status_code == 403
        assert (await client.get(f"/api/v1/audio/{uuid4()}/{place['id']}")).status_code == 404
        role(h, UserRole.ADMIN)
        await client.post(
            "/api/v1/admin/campus/unpublish",
            json={"revision": 2},
            headers=await csrf_headers(client),
        )
        assert (await client.get(url)).status_code == 404


async def test_public_english_audio_is_bound_to_the_matching_translation(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    draft = deepcopy(service.repository.tour["draft"])
    english = "Approved English POI narration."
    draft["places"][0]["translations"] = {
        "en": {
            "title": "Zone A",
            "description": english,
            "source": "Reviewed",
            "source_text_sha256": sha256(draft["places"][0]["description"].encode()).hexdigest(),
        }
    }
    service.audio.attach_test_audio(draft["places"][0]["description"])
    service.audio.attach_test_audio(english, language="en")
    await service.save(SaveCampus(revision=1, draft=draft), "admin")
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        published = await client.post(
            "/api/v1/admin/campus/publish",
            json={"revision": 2},
            headers=await csrf_headers(client),
        )
        assert published.status_code == 200
        public = (await client.get("/api/v1/content/campus")).json()
        place = public["places"][0]
        assert place["translations"]["en"]["description"] == english
        assert place["audio_by_language"]["en"] == "test-asset-en"
        response = await client.get(
            f"/api/v1/audio/{public['release_id']}/{place['id']}?language=en",
            headers={"Range": "bytes=2-5"},
        )
        assert response.status_code == 206
        assert response.content == b"2345"


async def test_empty_tour_and_unknown_fields_rejected(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.ADMIN)
        draft = deepcopy(service.repository.tour["draft"])
        draft["places"][0]["audio_id"] = "forged"
        response = await client.put(
            "/api/v1/admin/campus",
            json={"revision": 1, "draft": draft},
            headers=await csrf_headers(client),
        )
        assert response.status_code == 422
        service.repository.tour["draft"]["places"] = []
        assert (
            await client.post(
                "/api/v1/admin/campus/publish",
                json={"revision": 1},
                headers=await csrf_headers(client),
            )
        ).status_code == 422


def test_coordinate_validation_and_source_duplicates():
    assert Point(coordinates=[106, 10]).coordinates == (106, 10)
    for coords in ([10, 106], [float("nan"), 10], [float("inf"), 10]):
        with pytest.raises(ValidationError):
            Point(coordinates=coords)
    draft = content_service().repository.tour["draft"]
    draft["places"].append(draft["places"][0])
    with pytest.raises(ValidationError):
        CampusDraft.model_validate(draft)


async def test_upload_limits_validation_and_authorization(settings_factory):
    h = auth_harness(settings_factory)
    service = attach(h)
    place_id = service.repository.tour["draft"]["places"][0]["id"]
    url = f"/api/v1/admin/campus/places/{place_id}/audio?revision=1"
    async with h.client as client:
        await register_and_login(client)
        headers = {**await csrf_headers(client), "Content-Type": "audio/mpeg"}
        assert (await client.put(url, content=b"no", headers=headers)).status_code == 403
        role(h, UserRole.ADMIN)
        assert (await client.put(url, content=b"no", headers=headers)).status_code == 422
        assert (
            await client.put(url, content=b"no", headers=await csrf_headers(client))
        ).status_code == 415
        headers = {**await csrf_headers(client), "Content-Type": "audio/mpeg"}
        response = await client.put(url, content=b"x" * (10 * 1024 * 1024 + 1), headers=headers)
        assert response.status_code == 413
        assert not service.audio.assets
