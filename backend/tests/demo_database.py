"""Disposable Atlas content/GridFS fixtures; remove only exact generated collection names."""

from contextlib import asynccontextmanager
from types import SimpleNamespace
from uuid import uuid4

from gridfs import AsyncGridFSBucket

from app.repositories.admin import AdminRepository
from app.repositories.audio import AudioRepository
from app.repositories.content import ContentRepository
from app.repositories.submissions import SubmissionRepository
from app.services.admin import AdminService
from app.services.audio import AudioService
from app.services.content import ContentService
from app.services.submissions import SubmissionService
from tests.integration.conftest import temporary_collection


@asynccontextmanager
async def isolated_content(users, sessions):
    async with (
        temporary_collection("tours") as tours,
        temporary_collection("tour_releases") as releases,
        temporary_collection("assets") as assets,
        temporary_collection("audio_selections") as selections,
        temporary_collection("content_submissions") as submissions,
        temporary_collection("usage_events") as usage_events,
        temporary_collection("visitor_presence") as visitor_presence,
    ):
        database = tours.database
        bucket_name = "__test_demo_audio_" + uuid4().hex
        names = (bucket_name + ".files", bucket_name + ".chunks")
        content_repository = ContentRepository({"tours": tours, "tour_releases": releases})
        submission_repository = SubmissionRepository({"content_submissions": submissions})
        audio_repository = AudioRepository(database)
        audio_repository.assets = assets
        audio_repository.selections = selections
        audio_repository.bucket = AsyncGridFSBucket(database, bucket_name=bucket_name)
        content = ContentService(content_repository, audio_repository)
        admin_repository = AdminRepository(
            {
                "users": users,
                "assets": assets,
                "sessions": sessions,
                "usage_events": usage_events,
                "visitor_presence": visitor_presence,
            }
        )
        try:
            yield SimpleNamespace(
                content=content,
                audio=AudioService(audio_repository, content),
                admin=AdminService(admin_repository, content),
                submissions=SubmissionService(submission_repository, content),
                usage_events=usage_events,
                visitor_presence=visitor_presence,
            )
        finally:
            for name in names:
                if name not in (bucket_name + ".files", bucket_name + ".chunks"):
                    raise RuntimeError("Unexpected GridFS cleanup target.")
                await database.drop_collection(name)
                if await database.list_collection_names(filter={"name": name}):
                    raise RuntimeError("GridFS cleanup did not complete.")
