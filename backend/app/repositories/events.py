"""Idempotent anonymous visitor events for the demo dashboard."""

from pymongo.errors import DuplicateKeyError


class EventRepository:
    def __init__(self, database):
        self.events = database["usage_events"]

    async def record(self, event: dict) -> bool:
        try:
            await self.events.insert_one(event)
        except DuplicateKeyError:
            return False
        return True

    async def counts(self, day: str) -> dict[str, int]:
        base = {"day": day}
        return {
            "guest_visitors": len(
                await self.events.distinct("visitor_id", {**base, "event_type": "visit"})
            ),
            "guest_journeys": await self.events.count_documents(
                {**base, "event_type": "journey_started"}
            ),
            "guest_audio_plays": await self.events.count_documents(
                {**base, "event_type": "audio_played"}
            ),
            "guest_qr_scans": await self.events.count_documents(
                {**base, "event_type": "qr_scanned"}
            ),
        }
