"""Internal user records. API responses must never use persistence documents."""

from enum import StrEnum
from typing import Any, Self
from uuid import uuid4

from pydantic import (
    UUID4,
    BaseModel,
    ConfigDict,
    Field,
    SecretStr,
    StrictBool,
    field_validator,
    model_validator,
)

from app.models.common import UtcDateTime, utc_now


class UserRole(StrEnum):
    USER = "user"
    CREATOR = "creator"
    ADMIN = "admin"


def clean_username(value: str) -> str:
    value = value.strip()
    if not value or len(value) > 128 or not value.isprintable():
        raise ValueError("Username must contain 1 to 128 printable characters.")
    return value


def username_key(value: str) -> str:
    return clean_username(value).casefold()


class UserRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
        populate_by_name=True,
        validate_default=True,
        hide_input_in_errors=True,
    )

    id: UUID4 = Field(default_factory=uuid4, alias="_id")
    username: str = Field(strict=True)
    username_key: str = Field(default="", repr=False)
    password_hash: SecretStr = Field(repr=False, exclude=True)
    role: UserRole = UserRole.USER
    is_active: StrictBool = True
    created_at: UtcDateTime = Field(default_factory=utc_now)
    updated_at: UtcDateTime = Field(default_factory=utc_now)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return clean_username(value)

    @field_validator("password_hash")
    @classmethod
    def require_password_hash(cls, value: SecretStr) -> SecretStr:
        if not value.get_secret_value().strip():
            raise ValueError("An already-computed password hash is required.")
        return value

    @model_validator(mode="after")
    def enforce_record_invariants(self) -> Self:
        expected_key = username_key(self.username)
        if self.username_key and self.username_key != expected_key:
            raise ValueError("Stored username key does not match the username.")
        if self.updated_at < self.created_at:
            raise ValueError("updated_at must not precede created_at.")
        object.__setattr__(self, "username_key", expected_key)
        return self

    def to_document(self) -> dict[str, Any]:
        """Internal persistence only. Never return this document from an API."""
        return {
            "_id": str(self.id),
            "username": self.username,
            "username_key": self.username_key,
            "password_hash": self.password_hash.get_secret_value(),
            "role": self.role.value,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
