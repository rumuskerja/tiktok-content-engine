"""Command line: python -m engine <command>."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import config, hooks, pipeline


def _folder(arg: str) -> Path:
    path = Path(arg)
    if not path.exists():
        path = pipeline.CONTENT_DIR / arg
    if not path.is_dir():
        sys.exit(f"No video folder {arg!r}")
    return path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="engine", description=__doc__)
    parser.add_argument("--config", default=config.DEFAULT_CONFIG, help="channel profile (TOML)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("new", help="start a video from a topic")
    p.add_argument("topic")
    p.add_argument("--angle", default="", help="optional angle or take on the topic")

    p = sub.add_parser("check", help="validate a video's script.json")
    p.add_argument("folder")

    p = sub.add_parser("build", help="write voiceover, captions and Canva brief")
    p.add_argument("folder")
    p.add_argument("--audio-seconds", type=float, help="real voiceover length, to re-time captions")
    p.add_argument("--audio-file", help="voiceover file in the video folder, played by the renderer")

    p = sub.add_parser("status", help="show or update a video's status")
    p.add_argument("folder")
    p.add_argument("--set", nargs="*", default=[], metavar="KEY=VALUE",
                   help="e.g. stage=voiced voiceover_url=https://...")

    sub.add_parser("list", help="list videos and their stage")
    sub.add_parser("hooks", help="list hook formulas")

    args = parser.parse_args(argv)
    cfg = config.load(args.config)

    if args.cmd == "new":
        folder = pipeline.new_video(args.topic, cfg, args.angle)
        print(f"Created {folder}\nNext: write {folder / 'script.json'} following {folder / 'prompt.md'}")
    elif args.cmd in ("check", "build"):
        folder = _folder(args.folder)
        try:
            if args.cmd == "check":
                pipeline.load_script(folder, cfg)
                pipeline.write_status(folder, stage=max(
                    pipeline.read_status(folder).get("stage", "new"), "scripted",
                    key=pipeline.STAGES.index))
                print("Script OK")
            else:
                for path in pipeline.build(folder, cfg, args.audio_seconds, args.audio_file):
                    print(f"Wrote {path}")
        except pipeline.ScriptError as err:
            print("Script needs work:", *(f"- {p}" for p in err.problems), sep="\n")
            return 1
    elif args.cmd == "status":
        folder = _folder(args.folder)
        updates = dict(kv.split("=", 1) for kv in args.set)
        status = pipeline.write_status(folder, **updates) if updates else pipeline.read_status(folder)
        for key, value in status.items():
            print(f"{key}: {value}")
    elif args.cmd == "list":
        videos = pipeline.list_videos()
        if not videos:
            print("No videos yet. Start one with: python -m engine new \"your topic\"")
        for path, status in videos:
            print(f"{status.get('stage', '?'):9} {path.name}")
    elif args.cmd == "hooks":
        for f in hooks.FORMULAS:
            print(f"{f.key:9} {f.template}\n{'':9} e.g. {f.example}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
