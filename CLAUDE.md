# CLAUDE.md

- To make a video, follow `.claude/skills/make-tiktok/SKILL.md`.
- The channel profile is `config/channel.toml`; read it before writing anything.
  When the person tells you their niche, voice or brand kit, update it there.
- `python -m engine check` must pass before building or voicing a script.
- The engine is stdlib-only Python 3.11+. Keep it dependency-free.
- Run `python -m unittest` after changing anything in `engine/`.
