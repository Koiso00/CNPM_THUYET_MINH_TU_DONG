"""Runtime settings; connection credentials never appear in dumps or errors."""

from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SGU Campus Guide"
    environment: Literal["development", "test", "production"] = "development"
    frontend_dist: Path | None = Field(default=None, repr=False)
    mongodb_uri: SecretStr | None = Field(default=None, repr=False, exclude=True)
    mongodb_database: str = Field(
        default="sgu_campus_guide", min_length=1, max_length=63, pattern=r"^[a-zA-Z0-9_-]+$"
    )
    mongodb_timeout_ms: int = Field(default=3000, ge=100, le=30000)
    jwt_secret: SecretStr | None = Field(default=None, repr=False, exclude=True)
    # Vite's proxy keeps API same-origin during development.
    auth_allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("jwt_secret", mode="before")
    @classmethod
    def validate_jwt_secret(cls, value: object) -> object:
        raw = value.get_secret_value() if isinstance(value, SecretStr) else value
        if raw is None or raw == "":
            return None
        if not isinstance(raw, str) or len(raw.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 bytes of random secret material.")
        return raw

    @field_validator("auth_allowed_origins")
    @classmethod
    def validate_origins(cls, values: list[str]) -> list[str]:
        from urllib.parse import urlsplit

        for value in values:
            parsed = urlsplit(value)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.path
                or parsed.query
                or parsed.fragment
                or parsed.username
            ):
                raise ValueError("Allowed origins must be exact http(s) origins without paths.")
        return values

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", hide_input_in_errors=True
    )

    @field_validator("mongodb_uri", mode="before")
    @classmethod
    def normalize_mongodb_uri(cls, value: object) -> object:
        if isinstance(value, SecretStr):
            value = value.get_secret_value()
        if isinstance(value, str):
            return value.strip() or None
        return value

    @field_validator("mongodb_uri")
    @classmethod
    def validate_mongodb_uri(cls, value: SecretStr | None) -> SecretStr | None:
        if value is not None and not value.get_secret_value().startswith(
            ("mongodb://", "mongodb+srv://")
        ):
            raise ValueError("MONGODB_URI must use mongodb:// or mongodb+srv://.")
        return value

    @field_validator("frontend_dist", mode="before")
    @classmethod
    def empty_path_is_none(cls, value: object) -> object:
        if isinstance(value, str | Path):
            text = str(value).strip()
            if not text:
                return None
            if text.startswith(("mongodb:", "mongodb+srv:")) or "://" in text:
                raise ValueError(
                    "FRONTEND_DIST must be a local build directory. "
                    "Set the MongoDB connection string in MONGODB_URI."
                )
        return value
