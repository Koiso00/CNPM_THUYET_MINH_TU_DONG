"""Import the reviewed English pack, add POI translations and publish a release."""

import asyncio
import json
from copy import deepcopy
from hashlib import sha256
from uuid import NAMESPACE_URL, uuid5

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.commands.generate_demo_audio_en import OUTPUT, SOURCE, VOICE, inspect_mp3, parse_source
from app.core.config import Settings
from app.db.mongodb import MongoConnection
from app.repositories.audio import AudioRepository
from app.repositories.content import ContentRepository
from app.schemas.content import CampusDraft
from app.services.content import ContentService


def validate_pack():
    source_bytes = SOURCE.read_bytes()
    entries = parse_source(source_bytes.decode("utf-8-sig"))
    manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf-8"))
    if (
        manifest.get("source_sha256") != sha256(source_bytes).hexdigest()
        or not manifest.get("complete")
        or manifest.get("voice") != VOICE
        or manifest.get("language") != "en"
        or manifest.get("draft_translation") is not False
        or manifest.get("review_status") != "user-approved-2026-10-24"
        or len(manifest.get("entries", [])) != len(entries)
    ):
        raise ValueError("English MP3 manifest does not match the approved source.")

    pack = []
    for expected, item in zip(entries, manifest["entries"], strict=True):
        filename = item["file"]
        path = (OUTPUT / filename).resolve()
        if path.parent != OUTPUT.resolve() or not filename.endswith(".mp3"):
            raise ValueError("Invalid English audio asset path.")
        measured = inspect_mp3(path)
        if (
            item.get("status") != "ready"
            or any(
                item.get(key) != expected[key] for key in ("order", "slug", "title", "text_sha256")
            )
            or any(item.get(key) != value for key, value in measured.items())
        ):
            raise ValueError(f"English audio does not match translation {expected['order']}.")
        asset_id = sha256(
            f"{VOICE}\0en\0{expected['text_sha256']}\0{measured['sha256']}".encode()
        ).hexdigest()
        pack.append(
            (
                {
                    "_id": asset_id,
                    **measured,
                    "filename": filename,
                    "language": "en",
                    "voice": VOICE,
                    "text_sha256": expected["text_sha256"],
                },
                path.read_bytes(),
            )
        )
    return entries, pack


def attach_translations(draft, entries):
    localized = deepcopy(draft)
    by_id = {place["id"]: place for place in localized["places"]}
    if len(by_id) != len(entries):
        raise ValueError("The current campus draft does not match the ten reviewed POIs.")
    for entry in entries:
        place_id = str(uuid5(NAMESPACE_URL, "sgu-campus/" + entry["slug"]))
        place = by_id.get(place_id)
        if not place:
            raise ValueError("The current campus draft POI IDs differ from the reviewed source.")
        place.setdefault("translations", {})["en"] = {
            "title": entry["title"],
            "description": entry["text"],
            "source": "User-reviewed English translation; approved 2026-10-24.",
            "source_text_sha256": sha256(place["description"].encode("utf-8")).hexdigest(),
        }
    return CampusDraft.model_validate(localized).model_dump(mode="json")


async def publish(settings, entries, pack):
    connection = MongoConnection(settings)
    connection.start()
    try:
        database = connection.database
        if database is None:
            raise RuntimeError("Database is not configured.")
        content_repository = ContentRepository(database)
        audio_repository = AudioRepository(database)
        service = ContentService(content_repository, audio_repository)
        tour = await service.draft()
        draft = attach_translations(tour["draft"], entries)

        current_release = (
            await content_repository.release(tour["published_release_id"])
            if tour.get("published_release_id")
            else None
        )
        if current_release and all(
            place.get("translations", {}).get("en", {}).get("description") == entry["text"]
            and place.get("translations", {}).get("en", {}).get("source_text_sha256")
            == sha256(place.get("description", "").encode("utf-8")).hexdigest()
            and place.get("audio_by_language", {}).get("en")
            for place, entry in zip(current_release["draft"]["places"], entries, strict=True)
        ):
            return 0, True

        changed = draft != tour["draft"]
        if changed:
            tour = await content_repository.save(tour["revision"], draft, "approved-english-import")
            if tour is None:
                raise RuntimeError("Campus draft changed during import; no release was published.")

        imported = 0
        for asset, data in pack:
            imported += await audio_repository.store(asset, data)

        result = await service.publish(tour["revision"], "approved-english-import")
        return imported, result
    finally:
        await connection.close()


def main():
    try:
        entries, pack = validate_pack()
        imported, result = asyncio.run(publish(Settings(), entries, pack))
    except (ValidationError, PyMongoError, RuntimeError, OSError, ValueError, KeyError) as error:
        print(f"Could not publish English content ({type(error).__name__}).")
        return 1
    if result is True:
        print("The current release already contains the approved English text and audio.")
    else:
        print(f"Published 10 English POIs and audio; imported {imported} new MP3 assets.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
