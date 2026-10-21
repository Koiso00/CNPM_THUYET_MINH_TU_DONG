"""Separate process liveness from a credential-safe MongoDB readiness probe."""

from typing import Literal

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel

from app.db.mongodb import MongoStatus

router = APIRouter()


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    environment: str


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    database: MongoStatus


@router.get("", response_model=HealthResponse)
async def health(request: Request, response: Response) -> HealthResponse:
    response.headers["Cache-Control"] = "no-store"
    settings = request.app.state.settings
    return HealthResponse(status="ok", service=settings.app_name, environment=settings.environment)


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={503: {"model": ReadinessResponse, "description": "Database is not ready."}},
)
async def readiness(request: Request, response: Response) -> ReadinessResponse:
    database = await request.app.state.mongodb.check()
    ready = database == "connected"
    response.status_code = 200 if ready else 503
    response.headers["Cache-Control"] = "no-store"
    return ReadinessResponse(status="ready" if ready else "not_ready", database=database)
