"""Add confirmed coordinates to the existing draft and a new immutable release."""

import asyncio
from copy import deepcopy

from app.commands.campus_coordinates import COORDINATES
from app.core.config import Settings
from app.db.mongodb import MongoConnection
from app.repositories.content import ContentRepository


def prepare(draft, published):
    """Reject unrelated edits, missing IDs and conflicting existing coordinates."""
    if set(draft) != {"title", "language", "places"}:
        raise ValueError("Unexpected draft shape")
    if draft["title"] != published["title"] or draft["language"] != published["language"]:
        raise ValueError("Published content and draft differ")
    if len(draft["places"]) != 10 or len(published["places"]) != 10:
        raise ValueError("Expected exactly ten places")
    if {p["id"] for p in draft["places"]} != set(COORDINATES):
        raise ValueError("Draft place IDs do not match confirmed coordinates")
    if [p["id"] for p in draft["places"]] != [p["id"] for p in published["places"]]:
        raise ValueError("Published and draft place IDs differ")
    updated_draft = deepcopy(draft)
    updated_release = deepcopy(published)
    for d, p, out_d, out_p in zip(
        draft["places"],
        published["places"],
        updated_draft["places"],
        updated_release["places"],
        strict=True,
    ):
        clean_p = {
            key: value for key, value in p.items() if key not in {"audio_id", "audio_by_language"}
        }
        if d != clean_p:
            raise ValueError("Draft differs from published content")
        location = {"type": "Point", "coordinates": COORDINATES[d["id"]]}
        if d.get("location") not in (None, location):
            raise ValueError("An existing location conflicts with confirmed coordinates")
        if set(p.get("audio_by_language", {})) != {"vi", "en", "ko"} or not p.get("audio_id"):
            raise ValueError("Published audio is incomplete")
        out_d["location"] = deepcopy(location)
        out_p["location"] = deepcopy(location)
    return updated_draft, updated_release


async def migrate():
    connection = MongoConnection(Settings())
    connection.start()
    try:
        repo = ContentRepository(connection.database)
        tour = await repo.get()
        if not tour or not tour.get("published_release_id"):
            raise ValueError("No published campus tour")
        release = await repo.release(tour["published_release_id"])
        if not release:
            raise ValueError("Published release not found")
        draft, snapshot = prepare(tour["draft"], release["draft"])
        if all(p.get("location") for p in tour["draft"]["places"]):
            print("Coordinates already present; no changes made.")
            return
        saved = await repo.save(tour["revision"], draft, "coordinate-migration")
        if not saved:
            raise ValueError("Draft changed before save; no changes made")
        # Copy the existing published snapshot to retain the exact pinned audio IDs.
        saved["draft"] = snapshot
        result = await repo.publish(saved, "coordinate-migration")
        if not result:
            raise ValueError("Draft changed before publication; coordinates saved in draft only")
        verified = await repo.release(result["published_release_id"])
        if not verified or verified["draft"] != snapshot:
            raise ValueError("Release verification failed")
        print(
            f"Published release {result['published_release_id']}; "
            "verified 10 locations and pinned audio."
        )
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(migrate())
