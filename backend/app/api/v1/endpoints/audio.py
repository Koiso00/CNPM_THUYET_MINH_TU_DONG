"""Published MP3 delivery with single byte-range and HEAD support."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response

from app.api.content_dependencies import get_audio_service

router = APIRouter()


@router.get("/{release_id}/{place_id}")
@router.head("/{release_id}/{place_id}", include_in_schema=False)
async def audio(
    release_id: UUID,
    place_id: UUID,
    request: Request,
    language: str = Query("vi", pattern="^(vi|en|ko)$"),
    service=Depends(get_audio_service),
):
    asset = await service.published_asset(str(release_id), str(place_id), language)
    data, status, headers = await service.response_data(
        asset,
        request.headers.get("range"),
        request.method == "HEAD",
    )
    return Response(data, status_code=status, headers=headers)
