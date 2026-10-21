"""Explicit loopback-only browser-test server. All test accounts are disposable Atlas data."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import Response

from app.api.dependencies import get_auth_service
from app.application import create_app
from app.core.config import Settings
from app.db.indexes import ensure_session_indexes, ensure_user_indexes
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository
from app.services.auth import AuthService
from tests.integration.conftest import temporary_collection

E2E_PASSWORD = "only-for-isolated-e2e-12345"


def browser_test_app():
    settings = Settings()
    if settings.jwt_secret is None or settings.environment == "production":
        raise RuntimeError("Browser test server requires configured development auth.")
    app = create_app(settings)
    original_lifespan = app.router.lifespan_context

    @asynccontextmanager
    async def isolated_lifespan(app):
        async with (
            temporary_collection("users") as users,
            temporary_collection("sessions") as sessions,
        ):
            await ensure_user_indexes(users)
            await ensure_session_indexes(sessions)
            service = AuthService(
                UserRepository(users),
                SessionRepository(sessions),
                secret=settings.jwt_secret.get_secret_value(),
            )
            for role in ("admin", "creator"):
                user = await service.register(f"e2e_{role}", E2E_PASSWORD)
                await users.update_one({"_id": str(user.id)}, {"$set": {"role": role}})
            app.dependency_overrides[get_auth_service] = lambda: service
            async with original_lifespan(app):
                print(
                    "Isolated browser-test server ready; no application accounts created.",
                    flush=True,
                )
                yield
        print("Isolated browser-test collections removed and verified.", flush=True)

    app.router.lifespan_context = isolated_lifespan

    @app.post("/_test/shutdown", include_in_schema=False)
    async def shutdown():
        app.state.test_server.should_exit = True
        return Response(status_code=202)

    return app


if __name__ == "__main__":
    app = browser_test_app()
    server = uvicorn.Server(
        uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning", access_log=False)
    )
    app.state.test_server = server
    server.run()
