"""Hook-first scripts: the data model, the writing prompt, and the checks.

A script is a list of scenes: the hook, 3-6 beats, then the call to action.
Each scene carries the spoken line, the short on-screen text, and a visual
direction for Canva, so one file drives the voiceover and the visuals.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field

from . import hooks
from .config import Config


@dataclass
class Scene:
    line: str          # what the voiceover says
    on_screen: str     # big caption text, 2-6 words
    visual: str        # direction for the Canva frame / b-roll


@dataclass
class Script:
    topic: str
    hook_formula: str
    hook: Scene
    beats: list[Scene]
    cta: Scene
    caption: str = ""
    hashtags: list[str] = field(default_factory=list)

    @property
    def scenes(self) -> list[Scene]:
        return [self.hook, *self.beats, self.cta]

    @property
    def spoken_text(self) -> str:
        return " ".join(s.line.strip() for s in self.scenes)

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False) + "\n"

    @classmethod
    def from_dict(cls, data: dict) -> "Script":
        return cls(
            topic=data["topic"],
            hook_formula=data.get("hook_formula", ""),
            hook=Scene(**data["hook"]),
            beats=[Scene(**b) for b in data["beats"]],
            cta=Scene(**data["cta"]),
            caption=data.get("caption", ""),
            hashtags=list(data.get("hashtags", [])),
        )

    @classmethod
    def from_json(cls, text: str) -> "Script":
        return cls.from_dict(json.loads(_strip_fences(text)))


def _strip_fences(text: str) -> str:
    match = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    return match.group(1) if match else text


def word_count(text: str) -> int:
    return len(re.findall(r"[\w'’-]+", text))


def estimate_seconds(script: Script, words_per_second: float) -> float:
    return round(word_count(script.spoken_text) / words_per_second, 1)


def validate(script: Script, cfg: Config) -> list[str]:
    """Return a list of problems. An empty list means the script is ready."""
    rules = cfg.script
    problems: list[str] = []

    hook_words = word_count(script.hook.line)
    if hook_words > rules.hook_max_words:
        problems.append(f"Hook is {hook_words} words; keep it to {rules.hook_max_words} or fewer.")
    if not script.hook.line.strip():
        problems.append("Hook is empty.")

    n = len(script.beats)
    if not rules.beats_min <= n <= rules.beats_max:
        problems.append(f"Script has {n} beats; aim for {rules.beats_min}-{rules.beats_max}.")

    secs = estimate_seconds(script, rules.words_per_second)
    if secs < rules.min_seconds:
        problems.append(f"Runs about {secs}s; minimum is {rules.min_seconds}s.")
    if secs > rules.max_seconds:
        problems.append(f"Runs about {secs}s; maximum is {rules.max_seconds}s. Cut a beat.")

    for i, scene in enumerate(script.scenes):
        label = "hook" if i == 0 else "cta" if i == len(script.scenes) - 1 else f"beat {i}"
        if not scene.line.strip():
            problems.append(f"{label}: spoken line is empty.")
        if word_count(scene.on_screen) > 7:
            problems.append(f"{label}: on-screen text is over 7 words; viewers won't read it.")
        if not scene.visual.strip():
            problems.append(f"{label}: no visual direction for Canva.")

    if script.hook_formula and script.hook_formula not in hooks.BY_KEY:
        problems.append(f"Unknown hook formula {script.hook_formula!r}.")
    return problems


def writing_prompt(topic: str, cfg: Config, angle: str = "") -> str:
    """The prompt Claude (or any writer) follows to produce script.json."""
    ch, rules = cfg.channel, cfg.script
    target_words = round(rules.target_seconds * rules.words_per_second)
    formulas = "\n".join(
        f"- `{f.key}` ({f.name}): {f.template}  e.g. \"{f.example}\"" for f in hooks.FORMULAS
    )
    angle_line = f"\nAngle to take: {angle}\n" if angle else ""
    return f"""# Write a TikTok script

Topic: **{topic}**
{angle_line}
Channel: {ch.name} | Niche: {ch.niche} | Audience: {ch.audience}
Language: {ch.language} | Tone: {ch.tone}

## Rules
1. Hook first. The first line must stop the scroll in under 3 seconds:
   {rules.hook_max_words} words max, no greeting, no "in this video".
   Write 3 candidate hooks from the formulas below, then keep the strongest.
2. {rules.beats_min}-{rules.beats_max} beats after the hook. One idea per beat. Each beat
   should make the viewer want the next one (open loops, numbers, contrast).
3. About {target_words} spoken words in total (~{rules.target_seconds}s at {rules.words_per_second} words/sec).
4. End with a call to action. Default: "{ch.cta}".
5. Write for the ear: short sentences, contractions, no lists read aloud.
6. Each scene needs `on_screen` text (2-6 words, the punchline of that line)
   and a `visual` direction a designer can build in Canva (subject, framing, mood).
7. Write a post caption (under 150 characters) and 3-5 hashtags.

## Hook formulas
{formulas}

## Output
Reply with only this JSON:

```json
{{
  "topic": "{topic}",
  "hook_formula": "<formula key>",
  "hook": {{"line": "...", "on_screen": "...", "visual": "..."}},
  "beats": [{{"line": "...", "on_screen": "...", "visual": "..."}}],
  "cta": {{"line": "...", "on_screen": "...", "visual": "..."}},
  "caption": "...",
  "hashtags": ["#..."]
}}
```
"""
