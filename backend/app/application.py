"""Application factory without environment evaluation or I/O at import time."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo.errors import PyMongoError

from app.api.auth_protection import protect_api
from app.api.v1.router import api_router
from app.core.config import Settings
from app.db.mongodb import MongoConnection


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    mongodb = MongoConnection(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        mongodb.start()
        try:
            yield
        finally:
            await mongodb.close()

    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.mongodb = mongodb
    app.middleware("http")(protect_api)

    @app.exception_handler(RequestValidationError)
    async def safe_validation_error(request, error):
        # Default FastAPI errors may echo a password or a forbidden field's value.
        return JSONResponse(
            {
                "detail": [
                    {"loc": item["loc"], "type": item["type"], "msg": item["msg"]}
                    for item in error.errors()
                ]
            },
            status_code=422,
            headers={"Cache-Control": "no-store"},
        )

    @app.exception_handler(PyMongoError)
    async def safe_database_error(request, error):
        return JSONResponse(
            {"detail": "Database is temporarily unavailable."},
            status_code=503,
            headers={"Cache-Control": "no-store"},
        )

    app.include_router(api_router)

    if settings.frontend_dist is not None:
        static_dir = settings.frontend_dist.resolve()
        if not (static_dir / "index.html").is_file():
            raise RuntimeError(
                "FRONTEND_DIST must point to a built frontend containing index.html."
            )
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

    return app
