"""Account administration and dashboard rules for the two-day demo."""

from datetime import UTC, datetime, timedelta, timezone

from fastapi import HTTPException


class AdminService:
    def __init__(self, repository, content):
        self.repository = repository
        self.content = content

    @staticmethod
    def user_view(user):
        return {
            "id": user["_id"],
            "is_protected": user["role"] == "admin" and user["is_active"],
            **{
                key: user[key]
                for key in (
                    "username",
                    "role",
                    "is_active",
                    "updated_at",
                )
            },
        }

    async def users(self, offset, limit):
        return [self.user_view(user) for user in await self.repository.list_users(offset, limit)]

    async def update_user(self, user_id, payload, actor_id):
        if user_id == actor_id:
            raise HTTPException(409, "Cannot change your own account here.")
        user = await self.repository.update_user(user_id, payload.role.value, payload.is_active)
        if user is None:
            raise HTTPException(409, "User missing or active administrator protected.")
        if not payload.is_active:
            await self.repository.revoke_sessions(user_id)
        return self.user_view(user)

    async def dashboard(self, day=None):
        if day is None:
            day = datetime.now(UTC).astimezone(timezone(timedelta(hours=7))).date().isoformat()
        counts = await self.repository.counts()
        tour = await self.content.repository.get()
        published = None
        if tour and tour.get("published_release_id"):
            published = await self.content.repository.release(tour["published_release_id"])
        guest_counts = await self.repository.guest_counts(day)
        place_titles = {
            place["id"]: place["title"]
            for place in (published["draft"]["places"] if published else [])
        }
        guest_counts["guest_audio_by_place"] = [
            {
                **item,
                "title": place_titles.get(item["place_id"], "Địa điểm đã gỡ"),
            }
            for item in guest_counts["guest_audio_by_place"]
        ]
        return {
            **counts,
            "day": day,
            **guest_counts,
            "draft_places": len(tour["draft"]["places"]) if tour else 0,
            "published_places": len(published["draft"]["places"]) if published else 0,
            "published_tours": int(published is not None),
        }
