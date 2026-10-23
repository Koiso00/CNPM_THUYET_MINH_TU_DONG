"""User persistence with a normalized lookup and database-enforced uniqueness."""

from uuid import UUID

from pymongo.asynchronous.collection import AsyncCollection
from pymongo.errors import DuplicateKeyError

from app.models.common import record_key, utc_now
from app.models.user import UserRecord, UserRole, username_key


class DuplicateUsernameError(Exception):
    """The normalized username is already registered."""


class DuplicateUserIdError(Exception):
    """The supplied internal user ID already exists."""


class UserRepository:
    def __init__(self, collection: AsyncCollection) -> None:
        self._collection = collection

    async def insert(self, user: UserRecord) -> UserRecord:
        try:
            await self._collection.insert_one(user.to_document())
        except DuplicateKeyError as error:
            key_pattern = (error.details or {}).get("keyPattern", {})
            if "username_key" in key_pattern:
                raise DuplicateUsernameError("Username is already registered.") from None
            raise DuplicateUserIdError("User identity already exists.") from None
        return user

    async def find_by_id(self, user_id: str | UUID) -> UserRecord | None:
        key = record_key(user_id)
        if key is None:
            return None
        document = await self._collection.find_one({"_id": key})
        return UserRecord.model_validate(document) if document is not None else None

    async def find_by_username(self, username: str) -> UserRecord | None:
        document = await self._collection.find_one({"username_key": username_key(username)})
        return UserRecord.model_validate(document) if document is not None else None

    async def promote_active(self, user: UserRecord) -> bool:
        """Local setup only: preserve credentials and reject concurrent account changes."""
        result = await self._collection.update_one(
            {
                "_id": str(user.id),
                "is_active": True,
                "role": user.role.value,
                "updated_at": user.updated_at,
            },
            {"$set": {"role": "admin", "updated_at": utc_now()}},
        )
        return result.matched_count == 1

    async def role_counts(self) -> dict[str, int]:
        return {
            role.value: await self._collection.count_documents({"role": role.value})
            for role in UserRole
        }
