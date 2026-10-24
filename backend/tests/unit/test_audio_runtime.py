"""Byte ranges and snapshot/audio versioning regressions."""

from copy import deepcopy
from hashlib import sha256

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
async def test_published_release_binds_english_text_and_audio_separately():
    service = content_service()
    draft = deepcopy(service.repository.tour["draft"])
    english = "Approved English narration for this place."
    draft["places"][0]["translations"] = {
        "en": {
            "title": "Zone A",
            "description": english,
            "source": "User-approved English translation.",
            "source_text_sha256": sha256(draft["places"][0]["description"].encode()).hexdigest(),
        }
    }
    service.audio.attach_test_audio(draft["places"][0]["description"])
    service.audio.attach_test_audio(english, language="en")
    await service.save(SaveCampus(revision=1, draft=draft), "admin")
    await service.publish(2, "admin")

    release = await service.public()
    place = release["places"][0]
    assert place["audio_id"] == "test-asset"
    assert place["audio_by_language"] == {"vi": "test-asset", "en": "test-asset-en"}
    english_asset = await AudioService(service.audio, service).published_asset(
        release["release_id"], place["id"], "en"
    )
    assert english_asset["_id"] == "test-asset-en"


@pytest.mark.anyio
async def test_changed_vietnamese_source_hides_stale_translation_on_next_release():
    service = content_service()
    draft = deepcopy(service.repository.tour["draft"])
    original = draft["places"][0]["description"]
    english = "Translation of the previous Vietnamese source."
    draft["places"][0]["translations"] = {
        "en": {
            "title": "Zone A",
            "description": english,
            "source": "User-approved English translation.",
            "source_text_sha256": sha256(original.encode()).hexdigest(),
        }
    }
    draft["places"][0]["description"] = "Vietnamese source revised after translation."
    service.audio.attach_test_audio(draft["places"][0]["description"])
    service.audio.attach_test_audio(english, language="en")
    await service.save(SaveCampus(revision=1, draft=draft), "admin")
    await service.publish(2, "admin")

    place = (await service.public())["places"][0]
    assert place["translations"] == {}
    assert place["audio_by_language"] == {"vi": "test-asset"}


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
