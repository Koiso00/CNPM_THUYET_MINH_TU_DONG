"""Prepare local Korean MP3 drafts for Admin review; never publishes to Atlas."""

import asyncio
import hashlib
import json
import re
from pathlib import Path

import edge_tts
from mutagen import MutagenError
from mutagen.mp3 import MP3

from app.models.common import utc_now

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/sources/campus-ko-translation-draft-2026-10-26.md"
OUTPUT = ROOT / "data/generated/audio/ko-male"
VOICE = "ko-KR-InJoonNeural"
SLUGS = (
    "khu-a",
    "khu-b",
    "khu-c",
    "khu-d",
    "khu-e",
    "khu-hieu-bo",
    "khu-klf-va-khu-tu-hoc",
    "cang-tin",
    "bai-giu-xe",
    "khu-san-the-thao",
)
TITLES = (
    "A 구역",
    "B 구역",
    "C 구역",
    "D 구역",
    "E 구역",
    "행정 업무 구역",
    "KLF 구역 및 자율학습 구역",
    "학생 식당",
    "주차장",
    "체육시설",
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def parse_source(markdown: str) -> list[dict]:
    sections = re.findall(
        r"^## (\d+)\. ([^\r\n]+)\r?\n(.*?)(?=^## |\Z)",
        markdown,
        flags=re.MULTILINE | re.DOTALL,
    )
    if len(sections) != len(TITLES):
        raise ValueError("Expected exactly ten numbered Korean POI translations.")
    entries = []
    for index, (number, title, body) in enumerate(sections):
        text = body.strip()
        if int(number) != index + 1 or title != TITLES[index] or not text:
            raise ValueError(
                "Korean translation order, title or text is invalid at entry "
                f"{index + 1}: {number}. {title}."
            )
        entries.append(
            {
                "order": index + 1,
                "slug": SLUGS[index],
                "title": title,
                "text": text,
                "text_sha256": sha256(text.encode("utf-8")),
            }
        )
    return entries


def inspect_mp3(path: Path) -> dict:
    info = MP3(path).info
    if info.length <= 0 or info.bitrate <= 0 or path.stat().st_size < 1024:
        raise ValueError("Generated MP3 has no usable audio frames.")
    return {
        "bytes": path.stat().st_size,
        "sha256": sha256(path.read_bytes()),
        "duration_seconds": round(info.length, 3),
        "sample_rate": info.sample_rate,
        "bitrate": info.bitrate,
    }


async def synthesize(text: str, path: Path) -> None:
    await edge_tts.Communicate(text, VOICE, rate="+0%", volume="+0%", pitch="+0Hz").save(str(path))


async def prepare_entry(
    entry: dict,
    output: Path,
    previous: dict | None = None,
    *,
    renderer=synthesize,
    inspector=inspect_mp3,
) -> dict:
    revision = sha256(f"{VOICE}\0+0%\0+0%\0+0Hz\0{entry['text']}".encode())
    filename = f"{entry['order']:02d}-{entry['slug']}-{revision[:12]}.mp3"
    target = output / filename
    metadata = {key: value for key, value in entry.items() if key != "text"}
    metadata.update({"file": filename, "revision": revision, "status": "pending"})
    if target.is_file() and previous and previous.get("revision") == revision:
        try:
            measured = inspector(target)
            if measured["sha256"] == previous.get("sha256"):
                return {**metadata, **measured, "status": "ready"}
        except (OSError, ValueError, MutagenError):
            pass
    temporary = target.with_suffix(".mp3.part")
    for attempt in range(2):
        try:
            async with asyncio.timeout(60):
                await renderer(entry["text"], temporary)
            measured = inspector(temporary)
            temporary.replace(target)
            metadata.pop("error_type", None)
            return {**metadata, **measured, "status": "ready"}
        except Exception as error:
            metadata["error_type"] = type(error).__name__
            if attempt == 0:
                await asyncio.sleep(1)
        finally:
            temporary.unlink(missing_ok=True)
    return {**metadata, "status": "failed"}


def write_manifest(path: Path, manifest: dict) -> None:
    temporary = path.with_suffix(".json.part")
    temporary.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    temporary.replace(path)


async def generate() -> int:
    source_bytes = SOURCE.read_bytes()
    entries = parse_source(source_bytes.decode("utf-8-sig"))
    async with asyncio.timeout(30):
        voices = await edge_tts.list_voices()
    if not any(
        voice["ShortName"] == VOICE and voice["Locale"] == "ko-KR" and voice["Gender"] == "Male"
        for voice in voices
    ):
        raise RuntimeError("The selected Korean male voice is not available.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUTPUT / "manifest.json"
    previous = {}
    if manifest_path.is_file():
        try:
            previous = {
                item["slug"]: item
                for item in json.loads(manifest_path.read_text(encoding="utf-8"))["entries"]
            }
        except (ValueError, KeyError, TypeError):
            pass
    manifest = {
        "schema_version": 1,
        "provider": "edge-tts",
        "voice": VOICE,
        "language": "ko",
        "rate": "+0%",
        "pitch": "+0Hz",
        "volume": "+0%",
        "draft_translation": True,
        "review_status": "pending-user-review",
        "source": SOURCE.relative_to(ROOT).as_posix(),
        "source_sha256": sha256(source_bytes),
        "generated_at": utc_now().isoformat(),
        "complete": False,
        "entries": [],
    }
    write_manifest(manifest_path, manifest)
    for entry in entries:
        result = await prepare_entry(entry, OUTPUT, previous.get(entry["slug"]))
        manifest["entries"].append(result)
        write_manifest(manifest_path, manifest)
        print(f"{entry['order']:02d}/10 {entry['slug']}: {result['status']}", flush=True)
    manifest["complete"] = all(item["status"] == "ready" for item in manifest["entries"])
    write_manifest(manifest_path, manifest)
    if not manifest["complete"]:
        print("Korean audio pack incomplete; rerun to retry failed entries.")
        return 1
    print(
        f"Complete: 10 Korean draft MP3 files, "
        f"{sum(item['bytes'] for item in manifest['entries'])} bytes."
    )
    return 0


def main() -> int:
    try:
        return asyncio.run(generate())
    except Exception as error:
        print(
            "Korean audio preparation failed "
            f"({type(error).__name__}); no complete pack was confirmed."
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
