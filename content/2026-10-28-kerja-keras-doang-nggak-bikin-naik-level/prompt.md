# Write a TikTok script

Topic: **Kerja keras doang nggak bikin naik level**

Angle to take: 3 rumus kerja biar kontribusimu kelihatan dan dihargai

Channel: Rumus Kerja Bertumbuh | Niche: career growth and work skills | Audience: Indonesian young professionals and fresh graduates who want to grow at work
Language: id | Tone: santai, to the point, supportive (casual Bahasa Indonesia, pakai kamu)

## Rules
1. Hook first. The first line must stop the scroll in under 3 seconds:
   12 words max, no greeting, no "in this video".
   Write 3 candidate hooks from the formulas below, then keep the strongest.
2. 3-6 beats after the hook. One idea per beat. Each beat
   should make the viewer want the next one (open loops, numbers, contrast).
3. About 84 spoken words in total (~35s at 2.4 words/sec).
4. End with a call to action. Default: "Follow buat rumus kerja berikutnya".
5. Write for the ear: short sentences, contractions, no lists read aloud.
6. Each scene needs `on_screen` text (2-6 words, the punchline of that line)
   and a `visual` direction a designer can build in Canva (subject, framing, mood).
7. Write a post caption (under 150 characters) and 3-5 hashtags.

## Hook formulas
- `mistake` (Common mistake): You're doing {topic} wrong.  e.g. "You're washing your face wrong."
- `secret` (Insider secret): Nobody tells you this about {topic}.  e.g. "Nobody tells you this about renting your first apartment."
- `number` (Numbered list): 3 {topic} tricks I wish I knew sooner.  e.g. "3 budgeting tricks I wish I knew sooner."
- `stop` (Stop doing): Stop {topic} until you watch this.  e.g. "Stop buying protein powder until you watch this."
- `result` (Result first): This is how I {topic} in one week.  e.g. "This is how I saved $500 in one week."
- `question` (Pointed question): Why does nobody talk about {topic}?  e.g. "Why does nobody talk about lifestyle creep?"
- `myth` (Myth bust): {topic} is a myth. Here's the proof.  e.g. "Eight glasses of water a day is a myth. Here's the proof."
- `pov` (POV): POV: you finally figured out {topic}.  e.g. "POV: you finally figured out meal prep."
- `callout` (Audience callout): If you're {audience}, watch this.  e.g. "If you're over 30 and still renting, watch this."
- `contrast` (Before / after): I used to {topic}. Now I do this instead.  e.g. "I used to cram for exams. Now I do this instead."

## Output
Reply with only this JSON:

```json
{
  "topic": "Kerja keras doang nggak bikin naik level",
  "hook_formula": "<formula key>",
  "hook": {"line": "...", "on_screen": "...", "visual": "..."},
  "beats": [{"line": "...", "on_screen": "...", "visual": "..."}],
  "cta": {"line": "...", "on_screen": "...", "visual": "..."},
  "caption": "...",
  "hashtags": ["#..."]
}
```
