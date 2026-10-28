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
Writes `voiceover.txt`, `captions.srt`, `canva_brief.md`, `canva_query.txt`.

## 4. Voiceover (AnyToSpeech connector)
- If `[voice] voice_id` is empty, call `voices_list` filtered by the channel
  `language`, offer the person two or three voices with `voice_test`, and
  write the chosen id back into `config/channel.toml`.
- Call `speech_synthesize` with `text` = contents of `voiceover.txt`,
  `voice` = voice_id, `speed` = `[voice] speed`, `language` = channel language,
  and a `vibe` built from the channel tone (e.g. "energetic TikTok creator,
  fast and punchy"). You may add `[pause]` after the hook line.
- If it returns a job, poll with `jobs_get` until done.
- Re-time captions to the real audio length, then record the link:
```
python -m engine build <folder> --audio-seconds <length>
python -m engine status <folder> --set stage=voiced voiceover_url=<url>
```

## 5. Visuals (Canva connector)
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

## 6. Hand off
Tell the person where the voiceover and the Canva design are, paste the caption
and hashtags from `canva_brief.md`, and remind them to lay the audio and
`captions.srt` over the Canva pages (Canva or CapCut) before posting. After they
post: `python -m engine status <folder> --set stage=posted`.
