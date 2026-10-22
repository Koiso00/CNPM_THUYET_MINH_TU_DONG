"""Explicit local operator command: promote one existing, active registered account."""

import argparse
import asyncio

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.core.config import Settings
from app.db.mongodb import MongoConnection
from app.models.common import utc_now
from app.models.user import username_key


async def promote(settings, username):
    connection = MongoConnection(settings)
    connection.start()
    try:
        database = connection.database
        if database is None:
            raise RuntimeError("Database not configured.")
        result = await database["users"].update_one(
            {"username_key": username_key(username), "is_active": True},
            {"$set": {"role": "admin", "updated_at": utc_now()}},
        )
        if result.matched_count != 1:
            raise RuntimeError("Register an active account first.")
    finally:
        await connection.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("username", help="Existing active username; never a password")
    args = parser.parse_args()
    try:
        asyncio.run(promote(Settings(), args.username))
    except (ValidationError, PyMongoError, RuntimeError, ValueError):
        print("Cannot promote account. Check configuration and the existing active username.")
        return 1
    print("Existing account now has Admin role. Sign in again or reload the session.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
