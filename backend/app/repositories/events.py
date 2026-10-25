"""Idempotent anonymous visitor events for the demo dashboard."""

from datetime import UTC, datetime, timedelta

from pymongo.errors import DuplicateKeyError


class EventRepository:
    def __init__(self, database):
        self.events = database["usage_events"]
        self.presence = database["visitor_presence"]

    async def touch_presence(self, visitor_id: str) -> None:
        await self.presence.update_one(
            {"_id": visitor_id},
            {"$set": {"last_seen": datetime.now(UTC)}},
            upsert=True,
        )

    async def online_visitors(self) -> int:
        cutoff = datetime.now(UTC) - timedelta(seconds=90)
        return await self.presence.count_documents({"last_seen": {"$gte": cutoff}})

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
        }
