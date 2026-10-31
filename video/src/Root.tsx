import { Composition } from "remotion";
import { TikTok } from "./TikTok";
import type { VideoProps } from "./types";
import { Tutorial, tutorialFrames } from "./youtube/Tutorial";
import { Thumbnail } from "./youtube/Thumbnail";
import { t1 } from "./youtube/t1";
import { s01, s02 } from "./youtube/shorts";

const placeholder: VideoProps = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 90,
  channel: "Channel",
  topic: "Preview",
  audio: null,
  scenes: [
    { role: "hook", index: 0, line: "Run the engine build step", onScreen: "Pass --props", from: 0, durationInFrames: 90 },
  ],
  captions: [{ text: "Run the engine build step", from: 0, to: 90 }],
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="TikTok"
      component={TikTok}
      defaultProps={placeholder}
      // Size, fps and length all come from the props the engine wrote.
      calculateMetadata={({ props }) => ({
        durationInFrames: props.durationInFrames,
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
    {/* YouTube tutorials (16:9, no voiceover) and their thumbnails. */}
    <Composition id="T1" component={Tutorial} defaultProps={t1} width={1920} height={1080} fps={t1.fps} durationInFrames={tutorialFrames(t1)} />
    <Composition
      id="T1-thumbnail"
      component={Thumbnail}
      defaultProps={{ before: "VLOOKUP", after: "XLOOKUP", headline: "PENSIUN AJA", level: "MENENGAH", logo: "logo.png" }}
      width={1280}
      height={720}
      fps={30}
      durationInFrames={1}
    />
    {/* YouTube Shorts (9:16), same component in a vertical layout. */}
    {[s01, s02].map((s) => (
      <Composition key={s.id} id={s.id} component={Tutorial} defaultProps={s} width={1080} height={1920} fps={s.fps} durationInFrames={tutorialFrames(s)} />
    ))}
  </>
);
