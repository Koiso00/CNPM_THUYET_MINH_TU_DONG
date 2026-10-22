"""Storage double for HTTP business tests; no claim of MongoDB validation."""

from copy import deepcopy
from hashlib import sha256
from uuid import uuid4

from app.commands.seed_demo_content import source_draft
from app.services.content import ContentService


class MemoryContent:
    def __init__(self):
        self.tour = {"revision": 1, "draft": source_draft(), "published_release_id": None}
        self.releases = {}

    async def get(self):
        return deepcopy(self.tour)

    async def save(self, revision, draft, actor_id):
        if self.tour["revision"] != revision:
            return None
        self.tour.update(revision=revision + 1, draft=deepcopy(draft))
        return deepcopy(self.tour)

    async def publish(self, tour, actor_id):
        if self.tour["revision"] != tour["revision"]:
            return None
        release_id = str(uuid4())
        self.releases[release_id] = {"draft": deepcopy(tour["draft"])}
        self.tour.update(revision=tour["revision"] + 1, published_release_id=release_id)
        return deepcopy(self.tour)

    async def release(self, release_id):
        return deepcopy(self.releases.get(release_id))

    async def unpublish(self, revision):
        if self.tour["revision"] != revision:
            return None
        self.tour.update(revision=revision + 1, published_release_id=None)
        return deepcopy(self.tour)


class MemoryAudio:
    def __init__(self):
        self.assets = {}
        self.choices = {}
        self.data = {}

    async def for_text(self, checksum):
        return self.assets.get(self.choices.get(checksum))

    async def find(self, asset_id):
        return self.assets.get(asset_id)

    async def store(self, asset, data, *, replace=False):
        existed = asset["_id"] in self.assets
        self.assets[asset["_id"]] = deepcopy(asset)
        self.data[asset["_id"]] = data
        if replace or asset["text_sha256"] not in self.choices:
            self.choices[asset["text_sha256"]] = asset["_id"]
        return not existed

    async def read(self, asset, start, length):
        return self.data[asset["_id"]][start : start + length]

    def attach_test_audio(self, description):
        checksum = sha256(description.encode()).hexdigest()
        asset = {"_id": "test-asset", "bytes": 10, "duration_seconds": 1, "text_sha256": checksum}
        self.assets["test-asset"] = asset
        self.choices[checksum] = "test-asset"
        self.data["test-asset"] = b"0123456789"


def content_service():
    return ContentService(MemoryContent(), MemoryAudio())
