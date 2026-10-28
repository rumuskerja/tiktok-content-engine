"""One folder per video under content/, moving through fixed stages.

    new      -> prompt.md written, waiting for script.json
    scripted -> script.json passes the checks
    built    -> voiceover.txt, captions.srt, canva_brief.md generated
    voiced   -> voiceover audio made (link recorded)
    designed -> Canva design made (link recorded)
    posted   -> published
"""

from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

from . import visuals, voiceover
from .config import ROOT, Config
from .script import Script, estimate_seconds, validate, writing_prompt

CONTENT_DIR = ROOT / "content"
STAGES = ("new", "scripted", "built", "voiced", "designed", "posted")


class ScriptError(Exception):
    def __init__(self, problems: list[str]):
        super().__init__("\n".join(problems))
        self.problems = problems


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:50].rstrip("-") or "video"


def read_status(folder: Path) -> dict:
    path = folder / "status.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_status(folder: Path, **updates) -> dict:
    status = {**read_status(folder), **updates}
    if "stage" in updates and updates["stage"] not in STAGES:
        raise ValueError(f"stage must be one of {', '.join(STAGES)}")
    status["updated"] = dt.datetime.now().isoformat(timespec="seconds")
    (folder / "status.json").write_text(json.dumps(status, indent=2) + "\n", encoding="utf-8")
    return status


def new_video(topic: str, cfg: Config, angle: str = "", base: Path = CONTENT_DIR,
              today: dt.date | None = None) -> Path:
    today = today or dt.date.today()
    folder = base / f"{today.isoformat()}-{slugify(topic)}"
    n = 2
    while folder.exists():
        folder = base / f"{today.isoformat()}-{slugify(topic)}-{n}"
        n += 1
    folder.mkdir(parents=True)
    (folder / "prompt.md").write_text(writing_prompt(topic, cfg, angle), encoding="utf-8")
    write_status(folder, topic=topic, angle=angle, stage="new")
    return folder


def load_script(folder: Path, cfg: Config) -> Script:
    path = folder / "script.json"
    if not path.exists():
        raise ScriptError([f"No script.json in {folder}. Write one from prompt.md first."])
    script = Script.from_json(path.read_text(encoding="utf-8"))
    problems = validate(script, cfg)
    if problems:
        raise ScriptError(problems)
    return script


def build(folder: Path, cfg: Config, audio_seconds: float | None = None) -> list[Path]:
    """Validate script.json and write the voiceover, caption and Canva files."""
    script = load_script(folder, cfg)
    outputs = {
        "voiceover.txt": voiceover.tts_text(script),
        "captions.srt": voiceover.srt(script, cfg, audio_seconds),
        "canva_brief.md": visuals.canva_brief(script, cfg, audio_seconds),
        "canva_query.txt": visuals.canva_query(script, cfg) + "\n",
    }
    written = []
    for name, text in outputs.items():
        path = folder / name
        path.write_text(text, encoding="utf-8")
        written.append(path)

    stage = read_status(folder).get("stage", "new")
    updates = {"estimated_seconds": estimate_seconds(script, cfg.script.words_per_second)}
    if audio_seconds:
        updates["audio_seconds"] = audio_seconds
    if STAGES.index(stage) < STAGES.index("built"):
        updates["stage"] = "built"
    write_status(folder, **updates)
    return written


def list_videos(base: Path = CONTENT_DIR) -> list[tuple[Path, dict]]:
    if not base.exists():
        return []
    return [(p, read_status(p)) for p in sorted(base.iterdir()) if (p / "status.json").exists()]
