"""Byte ranges and snapshot/audio versioning regressions."""

from copy import deepcopy

import pytest
from fastapi import HTTPException

from app.schemas.content import SaveCampus
from app.services.audio import AudioService, byte_range
from tests.content_support import content_service


@pytest.mark.parametrize(
    "header,expected",
    [
        (None, (0, 9, False)),
        ("bytes=0-", (0, 9, True)),
        ("bytes=2-99", (2, 9, True)),
        ("bytes=-3", (7, 9, True)),
        ("bytes=-99", (0, 9, True)),
    ],
)
def test_valid_ranges(header, expected):
    assert byte_range(header, 10) == expected


@pytest.mark.parametrize(
    "header", ["bytes=-0", "bytes=10-", "bytes=4-1", "bytes=-", "bytes=1-2,4-6", "items=1-2"]
)
def test_invalid_ranges(header):
    with pytest.raises(HTTPException) as caught:
        byte_range(header, 10)
    assert caught.value.status_code == 416
    assert caught.value.headers["Content-Range"] == "bytes */10"


@pytest.mark.anyio
async def test_editing_text_cannot_reuse_outdated_audio():
    service = content_service()
    draft = deepcopy(service.repository.tour["draft"])
    service.audio.attach_test_audio(draft["places"][0]["description"])
    await service.publish(1, "admin")
    old = await service.public()
    assert old["places"][0]["audio_id"] == "test-asset"
    draft["places"][0]["description"] = "Nội dung khác"
    await service.save(SaveCampus(revision=2, draft=draft), "admin")
    assert (await service.public()) == old
    await service.publish(3, "admin")
    assert (await service.public())["places"][0]["audio_id"] is None


@pytest.mark.anyio
async def test_invalid_mp3_and_stale_revision_do_not_store_audio():
    service = content_service()
    audio = AudioService(service.audio, service)
    place_id = service.repository.tour["draft"]["places"][0]["id"]
    for revision, expected in [(1, 422), (2, 409)]:
        with pytest.raises(HTTPException) as caught:
            await audio.upload(place_id, revision, b"not an mp3")
        assert caught.value.status_code == expected
    assert not service.audio.assets
