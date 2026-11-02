"""Turn a script into TTS-ready text and timed captions.

Scene timings are estimated from word counts at the configured speaking pace.
Once the real audio exists, re-time with `retime(script, cfg, audio_seconds)`
so captions and Canva pages match the actual voiceover length.
"""

from __future__ import annotations

from dataclasses import dataclass

from .config import Config
from .script import Script, word_count

# Short breath after the hook and between beats keeps the pace punchy.
PAUSE_AFTER_HOOK = 0.4
PAUSE_BETWEEN = 0.2


@dataclass
class Timing:
    start: float
    end: float

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 2)


def tts_text(script: Script) -> str:
    """One paragraph per scene; TTS engines read paragraph breaks as pauses."""
    return "\n\n".join(s.line.strip() for s in script.scenes) + "\n"


def timings(script: Script, cfg: Config, audio_seconds: float | None = None) -> list[Timing]:
    wps = cfg.script.words_per_second * cfg.voice.speed
    raw = [max(word_count(s.line), 1) / wps for s in script.scenes]
    pauses = [PAUSE_AFTER_HOOK] + [PAUSE_BETWEEN] * (len(raw) - 2) + [0.0]
    total = sum(raw) + sum(pauses)
    scale = audio_seconds / total if audio_seconds else 1.0

    out, t = [], 0.0
    for dur, pause in zip(raw, pauses):
        end = t + dur * scale
        out.append(Timing(round(t, 2), round(end, 2)))
        t = end + pause * scale
    return out


def _srt_time(seconds: float) -> str:
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def srt(script: Script, cfg: Config, audio_seconds: float | None = None) -> str:
    """Captions: each scene's spoken line, split into chunks of <= 6 words."""
    blocks, idx = [], 1
    for scene, timing in zip(script.scenes, timings(script, cfg, audio_seconds)):
        words = scene.line.split()
        chunks = [" ".join(words[i:i + 6]) for i in range(0, len(words), 6)] or [""]
        step = (timing.end - timing.start) / len(chunks)
        for n, chunk in enumerate(chunks):
            start = timing.start + n * step
            blocks.append(f"{idx}\n{_srt_time(start)} --> {_srt_time(start + step)}\n{chunk}\n")
            idx += 1
    return "\n".join(blocks)
