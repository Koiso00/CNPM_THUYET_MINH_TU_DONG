"""Insert selected source as a private draft, without replacing existing work."""

import asyncio
from uuid import NAMESPACE_URL, uuid5

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.commands.campus_coordinates import COORDINATES
from app.commands.generate_demo_audio import SOURCE, parse_source
from app.core.config import Settings
from app.db.mongodb import MongoConnection
from app.repositories.content import ContentRepository
from app.schemas.content import CampusDraft


def source_draft():
    entries = parse_source(SOURCE.read_text(encoding="utf-8-sig"))
    return CampusDraft.model_validate(
        {
            "title": "Khám phá cơ sở chính Đại học Sài Gòn",
            "language": "vi",
            "places": [
                {
                    "id": str(uuid5(NAMESPACE_URL, "sgu-campus/" + entry["slug"])),
                    "title": entry["title"],
                    "description": entry["text"],
                    "source": "data/sources/campus-vi-user-2026-10-21.md; "
                    "Người dùng cung cấp; chưa đối chiếu thực địa.",
                    "location": {
                        "type": "Point",
                        "coordinates": COORDINATES[
                            str(uuid5(NAMESPACE_URL, "sgu-campus/" + entry["slug"]))
                        ],
                    },
                }
                for entry in entries
            ],
        }
    ).model_dump(mode="json")


async def seed(settings):
    connection = MongoConnection(settings)
    connection.start()
    try:
        database = connection.database
        if database is None:
            raise RuntimeError("Database not configured.")
        result = await ContentRepository(database).initialize(source_draft())
        return result.upserted_id is not None
    finally:
        await connection.close()


def main():
    try:
        created = asyncio.run(seed(Settings()))
    except (ValidationError, PyMongoError, RuntimeError, OSError, ValueError):
        print("Cannot seed content. Check configuration and source; no existing draft replaced.")
        return 1
    print("Private campus draft created." if created else "Existing campus draft preserved.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
