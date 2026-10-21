"""Pool ownership, cleanup and bounded failure paths; no real database is contacted."""

import asyncio

import pytest
from pymongo.errors import ConfigurationError, OperationFailure, ServerSelectionTimeoutError

from app.application import create_app
from app.db.mongodb import MongoConnection

pytestmark = pytest.mark.anyio


async def test_real_driver_allocates_lazy_pool_without_network(settings_factory):
    connection = MongoConnection(settings_factory(mongodb_uri="mongodb://127.0.0.1:27017/"))
    connection.start()
    try:
        assert connection.database.name == "sgu_campus_guide"
        assert connection.database.codec_options.tz_aware is True
    finally:
        await connection.close()


async def test_real_driver_parser_hides_invalid_connection_credentials(settings_factory):
    connection = MongoConnection(
        settings_factory(mongodb_uri="mongodb://test-user:private-password@localhost:bad-port/")
    )
    with pytest.raises(RuntimeError) as caught:
        connection.start()
    assert "Check backend/.env" in str(caught.value)
    assert "private-password" not in str(caught.value)


async def test_unconfigured_connection_does_not_allocate_pool(settings_factory, mongodb_double):
    connection = MongoConnection(settings_factory())
    connection.start()
    assert connection.database is None
    assert await connection.check() == "not_configured"
    await connection.close()
    mongodb_double.factory.assert_not_called()


async def test_pool_is_reused_and_closed(settings_factory, mongodb_double):
    settings = settings_factory(mongodb_uri="mongodb://cluster.invalid/")
    connection = MongoConnection(settings)
    connection.start()
    assert connection.database is mongodb_double.database
    assert await connection.check() == "connected"
    assert await connection.check() == "connected"
    mongodb_double.factory.assert_called_once()
    assert mongodb_double.client.__getitem__.call_args.args == ("sgu_campus_guide",)
    options = mongodb_double.factory.call_args.kwargs
    assert options["tz_aware"] is True
    assert options["serverSelectionTimeoutMS"] == settings.mongodb_timeout_ms
    await connection.close()
    await connection.close()
    mongodb_double.client.close.assert_awaited_once()
    assert await connection.check() == "unavailable"


async def test_duplicate_start_does_not_leak_a_second_pool(settings_factory, mongodb_double):
    connection = MongoConnection(settings_factory(mongodb_uri="mongodb://cluster.invalid/"))
    connection.start()
    with pytest.raises(RuntimeError, match="already been started"):
        connection.start()
    mongodb_double.factory.assert_called_once()
    await connection.close()


async def test_lifespan_closes_pool_when_application_body_fails(settings_factory, mongodb_double):
    app = create_app(settings_factory(mongodb_uri="mongodb://cluster.invalid/"))
    with pytest.raises(RuntimeError, match="test failure"):
        async with app.router.lifespan_context(app):
            raise RuntimeError("test failure")
    mongodb_double.client.close.assert_awaited_once()


async def test_invalid_driver_configuration_is_sanitized(settings_factory, mongodb_double):
    mongodb_double.factory.side_effect = ConfigurationError("private-password in original error")
    connection = MongoConnection(settings_factory(mongodb_uri="mongodb://cluster.invalid/"))
    with pytest.raises(RuntimeError) as caught:
        connection.start()
    assert "Check backend/.env" in str(caught.value)
    assert "private-password" not in str(caught.value)
    assert caught.value.__suppress_context__ is True


@pytest.mark.parametrize(
    "error",
    [
        ServerSelectionTimeoutError("private-password: network failure"),
        OperationFailure("private-password: authentication failure"),
        OSError("private-password: connection unavailable"),
    ],
)
async def test_driver_failures_become_unavailable(settings_factory, mongodb_double, error):
    mongodb_double.database.command.side_effect = error
    connection = MongoConnection(settings_factory(mongodb_uri="mongodb://cluster.invalid/"))
    connection.start()
    try:
        assert await connection.check() == "unavailable"
    finally:
        await connection.close()


async def test_probe_has_a_total_deadline(settings_factory, mongodb_double):
    async def blocked_command(_command):
        await asyncio.sleep(10)

    mongodb_double.database.command.side_effect = blocked_command
    connection = MongoConnection(
        settings_factory(mongodb_uri="mongodb://cluster.invalid/", mongodb_timeout_ms=100)
    )
    connection.start()
    try:
        async with asyncio.timeout(2):
            assert await connection.check() == "unavailable"
    finally:
        await connection.close()
