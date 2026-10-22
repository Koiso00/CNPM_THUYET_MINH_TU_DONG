"""Assemble health, authentication and future feature routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    ai,
    audio,
    auth,
    content,
    creator,
    events,
    health,
    jobs,
    maps,
    offline_packs,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(maps.router, prefix="/maps", tags=["maps"])
api_router.include_router(offline_packs.router, prefix="/offline-packs", tags=["offline-packs"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(creator.router, prefix="/creator", tags=["creator"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
