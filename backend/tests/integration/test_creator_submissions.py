"""Real MongoDB checks for isolated Creator-owned proposals and review transitions."""

import asyncio
from uuid import uuid4

import pytest

from app.db.indexes import ensure_submission_indexes
from app.repositories.submissions import SubmissionRepository
from tests.integration.conftest import temporary_collection

pytestmark = [pytest.mark.anyio, pytest.mark.mongodb_write_integration]


async def test_creator_submission_lifecycle_is_owned_and_compare_and_set():
    async with temporary_collection("content_submissions") as collection:
        await ensure_submission_indexes(collection)
        await ensure_submission_indexes(collection)
        repository = SubmissionRepository({"content_submissions": collection})
        creator_id = str(uuid4())
        other_creator = str(uuid4())
        draft = {
            "title": "Tour khuôn viên",
            "language": "vi",
            "places": [
                {
                    "id": str(uuid4()),
                    "title": "Khu A",
                    "description": "Nội dung đề xuất",
                    "source": "Nguồn được cung cấp",
                    "location": None,
                }
            ],
        }

        created = await repository.create(creator_id, draft, base_revision=7)
        assert await repository.get(created["_id"], other_creator) is None
        assert [item["_id"] for item in await repository.list(creator_id)] == [created["_id"]]
        assert await repository.list(other_creator) == []

        outcomes = await asyncio.gather(
            repository.submit(created["_id"], creator_id, revision=1),
            repository.submit(created["_id"], creator_id, revision=1),
            return_exceptions=True,
        )
        submitted = [item for item in outcomes if isinstance(item, dict)]
        assert len(submitted) == 1
        assert submitted[0]["status"] == "pending"
        approved = await repository.review(
            created["_id"],
            revision=2,
            decision="approved",
            reviewer_id=str(uuid4()),
            note="Đạt",
        )
        assert approved["status"] == "approved"
        applied = await repository.mark_applied(created["_id"], revision=3, applied_revision=8)
        assert applied["status"] == "applied"
        assert applied["applied_revision"] == 8
        assert await repository.mark_applied(created["_id"], revision=3, applied_revision=9) is None
