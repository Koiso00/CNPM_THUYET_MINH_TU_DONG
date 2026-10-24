"""Dashboard aggregations against an async-collection-compatible test double."""

import pytest

from app.repositories.admin import AdminRepository


class AsyncCursor:
    def __init__(self, rows):
        self.rows = rows

    def __aiter__(self):
        self.iterator = iter(self.rows)
        return self

    async def __anext__(self):
        try:
            return next(self.iterator)
        except StopIteration:
            raise StopAsyncIteration from None


class AsyncEvents:
    def __init__(self):
        self.pipeline = None

    async def aggregate(self, pipeline):
        self.pipeline = pipeline
        return AsyncCursor([{"_id": "place-a", "plays": 3}])

    async def distinct(self, field, query):
        return ["visitor-a"]

    async def count_documents(self, query):
        return {"journey_started": 2, "audio_played": 3}[query["event_type"]]


class Database:
    def __init__(self, events):
        self.events = events

    def __getitem__(self, name):
        if name == "usage_events":
            return self.events
        return object()


@pytest.mark.anyio
async def test_guest_counts_awaits_async_aggregate_and_groups_audio_by_place():
    events = AsyncEvents()
    repository = AdminRepository(Database(events))

    counts = await repository.guest_counts("2026-10-24")

    assert counts == {
        "guest_visitors": 1,
        "guest_journeys": 2,
        "guest_audio_plays": 3,
        "guest_audio_by_place": [{"place_id": "place-a", "plays": 3}],
    }
    assert events.pipeline[0]["$match"]["day"] == "2026-10-24"
