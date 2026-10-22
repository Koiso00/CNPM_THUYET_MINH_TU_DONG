"""Role-scoped proposal drafting, review and application to the Admin draft."""

from fastapi import HTTPException

from app.schemas.content import SaveCampus
from app.schemas.submissions import CreateSubmission, SaveSubmission


class SubmissionService:
    def __init__(self, repository, content):
        self.repository = repository
        self.content = content

    @staticmethod
    def view(item):
        return {
            "id": item["_id"],
            "draft": item["draft"],
            "base_revision": item["base_revision"],
            "revision": item["revision"],
            "status": item["status"],
            "created_at": item["created_at"],
            "updated_at": item["updated_at"],
            "submitted_at": item["submitted_at"],
            "reviewed_at": item["reviewed_at"],
            "review_note": item["review_note"],
            "applied_revision": item["applied_revision"],
        }

    async def source(self):
        tour = await self.content.draft()
        return self.content.admin_view(tour)

    async def mine(self, creator_id, offset, limit):
        items = await self.repository.list(creator_id, offset=offset, limit=limit)
        return [self.view(item) for item in items]

    async def get_mine(self, submission_id, creator_id):
        item = await self.repository.get(submission_id, creator_id)
        if item is None:
            raise HTTPException(404, "Proposal not found.")
        return self.view(item)

    async def create(self, payload: CreateSubmission, creator_id):
        draft = payload.draft.model_dump(mode="json")
        if not draft["places"]:
            raise HTTPException(422, "A proposal must contain at least one place.")
        item = await self.repository.create(creator_id, draft, payload.base_revision)
        return self.view(item)

    async def save(self, payload: SaveSubmission, creator_id, submission_id):
        draft = payload.draft.model_dump(mode="json")
        if not draft["places"]:
            raise HTTPException(422, "A proposal must contain at least one place.")
        item = await self.repository.update_draft(
            submission_id, creator_id, payload.revision, draft, payload.base_revision
        )
        if item is None:
            raise HTTPException(409, "Proposal changed or is no longer editable.")
        return self.view(item)

    async def submit(self, submission_id, creator_id, revision):
        item = await self.repository.get(submission_id, creator_id)
        if item is None:
            raise HTTPException(404, "Proposal not found.")
        if not item["draft"]["places"]:
            raise HTTPException(422, "A proposal must contain at least one place.")
        item = await self.repository.submit(submission_id, creator_id, revision)
        if item is None:
            raise HTTPException(409, "Proposal changed or is no longer editable.")
        return self.view(item)

    async def review_queue(self, offset, limit):
        items = await self.repository.list(
            status=["pending", "approved"], offset=offset, limit=limit
        )
        return [self.view(item) for item in items]

    async def review(self, submission_id, payload, reviewer_id):
        item = await self.repository.review(
            submission_id, payload.revision, payload.decision, reviewer_id, payload.note
        )
        if item is None:
            raise HTTPException(409, "Proposal changed or has already been reviewed.")
        return self.view(item)

    async def apply(self, submission_id, revision, reviewer_id):
        item = await self.repository.get(submission_id)
        if item is None:
            raise HTTPException(404, "Proposal not found.")
        if item["status"] == "applied":
            raise HTTPException(409, "Proposal was already added to the Admin draft.")
        if item["status"] != "approved":
            raise HTTPException(409, "Approve the proposal before adding it to the Admin draft.")
        if revision != item["base_revision"]:
            raise HTTPException(409, "Admin draft changed since this proposal was created.")
        result = await self.content.save(
            SaveCampus(revision=revision, draft=item["draft"]), reviewer_id
        )
        updated = await self.repository.mark_applied(
            submission_id, item["revision"], result["revision"]
        )
        if updated is None:
            raise HTTPException(409, "Proposal application status changed; reload both drafts.")
        return {"submission": self.view(updated), "campus": result}
