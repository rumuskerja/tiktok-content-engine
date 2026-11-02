"""Load the channel profile from config/channel.toml."""

from __future__ import annotations

import tomllib
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = ROOT / "config" / "channel.toml"


@dataclass(frozen=True)
class Channel:
    name: str
    niche: str
    audience: str
    language: str
    tone: str
    cta: str


@dataclass(frozen=True)
class ScriptRules:
    target_seconds: int
    min_seconds: int
    max_seconds: int
    words_per_second: float
    hook_max_words: int
    beats_min: int
    beats_max: int


@dataclass(frozen=True)
class Voice:
    voice_id: str
    speed: float


@dataclass(frozen=True)
class Visuals:
    brand_kit_id: str
    design_type: str
    style: str


@dataclass(frozen=True)
class Config:
    channel: Channel
    script: ScriptRules
    voice: Voice
    visuals: Visuals


def load(path: Path | str = DEFAULT_CONFIG) -> Config:
    data = tomllib.loads(Path(path).read_text(encoding="utf-8"))
    return Config(
        channel=Channel(**data["channel"]),
        script=ScriptRules(**data["script"]),
        voice=Voice(**data["voice"]),
        visuals=Visuals(**data["visuals"]),
    )
