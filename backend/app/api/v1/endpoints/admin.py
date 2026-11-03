"""Admin-only campus authoring; all mutations also pass global CSRF checks."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from app.api.content_dependencies import (
    get_admin_service,
    get_audio_service,
    get_content_service,
)
from app.api.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.content import Revision, SaveCampus

router = APIRouter()
admin = require_roles(UserRole.ADMIN)


@router.get("/campus", dependencies=[Depends(admin)])
async def campus(service=Depends(get_content_service)):
    return service.admin_view(await service.draft())


@router.put("/campus")
async def save_campus(
    payload: SaveCampus, principal=Depends(admin), service=Depends(get_content_service)
):
    return await service.save(payload, str(principal.user.id))


@router.post("/campus/publish")
async def publish_campus(
    payload: Revision, principal=Depends(admin), service=Depends(get_content_service)
):
    return await service.publish(payload.revision, str(principal.user.id))


@router.post("/campus/unpublish", dependencies=[Depends(admin)])
async def unpublish_campus(payload: Revision, service=Depends(get_content_service)):
    return await service.unpublish(payload.revision)


@router.get("/dashboard", dependencies=[Depends(admin)])
async def dashboard(day: date | None = Query(None), service=Depends(get_admin_service)):
    return await service.dashboard(day.isoformat() if day else None)


@router.get("/audio", dependencies=[Depends(admin)])
async def audio_status(
    language: str = Query("vi", pattern="^(vi|en|ko)$"),
    service=Depends(get_content_service),
):
    return await service.audio_status(language)


@router.get("/audio/{asset_id}", dependencies=[Depends(admin)])
@router.head("/audio/{asset_id}", dependencies=[Depends(admin)], include_in_schema=False)
async def preview_audio(asset_id: str, request: Request, service=Depends(get_audio_service)):
    asset = await service.asset(asset_id)
    data, status, headers = await service.response_data(
        asset,
        request.headers.get("range"),
        request.method == "HEAD",
    )
    return Response(data, status_code=status, headers=headers)


@router.put("/campus/places/{place_id}/audio", dependencies=[Depends(admin)])
async def upload_audio(
    place_id: UUID,
    request: Request,
    revision: int = Query(ge=1),
    language: str = Query("vi", pattern="^(vi|en|ko)$"),
    service=Depends(get_audio_service),
):
    if request.headers.get("content-type", "").split(";", 1)[0] != "audio/mpeg":
        raise HTTPException(415, "Upload an audio/mpeg MP3 file.")
    data = bytearray()
    async for chunk in request.stream():
        if len(data) + len(chunk) > 10 * 1024 * 1024:
            raise HTTPException(413, "MP3 must not exceed 10 MB.")
        data.extend(chunk)
    return await service.upload(str(place_id), revision, bytes(data), language)
