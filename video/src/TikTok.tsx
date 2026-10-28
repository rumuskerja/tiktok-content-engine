import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// Bundled font files: renders work offline and look the same everywhere.
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import type { Caption, Scene, VideoProps } from "./types";

const fontFamily = "'Plus Jakarta Sans', sans-serif";

const C = {
  bg1: "#0B1B3A",
  bg2: "#13306B",
  accent: "#FFD23F",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",
};

// TikTok UI covers the top ~150px, bottom ~400px and right ~140px.
const SAFE = { top: 180, bottom: 420, left: 80, right: 160 };

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = 160 + Math.sin(frame / 90) * 20;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${C.bg1} 0%, ${C.bg2} 100%)` }}>
      {/* Slow drifting glow keeps static text from feeling like a slideshow. */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: 300 + Math.sin(frame / 70) * 120,
          top: 500 + Math.cos(frame / 85) * 160,
          background: `radial-gradient(circle, ${C.accent}33 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const label = (scene: Scene) =>
  scene.role === "hook" ? "" : scene.role === "cta" ? "BERTUMBUH BARENG" : `RUMUS #${scene.index}`;

const SceneCard: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const exit = interpolate(frame, [scene.durationInFrames - 6, scene.durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isHook = scene.role === "hook";
  const tag = label(scene);

  return (
    <AbsoluteFill
      style={{
        padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`,
        justifyContent: "center",
        opacity: exit,
      }}
    >
      {tag && (
        <div
          style={{
            alignSelf: "flex-start",
            background: C.accent,
            color: C.bg1,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: 2,
            padding: "10px 26px",
            borderRadius: 14,
            marginBottom: 40,
            transform: `translateX(${(1 - enter) * -200}px)`,
          }}
        >
          {tag}
        </div>
      )}
      <div
        style={{
          color: C.text,
          fontWeight: 800,
          fontSize: isHook ? 118 : 104,
          lineHeight: 1.08,
          letterSpacing: -2,
          transform: `translateY(${(1 - enter) * 80}px) scale(${0.9 + enter * 0.1})`,
          opacity: enter,
          textShadow: "0 8px 30px rgba(0,0,0,0.35)",
          textWrap: "balance",
        }}
      >
        {scene.onScreen}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const current = captions.find((c) => frame >= c.from && frame < c.to);
  if (!current) return null;
  const pop = spring({ frame: frame - current.from, fps: 30, config: { damping: 18, stiffness: 220 } });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        bottom: SAFE.bottom + 20,
        textAlign: "center",
        color: C.text,
        fontWeight: 500,
        fontSize: 54,
        lineHeight: 1.25,
        transform: `scale(${0.92 + pop * 0.08})`,
      }}
    >
      <span style={{ background: "rgba(0,0,0,0.45)", padding: "8px 18px", borderRadius: 12, boxDecorationBreak: "clone" }}>
        {current.text}
      </span>
    </div>
  );
};

const Chrome: React.FC<{ channel: string }> = ({ channel }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: SAFE.top - 40,
          left: SAFE.left,
          color: C.muted,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {channel}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: "100%", background: "rgba(255,255,255,0.12)" }}>
        <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: C.accent }} />
      </div>
    </>
  );
};

export const TikTok: React.FC<VideoProps> = ({ channel, audio, scenes, captions }) => (
  <AbsoluteFill style={{ fontFamily }}>
    <Background />
    {scenes.map((scene) => (
      <Sequence key={scene.index} from={scene.from} durationInFrames={scene.durationInFrames}>
        <SceneCard scene={scene} />
      </Sequence>
    ))}
    <Captions captions={captions} />
    <Chrome channel={channel} />
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);
