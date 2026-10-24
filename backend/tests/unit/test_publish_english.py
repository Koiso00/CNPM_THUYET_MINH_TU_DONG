"""English localization migration helpers preserve the original Vietnamese source."""

from hashlib import sha256

from app.commands.generate_demo_audio_en import SOURCE, parse_source
from app.commands.publish_demo_english import attach_translations
from app.commands.seed_demo_content import source_draft


def test_attach_approved_english_to_all_stable_poi_ids():
    draft = source_draft()
    original_vi = [place["description"] for place in draft["places"]]
    entries = parse_source(SOURCE.read_text(encoding="utf-8"))

    updated = attach_translations(draft, entries)

    assert len(updated["places"]) == 10
    assert [place["description"] for place in updated["places"]] == original_vi
    for place, entry in zip(updated["places"], entries, strict=True):
        assert place["translations"]["en"] == {
            "title": entry["title"],
            "description": entry["text"],
            "source": "User-reviewed English translation; approved 2026-10-24.",
            "source_text_sha256": sha256(place["description"].encode("utf-8")).hexdigest(),
        }
