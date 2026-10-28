import datetime as dt
import json
import tempfile
import unittest
from pathlib import Path

from engine import config, pipeline, visuals, voiceover
from engine.script import Scene, Script, validate, writing_prompt

CFG = config.load()


def sample_script(**overrides) -> Script:
    data = dict(
        topic="saving money on groceries",
        hook_formula="mistake",
        hook=Scene("You're grocery shopping wrong.", "Shopping wrong?", "Close-up of a full cart"),
        beats=[
            Scene("First, never shop hungry. You'll spend more on snacks you didn't plan for.",
                  "Never shop hungry", "Person eating before leaving home"),
            Scene("Second, check the bottom shelf. The cheapest brands live down there on purpose.",
                  "Look down", "Camera tilts to bottom shelf"),
            Scene("Third, buy the store brand. It's often made in the exact same factory as the big name.",
                  "Store brand = same", "Two identical products side by side"),
        ],
        cta=Scene("Follow for part two, where I cut my bill in half.", "Part 2 next", "Receipt with total circled"),
        caption="3 grocery tricks that actually work",
        hashtags=["#groceries", "#savemoney"],
    )
    data.update(overrides)
    return Script(**data)


class ScriptTests(unittest.TestCase):
    def test_sample_is_valid(self):
        self.assertEqual(validate(sample_script(), CFG), [])

    def test_long_hook_is_flagged(self):
        s = sample_script(hook=Scene("This is a very long hook that keeps going and going well past the limit",
                                     "Long", "x"))
        self.assertTrue(any("Hook" in p for p in validate(s, CFG)))

    def test_too_few_beats_is_flagged(self):
        s = sample_script(beats=sample_script().beats[:1])
        self.assertTrue(any("beats" in p for p in validate(s, CFG)))

    def test_json_round_trip_and_fences(self):
        s = sample_script()
        again = Script.from_json("Here you go:\n```json\n" + s.to_json() + "```")
        self.assertEqual(again, s)

    def test_prompt_mentions_topic_and_formulas(self):
        prompt = writing_prompt("budget travel", CFG)
        self.assertIn("budget travel", prompt)
        self.assertIn("`mistake`", prompt)


class VoiceoverTests(unittest.TestCase):
    def test_timings_scale_to_audio_length(self):
        t = voiceover.timings(sample_script(), CFG, audio_seconds=30)
        self.assertAlmostEqual(t[-1].end, 30, places=1)
        self.assertTrue(all(a.end <= b.start for a, b in zip(t, t[1:])))

    def test_srt_is_well_formed(self):
        srt = voiceover.srt(sample_script(), CFG)
        self.assertTrue(srt.startswith("1\n00:00:00,000 --> "))
        self.assertIn("You're grocery shopping wrong.", srt)

    def test_canva_brief_has_a_page_per_scene(self):
        brief = visuals.canva_brief(sample_script(), CFG)
        self.assertEqual(brief.count("## Page "), 5)
        self.assertIn("Never shop hungry", brief)


class PipelineTests(unittest.TestCase):
    def test_new_then_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            folder = pipeline.new_video("Saving money on groceries!", CFG, base=base,
                                        today=dt.date(2026, 10, 28))
            self.assertEqual(folder.name, "2026-10-28-saving-money-on-groceries")
            self.assertTrue((folder / "prompt.md").exists())

            with self.assertRaises(pipeline.ScriptError):
                pipeline.build(folder, CFG)

            (folder / "script.json").write_text(sample_script().to_json(), encoding="utf-8")
            written = pipeline.build(folder, CFG, audio_seconds=28.5)
            self.assertEqual({p.name for p in written},
                             {"voiceover.txt", "captions.srt", "canva_brief.md", "canva_query.txt"})
            status = json.loads((folder / "status.json").read_text())
            self.assertEqual(status["stage"], "built")
            self.assertEqual(status["audio_seconds"], 28.5)

            again = pipeline.new_video("Saving money on groceries!", CFG, base=base,
                                       today=dt.date(2026, 10, 28))
            self.assertTrue(again.name.endswith("-2"))


if __name__ == "__main__":
    unittest.main()
