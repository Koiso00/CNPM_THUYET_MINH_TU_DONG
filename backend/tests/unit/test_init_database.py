"""Administrative command failures must not display driver connection details."""

from pymongo.errors import OperationFailure

from app.commands import init_database


def test_command_failure_redacts_driver_message(monkeypatch, settings_factory, capsys):
    async def fail(_settings):
        raise OperationFailure("private-connection-details")

    monkeypatch.setattr(init_database, "Settings", lambda: settings_factory())
    monkeypatch.setattr(init_database, "initialize_database", fail)
    assert init_database.main() == 1
    output = capsys.readouterr()
    assert "Check configuration" in output.err
    assert "private-connection-details" not in output.err + output.out
