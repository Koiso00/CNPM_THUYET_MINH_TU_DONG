"""Admin-only campus authoring; all mutations also pass global CSRF checks."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from app.api.content_dependencies import (
    get_admin_service,
    get_audio_service,
    get_content_service,
    get_submission_service,
)
from app.api.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.admin import UpdateUser
from app.schemas.content import Revision, SaveCampus
from app.schemas.submissions import ReviewSubmission

router = APIRouter()
admin = require_roles(UserRole.ADMIN)


@router.get("/submissions", dependencies=[Depends(admin)])
async def submissions(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service=Depends(get_submission_service),
):
    return await service.review_queue(offset, limit)


@router.post("/submissions/{submission_id}/review")
async def review_submission(
    submission_id: UUID,
    payload: ReviewSubmission,
    principal=Depends(admin),
    service=Depends(get_submission_service),
):
    return await service.review(str(submission_id), payload, str(principal.user.id))


@router.post("/submissions/{submission_id}/apply")
async def apply_submission(
    submission_id: UUID,
    payload: Revision,
    principal=Depends(admin),
    service=Depends(get_submission_service),
):
    return await service.apply(str(submission_id), payload.revision, str(principal.user.id))


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


@router.get("/users", dependencies=[Depends(admin)])
async def users(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service=Depends(get_admin_service),
):
    return await service.users(offset, limit)


@router.put("/users/{user_id}")
async def update_user(
    user_id: UUID, payload: UpdateUser, principal=Depends(admin), service=Depends(get_admin_service)
):
    return await service.update_user(str(user_id), payload, str(principal.user.id))


@router.get("/dashboard", dependencies=[Depends(admin)])
async def dashboard(service=Depends(get_admin_service)):
    return await service.dashboard()


@router.get("/audio", dependencies=[Depends(admin)])
async def audio_status(service=Depends(get_content_service)):
    return await service.audio_status()


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
    service=Depends(get_audio_service),
):
    if request.headers.get("content-type", "").split(";", 1)[0] != "audio/mpeg":
        raise HTTPException(415, "Upload an audio/mpeg MP3 file.")
    data = bytearray()
    async for chunk in request.stream():
        if len(data) + len(chunk) > 10 * 1024 * 1024:
            raise HTTPException(413, "MP3 must not exceed 10 MB.")
        data.extend(chunk)
    return await service.upload(str(place_id), revision, bytes(data))
