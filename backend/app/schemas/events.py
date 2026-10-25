"""Anonymous demo visitor event contracts."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GuestEvent(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)

    event_id: UUID
    visitor_id: UUID
    journey_id: UUID | None = None
    place_id: UUID | None = None
    release_id: UUID | None = None
    event_type: Literal["visit", "journey_started", "audio_played", "qr_scanned"]

    def document(self, day: str) -> dict:
        return {
            "_id": str(self.event_id),
            "visitor_id": str(self.visitor_id),
            "journey_id": str(self.journey_id) if self.journey_id else None,
            "place_id": str(self.place_id) if self.place_id else None,
            "release_id": str(self.release_id) if self.release_id else None,
            "event_type": self.event_type,
            "day": day,
        }


class GuestEventResult(BaseModel):
    accepted: bool


class GuestDashboard(BaseModel):
    day: str
    guest_visitors: int = Field(ge=0)
    guest_journeys: int = Field(ge=0)
    guest_audio_plays: int = Field(ge=0)
    guest_qr_scans: int = Field(ge=0)
