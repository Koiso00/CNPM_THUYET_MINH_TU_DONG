"""Initialize auth indexes explicitly without inserting accounts or dropping data."""

import asyncio
import sys

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.core.config import Settings
from app.db.indexes import ensure_session_indexes, ensure_user_indexes
from app.db.mongodb import MongoConnection


async def initialize_database(settings: Settings) -> None:
    if settings.mongodb_uri is None:
        raise RuntimeError("MONGODB_URI is not configured.")
    connection = MongoConnection(settings)
    connection.start()
    try:
        database = connection.database
        if database is None:
            raise RuntimeError("MongoDB is not configured.")
        await ensure_user_indexes(database["users"])
        await ensure_session_indexes(database["sessions"])
    finally:
        await connection.close()


def main() -> int:
    try:
        asyncio.run(initialize_database(Settings()))
    except (ValidationError, PyMongoError, RuntimeError, OSError):
        print(
            "Cannot initialize database indexes. Check configuration, permissions "
            "and existing index/data conflicts; no data was dropped.",
            file=sys.stderr,
        )
        return 1
    print("User/session indexes are ready. No user accounts were created.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
