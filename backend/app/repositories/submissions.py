"""Creator-owned campus proposals awaiting administrator review."""

from uuid import uuid4

from pymongo import ReturnDocument
from pymongo.read_preferences import ReadPreference

from app.models.common import utc_now


class SubmissionRepository:
    def __init__(self, database):
        self.items = database["content_submissions"].with_options(
            read_preference=ReadPreference.PRIMARY
        )

    async def create(self, creator_id, draft, base_revision):
        item = {
            "_id": str(uuid4()),
            "creator_id": creator_id,
            "draft": draft,
            "base_revision": base_revision,
            "revision": 1,
            "status": "draft",
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "submitted_at": None,
            "reviewed_at": None,
            "reviewed_by": None,
            "review_note": None,
            "applied_revision": None,
        }
        await self.items.insert_one(item)
        return item

    async def get(self, submission_id, creator_id=None):
        query = {"_id": submission_id}
        if creator_id is not None:
            query["creator_id"] = creator_id
        return await self.items.find_one(query)

    async def list(self, creator_id=None, status=None, offset=0, limit=50):
        query = {}
        if creator_id is not None:
            query["creator_id"] = creator_id
        if status is not None:
            query["status"] = {"$in": status} if isinstance(status, list) else status
        cursor = self.items.find(query).sort("updated_at", -1).skip(offset).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_draft(self, submission_id, creator_id, revision, draft, base_revision):
        return await self.items.find_one_and_update(
            {
                "_id": submission_id,
                "creator_id": creator_id,
                "revision": revision,
                "status": {"$in": ["draft", "rejected"]},
            },
            {
                "$set": {
                    "draft": draft,
                    "base_revision": base_revision,
                    "status": "draft",
                    "review_note": None,
                    "reviewed_at": None,
                    "reviewed_by": None,
                    "updated_at": utc_now(),
                },
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )

    async def submit(self, submission_id, creator_id, revision):
        return await self.items.find_one_and_update(
            {
                "_id": submission_id,
                "creator_id": creator_id,
                "revision": revision,
                "status": "draft",
            },
            {
                "$set": {
                    "status": "pending",
                    "submitted_at": utc_now(),
                    "updated_at": utc_now(),
                },
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )

    async def review(self, submission_id, revision, decision, reviewer_id, note):
        return await self.items.find_one_and_update(
            {"_id": submission_id, "revision": revision, "status": "pending"},
            {
                "$set": {
                    "status": decision,
                    "review_note": note,
                    "reviewed_at": utc_now(),
                    "reviewed_by": reviewer_id,
                    "updated_at": utc_now(),
                },
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )

    async def mark_applied(self, submission_id, revision, applied_revision):
        return await self.items.find_one_and_update(
            {
                "_id": submission_id,
                "revision": revision,
                "status": "approved",
                "applied_revision": None,
            },
            {
                "$set": {
                    "status": "applied",
                    "applied_revision": applied_revision,
                    "updated_at": utc_now(),
                },
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )
