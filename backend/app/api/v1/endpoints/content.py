"""Authenticated listeners see only the current published campus snapshot."""

from fastapi import APIRouter, Depends

from app.api.content_dependencies import get_content_service
from app.api.dependencies import current_principal

router = APIRouter()


@router.get("/campus", dependencies=[Depends(current_principal)])
async def campus(service=Depends(get_content_service)):
    return await service.public()
