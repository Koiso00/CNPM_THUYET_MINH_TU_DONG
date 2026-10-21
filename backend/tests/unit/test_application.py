"""Local deployment configuration must not prevent isolated tests from importing."""

import importlib

import pytest

from app import application


def test_factory_module_import_does_not_evaluate_local_environment(monkeypatch):
    monkeypatch.setenv("MONGODB_URI", "invalid-connection-scheme")
    monkeypatch.setenv("FRONTEND_DIST", "does-not-exist")
    module = importlib.reload(application)
    assert callable(module.create_app)


def test_running_app_still_rejects_invalid_frontend_path(settings_factory, tmp_path):
    with pytest.raises(RuntimeError, match="FRONTEND_DIST must point"):
        application.create_app(settings_factory(frontend_dist=tmp_path / "missing"))
