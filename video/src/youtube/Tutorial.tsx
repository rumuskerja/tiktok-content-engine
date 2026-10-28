import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import type { Beat, Cell, Sheet, Tutorial as TutorialProps, Value } from "./types";

export const B = {
  navy: "#0F1C2E",
  navy2: "#16294A",
  teal: "#2EC4B6",
  yellow: "#FFC857",
  white: "#F5F7FA",
  red: "#E5585B",
  green: "#3DDC84",
  grid: "#D9DEE5",
  sheetBg: "#FFFFFF",
  ink: "#1F2937",
};
export const font = "'Plus Jakarta Sans', sans-serif";
export const mono = "'DejaVu Sans Mono', 'Menlo', 'Consolas', monospace";

const W = 1920;
const H = 1080;
const TITLE_H = 48;
const RIBBON_H = 64;
const FBAR_H = 76;
const TABS_H = 46;
const GRID_TOP = TITLE_H + RIBBON_H + FBAR_H;
const VW = W;
const VH = H - GRID_TOP - TABS_H;
const ROWHEAD_W = 64;
const COLHEAD_H = 40;
const ROW_H = 46;
const EXTRA_COL_W = 150;
const N_COLS = 12;
const N_ROWS = 32;
const CAPTION_SPACE = 150; // the caption covers the bottom of the grid

// ---------- addresses ----------

const colIndex = (letters: string) => letters.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
const colLetter = (i: number) => String.fromCharCode(65 + i);

const parseCell = (a: string) => {
  const m = /^([A-Z]+)(\d+)$/.exec(a);
  if (!m) throw new Error(`Bad cell ${a}`);
  return { c: colIndex(m[1]), r: Number(m[2]) - 1 };
};

const parseRange = (a: string) => {
  const [p, q = p] = a.split(":");
  const s = parseCell(p);
  const e = parseCell(q);
  return { c1: Math.min(s.c, e.c), r1: Math.min(s.r, e.r), c2: Math.max(s.c, e.c), r2: Math.max(s.r, e.r) };
};

const widthOf = (sheet: Sheet, c: number) => sheet.widths[c] ?? EXTRA_COL_W;
const colX = (sheet: Sheet, c: number) => {
  let x = ROWHEAD_W;
  for (let i = 0; i < c; i++) x += widthOf(sheet, i);
  return x;
};

const rangeRect = (sheet: Sheet, range: string) => {
  const { c1, r1, c2, r2 } = parseRange(range);
  const x = colX(sheet, c1);
  return { x, y: COLHEAD_H + r1 * ROW_H, w: colX(sheet, c2 + 1) - x, h: (r2 - r1 + 1) * ROW_H };
};

// ---------- timeline ----------

type Sticky = { sheet: string; focus: string; active: string; step: string };
type Timed = { beat: Beat; from: number; frames: number; sticky: Sticky; typedFrom: number };

const buildTimeline = (t: TutorialProps): Timed[] => {
  let from = 0;
  let sticky: Sticky = { sheet: t.sheets[0].name, focus: "A1:G15", active: "A1", step: "" };
  let lastType: { cell: string; len: number } | null = null;
  return t.beats.map((beat) => {
    sticky = {
      sheet: beat.sheet ?? sticky.sheet,
      focus: beat.focus ?? sticky.focus,
      active: beat.type?.cell ?? beat.active ?? sticky.active,
      step: beat.card?.step ?? sticky.step,
    };
    const typedFrom = beat.type?.cont && lastType?.cell === beat.type.cell ? lastType.len : 0;
    if (beat.type) lastType = { cell: beat.type.cell, len: beat.type.text.length };
    const frames = Math.round(beat.sec * t.fps);
    const item = { beat, from, frames, sticky, typedFrom };
    from += frames;
    return item;
  });
};

export const tutorialFrames = (t: TutorialProps) => buildTimeline(t).reduce((n, b) => n + b.frames, 0);

type Book = Map<string, Cell>;
const key = (sheet: string, addr: string) => `${sheet}!${addr}`;

const initialBook = (sheets: Sheet[]): Book => {
  const book: Book = new Map();
  for (const s of sheets)
    s.rows.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v !== null) book.set(key(s.name, `${colLetter(c)}${r + 1}`), { v });
      }),
    );
  return book;
};

const setEntries = (t: Timed) =>
  Object.entries(t.beat.set ?? {}).map(([addr, cell]) =>
    addr.includes("!") ? ([addr, cell] as const) : ([key(t.sticky.sheet, addr), cell] as const),
  );

// When in its beat (0..1) each `set` entry lands.
const setTimes = (t: Timed) => {
  const entries = setEntries(t);
  return entries.map((_, i) => (t.beat.type ? 0.72 : t.beat.cascade ? 0.1 + (0.7 * i) / Math.max(1, entries.length) : 0));
};

const TYPE_START = 0.06;
const TYPE_END = 0.62;

// ---------- formatting ----------

const fmt = (v: Value, money: boolean) => {
  if (v === null) return "";
  if (typeof v === "number") return money || Math.abs(v) >= 1000 ? v.toLocaleString("id-ID") : String(v);
  return v;
};

// ---------- pieces ----------

const TitleBar: React.FC<{ file: string; channel: string }> = ({ file, channel }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: W,
      height: TITLE_H,
      background: "#1D6F42",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      fontWeight: 500,
    }}
  >
    <div style={{ position: "absolute", left: 24, fontWeight: 800, letterSpacing: 1 }}>{channel}</div>
    {file} · Excel
  </div>
);

const Ribbon: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: TITLE_H,
      left: 0,
      width: W,
      height: RIBBON_H,
      background: "#F3F4F6",
      borderBottom: `1px solid ${B.grid}`,
      display: "flex",
      alignItems: "center",
      gap: 38,
      paddingLeft: 28,
      fontSize: 21,
      color: B.ink,
    }}
  >
    {["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View"].map((tab) => (
      <div
        key={tab}
        style={{
          fontWeight: tab === "Formulas" ? 800 : 500,
          color: tab === "Formulas" ? "#1D6F42" : B.ink,
          borderBottom: tab === "Formulas" ? "3px solid #1D6F42" : "3px solid transparent",
          paddingBottom: 4,
        }}
      >
        {tab}
      </div>
    ))}
  </div>
);

const FormulaBar: React.FC<{ active: string; text: string; typing: boolean; frame: number }> = ({
  active,
  text,
  typing,
  frame,
}) => (
  <div
    style={{
      position: "absolute",
      top: TITLE_H + RIBBON_H,
      left: 0,
      width: W,
      height: FBAR_H,
      background: "white",
      borderBottom: `2px solid ${B.grid}`,
      display: "flex",
      alignItems: "center",
      fontSize: 30,
      color: B.ink,
    }}
  >
    <div
      style={{
        width: 150,
        height: 50,
        marginLeft: 16,
        border: `1px solid ${B.grid}`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 26,
      }}
    >
      {active}
    </div>
    <div style={{ margin: "0 22px", fontStyle: "italic", color: "#6B7280", fontFamily: "serif", fontSize: 30 }}>fx</div>
    <div style={{ fontFamily: mono, fontSize: 32, whiteSpace: "pre" }}>
      {text}
      {typing && <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1, color: "#1D6F42" }}>|</span>}
    </div>
  </div>
);

const SheetTabs: React.FC<{ sheets: Sheet[]; current: string }> = ({ sheets, current }) => (
  <div
    style={{
      position: "absolute",
      top: H - TABS_H,
      left: 0,
      width: W,
      height: TABS_H,
      background: "#F3F4F6",
      borderTop: `1px solid ${B.grid}`,
      display: "flex",
      alignItems: "stretch",
      paddingLeft: 90,
      fontSize: 20,
    }}
  >
    {sheets
      .filter((s) => !s.hidden)
      .map((s) => (
        <div
          key={s.name}
          style={{
            padding: "0 26px",
            display: "flex",
            alignItems: "center",
            background: s.name === current ? "white" : "transparent",
            color: s.name === current ? "#1D6F42" : "#4B5563",
            fontWeight: s.name === current ? 800 : 500,
            borderBottom: s.name === current ? "4px solid #1D6F42" : "4px solid transparent",
          }}
        >
          {s.name}
        </div>
      ))}
  </div>
);

const Grid: React.FC<{
  sheet: Sheet;
  book: Book;
  active: string;
  typed: string | null;
}> = ({ sheet, book, active, typed }) => {
  const act = parseCell(active);
  const cells: React.ReactNode[] = [];
  for (let c = 0; c < N_COLS; c++) {
    const x = colX(sheet, c);
    cells.push(
      <div
        key={`h${c}`}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: widthOf(sheet, c),
          height: COLHEAD_H,
          background: c === act.c ? "#D1E7DD" : "#F3F4F6",
          borderRight: `1px solid ${B.grid}`,
          borderBottom: `1px solid ${B.grid}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color: "#4B5563",
        }}
      >
        {colLetter(c)}
      </div>,
    );
  }
  for (let r = 0; r < N_ROWS; r++) {
    const y = COLHEAD_H + r * ROW_H;
    cells.push(
      <div
        key={`r${r}`}
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width: ROWHEAD_W,
          height: ROW_H,
          background: r === act.r ? "#D1E7DD" : "#F3F4F6",
          borderRight: `1px solid ${B.grid}`,
          borderBottom: `1px solid ${B.grid}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color: "#4B5563",
        }}
      >
        {r + 1}
      </div>,
    );
    for (let c = 0; c < N_COLS; c++) {
      const addr = `${colLetter(c)}${r + 1}`;
      const cell = book.get(key(sheet.name, addr));
      const header = r === 0 && c < sheet.widths.length;
      const isNum = typeof cell?.v === "number";
      cells.push(
        <div
          key={addr}
          style={{
            position: "absolute",
            left: colX(sheet, c),
            top: y,
            width: widthOf(sheet, c),
            height: ROW_H,
            borderRight: `1px solid ${B.grid}`,
            borderBottom: `1px solid ${B.grid}`,
            background: header ? "#E6F7F5" : B.sheetBg,
            display: "flex",
            alignItems: "center",
            justifyContent: isNum ? "flex-end" : "flex-start",
            padding: "0 12px",
            fontSize: 24,
            fontWeight: header ? 800 : 500,
            color: cell?.error ? B.red : B.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {fmt(cell?.v ?? null, sheet.money?.includes(c) ?? false)}
        </div>,
      );
    }
  }
  const a = rangeRect(sheet, active);
  return (
    <>
      {cells}
      {typed !== null && (
        <div
          style={{
            position: "absolute",
            left: a.x,
            top: a.y,
            minWidth: a.w,
            height: a.h,
            background: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            fontFamily: mono,
            fontSize: 22,
            whiteSpace: "pre",
            color: B.ink,
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            border: "3px solid #1D6F42",
            zIndex: 5,
          }}
        >
          {typed}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: a.x - 2,
          top: a.y - 2,
          width: a.w + 4,
          height: a.h + 4,
          border: "3px solid #1D6F42",
          zIndex: 3,
        }}
      />
    </>
  );
};

const Box: React.FC<{ sheet: Sheet; range: string; color: string; local: number }> = ({ sheet, range, color, local }) => {
  const r = rangeRect(sheet, range);
  const o = interpolate(local, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(local / 6) * 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - 6,
        top: r.y - 6,
        width: r.w + 12,
        height: r.h + 12,
        border: `5px solid ${color}`,
        borderRadius: 8,
        background: `${color}22`,
        boxShadow: `0 0 ${24 * pulse}px ${color}`,
        opacity: o,
        zIndex: 4,
      }}
    />
  );
};

const camera = (sheet: Sheet, focus: string) => {
  const r = rangeRect(sheet, focus);
  const availH = VH - CAPTION_SPACE;
  const s = Math.max(1, Math.min(2.3, (VW * 0.9) / r.w, (availH * 0.88) / r.h));
  const tx = Math.min(0, VW / 2 - (r.x + r.w / 2) * s);
  const ty = Math.min(0, availH / 2 - (r.y + r.h / 2) * s);
  return { s, tx, ty };
};

const Caption: React.FC<{ text: string; local: number; fps: number }> = ({ text, local, fps }) => {
  const pop = spring({ frame: local, fps, config: { damping: 18, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        bottom: TABS_H + 34,
        display: "flex",
        justifyContent: "center",
        zIndex: 20,
        opacity: pop,
        transform: `translateY(${(1 - pop) * 20}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(15,28,46,0.92)",
          color: B.white,
          fontSize: 46,
          fontWeight: 800,
          lineHeight: 1.25,
          padding: "16px 34px",
          borderRadius: 18,
          textAlign: "center",
          borderBottom: `5px solid ${B.teal}`,
          maxWidth: 1500,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const PartsCard: React.FC<{ parts: NonNullable<Beat["parts"]>; local: number; fps: number }> = ({ parts, local, fps }) => {
  const enter = spring({ frame: local, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        bottom: TABS_H + 170,
        left: 0,
        width: W,
        display: "flex",
        justifyContent: "center",
        zIndex: 15,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 30}px)`,
      }}
    >
      <div
        style={{
          background: B.navy,
          borderRadius: 22,
          padding: "30px 40px",
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {parts.map((p, i) => {
          const shown = interpolate(local, [8 + i * 8, 16 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 40, color: p.color ?? B.white, fontWeight: 800, whiteSpace: "pre" }}>
                {p.text}
              </div>
              {p.label && (
                <div
                  style={{
                    marginTop: 12,
                    opacity: shown,
                    fontSize: 22,
                    fontWeight: 800,
                    color: B.navy,
                    background: p.color ?? B.white,
                    padding: "4px 12px",
                    borderRadius: 8,
                    maxWidth: 260,
                    textAlign: "center",
                  }}
                >
                  {p.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StepLabel: React.FC<{ step: string; badge?: string; keycap?: string; local: number }> = ({ step, badge, keycap, local }) => (
  <div
    style={{
      position: "absolute",
      top: TITLE_H + RIBBON_H + 12,
      right: 30,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 14,
      zIndex: 16,
    }}
  >
    {step && (
      <div style={{ background: B.navy, color: B.yellow, fontWeight: 800, fontSize: 26, padding: "10px 20px", borderRadius: 12 }}>
        {step}
      </div>
    )}
    {keycap && (
      <div
        style={{
          background: "white",
          color: B.ink,
          fontWeight: 800,
          fontSize: 30,
          padding: "12px 24px",
          borderRadius: 12,
          border: "2px solid #9CA3AF",
          boxShadow: "0 6px 0 #9CA3AF",
          transform: `translateY(${local % 30 < 6 ? 4 : 0}px)`,
        }}
      >
        ⌨ {keycap}
      </div>
    )}
    {badge && (
      <div style={{ background: B.yellow, color: B.navy, fontWeight: 800, fontSize: 24, padding: "8px 16px", borderRadius: 10 }}>
        {badge}
      </div>
    )}
  </div>
);

const CardView: React.FC<{ card: NonNullable<Beat["card"]>; local: number; frames: number; fps: number; logo?: string | null }> = ({
  card,
  local,
  frames,
  fps,
  logo,
}) => {
  const enter = spring({ frame: local, fps, config: { damping: 15, stiffness: 120 } });
  const exit = interpolate(local, [frames - 8, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = card.kind === "hook" ? 120 : card.kind === "chapter" ? 96 : 76;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, ${B.navy2} 0%, ${B.navy} 70%)`,
        opacity: card.kind === "hook" ? 1 : Math.min(1, enter * 1.5) * exit,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 30,
        fontFamily: font,
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${0.92 + enter * 0.08})`, opacity: enter, padding: "0 140px" }}>
        {card.step && (
          <div
            style={{
              display: "inline-block",
              background: B.teal,
              color: B.navy,
              fontWeight: 800,
              fontSize: 34,
              letterSpacing: 2,
              padding: "10px 26px",
              borderRadius: 14,
              marginBottom: 34,
            }}
          >
            {card.step.toUpperCase()}
          </div>
        )}
        <div style={{ color: B.white, fontSize: big, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>{card.title}</div>
        {card.sub && (
          <div
            style={{
              marginTop: 36,
              color: card.kind === "recap" ? B.yellow : "rgba(245,247,250,0.8)",
              fontSize: card.kind === "recap" ? 50 : 42,
              fontFamily: card.kind === "recap" ? mono : font,
              fontWeight: card.kind === "recap" ? 800 : 500,
              lineHeight: 1.4,
              whiteSpace: "pre-line",
            }}
          >
            {card.sub}
          </div>
        )}
        {card.kind === "end" && logo && <Img src={staticFile(logo)} style={{ width: 200, height: 200, marginTop: 50 }} />}
      </div>
    </AbsoluteFill>
  );
};

// No narration, so short sounds mark each new step, result and transition.
const Sfx: React.FC<{ timeline: Timed[]; sfx: NonNullable<TutorialProps["sfx"]> }> = ({ timeline, sfx }) => (
  <>
    {timeline.map((b, i) => {
      const cues: { at: number; src: string; vol: number }[] = [];
      if (b.beat.card) cues.push({ at: b.from, src: sfx.whoosh, vol: 0.5 });
      else if (b.beat.caption) cues.push({ at: b.from, src: sfx.pop, vol: 0.35 });
      if (b.beat.type && b.beat.set) cues.push({ at: b.from + Math.round(b.frames * 0.72), src: sfx.pop, vol: 0.6 });
      return cues.map((c, j) => (
        <Sequence key={`${i}-${j}`} from={c.at} durationInFrames={20}>
          <Audio src={staticFile(c.src)} volume={c.vol} />
        </Sequence>
      ));
    })}
  </>
);

// ---------- main ----------

export const Tutorial: React.FC<TutorialProps> = (t) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = buildTimeline(t);
  const idx = Math.max(0, timeline.findIndex((b) => frame >= b.from && frame < b.from + b.frames));
  const cur = timeline[idx];
  const local = frame - cur.from;
  const frac = local / cur.frames;

  // Workbook as of this frame.
  const book = initialBook(t.sheets);
  for (let i = 0; i <= idx; i++) {
    const times = setTimes(timeline[i]);
    setEntries(timeline[i]).forEach(([k, cell], j) => {
      if (i < idx || frac >= times[j]) book.set(k, cell);
    });
  }

  const sheet = t.sheets.find((s) => s.name === cur.sticky.sheet) ?? t.sheets[0];

  // Typing in progress (or a partial formula left by an earlier `cont` beat).
  let typed: string | null = null;
  let typing = false;
  const ty = cur.beat.type;
  if (ty) {
    const p = interpolate(frac, [TYPE_START, TYPE_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const n = Math.round(cur.typedFrom + (ty.text.length - cur.typedFrom) * p);
    const landed = cur.beat.set && frac >= 0.72;
    if (!landed) {
      typed = ty.text.slice(0, n);
      typing = p < 1;
    }
  }
  const activeCell = book.get(key(sheet.name, cur.sticky.active));
  const barText = typed ?? activeCell?.f ?? (activeCell ? fmt(activeCell.v, false) : "");

  // Camera eases from the previous beat's framing.
  const prev = timeline[idx - 1];
  const target = camera(sheet, cur.sticky.focus);
  const sameSheet = prev && prev.sticky.sheet === cur.sticky.sheet;
  const from = sameSheet ? camera(sheet, prev.sticky.focus) : target;
  const e = interpolate(local, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ease = 1 - Math.pow(1 - e, 3);
  const cam = {
    s: from.s + (target.s - from.s) * ease,
    tx: from.tx + (target.tx - from.tx) * ease,
    ty: from.ty + (target.ty - from.ty) * ease,
  };

  const musicVol = interpolate(frame, [0, 30, durationInFrames - 90, durationInFrames], [0, 0.22, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "white", fontFamily: font }}>
      <TitleBar file={`${t.id}.xlsx`} channel={t.channel} />
      <Ribbon />
      <FormulaBar active={cur.sticky.active} text={String(barText)} typing={typing} frame={frame} />
      <div style={{ position: "absolute", top: GRID_TOP, left: 0, width: VW, height: VH, overflow: "hidden", background: "white" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`,
          }}
        >
          <Grid sheet={sheet} book={book} active={cur.sticky.active} typed={typed} />
          {cur.beat.highlight && <Box sheet={sheet} range={cur.beat.highlight} color={B.teal} local={local} />}
          {cur.beat.bad && <Box sheet={sheet} range={cur.beat.bad} color={B.red} local={local} />}
          {cur.beat.good && <Box sheet={sheet} range={cur.beat.good} color={B.green} local={local} />}
        </div>
      </div>
      <SheetTabs sheets={t.sheets} current={sheet.tabAs ?? sheet.name} />
      {!cur.beat.card && <StepLabel step={cur.sticky.step} badge={cur.beat.badge} keycap={cur.beat.key} local={local} />}
      {cur.beat.parts && <PartsCard parts={cur.beat.parts} local={local} fps={fps} />}
      {cur.beat.caption && !cur.beat.card && <Caption key={idx} text={cur.beat.caption} local={local} fps={fps} />}
      {cur.beat.card && <CardView card={cur.beat.card} local={local} frames={cur.frames} fps={fps} logo={t.logo} />}
      {t.logo && !cur.beat.card && (
        <Img
          src={staticFile(t.logo)}
          style={{ position: "absolute", right: 24, bottom: TABS_H + 24, width: 84, height: 84, opacity: 0.9, zIndex: 18 }}
        />
      )}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${(frame / durationInFrames) * 100}%`, background: B.teal, zIndex: 40 }} />
      {t.music && <Audio src={staticFile(t.music)} volume={musicVol} loop />}
      {t.sfx && <Sfx timeline={timeline} sfx={t.sfx} />}
    </AbsoluteFill>
  );
};
