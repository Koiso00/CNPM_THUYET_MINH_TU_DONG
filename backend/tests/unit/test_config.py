"""Configuration errors must be actionable without leaking connection credentials."""

from pathlib import Path

import pytest
from pydantic import ValidationError


@pytest.mark.parametrize("uri", [None, "", "   "])
def test_empty_uri_is_unconfigured(settings_factory, uri):
    settings = settings_factory(mongodb_uri=uri)
    assert settings.mongodb_uri is None


@pytest.mark.parametrize("scheme", ["mongodb://", "mongodb+srv://"])
def test_connection_secret_is_hidden(settings_factory, scheme):
    uri = f"{scheme}test-user:private-password@cluster.invalid/"
    settings = settings_factory(mongodb_uri=f"  {uri}  ")
    assert settings.mongodb_uri.get_secret_value() == uri
    assert "private-password" not in repr(settings)
    assert "mongodb_uri" not in settings.model_dump()
    assert "private-password" not in settings.model_dump_json()


def test_invalid_uri_error_hides_input(settings_factory):
    with pytest.raises(ValidationError) as caught:
        settings_factory(mongodb_uri="https://test-user:private-password@cluster.invalid/")
    assert "MONGODB_URI must use" in str(caught.value)
    assert "private-password" not in str(caught.value)


@pytest.mark.parametrize(
    "value",
    [
        "mongodb+srv://user:private-password@cluster.invalid/",
        Path("mongodb://user:private-password@cluster.invalid/"),
    ],
)
def test_misplaced_connection_uri_is_rejected_without_leaking(settings_factory, value):
    with pytest.raises(ValidationError) as caught:
        settings_factory(frontend_dist=value)
    assert "Set the MongoDB connection string in MONGODB_URI" in str(caught.value)
    assert "private-password" not in str(caught.value)


def test_frontend_path_is_not_in_settings_repr(settings_factory):
    settings = settings_factory(frontend_dist="private-build-directory")
    assert "private-build-directory" not in repr(settings)


@pytest.mark.parametrize("database", ["", "bad/name", "bad.name", "a" * 64])
def test_invalid_database_name(settings_factory, database):
    with pytest.raises(ValidationError):
        settings_factory(mongodb_database=database)


@pytest.mark.parametrize("timeout", [0, 99, 30001])
def test_timeout_is_bounded(settings_factory, timeout):
    with pytest.raises(ValidationError):
        settings_factory(mongodb_timeout_ms=timeout)
