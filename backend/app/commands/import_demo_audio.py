"""Validate the entire prepared audio pack before importing immutable GridFS assets."""

import asyncio
import json

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.commands.generate_demo_audio import (
    OUTPUT,
    SOURCE,
    VOICE,
    inspect_mp3,
    parse_source,
    sha256,
)
from app.core.config import Settings
from app.db.mongodb import MongoConnection
from app.repositories.audio import AudioRepository


def validated_pack():
    source = SOURCE.read_bytes()
    entries = parse_source(source.decode("utf-8-sig"))
    manifest = json.loads((OUTPUT / "manifest.json").read_text(encoding="utf-8"))
    if (
        manifest.get("source_sha256") != sha256(source)
        or not manifest.get("complete")
        or manifest.get("voice") != VOICE
        or manifest.get("language") != "vi"
        or len(manifest.get("entries", [])) != len(entries)
    ):
        raise ValueError("Manifest does not match selected source.")
    pack = []
    for expected, entry in zip(entries, manifest["entries"], strict=True):
        filename = entry["file"]
        path = (OUTPUT / filename).resolve()
        if path.parent != OUTPUT.resolve() or not filename.endswith(".mp3"):
            raise ValueError("Invalid asset path.")
        measured = inspect_mp3(path)
        if (
            entry.get("status") != "ready"
            or any(
                entry.get(key) != expected[key] for key in ("order", "slug", "title", "text_sha256")
            )
            or any(entry.get(key) != value for key, value in measured.items())
        ):
            raise ValueError("Audio pack checksum or source mismatch.")
        asset_id = sha256(f"{VOICE}\0{entry['text_sha256']}\0{measured['sha256']}".encode())
        pack.append(
            (
                {
                    "_id": asset_id,
                    **measured,
                    "filename": filename,
                    "language": "vi",
                    "voice": VOICE,
                    "text_sha256": expected["text_sha256"],
                },
                path.read_bytes(),
            )
        )
    return pack


async def import_pack(settings, pack):
    connection = MongoConnection(settings)
    connection.start()
    try:
        database = connection.database
        if database is None:
            raise RuntimeError("Database not configured.")
        repository = AudioRepository(database)
        count = 0
        for asset, data in pack:
            count += await repository.store(asset, data)
        return count
    finally:
        await connection.close()


def main():
    try:
        pack = validated_pack()
        count = asyncio.run(import_pack(Settings(), pack))
    except (ValidationError, PyMongoError, RuntimeError, OSError, ValueError, KeyError):
        print("Cannot import audio. Check prepared pack, database configuration and permissions.")
        return 1
    print(f"Imported {count} new audio assets; existing assets preserved. Publish to attach audio.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
