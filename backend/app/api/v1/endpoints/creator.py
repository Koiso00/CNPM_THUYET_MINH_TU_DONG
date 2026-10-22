"""Creator-only full-campus proposals; unpublished work stays private."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.content_dependencies import get_submission_service
from app.api.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.content import Revision
from app.schemas.submissions import CreateSubmission, SaveSubmission

router = APIRouter()
creator = require_roles(UserRole.CREATOR)


@router.get("/campus")
async def campus(service=Depends(get_submission_service), principal=Depends(creator)):
    return await service.source()


@router.get("/submissions")
async def submissions(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service=Depends(get_submission_service),
    principal=Depends(creator),
):
    return await service.mine(str(principal.user.id), offset, limit)


@router.get("/submissions/{submission_id}")
async def get_submission(
    submission_id: UUID,
    service=Depends(get_submission_service),
    principal=Depends(creator),
):
    return await service.get_mine(str(submission_id), str(principal.user.id))


@router.post("/submissions")
async def create_submission(
    payload: CreateSubmission,
    service=Depends(get_submission_service),
    principal=Depends(creator),
):
    return await service.create(payload, str(principal.user.id))


@router.put("/submissions/{submission_id}")
async def save_submission(
    submission_id: UUID,
    payload: SaveSubmission,
    service=Depends(get_submission_service),
    principal=Depends(creator),
):
    return await service.save(payload, str(principal.user.id), str(submission_id))


@router.post("/submissions/{submission_id}/submit")
async def submit(
    submission_id: UUID,
    payload: Revision,
    service=Depends(get_submission_service),
    principal=Depends(creator),
):
    return await service.submit(str(submission_id), str(principal.user.id), payload.revision)
