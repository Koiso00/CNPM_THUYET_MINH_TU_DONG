"""Anonymous visitor and journey events for the current demo."""

from datetime import UTC, datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from app.api.content_dependencies import get_event_repository
from app.schemas.events import GuestEvent, GuestEventResult

router = APIRouter()
DEMO_TIMEZONE = timezone(timedelta(hours=7), name="ICT")


def demo_day() -> str:
    return datetime.now(UTC).astimezone(DEMO_TIMEZONE).date().isoformat()


@router.post("/guest", response_model=GuestEventResult)
async def guest_event(event: GuestEvent, repository=Depends(get_event_repository)):
    if event.event_type == "visit" and (event.journey_id or event.place_id or event.release_id):
        return GuestEventResult(accepted=False)
    if event.event_type == "journey_started" and not event.journey_id:
        return GuestEventResult(accepted=False)
    if event.event_type == "audio_played" and not (
        event.journey_id and event.place_id and event.release_id
    ):
        return GuestEventResult(accepted=False)
    accepted = await repository.record(event.document(demo_day()))
    return GuestEventResult(accepted=accepted)
