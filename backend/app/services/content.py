"""Campus demo business rules, including public snapshot isolation."""

from copy import deepcopy
from hashlib import sha256

from fastapi import HTTPException

from app.schemas.content import CampusDraft


class ContentService:
    def __init__(self, repository, audio=None):
        self.repository = repository
        self.audio = audio

    async def draft(self):
        tour = await self.repository.get()
        if tour is None:
            raise HTTPException(404, "Campus content has not been initialized.")
        return tour

    @staticmethod
    def admin_view(tour):
        return {key: tour[key] for key in ("revision", "draft", "published_release_id")}

    @staticmethod
    def changed(tour):
        if tour is None:
            raise HTTPException(409, "Content changed. Reload before saving or publishing.")
        return ContentService.admin_view(tour)

    async def save(self, payload, actor_id):
        tour = await self.draft()
        if tour["revision"] != payload.revision:
            self.changed(None)
        existing_ids = {place["id"] for place in tour["draft"]["places"]}
        requested_ids = {str(place.id) for place in payload.draft.places}
        if requested_ids != existing_ids:
            raise HTTPException(422, "Adding or removing places is disabled.")
        return self.changed(
            await self.repository.save(
                payload.revision,
                payload.draft.model_dump(mode="json"),
                actor_id,
            )
        )

    async def publish(self, revision, actor_id):
        tour = await self.draft()
        if tour["revision"] != revision:
            self.changed(None)
        draft = CampusDraft.model_validate(tour["draft"])
        if not draft.places:
            raise HTTPException(422, "Cannot publish an empty campus tour.")
        # Bind specific imported assets to this immutable snapshot. Later uploads
        # never alter an already published release, even for the same text.
        tour = deepcopy(tour)
        for place in tour["draft"]["places"]:
            source_hash = sha256(place["description"].encode("utf-8")).hexdigest()
            valid_translations = {
                language: translation
                for language, translation in place.get("translations", {}).items()
                if translation.get("source_text_sha256") == source_hash
            }
            place["translations"] = valid_translations
            localized = {"vi": {"description": place["description"]}}
            localized.update(valid_translations)
            audio_by_language = {}
            if self.audio:
                for language, content in localized.items():
                    checksum = sha256(content["description"].encode("utf-8")).hexdigest()
                    asset = await self.audio.for_text(checksum, language=language)
                    if asset:
                        audio_by_language[language] = asset["_id"]
            place["audio_id"] = audio_by_language.get("vi")
            place["audio_by_language"] = audio_by_language
        return self.changed(await self.repository.publish(tour, actor_id))

    async def public(self):
        tour = await self.draft()
        release_id = tour.get("published_release_id")
        release = await self.repository.release(release_id) if release_id else None
        if release is None:
            raise HTTPException(404, "No campus content has been published.")
        return {"release_id": release_id, **release["draft"]}

    async def audio_status(self, language="vi"):
        tour = await self.draft()
        items = []
        for place in tour["draft"]["places"]:
            localized = place if language == "vi" else place.get("translations", {}).get(language)
            asset = (
                await self.audio.for_text(
                    sha256(localized["description"].encode("utf-8")).hexdigest(),
                    language=language,
                )
                if self.audio and localized
                else None
            )
            items.append(
                {
                    "place_id": place["id"],
                    "title": localized["title"] if localized else place["title"],
                    "content_available": localized is not None,
                    "audio_id": asset["_id"] if asset else None,
                    "language": language,
                    "duration_seconds": asset["duration_seconds"] if asset else None,
                }
            )
        return items

    async def unpublish(self, revision):
        return self.changed(await self.repository.unpublish(revision))
