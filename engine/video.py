"""Props for the Remotion renderer in video/.

The renderer is a dumb player: everything it shows (scene text, caption
chunks, timings, audio file) comes from this JSON, so timing logic stays in
one place (voiceover.timings).
"""

from __future__ import annotations

import json

from .config import Config
from .script import Script
from .voiceover import timings

FPS = 30
TAIL_SECONDS = 0.8  # hold the CTA a beat after the last word


def props(script: Script, cfg: Config, audio_seconds: float | None = None,
          audio_file: str | None = None) -> dict:
    scene_times = timings(script, cfg, audio_seconds)
    n = len(script.scenes)
    scenes, captions = [], []
    for i, (scene, t) in enumerate(zip(script.scenes, scene_times)):
        role = "hook" if i == 0 else "cta" if i == n - 1 else "beat"
        # Each scene stays on screen until the next one starts, so there are no gaps.
        end = scene_times[i + 1].start if i + 1 < n else t.end + TAIL_SECONDS
        scenes.append({
            "role": role,
            "index": i,
            "line": scene.line,
            "onScreen": scene.on_screen,
            "from": round(t.start * FPS),
            "durationInFrames": max(round((end - t.start) * FPS), 1),
        })
        words = scene.line.split()
        chunks = [" ".join(words[k:k + 4]) for k in range(0, len(words), 4)] or [""]
        step = (t.end - t.start) / len(chunks)
        for k, chunk in enumerate(chunks):
            start = t.start + k * step
            captions.append({"text": chunk, "from": round(start * FPS),
                             "to": round((start + step) * FPS)})

    return {
        "fps": FPS,
        "width": 1080,
        "height": 1920,
        "durationInFrames": scenes[-1]["from"] + scenes[-1]["durationInFrames"],
        "channel": cfg.channel.name,
        "topic": script.topic,
        "audio": audio_file,
        "scenes": scenes,
        "captions": captions,
    }


def props_json(*args, **kwargs) -> str:
    return json.dumps(props(*args, **kwargs), indent=2, ensure_ascii=False) + "\n"
