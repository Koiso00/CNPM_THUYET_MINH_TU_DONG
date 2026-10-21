"""Non-secret runtime configuration for the application scaffold."""

from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SGU Campus Guide"
    environment: Literal["development", "test", "production"] = "development"
    frontend_dist: Path | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("frontend_dist", mode="before")
    @classmethod
    def empty_path_is_none(cls, value: object) -> object:
        return None if value == "" else value
