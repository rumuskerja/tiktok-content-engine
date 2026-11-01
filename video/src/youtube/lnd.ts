// LND · Dashboard Learning & Development interaktif (full tutorial + 3 spoiler Shorts)
// Data comes from lnd-data.json, written by youtube/scripts/build_lnd_dashboard.py
// together with youtube/latihan/LnD-dashboard.xlsx, so the video matches the file.
import data from "./lnd-data.json";
import type { Beat, Cell, DashState, Sheet, Tutorial } from "./types";
import { B } from "./theme";

type Row = (typeof data.rows)[number];
const ROWS: Row[] = data.rows;
const STATUS = ["Selesai", "Berjalan", "Tidak Hadir"];

export const LISTS = { dept: ["Semua", ...data.depts], metode: ["Semua", ...data.metode] };

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export type Agg = {
  peserta: number;
  selesai: number;
  rate: number;
  naik: number;
  kepuasan: number;
  jam: number;
  biaya: number;
  program: { program: string; peserta: number; selesai: number; rate: number; naik: number }[];
  bulan: { bulan: string; peserta: number; rate: number }[];
  status: { status: string; n: number }[];
  best: string;
  bestRate: number;
};

const cache = new Map<string, Agg>();
// Same maths as the Hitung sheet: COUNTIFS / AVERAGEIFS / SUMIFS with "*" for Semua.
export const agg = (dept: string, metode: string): Agg => {
  const id = `${dept}|${metode}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const rows = ROWS.filter((r) => (dept === "Semua" || r.dept === dept) && (metode === "Semua" || r.metode === metode));
  const done = rows.filter((r) => r.status === "Selesai");
  const program = data.program.map((p) => {
    const pr = rows.filter((r) => r.program === p);
    const pd = pr.filter((r) => r.status === "Selesai");
    return { program: p, peserta: pr.length, selesai: pd.length, rate: pr.length ? pd.length / pr.length : 0, naik: avg(pd.map((r) => r.naik ?? 0)) };
  });
  const bulan = data.bulan.map((b) => {
    const br = rows.filter((r) => r.bulan === b);
    return { bulan: b, peserta: br.length, rate: br.length ? br.filter((r) => r.status === "Selesai").length / br.length : 0 };
  });
  const bestRate = Math.max(...program.map((p) => p.rate));
  const out: Agg = {
    peserta: rows.length,
    selesai: done.length,
    rate: rows.length ? done.length / rows.length : 0,
    naik: avg(done.map((r) => r.naik ?? 0)),
    kepuasan: avg(done.map((r) => r.kepuasan ?? 0)),
    jam: done.reduce((s, r) => s + r.jam, 0),
    biaya: rows.reduce((s, r) => s + r.biaya, 0),
    program,
    bulan,
    status: STATUS.map((s) => ({ status: s, n: rows.filter((r) => r.status === s).length })),
    best: program.find((p) => p.rate === bestRate)?.program ?? "",
    bestRate,
  };
  cache.set(id, out);
  return out;
};

// ---------- sheets ----------

const DATA_HEAD = ["ID", "Tanggal", "Bulan", "Karyawan", "Departemen", "Program", "Metode", "Jam", "Biaya (Rp)", "Status", "Pre-test", "Post-test", "Kenaikan", "Kepuasan"];
const dataRows = ROWS.slice(0, 31).map((r) => {
  const d = new Date(r.tanggal);
  return [
    r.id,
    `${String(d.getDate()).padStart(2, "0")}-${data.bulan[d.getMonth()]}`,
    r.bulan,
    r.karyawan,
    r.dept,
    r.program,
    r.metode,
    r.jam,
    r.biaya,
    r.status,
    r.pre,
    r.post,
    r.naik,
    r.kepuasan === null ? null : r.kepuasan.toFixed(1).replace(".", ","),
  ];
});
const DATA_W = [140, 130, 110, 230, 195, 250, 135, 90, 165, 150, 130, 140, 140, 140];

const all = agg("Semua", "Semua");
const hitungRows: (string | number | null)[][] = Array.from({ length: 15 }, () => Array(18).fill(null));
const put = (addr: string, v: string | number | null) => {
  const c = addr.charCodeAt(0) - 65;
  const r = Number(addr.slice(1)) - 1;
  hitungRows[r][c] = v;
};
put("A1", "Kriteria");
put("B1", "Nilai");
put("A2", "Departemen");
put("A3", "Metode");
put("A5", "KPI");
put("B5", "Nilai");
["Peserta", "Selesai", "Completion rate", "Kenaikan skor", "Kepuasan", "Jam belajar", "Biaya"].forEach((k, i) => put(`A${6 + i}`, k));
["Program", "Peserta", "Selesai", "Completion", "Kenaikan"].forEach((h, i) => put(`${"DEFGH"[i]}1`, h));
data.program.forEach((p, i) => put(`D${2 + i}`, p));
["Bulan", "Peserta", "Completion"].forEach((h, i) => put(`${"JKL"[i]}1`, h));
data.bulan.forEach((b, i) => put(`J${2 + i}`, b));
put("N1", "Status");
put("O1", "Jumlah");
STATUS.forEach((s, i) => put(`N${2 + i}`, s));
put("Q1", "List Departemen");
put("R1", "List Metode");
LISTS.dept.forEach((d, i) => put(`Q${2 + i}`, d));
LISTS.metode.forEach((d, i) => put(`R${2 + i}`, d));
put("A15", "Program terbaik");

const dashRows: (string | null)[][] = Array.from({ length: 6 }, () => Array(12).fill(null));
dashRows[1][1] = "Dashboard Learning & Development";
dashRows[4][1] = "DEPARTEMEN";
dashRows[4][5] = "METODE";

export const sheets: Sheet[] = [
  { name: "Dashboard", plain: true, widths: [40, 150, 150, 150, 40, 150, 150, 150, 40, 150, 150, 150], rows: dashRows },
  { name: "Hitung", widths: [210, 170, 30, 290, 120, 120, 150, 130, 30, 100, 120, 150, 30, 160, 120, 30, 210, 170], rows: hitungRows },
  { name: "Data_Training", widths: DATA_W, money: [8], rows: [DATA_HEAD, ...dataRows] },
  { name: "Data_Training+", tabAs: "Data_Training", hidden: true, table: true, widths: DATA_W, money: [8], rows: [DATA_HEAD, ...dataRows] },
];

// ---------- formulas ----------

const F = "T_Training[Departemen],$B$2,T_Training[Metode],$B$3";
const crit = (cell: string) => `=IF(Dashboard!$${cell[0]}$${cell.slice(1)}="Semua","*",Dashboard!$${cell[0]}$${cell.slice(1)})`;
const fx = {
  b2: crit("B6"),
  b3: crit("F6"),
  b6: `=COUNTIFS(${F})`,
  b7: `=COUNTIFS(${F},T_Training[Status],"Selesai")`,
  b8: "=IFERROR(B7/B6,0)",
  b9: `=IFERROR(AVERAGEIFS(T_Training[Kenaikan],${F},T_Training[Status],"Selesai"),0)`,
  b10: `=IFERROR(AVERAGEIFS(T_Training[Kepuasan],${F},T_Training[Status],"Selesai"),0)`,
  b11: `=SUMIFS(T_Training[Jam],${F},T_Training[Status],"Selesai")`,
  b12: `=SUMIFS(T_Training[Biaya (Rp)],${F})`,
  e: (r: number) => `=COUNTIFS(${F},T_Training[Program],D${r})`,
  f: (r: number) => `=COUNTIFS(${F},T_Training[Program],D${r},T_Training[Status],"Selesai")`,
  g: (r: number) => `=IFERROR(F${r}/E${r},0)`,
  h: (r: number) => `=IFERROR(AVERAGEIFS(T_Training[Kenaikan],${F},T_Training[Program],D${r},T_Training[Status],"Selesai"),0)`,
  k: (r: number) => `=COUNTIFS(${F},T_Training[Bulan],J${r})`,
  l: (r: number) => `=IFERROR(COUNTIFS(${F},T_Training[Bulan],J${r},T_Training[Status],"Selesai")/K${r},0)`,
  o: (r: number) => `=COUNTIFS(${F},T_Training[Status],N${r})`,
  best: "=INDEX(D2:D7,MATCH(MAX(G2:G7),G2:G7,0))",
};

const programCells = (cols: string, from = 2): Record<string, Cell> => {
  const out: Record<string, Cell> = {};
  all.program.forEach((p, i) => {
    const r = 2 + i;
    if (r < from) return;
    if (cols.includes("E")) out[`E${r}`] = { v: p.peserta, f: fx.e(r) };
    if (cols.includes("F")) out[`F${r}`] = { v: p.selesai, f: fx.f(r) };
    if (cols.includes("G")) out[`G${r}`] = { v: p.rate, f: fx.g(r), fmt: "pct" };
    if (cols.includes("H")) out[`H${r}`] = { v: p.naik, f: fx.h(r), fmt: "plus1" };
  });
  return out;
};
const monthCells = (): Record<string, Cell> => {
  const out: Record<string, Cell> = {};
  all.bulan.forEach((m, i) => {
    out[`K${2 + i}`] = { v: m.peserta, f: fx.k(2 + i) };
    out[`L${2 + i}`] = { v: m.rate, f: fx.l(2 + i), fmt: "pct" };
  });
  return out;
};
const statusCells = (): Record<string, Cell> =>
  Object.fromEntries(all.status.map((s, i) => [`O${2 + i}`, { v: s.n, f: fx.o(2 + i) }]));

const DASH_ALL: DashState["show"] = ["header", "filters", "insight", "kpi", "trend", "program", "status"];
const full = (d: Partial<DashState> = {}): Partial<DashState> => ({ show: DASH_ALL, dept: "Semua", metode: "Semua", ...d });

// ---------- full tutorial ----------

const beats: Beat[] = [
  { sec: 2.5, card: { kind: "logo", title: "", sub: "Excel & slide buat kerja yang terus bertumbuh" } },
  { sec: 3.5, card: { kind: "hook", title: "Dashboard L&D yang langsung dipahami atasan.", sub: "360 baris data training → 1 halaman interaktif." } },
  { sec: 3.5, dash: full(), active: "B6", caption: "Hasil akhirnya kayak gini." },
  { sec: 3, dash: { open: "dept", cursor: "dept:5" }, caption: "Pilih departemen..." },
  { sec: 3.5, dash: { dept: "IT" }, caption: "...semua KPI dan chart langsung ikut berubah." },
  { sec: 3, dash: { open: "metode", cursor: "metode:1" }, caption: "Filter kedua: metode training." },
  { sec: 3.5, dash: { metode: "Online" }, caption: "IT + Online: completion-nya jauh lebih rendah. Ketahuan, kan?" },
  { sec: 3.5, dash: { dept: "Semua", metode: "Semua" }, card: { kind: "hook", title: "Kita bikin dari nol.", sub: "6 langkah · Excel 2010 ke atas · tanpa Pivot, tanpa macro" } },

  // 1 · Table
  { sec: 2.5, dash: null, card: { kind: "chapter", step: "Langkah 1/6", title: "Jadikan data sebuah Table" } },
  { sec: 4.5, sheet: "Data_Training", focus: "A1:G12", active: "A1", highlight: "A1:G12", caption: "Bahannya: 360 baris data training karyawan." },
  { sec: 4.5, focus: "E1:N12", highlight: "J1:N1", caption: "Ada status, skor pre/post-test, sampai kepuasan peserta." },
  {
    sec: 4.5,
    focus: "A1:G12",
    active: "C4",
    key: "Ctrl + T",
    dialog: { title: "Create Table", rows: [["Where is the data?", "=$A$1:$N$361"], ["☑", "My table has headers"]] },
    caption: "Klik sel mana aja di data, tekan Ctrl + T, OK.",
  },
  { sec: 4, sheet: "Data_Training+", caption: "Jadi Table: otomatis melebar kalau ada data baru." },
  { sec: 4.5, menu: "Table Design", nameBox: "T_Training", badge: "Table Design ▸ Table Name", caption: "Kasih nama T_Training. Rumus nanti gampang dibaca." },

  // 2 · Dropdown
  { sec: 2.5, card: { kind: "chapter", step: "Langkah 2/6", title: "Bikin dropdown filter" } },
  { sec: 4.5, sheet: "Hitung", focus: "Q1:R8", active: "Q2", highlight: "Q2:R2", caption: "Di sheet Hitung, siapkan daftar pilihan. Baris pertama: Semua." },
  { sec: 4.5, active: "Q2", nameBox: "ListDept", highlight: "Q2:Q8", caption: "Blok daftarnya, ketik nama ListDept di Name Box. Metode: ListMetode." },
  { sec: 4, sheet: "Dashboard", focus: "A1:H7", active: "B6", highlight: "B6", caption: "Pindah ke sheet Dashboard. Sel B6 buat filter Departemen." },
  {
    sec: 5.5,
    menu: "Data",
    dialog: { title: "Data Validation", rows: [["Allow:", "List"], ["Source:", "=ListDept"]] },
    caption: "Data ▸ Data Validation ▸ List. Source: =ListDept",
  },
  { sec: 4, dropdown: { cell: "B6", items: LISTS.dept, pick: 0 }, set: { B6: { v: "Semua" } }, caption: "Dropdown jadi. Pilih Semua sebagai default." },
  {
    sec: 4.5,
    active: "F6",
    dropdown: { cell: "F6", items: LISTS.metode, pick: 0 },
    set: { F6: { v: "Semua" } },
    caption: "Ulangi di F6 untuk Metode, source =ListMetode.",
  },

  // 3 · "Semua"
  { sec: 2.5, card: { kind: "chapter", step: "Langkah 3/6", title: "Trik kriteria \"Semua\"" } },
  { sec: 4.5, sheet: "Hitung", focus: "A1:B3", active: "B2", highlight: "A2:A3", caption: "Masalah: COUNTIFS nggak kenal kata \"Semua\"." },
  { sec: 7, type: { cell: "B2", text: fx.b2 }, set: { B2: { v: "*", f: fx.b2 } }, caption: "Kalau pilihannya Semua, ganti jadi bintang *." },
  {
    sec: 6.5,
    parts: [
      { text: "=IF(" },
      { text: 'Dashboard!$B$6="Semua"', label: "kalau pilih Semua", color: B.teal },
      { text: "," },
      { text: '"*"', label: "* = cocok semua teks", color: B.yellow },
      { text: "," },
      { text: "Dashboard!$B$6", label: "selain itu: nama dept", color: B.white },
      { text: ")" },
    ],
    caption: "Bintang itu wildcard: artinya \"apa aja\".",
  },
  { sec: 5, type: { cell: "B3", text: fx.b3 }, set: { B3: { v: "*", f: fx.b3 } }, caption: "Sama untuk Metode, ambil dari F6." },

  // 4 · KPI
  { sec: 2.5, card: { kind: "chapter", step: "Langkah 4/6", title: "Rumus KPI" } },
  { sec: 7, focus: "A1:B12", type: { cell: "B6", text: fx.b6 }, set: { B6: { v: all.peserta, f: fx.b6 } }, caption: "Peserta: hitung baris yang cocok 2 kriteria." },
  {
    sec: 6.5,
    parts: [
      { text: "=COUNTIFS(" },
      { text: "T_Training[Departemen]", label: "kolom 1", color: B.white },
      { text: "," },
      { text: "$B$2", label: "kriteria dept", color: B.teal },
      { text: "," },
      { text: "T_Training[Metode]", label: "kolom 2", color: B.white },
      { text: "," },
      { text: "$B$3", label: "kriteria metode", color: B.yellow },
      { text: ")" },
    ],
    caption: "Pasangan kolom + kriteria. Bintang bikin semua lolos.",
  },
  { sec: 6.5, type: { cell: "B7", text: fx.b7 }, set: { B7: { v: all.selesai, f: fx.b7 } }, caption: "Selesai: tambah kriteria ke-3, Status = \"Selesai\"." },
  { sec: 5, type: { cell: "B8", text: fx.b8 }, set: { B8: { v: all.rate, f: fx.b8, fmt: "pct" } }, caption: "Completion rate = Selesai ÷ Peserta. Format persen." },
  { sec: 7, type: { cell: "B9", text: fx.b9 }, set: { B9: { v: all.naik, f: fx.b9, fmt: "plus1" } }, caption: "Kenaikan skor: AVERAGEIFS, cuma peserta yang selesai." },
  {
    sec: 4.5,
    set: {
      B10: { v: all.kepuasan, f: fx.b10, fmt: "dec1" },
      B11: { v: all.jam, f: fx.b11 },
      B12: { v: all.biaya, f: fx.b12 },
    },
    cascade: true,
    caption: "Kepuasan, jam belajar, biaya: pola rumusnya sama.",
  },
  { sec: 4, active: "B12", badge: "Checkpoint", good: "B6:B12", caption: `Cek: Peserta ${all.peserta}, completion ${Math.round(all.rate * 100)}%.` },

  // 5 · helper tables
  { sec: 2.5, card: { kind: "chapter", step: "Langkah 5/6", title: "Tabel bantu buat chart" } },
  { sec: 7, focus: "D1:H7", type: { cell: "E2", text: fx.e(2) }, set: { E2: { v: all.program[0].peserta, f: fx.e(2) } }, caption: "Per program: rumus yang sama + kriteria Program." },
  { sec: 4.5, set: programCells("EFGH", 3), cascade: true, key: "Double-click", caption: "Copy ke bawah. Lalu kolom Selesai, Completion, Skor." },
  { sec: 2.5, set: programCells("FGH", 2), good: "E2:H7", caption: "Tabel per program siap." },
  { sec: 5, focus: "J1:O11", set: { ...monthCells(), ...statusCells() }, cascade: true, caption: "Per bulan (kriteria Bulan) dan per status. Ini bahan chart." },
  { sec: 6.5, focus: "A1:H15", type: { cell: "B15", text: fx.best }, set: { B15: { v: all.best, f: fx.best } }, caption: "Bonus insight: program dengan completion tertinggi." },

  // 6 · design
  { sec: 2.5, card: { kind: "chapter", step: "Langkah 6/6", title: "Desain dashboard modern" } },
  { sec: 4.5, dash: { show: [], dept: "Semua", metode: "Semua" }, active: "B6", menu: "View", badge: "View ▸ Gridlines & Headings", caption: "Matikan Gridlines dan Headings. Kanvas jadi bersih." },
  { sec: 4, dash: { show: ["header"] }, caption: "Header navy: judul dan periode data." },
  { sec: 4.5, dash: { show: ["header", "filters", "insight"], spot: "insight" }, caption: "Dropdown dikasih border teal. Insight pakai rumus teks + B15." },
  { sec: 5, dash: { show: ["header", "filters", "insight", "kpi"], spot: "kpi" }, caption: "4 kartu KPI. Isinya cuma =Hitung!B6, =Hitung!B8, dst." },
  { sec: 6, dash: { show: ["header", "filters", "insight", "kpi", "trend"], zoom: "trend" }, menu: "Insert", badge: "Insert ▸ Combo Chart", caption: "Combo chart: Peserta (kolom) + Completion (garis, sumbu kanan)." },
  { sec: 5, dash: { show: ["header", "filters", "insight", "kpi", "trend", "program"], zoom: "program" }, menu: "Insert", caption: "Bar chart per program. Hapus gridline, tampilkan label %." },
  { sec: 4.5, dash: { show: DASH_ALL, zoom: "status" }, menu: "Insert", caption: "Doughnut buat status. Tiga warna, cukup." },
  { sec: 4.5, dash: { show: DASH_ALL }, badge: "Prinsip desain", caption: "Atas: angka. Bawah: cerita. Warna maksimal 3." },

  // demo
  { sec: 2.5, card: { kind: "chapter", step: "Demo", title: "Tes: dashboard-nya hidup" } },
  { sec: 3, dash: { open: "dept", cursor: "dept:3" }, caption: "Pilih Finance..." },
  { sec: 4, dash: { dept: "Finance" }, caption: "Semua angka update sendiri. Tanpa refresh." },
  { sec: 3, dash: { open: "metode", cursor: "metode:2" }, caption: "Tambah filter: Offline." },
  { sec: 4, dash: { metode: "Offline", spot: "insight" }, caption: "Insight program terbaik ikut ganti." },
  { sec: 3, dash: { open: "dept", cursor: "dept:4" }, caption: "Atasan minta lihat HR?" },
  { sec: 3.5, dash: { dept: "HR", metode: "Semua" }, caption: "Satu klik. Selesai." },
  { sec: 3, dash: { dept: "Semua" }, caption: "Balik ke Semua." },

  {
    sec: 7,
    card: {
      kind: "recap",
      title: "Rekap: simpan atau screenshot",
      sub: "Table → Dropdown → Kriteria \"*\"\n→ COUNTIFS / AVERAGEIFS → Tabel bantu → Desain",
    },
  },
  { sec: 14, card: { kind: "end", title: "File dashboard gratis di deskripsi", sub: "Komen: dashboard tim apa lagi yang mau dibikin?" } },
];

const base = {
  channel: "RUMUS KERJA",
  fps: 30,
  sheets,
  logo: "logo.png",
  music: "music-upbeat.mp3",
  sfx: { pop: "pop.wav", whoosh: "whoosh.wav" },
};

export const lnd: Tutorial = { ...base, id: "LND", title: "Dashboard Learning & Development Interaktif di Excel", beats };

// ---------- spoiler Shorts (9:16, under 30 s for WA status) ----------

const s1: Beat[] = [
  { sec: 2.5, card: { kind: "hook", title: "Dashboard training, 1 klik.", sub: "Excel biasa. Tanpa macro." } },
  { sec: 3, dash: full(), active: "B6", caption: "Ini dashboard tim L&D." },
  { sec: 2.5, dash: { open: "dept", cursor: "dept:5" }, caption: "Pilih departemen..." },
  { sec: 3, dash: { dept: "IT" }, caption: "Semua angka langsung berubah." },
  { sec: 2.5, dash: { open: "metode", cursor: "metode:1" }, caption: "Filter metode..." },
  { sec: 3, dash: { metode: "Online" }, caption: "IT + Online. Ketahuan mana yang perlu dibenahi." },
  { sec: 2.5, dash: { open: "dept", cursor: "dept:1" } },
  { sec: 3, dash: { dept: "Sales", metode: "Semua" }, caption: "Ganti tim? Satu klik." },
  { sec: 3.5, card: { kind: "end", title: "Cara bikinnya: full video di YouTube", sub: "Rumus Kerja · file gratis" } },
];

const s2: Beat[] = [
  { sec: 2.5, card: { kind: "hook", title: "Dropdown \"Semua\" bikin COUNTIFS error?", sub: "Pakai trik bintang." } },
  { sec: 3.5, sheet: "Hitung", focus: "A1:B3", active: "B2", highlight: "A2:B3", caption: "COUNTIFS nggak kenal kata \"Semua\"." },
  { sec: 6, type: { cell: "B2", text: fx.b2 }, set: { B2: { v: "*", f: fx.b2 } }, caption: "Kalau Semua, ganti jadi *" },
  {
    sec: 4,
    parts: [
      { text: "=IF(" },
      { text: 'B6="Semua"', label: "pilih Semua?", color: B.teal },
      { text: "," },
      { text: '"*"', label: "cocok semua", color: B.yellow },
      { text: "," },
      { text: "B6", label: "nama dept", color: B.white },
      { text: ")" },
    ],
    caption: "Bintang = wildcard, artinya \"apa aja\".",
  },
  { sec: 3, dash: full(), active: "B6", caption: "Hasilnya: satu filter buat semua." },
  { sec: 2.5, dash: { open: "dept", cursor: "dept:2" } },
  { sec: 3, dash: { dept: "Operasional" }, caption: "Pilih dept, angka berubah." },
  { sec: 3, dash: { dept: "Semua" }, caption: "Pilih Semua, balik total." },
  { sec: 2.5, card: { kind: "end", title: "Full tutorial di YouTube", sub: "Rumus Kerja · file gratis" } },
];

const s3: Beat[] = [
  { sec: 2.5, card: { kind: "hook", title: "Dari 360 baris data...", sub: "...ke dashboard yang bisa diklik." } },
  { sec: 3.5, sheet: "Data_Training+", focus: "C1:G14", active: "D2", caption: "Data training mentah. Pusing liatnya." },
  { sec: 3, dash: { show: ["header", "filters", "insight"], dept: "Semua", metode: "Semua" }, active: "B6", caption: "Ubah jadi ini..." },
  { sec: 3.5, dash: { show: DASH_ALL, spot: "kpi" }, caption: "KPI training langsung kebaca." },
  { sec: 3, dash: { zoom: "trend" }, caption: "Tren completion per bulan." },
  { sec: 2.5, dash: { open: "dept", cursor: "dept:6" } },
  { sec: 3, dash: { dept: "Marketing" }, caption: "Filter per tim, sekali klik." },
  { sec: 3.5, card: { kind: "end", title: "Tutorial step-by-step di YouTube", sub: "Rumus Kerja · file gratis" } },
];

export const lndShorts: Tutorial[] = [
  { ...base, id: "LND-S1", title: "Dashboard training 1 klik", header: { series: "Spoiler dashboard", title: "Dashboard L&D, 1 klik" }, beats: s1 },
  { ...base, id: "LND-S2", title: "Trik kriteria Semua", header: { series: "Trik Excel", title: "Dropdown \"Semua\" + COUNTIFS" }, beats: s2 },
  { ...base, id: "LND-S3", title: "Data mentah jadi dashboard", header: { series: "Before → After", title: "360 baris jadi dashboard" }, beats: s3 },
];
