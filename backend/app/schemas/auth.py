"""Public auth contracts explicitly exclude persistence secrets and role assignment."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator

from app.models.user import UserRecord, UserRole, clean_username


class Credentials(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)
    username: str = Field(strict=True, max_length=128)
    password: SecretStr = Field(repr=False)

    @field_validator("username")
    @classmethod
    def valid_username(cls, value: str) -> str:
        return clean_username(value)

    @field_validator("password")
    @classmethod
    def bounded_password(cls, value: SecretStr) -> SecretStr:
        if not 1 <= len(value.get_secret_value()) <= 128:
            raise ValueError("Password must contain 1 to 128 characters.")
        return value


class Registration(Credentials):
    @field_validator("password")
    @classmethod
    def strong_password(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 15:
            raise ValueError("Password must contain 15 to 128 characters.")
        return value


class PublicUser(BaseModel):
    id: str
    username: str
    role: UserRole

    @classmethod
    def from_record(cls, user: UserRecord) -> "PublicUser":
        return cls(id=str(user.id), username=user.username, role=user.role)


class AuthResponse(BaseModel):
    user: PublicUser
    access_expires_at: datetime
    session_expires_at: datetime
    csrf_token: str


class CsrfResponse(BaseModel):
    csrf_token: str
