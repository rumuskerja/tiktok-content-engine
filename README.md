# TikTok Content Engine

A repeatable pipeline that turns a topic into a TikTok you can post:

```
topic ──► hook-first script ──► voiceover + captions ──► visuals ──► video.mp4
          (script.json)          (AnyToSpeech, .srt)      (Canva brief  (Remotion, 1080x1920)
                                                           or Remotion)
```

The engine is plain Python (3.11+, no dependencies). It writes the prompt,
checks the script, and generates the voiceover text, timed captions and the
Canva brief. Claude does the writing and drives the AnyToSpeech and Canva
connectors; the steps are in [`.claude/skills/make-tiktok/SKILL.md`](.claude/skills/make-tiktok/SKILL.md).
Ask Claude: *"make a TikTok about &lt;topic&gt;"*.

## Set up your channel

Edit [`config/channel.toml`](config/channel.toml) once: niche, audience,
language, tone, default call to action, voice and Canva brand kit. Every
video reads from it, so this is what tunes the engine to your niche.

## Commands

| Command | What it does |
| --- | --- |
| `python -m engine new "topic" [--angle "..."]` | Creates `content/<date>-<slug>/` with the writing prompt |
| `python -m engine check <folder>` | Validates `script.json` (hook length, beats, duration, on-screen text) |
| `python -m engine build <folder> [--audio-seconds N] [--audio-file voice.mp3]` | Writes `voiceover.txt`, `captions.srt`, `canva_brief.md`, `canva_query.txt`, `video_props.json` |
| `python -m engine status <folder> [--set key=value ...]` | Shows or records stage and links |
| `python -m engine list` | All videos and their stage |
| `python -m engine hooks` | The hook formula library |

`<folder>` can be the full path or just the folder name under `content/`.

## What a script looks like

A script is the hook, 3 to 6 beats, and a call to action. Every scene has the
spoken `line`, short `on_screen` text, and a `visual` direction for Canva. See
[`examples/script.json`](examples/script.json).

The checks enforce the things that drive watch time: a hook of 12 words or
fewer, one idea per beat, 15 to 60 seconds of speech (35s target), and
on-screen text short enough to read. All limits live in `config/channel.toml`.

## Render the video (Remotion)

`video/` is a Remotion project that turns `video_props.json` into a 1080x1920
MP4: animated scene text, "RUMUS #n" labels, word-chunk captions, a progress
bar, and the voiceover if the folder has one (`--audio-file`). Text stays
inside TikTok's safe zone.

```
cd video && npm install
npm run render -- <folder>          # writes content/<folder>/video.mp4
npm run studio                      # live preview while tweaking the design
```

Set `REMOTION_BROWSER=/path/to/chrome-headless-shell` to reuse a local Chrome
instead of letting Remotion download one.

## Stages

`new → scripted → built → voiced → designed → posted`, tracked in each
video's `status.json`.

## Tests

```
python -m unittest
```
