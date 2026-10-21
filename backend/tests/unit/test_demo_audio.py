"""Source integrity and failure/resume behavior; provider audio is checked separately."""

from unittest.mock import AsyncMock

import pytest
from mutagen import MutagenError

from app.commands.generate_demo_audio import (
    SOURCE,
    inspect_mp3,
    parse_source,
    prepare_entry,
    sha256,
)


def entry():
    return parse_source(SOURCE.read_text(encoding="utf-8"))[0]


def fake_inspect(path):
    return {
        "sha256": sha256(path.read_bytes()),
        "bytes": path.stat().st_size,
        "duration_seconds": 1,
        "sample_rate": 24000,
        "bitrate": 48000,
    }


def test_source_has_ten_exact_bodies_without_provenance():
    entries = parse_source(SOURCE.read_text(encoding="utf-8"))
    assert len(entries) == 10
    assert entries[0]["text"].startswith("Khu A nằm dọc theo phía trên")
    assert entries[-1]["title"] == "Khu sân thể thao"
    assert all("Nguồn:" not in item["text"] for item in entries)
    assert all(item["text_sha256"] == sha256(item["text"].encode()) for item in entries)


@pytest.mark.parametrize("change", ["missing", "reordered", "empty"])
def test_malformed_source_cannot_generate_a_pack(change):
    text = SOURCE.read_text(encoding="utf-8")
    if change == "missing":
        text = text[: text.index("## 10.")]
    elif change == "reordered":
        text = text.replace("## 1. Khu A", "## 2. Khu A")
    else:
        start = text.index("\n", text.index("## 1. Khu A"))
        text = text[:start] + "\n\n" + text[text.index("## 2.") :]
    with pytest.raises(ValueError):
        parse_source(text)


@pytest.mark.anyio
async def test_partial_provider_failure_never_publishes_mp3(tmp_path):
    async def broken(text, path):
        path.write_bytes(b"incomplete")
        raise RuntimeError("provider-url-that-must-not-be-logged")

    result = await prepare_entry(entry(), tmp_path, renderer=broken, inspector=fake_inspect)
    assert result["status"] == "failed"
    assert result["error_type"] == "RuntimeError"
    assert "provider-url" not in str(result)
    assert not list(tmp_path.iterdir())


@pytest.mark.anyio
async def test_resume_checks_hash_and_regenerates_changed_or_corrupt_files(tmp_path):
    async def render(text, path):
        path.write_bytes(text.encode())

    renderer = AsyncMock(side_effect=render)
    first = await prepare_entry(entry(), tmp_path, renderer=renderer, inspector=fake_inspect)
    second = await prepare_entry(
        entry(), tmp_path, previous=first, renderer=renderer, inspector=fake_inspect
    )
    assert first == second and renderer.await_count == 1
    (tmp_path / first["file"]).write_bytes(b"corrupted")
    repaired = await prepare_entry(
        entry(), tmp_path, previous=first, renderer=renderer, inspector=fake_inspect
    )
    assert repaired["sha256"] == first["sha256"] and renderer.await_count == 2
    changed_entry = {**entry(), "text": "Nội dung đã thay đổi."}
    changed = await prepare_entry(
        changed_entry, tmp_path, previous=first, renderer=renderer, inspector=fake_inspect
    )
    assert changed["file"] != first["file"] and renderer.await_count == 3


def test_invalid_audio_is_not_accepted(tmp_path):
    path = tmp_path / "invalid.mp3"
    path.write_bytes(b"not an mp3" * 1000)
    with pytest.raises((ValueError, MutagenError)):
        inspect_mp3(path)
