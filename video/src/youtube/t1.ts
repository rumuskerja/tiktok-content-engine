// T1 · Berhenti Pakai VLOOKUP, Ini Penggantinya di 2026
// Data mirrors youtube/latihan/T1-xlookup.xlsx; the beats follow youtube/briefs/T1-xlookup.md.
import type { Beat, Cell, Sheet, Tutorial } from "./types";
import { B } from "./Tutorial";

const PRODUK: [string, string, string, number, string][] = [
  ["P001", "Kertas A4 80gsm", "ATK", 52000, "SiDU"],
  ["P002", "Tinta Printer Hitam", "ATK", 185000, "Canon"],
  ["P003", "Map Plastik", "ATK", 3500, "Bantex"],
  ["P004", "Mouse Wireless", "Elektronik", 125000, "Logitech"],
  ["P005", "Keyboard USB", "Elektronik", 160000, "Logitech"],
  ["P006", "Flashdisk 64GB", "Elektronik", 89000, "SanDisk"],
  ["P007", "Kursi Kantor", "Furnitur", 1250000, "Chitose"],
  ["P008", "Meja Lipat", "Furnitur", 650000, "Olympic"],
  ["P009", "Lemari Arsip", "Furnitur", 2100000, "Brother"],
  ["P010", "Kopi Sachet (box)", "Pantry", 48000, "Kapal Api"],
  ["P011", "Air Mineral (dus)", "Pantry", 42000, "Aqua"],
  ["P012", "Gula 1kg", "Pantry", 17500, "Gulaku"],
];

const TRX: [string, string, number, string][] = [
  ["TRX-001", "P002", 11, "Surabaya"],
  ["TRX-002", "P009", 4, "Jakarta"],
  ["TRX-003", "P010", 20, "Surabaya"],
  ["TRX-004", "P007", 19, "Surabaya"],
  ["TRX-005", "P012", 16, "Surabaya"],
  ["TRX-006", "P008", 8, "Jakarta"],
  ["TRX-007", "P010", 3, "Jakarta"],
  ["TRX-008", "P005", 4, "Bandung"],
  ["TRX-009", "P001", 16, "Surabaya"],
  ["TRX-010", "P006", 7, "Bandung"],
  ["TRX-011", "P005", 12, "Bandung"],
  ["TRX-012", "P007", 17, "Surabaya"],
  ["TRX-013", "P002", 11, "Jakarta"],
  ["TRX-014", "P099", 18, "Surabaya"],
  ["TRX-015", "P005", 10, "Bandung"],
  ["TRX-016", "P003", 19, "Bandung"],
  ["TRX-017", "P001", 12, "Bandung"],
  ["TRX-018", "P008", 14, "Jakarta"],
  ["TRX-019", "P007", 19, "Surabaya"],
  ["TRX-020", "P008", 4, "Bandung"],
];

const TARGET: [string, string, number][] = [
  ["Jakarta", "Okt", 43000000],
  ["Jakarta", "Nov", 85000000],
  ["Jakarta", "Des", 73000000],
  ["Bandung", "Okt", 82000000],
  ["Bandung", "Nov", 46000000],
  ["Bandung", "Des", 85000000],
  ["Surabaya", "Okt", 79000000],
  ["Surabaya", "Nov", 67000000],
  ["Surabaya", "Des", 70000000],
];

const find = (kode: string) => PRODUK.find((p) => p[0] === kode);
const NA: Cell = { v: "#N/A", error: true };

const sheets: Sheet[] = [
  {
    name: "Data_Produk",
    widths: [110, 300, 170, 180],
    money: [3],
    rows: [["Kode", "Nama Produk", "Kategori", "Harga (Rp)"], ...PRODUK.map(([k, n, c, h]) => [k, n, c, h])],
  },
  {
    name: "Data_Produk+",
    tabAs: "Data_Produk",
    hidden: true,
    widths: [110, 160, 300, 170, 180],
    money: [4],
    rows: [["Kode", "Merek", "Nama Produk", "Kategori", "Harga (Rp)"], ...PRODUK.map(([k, n, c, h, m]) => [k, m, n, c, h])],
  },
  {
    name: "Latihan",
    widths: [160, 100, 80, 150, 290, 180, 200],
    money: [5, 6],
    rows: [
      ["No Transaksi", "Kode", "Qty", "Cabang", "Nama Produk", "Harga (Rp)", "Total (Rp)"],
      ...TRX.map(([n, k, q, c]) => [n, k, q, c, null, null, null]),
    ],
  },
  {
    name: "Tantangan",
    widths: [150, 100, 200, 40, 160, 100, 230],
    money: [2, 6],
    rows: [
      ["Cabang", "Bulan", "Target (Rp)", null, "Cari", "Bulan", "Target"],
      ...TARGET.map(([c, b, t], i) => (i === 0 ? [c, b, t, null, "Bandung", "Nov", null] : [c, b, t])),
    ],
  },
];

const ROWS = Array.from({ length: 14 }, (_, i) => i + 2); // rows 2..15 are on screen

// Fill-down results for rows 3..15.
const fillDown = (col: "E" | "F" | "G", f: (r: number) => string) => {
  const out: Record<string, Cell> = {};
  for (const r of ROWS.slice(1)) {
    const [, kode, qty] = TRX[r - 2];
    const p = find(kode);
    if (col === "E") out[`E${r}`] = p ? { v: p[1], f: f(r) } : { ...NA, f: f(r) };
    if (col === "F") out[`F${r}`] = p ? { v: p[3], f: f(r) } : { ...NA, f: f(r) };
    if (col === "G") out[`G${r}`] = p ? { v: qty * p[3], f: f(r) } : { ...NA, f: f(r) };
  }
  return out;
};

const xl = (r: number, col: string) => `=XLOOKUP(B${r},Data_Produk!A:A,Data_Produk!${col}:${col})`;

const beats: Beat[] = [
  { sec: 2.5, card: { kind: "logo", title: "", sub: "Excel & slide buat kerja yang terus bertumbuh" } },
  { sec: 3.5, card: { kind: "hook", title: "VLOOKUP udah pensiun.", sub: "Excel 2026 punya pengganti yang lebih gampang." } },
  { sec: 3.5, card: { kind: "hook", title: "XLOOKUP", sub: "Nggak perlu hitung kolom · Nggak gampang rusak · Anti #N/A" } },

  { sec: 4.5, sheet: "Latihan", focus: "A1:G15", active: "B2", highlight: "B2:B15", caption: "Kasus: data transaksi cuma ada kode produk." },
  { sec: 4.5, sheet: "Data_Produk", focus: "A1:D13", active: "A1", highlight: "A1:D13", caption: "Nama dan harga produk ada di sheet lain." },
  { sec: 4.5, sheet: "Latihan", focus: "A1:G15", active: "E2", highlight: "E1:G15", caption: "Tugas: isi Nama, Harga, dan Total otomatis." },

  { sec: 2.5, card: { kind: "chapter", step: "Langkah 1/4", title: "Kenapa VLOOKUP bikin repot" } },
  {
    sec: 6,
    focus: "A1:G6",
    type: { cell: "E2", text: "=VLOOKUP(B2,Data_Produk!A:D,2,0)" },
    set: { E2: { v: "Tinta Printer Hitam", f: "=VLOOKUP(B2,Data_Produk!A:D,2,0)" } },
    caption: "Cara lama: VLOOKUP.",
  },
  {
    sec: 5.5,
    parts: [
      { text: "=VLOOKUP(" },
      { text: "B2", label: "yang dicari", color: B.teal },
      { text: "," },
      { text: "A:D", label: "seluruh tabel", color: B.white },
      { text: "," },
      { text: "2", label: "kolom ke-2, dihitung manual!", color: B.red },
      { text: ",0)" },
    ],
    caption: "Angka 2 = kolom ke-2. Kamu harus hitung sendiri.",
  },
  { sec: 4.5, sheet: "Data_Produk+", focus: "A1:E13", active: "B1", highlight: "B1:B13", caption: "Lalu ada yang nyisipin kolom Merek di data..." },
  {
    sec: 5,
    sheet: "Latihan",
    focus: "A1:G6",
    active: "E2",
    set: { E2: { v: "Canon", f: "=VLOOKUP(B2,Data_Produk!A:D,2,0)" } },
    bad: "E2",
    caption: "...hasil VLOOKUP langsung salah. Tanpa error, tanpa peringatan.",
  },
  { sec: 3.5, set: { E2: { v: null } }, caption: "Itu kelemahan VLOOKUP. Sekarang cara baru." },

  { sec: 2.5, card: { kind: "chapter", step: "Langkah 2/4", title: "XLOOKUP dasar" } },
  {
    sec: 5,
    type: { cell: "E2", text: "=XLOOKUP(B2," },
    parts: [{ text: "=XLOOKUP(" }, { text: "B2", label: "1 · apa yang dicari", color: B.teal }, { text: ", ...)" }],
    highlight: "B2",
    caption: "Argumen 1: apa yang dicari. Kode produk di B2.",
  },
  {
    sec: 5.5,
    type: { cell: "E2", text: "=XLOOKUP(B2,Data_Produk!A:A,", cont: true },
    parts: [
      { text: "=XLOOKUP(" },
      { text: "B2", label: "1 · apa yang dicari", color: B.teal },
      { text: "," },
      { text: "Data_Produk!A:A", label: "2 · dicari di mana", color: B.yellow },
      { text: ", ...)" },
    ],
    caption: "Argumen 2: dicari di mana. Kolom Kode di Data_Produk.",
  },
  {
    sec: 6.5,
    type: { cell: "E2", text: xl(2, "B"), cont: true },
    set: { E2: { v: "Tinta Printer Hitam", f: xl(2, "B") } },
    parts: [
      { text: "=XLOOKUP(" },
      { text: "B2", label: "1 · apa yang dicari", color: B.teal },
      { text: "," },
      { text: "Data_Produk!A:A", label: "2 · dicari di mana", color: B.yellow },
      { text: "," },
      { text: "Data_Produk!B:B", label: "3 · ambil dari mana", color: B.white },
      { text: ")" },
    ],
    caption: "Argumen 3: ambil dari mana. Kolom Nama Produk.",
  },
  { sec: 4, key: "Enter", good: "E2", caption: "Hasilnya muncul. Nggak ada nomor kolom yang perlu dihitung." },
  {
    sec: 4.5,
    focus: "A1:G15",
    set: fillDown("E", (r) => xl(r, "B")),
    cascade: true,
    key: "Double-click",
    caption: "Double-click pojok kanan bawah sel buat copy ke bawah.",
  },
  {
    sec: 6,
    focus: "A1:G8",
    type: { cell: "F2", text: xl(2, "D") },
    set: { F2: { v: 185000, f: xl(2, "D") } },
    caption: "Harga: rumus sama, cukup ganti kolom hasilnya ke D.",
  },
  { sec: 3.5, focus: "A1:G15", set: fillDown("F", (r) => xl(r, "D")), cascade: true, key: "Double-click", caption: "Copy ke bawah lagi." },
  {
    sec: 4.5,
    focus: "A1:G8",
    type: { cell: "G2", text: "=C2*F2" },
    set: { G2: { v: 2035000, f: "=C2*F2" } },
    caption: "Total = Qty × Harga.",
  },
  { sec: 3.5, focus: "A1:G15", set: fillDown("G", (r) => `=C${r}*F${r}`), cascade: true, key: "Double-click", caption: "Copy ke bawah. Selesai dalam 3 rumus." },
  { sec: 4.5, active: "G15", badge: "Checkpoint", good: "E2:G14", caption: "Sampai sini, hasil kamu harus seperti ini." },

  { sec: 2.5, card: { kind: "chapter", step: "Langkah 3/4", title: "Kalau datanya nggak ada" } },
  { sec: 5, focus: "A10:G16", active: "E15", bad: "B15:G15", caption: "TRX-014 error #N/A. Kode P099 nggak ada di daftar produk." },
  {
    sec: 7,
    type: { cell: "E15", text: '=XLOOKUP(B15,Data_Produk!A:A,Data_Produk!B:B,"Tidak ada")' },
    set: { E15: { v: "Tidak ada", f: '=XLOOKUP(B15,Data_Produk!A:A,Data_Produk!B:B,"Tidak ada")' } },
    parts: [
      { text: "=XLOOKUP(B15, A:A, B:B, " },
      { text: '"Tidak ada"', label: "4 · kalau nggak ketemu", color: B.yellow },
      { text: ")" },
    ],
    caption: "Argumen 4: tulisan yang muncul kalau datanya nggak ketemu.",
  },
  {
    sec: 5,
    active: "F15",
    set: {
      F15: { v: 0, f: "=XLOOKUP(B15,Data_Produk!A:A,Data_Produk!D:D,0)" },
      G15: { v: 0, f: "=C15*F15" },
    },
    good: "E15:G15",
    caption: "Untuk harga, pakai 0. Total tetap bisa dijumlah, laporan bersih.",
  },

  { sec: 2.5, card: { kind: "chapter", step: "Langkah 4/4", title: "Cari pakai 2 kriteria" } },
  { sec: 5, sheet: "Tantangan", focus: "A1:G10", active: "G2", highlight: "E2:F2", caption: "Bonus: cari target cabang Bandung bulan Nov." },
  {
    sec: 7,
    type: { cell: "G2", text: "=XLOOKUP(E2&F2,A2:A10&B2:B10,C2:C10)" },
    set: { G2: { v: 46000000, f: "=XLOOKUP(E2&F2,A2:A10&B2:B10,C2:C10)" } },
    caption: "Gabungkan 2 kriteria pakai tanda &.",
  },
  {
    sec: 6,
    parts: [
      { text: "=XLOOKUP(" },
      { text: "E2&F2", label: '"BandungNov"', color: B.teal },
      { text: "," },
      { text: "A2:A10&B2:B10", label: "Cabang + Bulan", color: B.yellow },
      { text: "," },
      { text: "C2:C10", label: "ambil Target", color: B.white },
      { text: ")" },
    ],
    caption: 'Excel nyari "BandungNov" di kolom Cabang + Bulan.',
  },
  { sec: 5, highlight: "A6:C6", good: "G2", caption: "Ketemu: 46 juta. VLOOKUP nggak bisa begini tanpa kolom bantu." },
  {
    sec: 5,
    badge: "Excel 2016/2019?",
    caption: "Excel lama belum punya XLOOKUP. Pakai INDEX + MATCH, ada di file latihan.",
  },

  {
    sec: 7,
    card: {
      kind: "recap",
      title: "Rekap: simpan atau screenshot",
      sub: "=XLOOKUP(apa, di mana, ambil apa, kalau nggak ada)\nDua kriteria: =XLOOKUP(A&B, kolom1&kolom2, hasil)",
    },
  },
  {
    sec: 14,
    card: {
      kind: "end",
      title: "File latihan gratis di deskripsi",
      sub: "Lanjut: Laporan 2 Jam Jadi 2 Menit dengan Power Query",
    },
  },
];

export const t1: Tutorial = {
  id: "T1-xlookup",
  title: "Berhenti Pakai VLOOKUP, Ini Penggantinya di 2026",
  channel: "RUMUS KERJA",
  fps: 30,
  sheets,
  beats,
  logo: "logo.png",
  music: "music.mp3",
  sfx: { pop: "pop.wav", whoosh: "whoosh.wav" },
};
