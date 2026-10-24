"""English draft translation checks; provider generation is exercised separately."""

import pytest

from app.commands.generate_demo_audio_en import SOURCE, parse_source, prepare_entry, sha256


def test_english_source_has_ten_ordered_translations():
    entries = parse_source(SOURCE.read_text(encoding="utf-8"))
    assert len(entries) == 10
    assert entries[0]["title"] == "Zone A"
    assert entries[-1]["title"] == "Sports Facilities"
    assert all(item["text_sha256"] == sha256(item["text"].encode()) for item in entries)


def test_invalid_english_translation_source_is_rejected():
    source = SOURCE.read_text(encoding="utf-8")
    with pytest.raises(ValueError):
        parse_source(source.replace("## 1. Zone A", "## 2. Zone A", 1))


@pytest.mark.anyio
async def test_provider_failure_does_not_leave_partial_mp3(tmp_path):
    async def broken(text, path):
        path.write_bytes(b"partial")
        raise RuntimeError("provider details")

    entry = parse_source(SOURCE.read_text(encoding="utf-8"))[0]
    result = await prepare_entry(entry, tmp_path, renderer=broken, inspector=lambda _: {})
    assert result["status"] == "failed"
    assert result["error_type"] == "RuntimeError"
    assert not list(tmp_path.iterdir())
