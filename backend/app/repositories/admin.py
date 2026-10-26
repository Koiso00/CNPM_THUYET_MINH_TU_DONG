"""Public account projections and real aggregate counts, without password material."""

from pymongo import ReturnDocument

from app.models.common import utc_now
from app.repositories.events import EventRepository

USER_FIELDS = {"_id": 1, "username": 1, "role": 1, "is_active": 1, "updated_at": 1}


class AdminRepository:
    def __init__(self, database):
        self.database = database
        self.users = database["users"]

    async def list_users(self, offset, limit):
        return (
            await self.users.find({}, USER_FIELDS)
            .sort("_id", 1)
            .skip(offset)
            .limit(limit)
            .to_list()
        )

    async def update_user(self, user_id, role, is_active):
        # Protect active administrators against cross-demotion races. Creating new
        # administrators is allowed; existing active admins require a local operator.
        return await self.users.find_one_and_update(
            {"_id": user_id, "$nor": [{"role": "admin", "is_active": True}]},
            {"$set": {"role": role, "is_active": is_active, "updated_at": utc_now()}},
            projection=USER_FIELDS,
            return_document=ReturnDocument.AFTER,
        )

    async def counts(self):
        return {
            "users": await self.users.count_documents({}),
            "online_visitors": await EventRepository(self.database).online_visitors(),
            "audio_assets": await self.database["assets"].count_documents({"status": "ready"}),
        }

    async def guest_counts(self, day):
        events = self.database["usage_events"]
        audio_by_place = await events.aggregate(
            [
                {"$match": {"day": day, "event_type": "audio_played", "place_id": {"$ne": None}}},
                {"$group": {"_id": "$place_id", "plays": {"$sum": 1}}},
                {"$sort": {"plays": -1, "_id": 1}},
            ]
        )
        place_rows = [row async for row in audio_by_place]
        return {
            "guest_visitors": len(
                await events.distinct("visitor_id", {"day": day, "event_type": "visit"})
            ),
            "guest_journeys": await events.count_documents(
                {"day": day, "event_type": "journey_started"}
            ),
            "guest_audio_plays": await events.count_documents(
                {"day": day, "event_type": "audio_played"}
            ),
            "guest_audio_by_place": [
                {"place_id": row["_id"], "plays": row["plays"]} for row in place_rows
            ],
        }

    async def revoke_sessions(self, user_id):
        now = utc_now()
        await self.database["sessions"].update_many(
            {"user_id": user_id, "revoked_at": None},
            {"$set": {"revoked_at": now, "updated_at": now}},
        )
