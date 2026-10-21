"""Application factory with an optional built frontend at the same origin."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.state.settings = settings
    app.include_router(api_router)

    if settings.frontend_dist is not None:
        static_dir = settings.frontend_dist.resolve()
        if not (static_dir / "index.html").is_file():
            raise RuntimeError(
                "FRONTEND_DIST must point to a built frontend containing index.html."
            )
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

    return app


app = create_app()
