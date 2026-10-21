"""Stored refresh sessions with an absolute, non-sliding expiry."""

import re
from datetime import datetime
from typing import Any, Self
from uuid import uuid4

from pydantic import (
    UUID4,
    BaseModel,
    ConfigDict,
    Field,
    SecretStr,
    field_validator,
    model_validator,
)

from app.core.auth_policy import SESSION_MAX_AGE
from app.models.common import UtcDateTime, utc_milliseconds, utc_now


def refresh_digest(value: str | SecretStr) -> str:
    value = value.get_secret_value() if isinstance(value, SecretStr) else value
    if not re.fullmatch(r"[0-9a-f]{64}", value):
        raise ValueError("Expected a lowercase SHA-256 digest of a high-entropy refresh token.")
    return value


class SessionRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
        populate_by_name=True,
        validate_default=True,
        hide_input_in_errors=True,
    )

    id: UUID4 = Field(default_factory=uuid4, alias="_id")
    user_id: UUID4
    refresh_token_hash: SecretStr = Field(repr=False, exclude=True)
    created_at: UtcDateTime
    updated_at: UtcDateTime
    expires_at: UtcDateTime
    revoked_at: UtcDateTime | None = None

    @field_validator("refresh_token_hash")
    @classmethod
    def validate_refresh_hash(cls, value: SecretStr) -> SecretStr:
        refresh_digest(value)
        return value

    @model_validator(mode="after")
    def enforce_session_lifetime(self) -> Self:
        if not self.created_at < self.expires_at <= self.created_at + SESSION_MAX_AGE:
            raise ValueError("Session expiry must be after creation and within seven days.")
        if self.updated_at < self.created_at:
            raise ValueError("updated_at must not precede created_at.")
        if (
            self.revoked_at is not None
            and not self.created_at <= self.revoked_at <= self.updated_at
        ):
            raise ValueError("revoked_at must lie between created_at and updated_at.")
        return self

    @classmethod
    def new(
        cls,
        *,
        user_id: UUID4 | str,
        refresh_token_hash: str | SecretStr,
        now: datetime | None = None,
    ) -> Self:
        moment = utc_milliseconds(now) if now is not None else utc_now()
        return cls(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            created_at=moment,
            updated_at=moment,
            expires_at=moment + SESSION_MAX_AGE,
        )

    def is_active_at(self, now: datetime) -> bool:
        moment = utc_milliseconds(now)
        return self.revoked_at is None and self.created_at <= moment < self.expires_at

    def to_document(self) -> dict[str, Any]:
        """Internal persistence only. A raw refresh token is never accepted by this schema."""
        return {
            "_id": str(self.id),
            "user_id": str(self.user_id),
            "refresh_token_hash": self.refresh_token_hash.get_secret_value(),
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "expires_at": self.expires_at,
            "revoked_at": self.revoked_at,
        }
