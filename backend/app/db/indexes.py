"""Explicit index setup. Never drop/rebuild an existing index automatically."""

from pymongo import ASCENDING, IndexModel
from pymongo.asynchronous.collection import AsyncCollection


async def ensure_user_indexes(collection: AsyncCollection) -> list[str]:
    return await collection.create_indexes(
        [
            IndexModel(
                [("username_key", ASCENDING)],
                name="uq_users_username_key",
                unique=True,
            )
        ]
    )


async def ensure_session_indexes(collection: AsyncCollection) -> list[str]:
    return await collection.create_indexes(
        [
            IndexModel(
                [("refresh_token_hash", ASCENDING)],
                name="uq_sessions_refresh_token_hash",
                unique=True,
            ),
            IndexModel(
                [("expires_at", ASCENDING)],
                name="ttl_sessions_expires_at",
                expireAfterSeconds=0,
            ),
            IndexModel([("user_id", ASCENDING)], name="ix_sessions_user_id"),
        ]
    )
