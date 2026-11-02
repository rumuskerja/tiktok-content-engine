---
name: make-tiktok
description: Turn a topic into a finished TikTok package (hook-first script, AnyToSpeech voiceover, Canva 9:16 visuals) using this repo's engine. Use when asked to make, script or produce a TikTok video.
---

# Make a TikTok

Run every step from the repo root. The channel profile in `config/channel.toml`
(niche, audience, language, tone, voice, brand kit) drives everything; read it first.

## 1. Start the video
```
python -m engine new "<topic>" [--angle "<take>"]
```
This creates `content/<date>-<slug>/` with `prompt.md` and `status.json`.

## 2. Write the script
Follow `prompt.md` exactly and save the JSON it asks for as `script.json` in
the same folder. Draft three hooks from the formulas, keep the strongest.
Then:
```
python -m engine check <folder>
```
Fix every problem it lists and re-run until it prints `Script OK`.

## 3. Build the files
```
python -m engine build <folder>
```
Writes `voiceover.txt`, `captions.srt`, `canva_brief.md`, `canva_query.txt`,
`video_props.json`.

## 4. Voiceover (AnyToSpeech connector)
- If `[voice] voice_id` is empty, call `voices_list` filtered by the channel
  `language`, offer the person two or three voices with `voice_test`, and
  write the chosen id back into `config/channel.toml`.
- Call `speech_synthesize` with `text` = contents of `voiceover.txt`,
  `voice` = voice_id, `speed` = `[voice] speed`, `language` = channel language,
  and a `vibe` built from the channel tone (e.g. "energetic TikTok creator,
  fast and punchy"). You may add `[pause]` after the hook line.
- If it returns a job, poll with `jobs_get` until done.
- Save the audio into the video folder (e.g. `voice.mp3`), measure it with
  `ffprobe`, re-time everything to it, then record the link:
```
python -m engine build <folder> --audio-seconds <length> --audio-file voice.mp3
python -m engine status <folder> --set stage=voiced voiceover_url=<url>
```

## 5. Render the video (Remotion)
```
cd video && npm install && npm run render -- <folder>
```
Gives `content/<folder>/video.mp4` (1080x1920, H.264) with animated text,
captions and the voiceover. Grab a few frames with ffmpeg and look at them
before handing it over. No voiceover yet? Render anyway: it works as a
text-on-screen video the person can put a trending sound under.

## 6. Visuals in Canva (optional)
Use this when the person wants to edit the frames by hand or apply their
Canva brand kit; the Remotion render already covers the visuals otherwise.
- Use `create-design` when available, with `canva_query.txt` as the brief and a
  9:16 vertical format. If the person wants their brand kit (`[visuals]
  brand_kit_id` set, or they ask), use `generate-design` with
  `design_type` = `your_story` and `brand_kit_id`, show the candidates, then
  `create-design-from-candidate` for the one they pick.
- Check the result against `canva_brief.md`: one page per scene, on-screen text
  matches, text inside the safe zone.
- Record it:
```
python -m engine status <folder> --set stage=designed canva_url=<url>
```

## 7. Hand off
Give the person `video.mp4` (copy it to the shared project files), the voiceover
and any Canva design, paste the caption
and hashtags from `canva_brief.md`. If they used Canva instead of the Remotion
render, remind them to lay the audio and `captions.srt` over the pages (Canva
or CapCut) before posting. After they
post: `python -m engine status <folder> --set stage=posted`.
