"""Atomic refresh-token rotation and explicit expiry checks independent of TTL cleanup."""

from datetime import datetime
from uuid import UUID

from pydantic import SecretStr
from pymongo import ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.errors import DuplicateKeyError

from app.models.common import record_key, utc_milliseconds
from app.models.session import SessionRecord, refresh_digest


class DuplicateSessionError(Exception):
    """The internal session ID or token digest is already stored."""


class SessionRepository:
    def __init__(self, collection: AsyncCollection) -> None:
        self._collection = collection

    async def insert(self, session: SessionRecord) -> SessionRecord:
        try:
            await self._collection.insert_one(session.to_document())
        except DuplicateKeyError:
            raise DuplicateSessionError("Session identity already exists.") from None
        return session

    async def find_active(self, session_id: str | UUID, *, now: datetime) -> SessionRecord | None:
        key = record_key(session_id)
        if key is None:
            return None
        moment = utc_milliseconds(now)
        document = await self._collection.find_one(
            {
                "_id": key,
                "revoked_at": None,
                "created_at": {"$lte": moment},
                "expires_at": {"$gt": moment},
            }
        )
        return SessionRecord.model_validate(document) if document is not None else None

    async def rotate_refresh(
        self,
        session_id: str | UUID,
        *,
        expected_hash: str | SecretStr,
        replacement_hash: str | SecretStr,
        now: datetime,
    ) -> SessionRecord | None:
        key = record_key(session_id)
        if key is None:
            return None
        current_digest = refresh_digest(expected_hash)
        next_digest = refresh_digest(replacement_hash)
        if current_digest == next_digest:
            raise ValueError("Refresh rotation requires a new token digest.")
        moment = utc_milliseconds(now)
        try:
            document = await self._collection.find_one_and_update(
                {
                    "_id": key,
                    "refresh_token_hash": current_digest,
                    "revoked_at": None,
                    "created_at": {"$lte": moment},
                    "expires_at": {"$gt": moment},
                },
                {"$set": {"refresh_token_hash": next_digest, "updated_at": moment}},
                return_document=ReturnDocument.AFTER,
            )
        except DuplicateKeyError:
            raise DuplicateSessionError("Replacement token digest already exists.") from None
        return SessionRecord.model_validate(document) if document is not None else None

    async def revoke(self, session_id: str | UUID, *, user_id: str | UUID, now: datetime) -> bool:
        key, owner_key = record_key(session_id), record_key(user_id)
        if key is None or owner_key is None:
            return False
        moment = utc_milliseconds(now)
        result = await self._collection.update_one(
            {"_id": key, "user_id": owner_key, "revoked_at": None, "created_at": {"$lte": moment}},
            {"$set": {"revoked_at": moment, "updated_at": moment}},
        )
        return result.modified_count == 1

    async def revoke_all(self, user_id: str | UUID, *, now: datetime) -> int:
        owner_key = record_key(user_id)
        if owner_key is None:
            return 0
        moment = utc_milliseconds(now)
        result = await self._collection.update_many(
            {"user_id": owner_key, "revoked_at": None, "created_at": {"$lte": moment}},
            {"$set": {"revoked_at": moment, "updated_at": moment}},
        )
        return result.modified_count
