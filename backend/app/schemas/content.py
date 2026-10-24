"""Demo campus contracts; unknown coordinates stay null, never synthesized."""

from typing import Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)


class Point(StrictModel):
    type: Literal["Point"] = "Point"
    coordinates: tuple[float, float]

    @field_validator("coordinates")
    @classmethod
    def valid_coordinates(cls, value):
        if not (-180 <= value[0] <= 180 and -90 <= value[1] <= 90):
            raise ValueError("Expected [longitude, latitude] in geographic bounds.")
        return value


class LocalizedPlace(StrictModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=20000)
    source: str = Field(min_length=1, max_length=2000)
    source_text_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")

    @field_validator("title", "description", "source")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank.")
        return value


class Place(StrictModel):
    id: UUID
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=20000)
    source: str = Field(min_length=1, max_length=2000)
    location: Point | None = None
    translations: dict[Literal["en", "ko"], LocalizedPlace] = Field(default_factory=dict)

    @field_validator("title", "description", "source")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank.")
        return value


class CampusDraft(StrictModel):
    title: str = Field(min_length=1, max_length=200)
    language: Literal["vi"] = "vi"
    places: list[Place] = Field(max_length=100)

    @field_validator("title")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank.")
        return value

    @model_validator(mode="after")
    def unique_places(self) -> Self:
        if len({place.id for place in self.places}) != len(self.places):
            raise ValueError("Place IDs must be unique within the tour.")
        return self


class Revision(StrictModel):
    revision: int = Field(ge=1, strict=True)


class SaveCampus(Revision):
    draft: CampusDraft
