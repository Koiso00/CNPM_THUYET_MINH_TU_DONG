"""Identifiers and timezone-aware, BSON-compatible timestamps for stored records."""

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from pydantic import AfterValidator, AwareDatetime


def utc_milliseconds(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("A timezone-aware datetime is required.")
    value = value.astimezone(UTC)
    return value.replace(microsecond=(value.microsecond // 1000) * 1000)


UtcDateTime = Annotated[AwareDatetime, AfterValidator(utc_milliseconds)]


def utc_now() -> datetime:
    return utc_milliseconds(datetime.now(UTC))


def record_key(value: str | UUID) -> str | None:
    try:
        identifier = UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None
    return str(identifier) if identifier.version == 4 else None
