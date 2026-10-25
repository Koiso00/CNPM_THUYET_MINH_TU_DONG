"""Anonymous demo event contracts and idempotency."""

from uuid import uuid4

import pytest

from app.api.content_dependencies import get_event_repository
from tests.auth_support import auth_harness


class MemoryEvents:
    def __init__(self):
        self.events = {}
        self.presence = set()

    async def touch_presence(self, visitor_id):
        self.presence.add(visitor_id)

    async def record(self, event):
        if event["_id"] in self.events:
            return False
        self.events[event["_id"]] = event
        return True


pytestmark = pytest.mark.anyio


async def test_guest_events_are_anonymous_and_idempotent(settings_factory):
    harness = auth_harness(settings_factory)
    events = MemoryEvents()
    harness.app.dependency_overrides[get_event_repository] = lambda: events
    visitor = uuid4()
    event_id = uuid4()
    payload = {"event_id": str(event_id), "visitor_id": str(visitor), "event_type": "visit"}
    async with harness.client as client:
        first = await client.post("/api/v1/events/guest", json=payload)
        second = await client.post("/api/v1/events/guest", json=payload)
    assert first.status_code == 200 and first.json() == {"accepted": True}
    assert second.status_code == 200 and second.json() == {"accepted": False}
    assert len(events.events) == 1


async def test_guest_presence_is_public_and_records_browser(settings_factory):
    harness = auth_harness(settings_factory)
    events = MemoryEvents()
    harness.app.dependency_overrides[get_event_repository] = lambda: events
    visitor = uuid4()
    async with harness.client as client:
        response = await client.post(
            "/api/v1/events/presence", json={"visitor_id": str(visitor)}
        )
    assert response.status_code == 204
    assert str(visitor) in events.presence


async def test_guest_event_rejects_incomplete_audio(settings_factory):
    harness = auth_harness(settings_factory)
    events = MemoryEvents()
    harness.app.dependency_overrides[get_event_repository] = lambda: events
    async with harness.client as client:
        response = await client.post(
            "/api/v1/events/guest",
            json={
                "event_id": str(uuid4()),
                "visitor_id": str(uuid4()),
                "event_type": "audio_played",
            },
        )
    assert response.status_code == 200
    assert response.json() == {"accepted": False}
