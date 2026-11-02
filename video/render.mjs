// Usage: npm run render -- <content folder name or path> [out.mp4]
// Serves the video folder as Remotion's public dir so the voiceover file
// named in video_props.json can be played with staticFile().
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const [arg, outArg] = process.argv.slice(2);
if (!arg) {
  console.error("Usage: npm run render -- <video folder> [out.mp4]");
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, "..");
const folder = existsSync(arg) ? path.resolve(arg) : path.join(root, "content", arg);
const props = path.join(folder, "video_props.json");
if (!existsSync(props)) {
  console.error(`No video_props.json in ${folder}. Run: python -m engine build ${arg}`);
  process.exit(1);
}
const out = outArg ? path.resolve(outArg) : path.join(folder, "video.mp4");

const args = ["remotion", "render", "src/index.ts", "TikTok", out, `--props=${props}`, `--public-dir=${folder}`];
// Reuse a local Chrome when one is configured (e.g. in sandboxes without downloads).
if (process.env.REMOTION_BROWSER) args.push(`--browser-executable=${process.env.REMOTION_BROWSER}`);

execFileSync("npx", args, { stdio: "inherit", cwd: import.meta.dirname });
console.log(`Rendered ${out}`);
