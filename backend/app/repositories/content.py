"""Atomic tour edits and publication pointer; release documents are insert-only."""

from uuid import uuid4

from pymongo import ReturnDocument
from pymongo.read_preferences import ReadPreference

from app.models.common import utc_now

CAMPUS_ID = "campus-main"


class ContentRepository:
    def __init__(self, database):
        self.tours = database["tours"].with_options(read_preference=ReadPreference.PRIMARY)
        self.releases = database["tour_releases"].with_options(
            read_preference=ReadPreference.PRIMARY
        )

    async def get(self):
        return await self.tours.find_one({"_id": CAMPUS_ID})

    async def initialize(self, draft):
        return await self.tours.update_one(
            {"_id": CAMPUS_ID},
            {
                "$setOnInsert": {
                    "revision": 1,
                    "draft": draft,
                    "published_release_id": None,
                    "updated_at": utc_now(),
                }
            },
            upsert=True,
        )

    async def save(self, revision, draft, actor_id):
        return await self.tours.find_one_and_update(
            {"_id": CAMPUS_ID, "revision": revision},
            {
                "$set": {"draft": draft, "updated_at": utc_now(), "updated_by": actor_id},
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )

    async def release(self, release_id):
        return await self.releases.find_one({"_id": release_id, "tour_id": CAMPUS_ID})

    async def publish(self, tour, actor_id):
        release_id = str(uuid4())
        await self.releases.insert_one(
            {
                "_id": release_id,
                "tour_id": CAMPUS_ID,
                "draft": tour["draft"],
                "source_revision": tour["revision"],
                "published_by": actor_id,
                "published_at": utc_now(),
            }
        )
        # If an edit wins the race, this snapshot remains private and unreferenced.
        return await self.tours.find_one_and_update(
            {"_id": CAMPUS_ID, "revision": tour["revision"]},
            {
                "$set": {"published_release_id": release_id, "updated_at": utc_now()},
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )

    async def unpublish(self, revision):
        return await self.tours.find_one_and_update(
            {"_id": CAMPUS_ID, "revision": revision},
            {
                "$set": {"published_release_id": None, "updated_at": utc_now()},
                "$inc": {"revision": 1},
            },
            return_document=ReturnDocument.AFTER,
        )
