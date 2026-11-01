// The L&D dashboard as a video view: mirrors the Dashboard sheet of
// youtube/latihan/LnD-dashboard.xlsx, computed from the same rows, so every
// filter change in the video shows the numbers Excel would show.
import { interpolate, spring } from "remotion";
import { B, font } from "./theme";
import type { DashEl, DashState } from "./types";
import { agg, LISTS, type Agg } from "./lnd";

const CANVAS = "#EEF2F7";
const MUTED = "#6B7280";
const INK = "#1F2937";

type Rect = { x: number; y: number; w: number; h: number };

export const dashLayout = (W: number, H: number, compact: boolean): Record<string, Rect> => {
  if (!compact) {
    const cy = 342;
    const ch = Math.min(470, H - cy - 130); // room for the caption under the charts
    const L: Record<string, Rect> = {
      header: { x: 0, y: 0, w: W, h: 84 },
      dept: { x: 40, y: 118, w: 300, h: 50 },
      metode: { x: 370, y: 118, w: 300, h: 50 },
      insight: { x: 700, y: 118, w: 1180, h: 50 },
      trend: { x: 40, y: cy, w: 760, h: ch },
      program: { x: 824, y: cy, w: 560, h: ch },
      status: { x: 1408, y: cy, w: 472, h: ch },
    };
    L.filters = { x: 40, y: 92, w: 630, h: 78 };
    for (let i = 0; i < 4; i++) L[`kpi${i}`] = { x: 40 + i * 466, y: 188, w: 442, h: 136 };
    L.kpi = { x: 40, y: 188, w: 1840, h: 136 };
    return L;
  }
  const L: Record<string, Rect> = {
    header: { x: 0, y: 0, w: W, h: 90 },
    dept: { x: 24, y: 124, w: 330, h: 50 },
    metode: { x: 372, y: 124, w: 330, h: 50 },
    insight: { x: 24, y: 192, w: 1032, h: 48 },
    trend: { x: 24, y: 532, w: 508, h: H - 546 },
    program: { x: 548, y: 532, w: 508, h: H - 546 },
    status: { x: 548, y: 532, w: 508, h: H - 546 },
  };
  L.filters = { x: 24, y: 100, w: 678, h: 76 };
  for (let i = 0; i < 4; i++) L[`kpi${i}`] = { x: 24 + (i % 2) * 524, y: 256 + Math.floor(i / 2) * 134, w: 508, h: 120 };
  L.kpi = { x: 24, y: 256, w: 1032, h: 254 };
  return L;
};

const itemH = (compact: boolean) => (compact ? 42 : 44);

// Rect of an element id, including dropdown items like "dept:3".
export const dashRect = (id: string, L: Record<string, Rect>, compact: boolean): Rect => {
  const [base, idx] = id.split(":");
  const r = L[base] ?? L.header;
  if (idx === undefined) return r;
  return { x: r.x, y: r.y + r.h + 4 + Number(idx) * itemH(compact), w: r.w, h: itemH(compact) };
};

const ease = (local: number, len = 18) => {
  const e = interpolate(local, [0, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return 1 - Math.pow(1 - e, 3);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const num = (v: number, d = 0) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

// Tween every number between two aggregates.
const tween = (a: Agg, b: Agg, t: number): Agg => ({
  ...b,
  peserta: mix(a.peserta, b.peserta, t),
  selesai: mix(a.selesai, b.selesai, t),
  rate: mix(a.rate, b.rate, t),
  naik: mix(a.naik, b.naik, t),
  kepuasan: mix(a.kepuasan, b.kepuasan, t),
  jam: mix(a.jam, b.jam, t),
  biaya: mix(a.biaya, b.biaya, t),
  program: b.program.map((p, i) => ({ ...p, rate: mix(a.program[i].rate, p.rate, t), peserta: mix(a.program[i].peserta, p.peserta, t) })),
  bulan: b.bulan.map((m, i) => ({ ...m, peserta: mix(a.bulan[i].peserta, m.peserta, t), rate: mix(a.bulan[i].rate, m.rate, t) })),
  status: b.status.map((s, i) => ({ ...s, n: mix(a.status[i].n, s.n, t) })),
  bestRate: mix(a.bestRate, b.bestRate, t),
});

const Panel: React.FC<{ r: Rect; o: number; title?: string; k: number; children?: React.ReactNode }> = ({ r, o, title, k, children }) => (
  <div
    style={{
      position: "absolute",
      left: r.x,
      top: r.y,
      width: r.w,
      height: r.h,
      background: "white",
      borderTop: `5px solid ${B.teal}`,
      borderRadius: 6,
      boxShadow: "0 6px 18px rgba(15,28,46,0.08)",
      opacity: o,
      transform: `translateY(${(1 - o) * 30}px)`,
      overflow: "hidden",
    }}
  >
    {title && <div style={{ position: "absolute", left: 0, right: 0, top: 14 * k, textAlign: "center", fontSize: 24 * k, fontWeight: 800, color: INK }}>{title}</div>}
    {children}
  </div>
);

const Trend: React.FC<{ a: Agg; r: Rect; grow: number; k: number }> = ({ a, r, grow, k }) => {
  const pad = { l: 56 * k, r: 64 * k, t: 64 * k, b: 74 * k };
  const pw = r.w - pad.l - pad.r;
  const ph = r.h - 5 - pad.t - pad.b;
  const max = Math.max(10, Math.ceil(Math.max(...a.bulan.map((m) => m.peserta)) / 10) * 10);
  const n = a.bulan.length;
  const slot = pw / n;
  const bw = slot * 0.62;
  const pts = a.bulan.map((m, i) => [pad.l + slot * (i + 0.5), pad.t + ph * (1 - m.rate * grow)] as const);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width={r.w} height={r.h - 5} style={{ position: "absolute", left: 0, top: 0 }}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <text x={pad.l - 10} y={pad.t + ph * (1 - f) + 6} fontSize={17 * k} fill={MUTED} textAnchor="end">
            {Math.round(max * f)}
          </text>
          <text x={pad.l + pw + 10} y={pad.t + ph * (1 - f) + 6} fontSize={17 * k} fill={MUTED}>
            {Math.round(f * 100)}%
          </text>
        </g>
      ))}
      <line x1={pad.l} x2={pad.l + pw} y1={pad.t + ph} y2={pad.t + ph} stroke="#D9DEE5" strokeWidth={2} />
      {a.bulan.map((m, i) => {
        const h = (m.peserta / max) * ph * grow;
        return (
          <g key={m.bulan}>
            <rect x={pad.l + slot * i + (slot - bw) / 2} y={pad.t + ph - h} width={bw} height={h} rx={3} fill={B.teal} />
            <text x={pad.l + slot * (i + 0.5)} y={pad.t + ph + 26 * k} fontSize={17 * k} fill={MUTED} textAnchor="middle">
              {m.bulan}
            </text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke={B.yellow} strokeWidth={5 * k} strokeLinejoin="round" opacity={grow} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={6 * k} fill={B.yellow} opacity={grow} />
      ))}
      <g transform={`translate(${r.w / 2 - 130 * k}, ${r.h - 30 * k})`} fontSize={18 * k} fill={MUTED}>
        <rect x={0} y={-14 * k} width={22 * k} height={14 * k} fill={B.teal} />
        <text x={30 * k} y={0}>Peserta</text>
        <line x1={130 * k} x2={156 * k} y1={-7 * k} y2={-7 * k} stroke={B.yellow} strokeWidth={5 * k} />
        <text x={164 * k} y={0}>Completion</text>
      </g>
    </svg>
  );
};

const Program: React.FC<{ a: Agg; r: Rect; grow: number; k: number; compact: boolean }> = ({ a, r, grow, k, compact }) => {
  const top = 70 * k;
  const labelW = compact ? 150 : 200;
  const rowH = (r.h - 5 - top - 20) / a.program.length;
  const maxW = r.w - labelW - 80 * k - 20;
  return (
    <div style={{ position: "absolute", left: 0, top, width: r.w }}>
      {a.program.map((p) => (
        <div key={p.program} style={{ height: rowH, display: "flex", alignItems: "center" }}>
          <div style={{ width: labelW, textAlign: "right", paddingRight: 14, fontSize: (compact ? 16 : 18) * k, color: MUTED, lineHeight: 1.1 }}>{p.program}</div>
          <div style={{ width: maxW * p.rate * grow, height: rowH * 0.62, background: B.navy2, borderRadius: 4 }} />
          <div style={{ marginLeft: 10, fontSize: 19 * k, fontWeight: 800, color: INK, opacity: grow }}>{Math.round(p.rate * 100)}%</div>
        </div>
      ))}
    </div>
  );
};

const Status: React.FC<{ a: Agg; r: Rect; grow: number; k: number }> = ({ a, r, grow, k }) => {
  const total = a.status.reduce((s, x) => s + x.n, 0) || 1;
  const cx = r.w / 2;
  const cy = 70 * k + (r.h - 70 * k - 90 * k) / 2;
  const R = Math.min(r.w * 0.36, (r.h - 70 * k - 100 * k) / 2);
  const colors = [B.teal, B.yellow, B.red];
  let acc = -Math.PI / 2;
  const arcs = a.status.map((s, i) => {
    const ang = (s.n / total) * Math.PI * 2 * grow;
    const a0 = acc;
    acc += ang;
    const large = ang > Math.PI ? 1 : 0;
    const p = (t: number) => [cx + R * Math.cos(t), cy + R * Math.sin(t)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a0 + Math.max(0.0001, ang - 0.0001));
    const mid = a0 + ang / 2;
    return (
      <g key={s.status}>
        <path d={`M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1}`} fill="none" stroke={colors[i]} strokeWidth={R * 0.42} />
        {s.n / total > 0.04 && (
          <text x={cx + R * 1.0 * Math.cos(mid)} y={cy + R * Math.sin(mid) + 7} fontSize={20 * k} fontWeight={800} fill={i === 0 ? "white" : B.navy} textAnchor="middle" opacity={grow}>
            {Math.round((s.n / total) * 100)}%
          </text>
        )}
      </g>
    );
  });
  return (
    <svg width={r.w} height={r.h - 5} style={{ position: "absolute", left: 0, top: 0 }}>
      {arcs}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={44 * k} fontWeight={800} fill={B.navy}>
        {num(a.status[0].n)}
      </text>
      <text x={cx} y={cy + 28 * k} textAnchor="middle" fontSize={17 * k} fill={MUTED}>
        selesai
      </text>
      <g transform={`translate(${r.w / 2 - 175 * k}, ${r.h - 34 * k})`} fontSize={18 * k} fill={INK}>
        {a.status.map((s, i) => (
          <g key={s.status} transform={`translate(${[0, 110, 225][i] * k}, 0)`}>
            <circle cx={0} cy={-6 * k} r={7 * k} fill={colors[i]} />
            <text x={14 * k} y={0}>{s.status}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

const Cursor: React.FC<{ x: number; y: number; click: number }> = ({ x, y, click }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 50, pointerEvents: "none" }}>
    {click > 0 && click < 1 && (
      <div
        style={{
          position: "absolute",
          left: -30 * click,
          top: -30 * click,
          width: 60 * click,
          height: 60 * click,
          borderRadius: "50%",
          border: `4px solid ${B.teal}`,
          opacity: 1 - click,
        }}
      />
    )}
    <svg width={40} height={48} viewBox="0 0 20 24" style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>
      <path d="M1 1 L1 19 L6 14.5 L9.5 22 L12.5 20.6 L9 13.2 L15.5 13.2 Z" fill="white" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  </div>
);

export const DashView: React.FC<{
  state: DashState;
  prev: DashState | null;
  local: number;
  frames: number;
  fps: number;
  W: number;
  H: number;
  compact: boolean;
}> = ({ state, prev, local, frames, fps, W, H, compact }) => {
  const k = 1;
  const L = dashLayout(W, H, compact);
  const t = ease(local);
  const prevAgg = agg(prev?.dept ?? state.dept, prev?.metode ?? state.metode);
  const a = tween(prevAgg, agg(state.dept, state.metode), t);
  const shown = (el: DashEl) => state.show.includes(el);
  const enter = (el: DashEl) => {
    if (!shown(el)) return 0;
    if (prev?.show.includes(el)) return 1;
    return spring({ frame: local, fps, config: { damping: 16, stiffness: 110 } });
  };
  const changed = prev && (prev.dept !== state.dept || prev.metode !== state.metode);
  const flash = changed ? interpolate(local, [0, 6, 22], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // camera: zoom eases in from wherever the previous beat framed
  const camOf = (z?: DashEl) => {
    if (!z) return { s: 1, tx: 0, ty: 0 };
    const r = L[z];
    const s = Math.min(2.2, (W * 0.92) / r.w, (H * 0.86) / r.h);
    return { s, tx: W / 2 - (r.x + r.w / 2) * s, ty: H / 2 - (r.y + r.h / 2) * s };
  };
  const c0 = camOf(prev?.zoom);
  const c1 = camOf(state.zoom);
  const ce = ease(local, 22);
  const cam = { s: mix(c0.s, c1.s, ce), tx: mix(c0.tx, c1.tx, ce), ty: mix(c0.ty, c1.ty, ce) };

  const kpis = [
    { label: "PESERTA", value: num(Math.round(a.peserta)), foot: `dari ${num(Math.round(a.selesai))} yang selesai` },
    { label: "COMPLETION RATE", value: `${Math.round(a.rate * 100)}%`, foot: `${num(Math.round(a.jam))} jam belajar` },
    { label: "KENAIKAN SKOR", value: `+${num(a.naik, 1)}`, foot: "poin, post-test vs pre-test" },
    { label: "KEPUASAN", value: `${num(a.kepuasan, 1)} / 5`, foot: `Biaya Rp ${num(a.biaya / 1e6, 1)} jt` },
  ];

  const filterBox = (id: "dept" | "metode", label: string, value: string) => {
    const r = L[id];
    const o = enter("filters");
    const isOpen = state.open === id;
    return (
      <div key={id} style={{ opacity: o }}>
        {!compact || id === "dept" || id === "metode" ? (
          <div style={{ position: "absolute", left: r.x, top: r.y - 26 * k, fontSize: 16 * k, fontWeight: 800, color: MUTED, letterSpacing: 1 }}>{label}</div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            background: "white",
            border: `2px solid ${B.teal}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            boxSizing: "border-box",
            fontSize: 24 * k,
            fontWeight: 800,
            color: B.navy,
            boxShadow: changed && (prev?.[id] !== state[id]) ? `0 0 ${30 * flash}px ${B.teal}` : "none",
          }}
        >
          {value}
          <span style={{ color: B.teal, fontSize: 20 * k }}>▼</span>
        </div>
        {isOpen && (
          <div style={{ position: "absolute", left: r.x, top: r.y + r.h + 4, width: r.w, background: "white", border: "1px solid #CBD2DC", boxShadow: "0 12px 30px rgba(0,0,0,0.18)", zIndex: 40 }}>
            {LISTS[id].map((item, i) => {
              const hovered = state.cursor === `${id}:${i}` && local > frames * 0.45;
              return (
                <div key={item} style={{ height: itemH(compact), display: "flex", alignItems: "center", padding: "0 18px", fontSize: 22 * k, color: INK, background: hovered ? "#D7F3F0" : "white", fontWeight: hovered ? 800 : 500 }}>
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // cursor glides from the previous target (or the bottom right) to this one
  let cursor: React.ReactNode = null;
  if (state.cursor) {
    const r1 = dashRect(state.cursor, L, compact);
    const r0 = prev?.cursor ? dashRect(prev.cursor, L, compact) : { x: W * 0.8, y: H * 0.85, w: 0, h: 0 };
    const p = ease(local, Math.round(frames * 0.4));
    const x = mix(r0.x + r0.w * 0.6, r1.x + r1.w * 0.6, p);
    const y = mix(r0.y + r0.h * 0.5, r1.y + r1.h * 0.5, p);
    const click = interpolate(local, [frames * 0.5, frames * 0.5 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    cursor = <Cursor x={x} y={y} click={click} />;
  }

  const spot = state.spot ? L[state.spot] : null;
  const pulse = 1 + Math.sin(local / 6) * 0.15;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: CANVAS, overflow: "hidden", fontFamily: font }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
        {shown("header") && (
          <div style={{ position: "absolute", ...pos(L.header), background: B.navy, opacity: enter("header") }}>
            <div style={{ position: "absolute", left: compact ? 24 : 40, top: 10 * k, color: "white", fontSize: (compact ? 34 : 38) * k, fontWeight: 800 }}>
              Dashboard Learning & Development
            </div>
            <div style={{ position: "absolute", left: compact ? 24 : 40, top: 56 * k, color: "#A9B4C6", fontSize: 18 * k }}>Data training karyawan · Jan–Okt 2026</div>
          </div>
        )}
        {shown("filters") && filterBox("metode", "METODE", state.metode)}
        {shown("filters") && filterBox("dept", "DEPARTEMEN", state.dept)}
        {shown("insight") && (
          <div style={{ opacity: enter("insight") }}>
            {!compact && <div style={{ position: "absolute", left: L.insight.x, top: L.insight.y - 26, fontSize: 16, fontWeight: 800, color: MUTED, letterSpacing: 1 }}>INSIGHT</div>}
            <div
              style={{
                position: "absolute",
                ...pos(L.insight),
                background: "#FFF4D6",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                boxSizing: "border-box",
                fontSize: 22 * k,
                fontWeight: 800,
                color: B.navy,
              }}
            >
              <span style={{ color: "#E0A100", marginRight: 12 }}>★</span>Completion tertinggi: {a.best} ({Math.round(a.bestRate * 100)}%)
            </div>
          </div>
        )}
        {shown("kpi") &&
          kpis.map((kp, i) => {
            const r = L[`kpi${i}`];
            const prevShown = prev?.show.includes("kpi");
            const o = prevShown ? 1 : spring({ frame: local - i * 5, fps, config: { damping: 16, stiffness: 110 } });
            return (
              <Panel key={kp.label} r={r} o={o} k={k}>
                <div style={{ position: "absolute", left: 24 * k, top: 16 * k, fontSize: 16 * k, fontWeight: 800, color: MUTED, letterSpacing: 1 }}>{kp.label}</div>
                <div style={{ position: "absolute", left: 22 * k, top: 34 * k, fontSize: (compact ? 50 : 54) * k, fontWeight: 800, color: B.navy, letterSpacing: -1 }}>{kp.value}</div>
                <div style={{ position: "absolute", left: 24 * k, bottom: 12 * k, fontSize: 17 * k, fontWeight: 800, color: B.teal }}>{kp.foot}</div>
              </Panel>
            );
          })}
        {shown("trend") && (
          <Panel r={L.trend} o={enter("trend")} title={compact ? "Tren per bulan" : "Tren peserta & completion per bulan"} k={k}>
            <Trend a={a} r={L.trend} grow={enter("trend")} k={k} />
          </Panel>
        )}
        {shown("program") && (
          <Panel r={L.program} o={enter("program")} title="Completion per program" k={k}>
            <Program a={a} r={L.program} grow={enter("program")} k={k} compact={compact} />
          </Panel>
        )}
        {shown("status") && !compact && (
          <Panel r={L.status} o={enter("status")} title="Status peserta" k={k}>
            <Status a={a} r={L.status} grow={enter("status")} k={k} />
          </Panel>
        )}
        {spot && (
          <div
            style={{
              position: "absolute",
              left: spot.x - 10,
              top: spot.y - 10,
              width: spot.w + 20,
              height: spot.h + 20,
              border: `5px solid ${B.teal}`,
              borderRadius: 12,
              boxShadow: `0 0 ${26 * pulse}px ${B.teal}`,
              opacity: interpolate(local, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              zIndex: 30,
            }}
          />
        )}
        {cursor}
      </div>
    </div>
  );
};

const pos = (r: Rect) => ({ left: r.x, top: r.y, width: r.w, height: r.h });
