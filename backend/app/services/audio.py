"""Only current published audio is listener-visible; admins may preview imported assets."""

import re
from hashlib import sha256
from io import BytesIO

from fastapi import HTTPException
from mutagen import MutagenError
from mutagen.mp3 import MP3


def byte_range(header, size):
    if not header:
        return 0, size - 1, False
    match = re.fullmatch(r"bytes=(\d*)-(\d*)", header) if len(header) <= 100 else None
    if not match or not any(match.groups()):
        raise HTTPException(
            416, "Invalid byte range.", headers={"Content-Range": f"bytes */{size}"}
        )
    left, right = match.groups()
    if left:
        start, end = int(left), min(int(right), size - 1) if right else size - 1
    else:
        start, end = max(0, size - int(right)), size - 1
    if start >= size or start > end or (not left and int(right) == 0):
        raise HTTPException(
            416, "Unsatisfiable byte range.", headers={"Content-Range": f"bytes */{size}"}
        )
    return start, end, True


class AudioService:
    def __init__(self, repository, content):
        self.repository = repository
        self.content = content

    async def published_asset(self, release_id, place_id, language="vi"):
        snapshot = await self.content.public()
        place = next((p for p in snapshot["places"] if p["id"] == place_id), None)
        audio_id = (
            place.get("audio_by_language", {}).get(language)
            if place and language != "vi"
            else place.get("audio_id")
            if place
            else None
        )
        if snapshot["release_id"] != release_id or not audio_id:
            raise HTTPException(404, "Published audio not found.")
        asset = await self.asset(audio_id)
        if asset.get("language", "vi") != language:
            raise HTTPException(404, "Published audio not found.")
        return asset

    async def asset(self, asset_id):
        asset = await self.repository.find(asset_id)
        if asset is None:
            raise HTTPException(404, "Audio not found.")
        return asset

    async def upload(self, place_id, revision, data, language="vi"):
        tour = await self.content.draft()
        if tour["revision"] != revision:
            raise HTTPException(409, "Draft changed. Reload before uploading audio.")
        place = next((p for p in tour["draft"]["places"] if p["id"] == place_id), None)
        if place is None:
            raise HTTPException(404, "Place not found.")
        try:
            info = MP3(BytesIO(data)).info
            if info.length <= 0 or info.bitrate <= 0:
                raise ValueError("Empty MP3.")
        except (MutagenError, ValueError):
            raise HTTPException(422, "File must contain valid MP3 audio frames.") from None
        localized = place if language == "vi" else place.get("translations", {}).get(language)
        if localized is None:
            raise HTTPException(404, "Translation not found.")
        text_sha = sha256(localized["description"].encode("utf-8")).hexdigest()
        checksum = sha256(data).hexdigest()
        asset_id = sha256(f"upload\0{text_sha}\0{checksum}".encode()).hexdigest()
        await self.repository.store(
            {
                "_id": asset_id,
                "filename": f"{asset_id}.mp3",
                "language": language,
                "voice": "admin-upload",
                "text_sha256": text_sha,
                "sha256": checksum,
                "bytes": len(data),
                "duration_seconds": round(info.length, 3),
            },
            data,
            replace=True,
        )
        return {"audio_id": asset_id, "duration_seconds": round(info.length, 3)}

    async def response_data(self, asset, range_header, head=False):
        start, end, partial = byte_range(range_header, asset["bytes"])
        data = b"" if head else await self.repository.read(asset, start, end - start + 1)
        if data is None or (not head and len(data) != end - start + 1):
            raise HTTPException(503, "Audio is temporarily unavailable.")
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(end - start + 1),
            "Content-Type": "audio/mpeg",
            "X-Content-Type-Options": "nosniff",
        }
        if partial:
            headers["Content-Range"] = f"bytes {start}-{end}/{asset['bytes']}"
        return data, 206 if partial else 200, headers
