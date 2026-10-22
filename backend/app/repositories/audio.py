"""GridFS storage, with content-addressed metadata and bounded range reads."""

from gridfs import AsyncGridFSBucket, NoFile


class AudioRepository:
    def __init__(self, database):
        self.assets = database["assets"]
        self.selections = database["audio_selections"]
        self.bucket = AsyncGridFSBucket(database)

    async def find(self, asset_id):
        return await self.assets.find_one({"_id": asset_id, "status": "ready"})

    async def for_text(self, text_sha256):
        selection = await self.selections.find_one({"_id": text_sha256})
        if selection:
            return await self.find(selection["asset_id"])
        return await self.assets.find_one(
            {"text_sha256": text_sha256, "status": "ready", "language": "vi"},
            sort=[("_id", 1)],
        )

    async def select(self, text_sha256, asset_id, *, replace=False):
        await self.selections.update_one(
            {"_id": text_sha256},
            {"$set" if replace else "$setOnInsert": {"asset_id": asset_id}},
            upsert=True,
        )

    async def store(self, asset, data, *, replace=False):
        if await self.find(asset["_id"]):
            await self.select(asset["text_sha256"], asset["_id"], replace=replace)
            return False
        # A random GridFS id keeps concurrent imports independent. Only the winning
        # metadata upsert remains referenced; failed/losing uploads are removed.
        file_id = await self.bucket.upload_from_stream(asset["filename"], data)
        try:
            result = await self.assets.update_one(
                {"_id": asset["_id"]},
                {"$setOnInsert": {**asset, "gridfs_id": file_id, "status": "ready"}},
                upsert=True,
            )
        except Exception:
            await self.bucket.delete(file_id)
            raise
        if result.upserted_id is None:
            await self.bucket.delete(file_id)
        await self.select(asset["text_sha256"], asset["_id"], replace=replace)
        return result.upserted_id is not None

    async def read(self, asset, start, length):
        try:
            stream = await self.bucket.open_download_stream(asset["gridfs_id"])
            try:
                await stream.seek(start)
                return await stream.read(length)
            finally:
                await stream.close()
        except NoFile:
            return None
