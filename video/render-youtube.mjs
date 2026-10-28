// Usage: npm run render:youtube -- <id> [out dir]
// Renders the 16:9 tutorial <id> (e.g. T1) and its thumbnail, using
// youtube/videos/<id>/ as the public dir (logo, sound effects).
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [id, outArg] = process.argv.slice(2);
if (!id) {
  console.error("Usage: npm run render:youtube -- <id> [out dir]");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "youtube", "videos", id);
const out = outArg ? path.resolve(outArg) : pub;
mkdirSync(out, { recursive: true });

const extra = process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : [];
const run = (args) => execFileSync("npx", ["remotion", ...args, `--public-dir=${pub}`, ...extra], { stdio: "inherit", cwd: import.meta.dirname });

run(["render", "src/index.ts", id, path.join(out, `${id}.mp4`), "--codec=h264", "--crf=18"]);
run(["still", "src/index.ts", `${id}-thumbnail`, path.join(out, `${id}-thumbnail.png`)]);
console.log(`Rendered ${id}.mp4 and ${id}-thumbnail.png into ${out}`);
