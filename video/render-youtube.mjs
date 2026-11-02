// Usage: npm run render:youtube -- <id> [out dir]
// Renders the tutorial or Short <id> (e.g. T1, S01) into youtube/videos/<id>/,
// plus a thumbnail for tutorials. youtube/assets/ (logo, music, sound effects)
// is the public dir.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [id, outArg] = process.argv.slice(2);
if (!id) {
  console.error("Usage: npm run render:youtube -- <id> [out dir]");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "youtube", "assets");
const out = outArg ? path.resolve(outArg) : path.join(root, "youtube", "videos", id);
mkdirSync(out, { recursive: true });

const extra = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const run = (args) => execFileSync("npx", ["remotion", ...args, `--public-dir=${pub}`, ...extra], { stdio: "inherit", cwd: import.meta.dirname });

run(["render", "src/index.ts", id, path.join(out, `${id}.mp4`), "--codec=h264", "--crf=18"]);
// Shorts get their cover frame picked in the YouTube app, so only tutorials have a thumbnail.
if (id.startsWith("T")) run(["still", "src/index.ts", `${id}-thumbnail`, path.join(out, `${id}-thumbnail.png`)]);
console.log(`Rendered ${id} into ${out}`);
