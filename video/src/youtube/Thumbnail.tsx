import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import { B, font, mono } from "./Tutorial";

export type ThumbnailProps = {
  before: string;
  after: string;
  headline: string;
  level: string;
  logo?: string | null;
};

// Before/after split, max 4 big words, a level badge (youtube/channel-setup.md).
export const Thumbnail: React.FC<ThumbnailProps> = ({ before, after, headline, level, logo }) => (
  <AbsoluteFill style={{ background: B.navy, fontFamily: font }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 640,
        height: 520,
        background: "#1B2433",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", fontFamily: mono, fontWeight: 800, fontSize: 92, color: "rgba(245,247,250,0.45)" }}>
        {before}
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            top: "50%",
            height: 16,
            background: B.red,
            transform: "rotate(-8deg)",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 640,
        top: 0,
        width: 640,
        height: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderLeft: `10px solid ${B.teal}`,
      }}
    >
      <div style={{ fontFamily: mono, fontWeight: 800, fontSize: 96, color: B.teal, textShadow: `0 0 40px ${B.teal}88` }}>{after}</div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 520,
        height: 200,
        background: B.navy,
        borderTop: `8px solid ${B.teal}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: B.yellow,
        fontWeight: 800,
        fontSize: 120,
        letterSpacing: -2,
        textShadow: "0 8px 0 rgba(0,0,0,0.5)",
      }}
    >
      {headline}
    </div>
    <div
      style={{
        position: "absolute",
        left: 36,
        top: 36,
        background: B.yellow,
        color: B.navy,
        fontWeight: 800,
        fontSize: 34,
        padding: "8px 22px",
        borderRadius: 12,
      }}
    >
      {level}
    </div>
    <div
      style={{
        position: "absolute",
        right: 36,
        top: 36,
        width: 74,
        height: 74,
        borderRadius: 14,
        background: "#1D6F42",
        color: "white",
        fontWeight: 800,
        fontSize: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      X
    </div>
    {logo && <Img src={staticFile(logo)} style={{ position: "absolute", right: 24, top: 566, width: 110, height: 110 }} />}
  </AbsoluteFill>
);
