"""Public account projections and real aggregate counts, without password material."""

from pymongo import ReturnDocument

from app.models.common import utc_now

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
            "active_users": await self.users.count_documents({"is_active": True}),
            "audio_assets": await self.database["assets"].count_documents({"status": "ready"}),
        }

    async def revoke_sessions(self, user_id):
        now = utc_now()
        await self.database["sessions"].update_many(
            {"user_id": user_id, "revoked_at": None},
            {"$set": {"revoked_at": now, "updated_at": now}},
        )
