// 9:16 Shorts cut from T1, scripted as their own beats (youtube/shorts.md).
import type { Beat, Cell, Tutorial } from "./types";
import { B } from "./Tutorial";
import { fillDown, sheets, xl } from "./t1";

const base = {
  channel: "RUMUS KERJA",
  fps: 30,
  sheets,
  logo: "logo.png",
  music: "music.mp3",
  sfx: { pop: "pop.wav", whoosh: "whoosh.wav" },
};

// Sheet prefixes dropped so the breakdown fits the narrow frame.
const xlParts = [
  { text: "=XLOOKUP(" },
  { text: "B2", label: "apa dicari", color: B.teal },
  { text: ", " },
  { text: "A:A", label: "di mana", color: B.yellow },
  { text: ", " },
  { text: "B:B", label: "ambil apa", color: B.white },
  { text: ")" },
];

// S01 · 1 Rumus 1 Hari: XLOOKUP dalam 30 detik
const s01Beats: Beat[] = [
  { sec: 2.5, card: { kind: "hook", title: "VLOOKUP udah pensiun.", sub: "Ini penggantinya, 30 detik." } },
  { sec: 3.5, sheet: "Latihan", focus: "B1:E8", active: "E2", highlight: "B2:B8", caption: "Kodenya ada. Nama produknya?" },
  {
    sec: 8,
    type: { cell: "E2", text: xl(2, "B") },
    set: { E2: { v: "Tinta Printer Hitam", f: xl(2, "B") } },
    parts: xlParts,
    caption: "Apa dicari, di mana, ambil apa.",
  },
  { sec: 3, key: "Enter", good: "E2", caption: "Ketemu. Tanpa hitung nomor kolom." },
  { sec: 4, focus: "B1:E15", set: fillDown("E", (r) => xl(r, "B")), cascade: true, key: "Double-click", caption: "Copy ke bawah. Beres." },
  { sec: 4.5, card: { kind: "recap", title: "Simpan rumusnya", sub: "=XLOOKUP(apa,\ndi mana,\nambil apa)" } },
  { sec: 3, card: { kind: "end", title: "Full tutorial di channel", sub: "Rumus Kerja · tiap Jumat 19.00" } },
];

export const s01: Tutorial = {
  ...base,
  id: "S01",
  title: "XLOOKUP dalam 30 detik",
  header: { series: "1 Rumus 1 Hari", title: "XLOOKUP dalam 30 detik" },
  beats: s01Beats,
};

// S02 · Tebak Hasil Rumus: XLOOKUP kalau data nggak ketemu
const filled: Record<string, Cell> = { E2: { v: "Tinta Printer Hitam", f: xl(2, "B") }, ...fillDown("E", (r) => xl(r, "B")) };
delete filled.E15;
const wrong = xl(15, "B");
const fixed = '=XLOOKUP(B15,Data_Produk!A:A,Data_Produk!B:B,"Tidak ada")';

const s02Beats: Beat[] = [
  { sec: 2.5, card: { kind: "hook", title: "Tebak hasilnya!", sub: "Jawab di komen sebelum dibuka." } },
  { sec: 4, sheet: "Latihan", focus: "B9:E16", active: "E15", set: filled, highlight: "B15", caption: "Kode P099 dicari pakai XLOOKUP..." },
  { sec: 4.5, type: { cell: "E15", text: wrong }, caption: "Hasilnya apa?" },
  { sec: 4.5, type: { cell: "E15", text: wrong, cont: true }, badge: "Jawab di komen!", caption: "A. Kosong   B. 0   C. #N/A" },
  { sec: 1, type: { cell: "E15", text: wrong, cont: true }, caption: "3" },
  { sec: 1, type: { cell: "E15", text: wrong, cont: true }, caption: "2" },
  { sec: 1, type: { cell: "E15", text: wrong, cont: true }, caption: "1" },
  { sec: 4, set: { E15: { v: "#N/A", f: wrong, error: true } }, bad: "E15", caption: "Jawabannya C: #N/A. P099 nggak ada di daftar." },
  {
    sec: 6.5,
    type: { cell: "E15", text: fixed },
    set: { E15: { v: "Tidak ada", f: fixed } },
    parts: [{ text: "=XLOOKUP(B15, A:A, B:B, " }, { text: '"Tidak ada"', label: "argumen ke-4", color: B.yellow }, { text: ")" }],
    caption: "Biar rapi: isi argumen ke-4.",
  },
  { sec: 3, good: "E15", caption: "Hasilnya jadi \"Tidak ada\". Laporan bersih." },
  { sec: 3, card: { kind: "end", title: "Full tutorial XLOOKUP di channel", sub: "Rumus Kerja · tiap Jumat 19.00" } },
];

export const s02: Tutorial = {
  ...base,
  id: "S02",
  title: "Tebak Hasil Rumus: XLOOKUP",
  header: { series: "Tebak Hasil Rumus", title: "XLOOKUP kalau datanya nggak ada?" },
  beats: s02Beats,
};
