"""Actual HTTP/auth/CSRF over deterministic content storage doubles."""

from copy import deepcopy
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.api.content_dependencies import (
    get_audio_service,
    get_content_service,
    get_submission_service,
)
from app.models.user import UserRecord, UserRole
from app.schemas.content import CampusDraft, Point
from app.services.audio import AudioService
from app.services.submissions import SubmissionService
from tests.auth_support import auth_harness, csrf_headers, register_and_login
from tests.content_support import content_service

pytestmark = pytest.mark.anyio


class MemorySubmissions:
    def __init__(self):
        self.items = {}

    async def create(self, creator_id, draft, base_revision):
        item = {
            "_id": str(uuid4()),
            "creator_id": creator_id,
            "draft": deepcopy(draft),
            "base_revision": base_revision,
            "revision": 1,
            "status": "draft",
            "created_at": "now",
            "updated_at": "now",
            "submitted_at": None,
            "reviewed_at": None,
            "reviewed_by": None,
            "review_note": None,
            "applied_revision": None,
        }
        self.items[item["_id"]] = item
        return deepcopy(item)

    async def get(self, submission_id, creator_id=None):
        item = self.items.get(submission_id)
        if item is None or (creator_id is not None and item["creator_id"] != creator_id):
            return None
        return deepcopy(item)

    async def list(self, creator_id=None, status=None, offset=0, limit=50):
        items = list(self.items.values())
        if creator_id is not None:
            items = [item for item in items if item["creator_id"] == creator_id]
        if status is not None:
            statuses = status if isinstance(status, list) else [status]
            items = [item for item in items if item["status"] in statuses]
        return deepcopy(items[offset : offset + limit])

    async def update_draft(self, submission_id, creator_id, revision, draft, base_revision):
        item = self.items.get(submission_id)
        if (
            not item
            or item["creator_id"] != creator_id
            or item["revision"] != revision
            or item["status"] not in ("draft", "rejected")
        ):
            return None
        item.update(
            draft=deepcopy(draft),
            base_revision=base_revision,
            status="draft",
            revision=revision + 1,
        )
        return deepcopy(item)

    async def submit(self, submission_id, creator_id, revision):
        item = self.items.get(submission_id)
        if (
            not item
            or item["creator_id"] != creator_id
            or item["revision"] != revision
            or item["status"] != "draft"
        ):
            return None
        item.update(status="pending", revision=revision + 1)
        return deepcopy(item)

    async def review(self, submission_id, revision, decision, reviewer_id, note):
        item = self.items.get(submission_id)
        if not item or item["revision"] != revision or item["status"] != "pending":
            return None
        item.update(
            status=decision, review_note=note, reviewed_by=reviewer_id, revision=revision + 1
        )
        return deepcopy(item)

    async def mark_applied(self, submission_id, revision, applied_revision):
        item = self.items.get(submission_id)
        if (
            not item
            or item["revision"] != revision
            or item["status"] != "approved"
            or item["applied_revision"] is not None
        ):
            return None
        item.update(status="applied", applied_revision=applied_revision, revision=revision + 1)
        return deepcopy(item)


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
        assert (await client.get("/api/v1/content/campus")).status_code == 401
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


async def test_creator_proposal_review_and_apply_are_separate_from_publication(settings_factory):
    h = auth_harness(settings_factory)
    content = attach(h)
    repository = MemorySubmissions()
    service = SubmissionService(repository, content)
    h.app.dependency_overrides[get_submission_service] = lambda: service
    async with h.client as client:
        await register_and_login(client)
        role(h, UserRole.CREATOR)
        source = (await client.get("/api/v1/creator/campus")).json()
        draft = deepcopy(source["draft"])
        draft["places"][0]["description"] = "Creator đề xuất nội dung mới"
        created = await client.post(
            "/api/v1/creator/submissions",
            json={"base_revision": source["revision"], "draft": draft},
            headers=await csrf_headers(client),
        )
        assert created.status_code == 200
        submission = created.json()
        submitted = await client.post(
            f"/api/v1/creator/submissions/{submission['id']}/submit",
            json={"revision": submission["revision"]},
            headers=await csrf_headers(client),
        )
        assert submitted.status_code == 200
        assert submitted.json()["status"] == "pending"
        assert (await client.get("/api/v1/admin/submissions")).status_code == 403

        role(h, UserRole.ADMIN)
        reviewed = await client.post(
            f"/api/v1/admin/submissions/{submission['id']}/review",
            json={"revision": submitted.json()["revision"], "decision": "approved", "note": "Đạt"},
            headers=await csrf_headers(client),
        )
        assert reviewed.status_code == 200
        assert reviewed.json()["status"] == "approved"
        applied = await client.post(
            f"/api/v1/admin/submissions/{submission['id']}/apply",
            json={"revision": source["revision"]},
            headers=await csrf_headers(client),
        )
        assert applied.status_code == 200
        assert (
            applied.json()["campus"]["draft"]["places"][0]["description"]
            == "Creator đề xuất nội dung mới"
        )
        assert applied.json()["campus"]["revision"] == 2
        assert (await client.get("/api/v1/content/campus")).status_code == 404
        published = await client.post(
            "/api/v1/admin/campus/publish",
            json={"revision": 2},
            headers=await csrf_headers(client),
        )
        assert published.status_code == 200
        assert (await client.get("/api/v1/content/campus")).json()["places"][0][
            "description"
        ] == "Creator đề xuất nội dung mới"


@pytest.mark.parametrize("value", [UserRole.USER, UserRole.CREATOR])
async def test_nonadmin_cannot_read_or_write_admin_features(settings_factory, value):
    h = auth_harness(settings_factory)
    content = attach(h)
    h.app.dependency_overrides[get_submission_service] = lambda: SubmissionService(
        MemorySubmissions(), content
    )
    async with h.client as client:
        await register_and_login(client)
        role(h, value)
        for path in ("campus", "users", "dashboard", "audio", "audio/private"):
            assert (await client.get("/api/v1/admin/" + path)).status_code == 403
        creator_response = await client.get("/api/v1/creator/campus")
        assert creator_response.status_code == (
            200 if value == UserRole.CREATOR else 403
        )
        assert (await client.get("/api/v1/creator/submissions")).status_code == (
            200 if value == UserRole.CREATOR else 403
        )
        for method, path, body in (
            ("PUT", "campus", {"revision": 1, "draft": {}}),
            ("POST", "campus/publish", {"revision": 1}),
            ("PUT", f"users/{uuid4()}", {"role": "admin", "is_active": True}),
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
