"""Listeners see only the current published campus snapshot."""

from fastapi import APIRouter, Depends

from app.api.content_dependencies import get_content_service

router = APIRouter()


@router.get("/campus")
async def campus(service=Depends(get_content_service)):
    return await service.public()
