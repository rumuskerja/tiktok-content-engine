import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import { DashView } from "./Dash";
import { B, font } from "./theme";

const ALL = ["header", "filters", "insight", "kpi", "trend", "program", "status"] as const;

// Big words left, the real dashboard tilted on the right, a cursor on the filter.
export const LndThumbnail: React.FC<{ logo?: string | null }> = ({ logo }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 40%, ${B.navy2} 0%, ${B.navy} 65%)`, fontFamily: font, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 470,
        top: 120,
        width: 1920,
        height: 846,
        transformOrigin: "0 0",
        transform: "perspective(2400px) rotateY(-14deg) scale(0.47)",
        boxShadow: `0 0 120px ${B.teal}66`,
        borderRadius: 18,
        overflow: "hidden",
        border: `6px solid ${B.teal}`,
      }}
    >
      <DashView state={{ show: [...ALL], dept: "Semua", metode: "Semua", cursor: "dept" }} prev={null} local={40} frames={60} fps={30} W={1920} H={846} compact={false} />
    </div>
    <div style={{ position: "absolute", left: 44, top: 40, background: B.yellow, color: B.navy, fontWeight: 800, fontSize: 32, padding: "8px 22px", borderRadius: 12 }}>MENENGAH</div>
    <div style={{ position: "absolute", left: 44, top: 150, width: 520 }}>
      <div style={{ color: B.white, fontWeight: 800, fontSize: 98, lineHeight: 0.98, letterSpacing: -3, textShadow: "0 8px 0 rgba(0,0,0,0.45)" }}>
        DASH
        <br />
        BOARD
      </div>
      <div style={{ color: B.teal, fontWeight: 800, fontSize: 98, lineHeight: 1, letterSpacing: -3, textShadow: "0 8px 0 rgba(0,0,0,0.45)" }}>L&amp;D</div>
      <div style={{ marginTop: 26, display: "inline-block", background: B.teal, color: B.navy, fontWeight: 800, fontSize: 50, padding: "6px 22px", borderRadius: 12 }}>1 KLIK</div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 44,
        bottom: 36,
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
    {logo && <Img src={staticFile(logo)} style={{ position: "absolute", right: 24, bottom: 20, width: 110, height: 110 }} />}
  </AbsoluteFill>
);
