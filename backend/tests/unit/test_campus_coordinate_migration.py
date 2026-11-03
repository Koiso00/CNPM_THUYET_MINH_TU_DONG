from copy import deepcopy

import pytest

from app.commands.campus_coordinates import COORDINATES
from app.commands.migrate_campus_coordinates import prepare
from app.commands.seed_demo_content import source_draft


def snapshots():
    draft = source_draft()
    for place in draft["places"]:
        place["location"] = None
    published = deepcopy(draft)
    for place in published["places"]:
        place["audio_id"] = "vi-asset"
        place["audio_by_language"] = {"vi": "vi-asset", "en": "en-asset", "ko": "ko-asset"}
    return draft, published


def test_prepare_keeps_published_audio_and_coordinates_follow_id_after_rename():
    draft, published = snapshots()
    draft["places"][0]["title"] = published["places"][0]["title"] = "Tên đã đổi"
    updated, release = prepare(draft, published)
    assert updated["places"][0]["location"]["coordinates"] == COORDINATES[draft["places"][0]["id"]]
    assert release["places"][0]["audio_by_language"] == published["places"][0]["audio_by_language"]
    assert draft["places"][0]["location"] is None


def test_prepare_rejects_unpublished_changes_or_conflicting_coordinates():
    draft, published = snapshots()
    draft["places"][0]["description"] = "Unpublished edit"
    with pytest.raises(ValueError, match="Draft differs"):
        prepare(draft, published)
    draft, published = snapshots()
    draft["places"][0]["location"] = published["places"][0]["location"] = {
        "type": "Point",
        "coordinates": [0, 0],
    }
    with pytest.raises(ValueError, match="conflicts"):
        prepare(draft, published)
