"""Build the Canva brief: one 9:16 page per scene.

The brief is plain Markdown so it works two ways: Claude passes it to the
Canva connector (generate-design), or a person builds the frames by hand.
"""

from __future__ import annotations

from .config import Config
from .script import Script
from .voiceover import timings


def canva_brief(script: Script, cfg: Config, audio_seconds: float | None = None) -> str:
    v, ch = cfg.visuals, cfg.channel
    brand = f"Use brand kit `{v.brand_kit_id}`." if v.brand_kit_id else "No brand kit set; keep colours consistent across pages."
    lines = [
        f"# Canva brief: {script.topic}",
        "",
        f"- Format: Canva `{v.design_type}` (1080x1920, 9:16), {len(script.scenes)} pages, one per scene",
        f"- Style: {v.style}",
        f"- Channel: {ch.name} ({ch.niche}), language: {ch.language}",
        f"- {brand}",
        "- Keep on-screen text inside the safe zone: away from the top 150px,"
        " the bottom 400px and the right 140px, where TikTok's UI sits.",
        "",
    ]
    for i, (scene, t) in enumerate(zip(script.scenes, timings(script, cfg, audio_seconds)), 1):
        role = "Hook" if i == 1 else "CTA" if i == len(script.scenes) else f"Beat {i - 1}"
        lines += [
            f"## Page {i}: {role} ({t.start:.1f}s-{t.end:.1f}s, {t.duration:.1f}s)",
            f"- On-screen text: **{scene.on_screen}**",
            f"- Visual: {scene.visual}",
            f"- Voiceover: \"{scene.line}\"",
            "",
        ]
    lines[-1:] = ["", "## Post", f"- Caption: {script.caption}", f"- Hashtags: {' '.join(script.hashtags)}", ""]
    return "\n".join(lines)


def canva_query(script: Script, cfg: Config) -> str:
    """A compact one-shot prompt for Canva's generate-design tool."""
    pages = " | ".join(
        f"Page {i}: text '{s.on_screen}', visual: {s.visual}" for i, s in enumerate(script.scenes, 1)
    )
    return (
        f"TikTok video, 9:16 vertical, {len(script.scenes)} pages about '{script.topic}'. "
        f"Style: {cfg.visuals.style}. Big bold readable text centred in the safe zone. {pages}"
    )
