"""Explicit index setup. Never drop/rebuild an existing index automatically."""

from pymongo import ASCENDING, DESCENDING, IndexModel
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


async def ensure_submission_indexes(collection: AsyncCollection) -> list[str]:
    return await collection.create_indexes(
        [
            IndexModel([("creator_id", ASCENDING), ("updated_at", DESCENDING)]),
            IndexModel([("status", ASCENDING), ("updated_at", DESCENDING)]),
        ]
    )


async def ensure_usage_event_indexes(collection: AsyncCollection) -> list[str]:
    return await collection.create_indexes(
        [
            IndexModel([("event_type", ASCENDING), ("day", ASCENDING)]),
        ]
    )


async def ensure_visitor_presence_indexes(collection: AsyncCollection) -> list[str]:
    return await collection.create_indexes(
        [
            IndexModel(
                [("last_seen", ASCENDING)],
                name="ttl_visitor_presence_last_seen",
                expireAfterSeconds=180,
            )
        ]
    )
