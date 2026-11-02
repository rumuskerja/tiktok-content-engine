"""Hook formulas. A hook has one job: stop the scroll in the first 3 seconds.

Each formula has a template with {topic}/{audience} slots and an example, so
the writer (Claude or a person) can pick a pattern instead of starting blank.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class HookFormula:
    key: str
    name: str
    template: str
    example: str


FORMULAS: tuple[HookFormula, ...] = (
    HookFormula("mistake", "Common mistake",
                "You're doing {topic} wrong.",
                "You're washing your face wrong."),
    HookFormula("secret", "Insider secret",
                "Nobody tells you this about {topic}.",
                "Nobody tells you this about renting your first apartment."),
    HookFormula("number", "Numbered list",
                "3 {topic} tricks I wish I knew sooner.",
                "3 budgeting tricks I wish I knew sooner."),
    HookFormula("stop", "Stop doing",
                "Stop {topic} until you watch this.",
                "Stop buying protein powder until you watch this."),
    HookFormula("result", "Result first",
                "This is how I {topic} in one week.",
                "This is how I saved $500 in one week."),
    HookFormula("question", "Pointed question",
                "Why does nobody talk about {topic}?",
                "Why does nobody talk about lifestyle creep?"),
    HookFormula("myth", "Myth bust",
                "{topic} is a myth. Here's the proof.",
                "Eight glasses of water a day is a myth. Here's the proof."),
    HookFormula("pov", "POV",
                "POV: you finally figured out {topic}.",
                "POV: you finally figured out meal prep."),
    HookFormula("callout", "Audience callout",
                "If you're {audience}, watch this.",
                "If you're over 30 and still renting, watch this."),
    HookFormula("contrast", "Before / after",
                "I used to {topic}. Now I do this instead.",
                "I used to cram for exams. Now I do this instead."),
)

BY_KEY = {f.key: f for f in FORMULAS}


def get(key: str) -> HookFormula:
    try:
        return BY_KEY[key]
    except KeyError:
        raise KeyError(f"unknown hook formula {key!r}; choose from {', '.join(BY_KEY)}") from None
