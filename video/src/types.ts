export type Scene = {
  role: "hook" | "beat" | "cta";
  index: number;
  line: string;
  onScreen: string;
  from: number;
  durationInFrames: number;
};

export type Caption = { text: string; from: number; to: number };

// Mirrors engine/video.py; written to content/<video>/video_props.json.
export type VideoProps = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  channel: string;
  topic: string;
  audio: string | null;
  scenes: Scene[];
  captions: Caption[];
};
