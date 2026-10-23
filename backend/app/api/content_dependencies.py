"""Request-scoped feature services share the application MongoDB pool."""

from fastapi import Depends, HTTPException, Request

from app.repositories.admin import AdminRepository
from app.repositories.audio import AudioRepository
from app.repositories.content import ContentRepository
from app.repositories.events import EventRepository
from app.repositories.submissions import SubmissionRepository
from app.services.admin import AdminService
from app.services.audio import AudioService
from app.services.content import ContentService
from app.services.submissions import SubmissionService


def get_database(request: Request):
    database = request.app.state.mongodb.database
    if database is None:
        raise HTTPException(503, "Database is unavailable.")
    return database


def get_event_repository(database=Depends(get_database)):
    return EventRepository(database)


def get_content_service(database=Depends(get_database)):
    return ContentService(ContentRepository(database), AudioRepository(database))


def get_admin_service(database=Depends(get_database), content=Depends(get_content_service)):
    return AdminService(AdminRepository(database), content)


def get_audio_service(database=Depends(get_database), content=Depends(get_content_service)):
    return AudioService(AudioRepository(database), content)


def get_submission_service(database=Depends(get_database), content=Depends(get_content_service)):
    return SubmissionService(SubmissionRepository(database), content)
