import { Composition } from "remotion";
import { TikTok } from "./TikTok";
import type { VideoProps } from "./types";

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
);
