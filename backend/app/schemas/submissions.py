"""Creator proposal and administrator review contracts."""

from typing import Literal

from pydantic import Field

from app.schemas.content import CampusDraft, Revision, StrictModel


class CreateSubmission(StrictModel):
    base_revision: int = Field(ge=1, strict=True)
    draft: CampusDraft


class SaveSubmission(Revision):
    base_revision: int = Field(ge=1, strict=True)
    draft: CampusDraft


class ReviewSubmission(Revision):
    decision: Literal["approved", "rejected"]
    note: str | None = Field(default=None, max_length=2000)
