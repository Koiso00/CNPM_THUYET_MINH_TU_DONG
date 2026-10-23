"""Initial-admin setup preserves existing credentials and handles conflicting state."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError
from pymongo.errors import OperationFailure

from app.commands import setup_admin
from app.core.security import verify_password
from app.models.user import UserRecord, UserRole
from app.repositories.users import DuplicateUsernameError, UserRepository
from app.schemas.admin import UpdateUser
from app.services.admin_setup import AdminSetupError, AdminSetupService, InitialPasswordRequired

PASSWORD = "test-only-initial-password"


def test_admin_api_cannot_assign_retired_creator_role():
    with pytest.raises(ValidationError):
        UpdateUser(role="creator", is_active=True)


def repository(user=None):
    return SimpleNamespace(
        find_by_username=AsyncMock(return_value=user),
        insert=AsyncMock(),
        promote_active=AsyncMock(return_value=True),
        role_counts=AsyncMock(return_value={"user": 2, "creator": 1, "admin": 0}),
    )


def test_create_hashes_password_and_assigns_admin():
    users = repository()
    assert asyncio.run(AdminSetupService(users).ensure("Phong", PASSWORD)) == "created"
    saved = users.insert.call_args.args[0]
    assert saved.role == UserRole.ADMIN
    assert saved.username_key == "phong"
    assert verify_password(PASSWORD, saved.password_hash.get_secret_value())
    assert PASSWORD not in str(saved.to_document())


@pytest.mark.parametrize("password", ["short", "x" * 129])
def test_invalid_password_never_inserts(password):
    users = repository()
    with pytest.raises(ValidationError):
        asyncio.run(AdminSetupService(users).ensure("phong", password))
    users.insert.assert_not_called()


def test_new_account_requires_password():
    users = repository()
    with pytest.raises(InitialPasswordRequired):
        asyncio.run(AdminSetupService(users).ensure("phong"))
    users.insert.assert_not_called()


@pytest.mark.parametrize("role", [UserRole.USER, UserRole.CREATOR, UserRole.ADMIN])
def test_existing_account_keeps_credentials(role):
    user = UserRecord(username="Phong", password_hash="original-hash", role=role)
    users = repository(user)
    result = asyncio.run(AdminSetupService(users).ensure("phong", "ignored-new-password"))
    assert result == ("unchanged" if role == UserRole.ADMIN else "promoted")
    users.insert.assert_not_called()
    if role == UserRole.ADMIN:
        users.promote_active.assert_not_called()
    else:
        users.promote_active.assert_awaited_once_with(user)
    assert user.password_hash.get_secret_value() == "original-hash"


def test_inactive_account_is_not_reactivated():
    user = UserRecord(username="phong", password_hash="hash", is_active=False)
    users = repository(user)
    with pytest.raises(AdminSetupError):
        asyncio.run(AdminSetupService(users).ensure("phong", PASSWORD))
    users.insert.assert_not_called()
    users.promote_active.assert_not_called()


def test_concurrent_account_changes_fail_closed():
    users = repository(UserRecord(username="phong", password_hash="hash"))
    users.promote_active.return_value = False
    with pytest.raises(AdminSetupError):
        asyncio.run(AdminSetupService(users).ensure("phong"))
    users = repository()
    users.insert.side_effect = DuplicateUsernameError()
    with pytest.raises(AdminSetupError):
        asyncio.run(AdminSetupService(users).ensure("phong", PASSWORD))
    users.promote_active.assert_not_called()


def test_repository_promotion_guards_state_and_never_updates_password():
    collection = SimpleNamespace(
        update_one=AsyncMock(return_value=SimpleNamespace(matched_count=1))
    )
    user = UserRecord(username="phong", password_hash="hash")
    assert asyncio.run(UserRepository(collection).promote_active(user))
    query, update = collection.update_one.call_args.args
    assert query == {
        "_id": str(user.id),
        "is_active": True,
        "role": "user",
        "updated_at": user.updated_at,
    }
    assert set(update["$set"]) == {"role", "updated_at"}


def test_inspect_omits_credentials():
    user = UserRecord(username="Phong", password_hash="original-hash", role=UserRole.ADMIN)
    users = repository(user)
    report = asyncio.run(AdminSetupService(users).inspect("phong"))
    assert report == {
        "target": "phong",
        "exists": True,
        "role": "admin",
        "is_active": True,
        "role_counts": {"user": 2, "creator": 1, "admin": 0},
    }
    assert "original-hash" not in str(report)


def test_role_counts_query_each_known_role():
    collection = SimpleNamespace(count_documents=AsyncMock(side_effect=[3, 1, 2]))
    assert asyncio.run(UserRepository(collection).role_counts()) == {
        "user": 3,
        "creator": 1,
        "admin": 2,
    }
    assert [call.args[0] for call in collection.count_documents.call_args_list] == [
        {"role": "user"},
        {"role": "creator"},
        {"role": "admin"},
    ]


def test_command_failure_redacts_driver_details(monkeypatch, settings_factory, capsys):
    monkeypatch.setattr("sys.argv", ["setup_admin", "--non-interactive"])
    monkeypatch.setattr(setup_admin, "load_settings", lambda: settings_factory())
    monkeypatch.setattr(
        setup_admin, "setup", AsyncMock(side_effect=OperationFailure("secret-host"))
    )
    assert setup_admin.main() == 1
    output = capsys.readouterr()
    assert "secret-host" not in output.err + output.out
    assert setup_admin.COMMAND_FAILURE in output.err


def test_invalid_mongo_runtime_error_is_redacted(monkeypatch, settings_factory, capsys):
    monkeypatch.setattr("sys.argv", ["setup_admin", "--status"])
    monkeypatch.setattr(setup_admin, "load_settings", lambda: settings_factory())
    monkeypatch.setattr(
        setup_admin,
        "inspect",
        AsyncMock(side_effect=RuntimeError("mongodb+srv://user:secret@cluster")),
    )
    assert setup_admin.main() == 1
    output = capsys.readouterr()
    assert "secret" not in output.err + output.out
    assert setup_admin.COMMAND_FAILURE in output.err


def test_status_prints_account_state_without_writing(monkeypatch, settings_factory, capsys):
    monkeypatch.setattr("sys.argv", ["setup_admin", "--status"])
    monkeypatch.setattr(setup_admin, "load_settings", lambda: settings_factory())
    monkeypatch.setattr(
        setup_admin,
        "inspect",
        AsyncMock(
            return_value={
                "database": "connected",
                "target": "phong",
                "exists": False,
                "role": None,
                "is_active": None,
                "role_counts": {"user": 4, "creator": 1, "admin": 0},
            }
        ),
    )
    setup = AsyncMock()
    monkeypatch.setattr(setup_admin, "setup", setup)
    assert setup_admin.main() == 0
    setup.assert_not_called()
    output = capsys.readouterr().out
    assert "exists: False" in output
    assert "creator=1" in output
    assert "password" not in output.lower() or "password must be supplied" in output


def test_load_settings_uses_backend_env_file(monkeypatch, tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "MONGODB_URI=mongodb://localhost:27017\nMONGODB_DATABASE=setup_status_db\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(setup_admin, "ENV_FILE", env_file)
    settings = setup_admin.load_settings()
    assert settings.mongodb_database == "setup_status_db"
    assert settings.mongodb_uri is not None
    assert settings.mongodb_uri.get_secret_value() == "mongodb://localhost:27017"


def test_noninteractive_missing_password_does_not_prompt(monkeypatch, settings_factory, capsys):
    monkeypatch.delenv("INITIAL_ADMIN_PASSWORD", raising=False)
    monkeypatch.setattr("sys.argv", ["setup_admin", "--non-interactive"])
    monkeypatch.setattr(setup_admin, "load_settings", lambda: settings_factory())
    operation = AsyncMock(side_effect=InitialPasswordRequired())
    monkeypatch.setattr(setup_admin, "setup", operation)
    assert setup_admin.main() == 1
    assert operation.call_args.args[1:] == ("phong", None)
    assert "INITIAL_ADMIN_PASSWORD" in capsys.readouterr().err
