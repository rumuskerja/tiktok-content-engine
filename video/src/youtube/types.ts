// A faceless, no-voiceover Excel tutorial: a simulated workbook plus a list
// of beats. On-screen captions, zoom, highlights and formula cards carry the
// explanation, so every beat says what the viewer should read and look at.

export type Value = string | number | null;
export type Cell = { v: Value; f?: string; error?: boolean; fmt?: "pct" | "dec1" | "plus1" };

// The finished dashboard, drawn as its own view instead of the cell grid.
export type DashEl = "header" | "filters" | "insight" | "kpi" | "trend" | "program" | "status";
export type DashState = {
  show: DashEl[]; // sticky: which parts are built so far
  dept: string; // sticky: dropdown values
  metode: string;
  open?: "dept" | "metode"; // this beat only: dropdown list shown
  cursor?: string; // this beat only: element id, or "dept:3" for a list item
  spot?: DashEl; // this beat only: teal glow
  zoom?: DashEl; // this beat only: camera frames this part
};

export type Sheet = {
  name: string;
  widths: number[]; // px per column, A onwards
  rows: Value[][]; // row 1 is the header row
  money?: number[]; // 0-based column indexes shown as Rupiah
  hidden?: boolean; // not shown in the sheet tabs
  table?: boolean; // styled as an Excel Table (banded rows, filter arrows)
  plain?: boolean; // row 1 is not a header row
  tabAs?: string; // a hidden variant of another sheet lights up that sheet's tab
};

export type Card = {
  kind: "logo" | "hook" | "chapter" | "recap" | "end";
  title: string;
  sub?: string;
  step?: string; // chapter cards set the sticky step label, e.g. "Langkah 2/4"
};

export type Part = { text: string; label?: string; color?: string };

export type Beat = {
  sec: number;
  caption?: string;
  card?: Card;
  sheet?: string; // sticky: which sheet is on screen
  focus?: string; // sticky: range the camera frames, e.g. "A1:G15"
  active?: string; // sticky: selected cell shown in the name box
  type?: { cell: string; text: string; cont?: boolean }; // typed during the beat
  set?: Record<string, Cell>; // "E2" or "Sheet!E2"; applied after typing
  cascade?: boolean; // reveal `set` entries one by one, like a fill-down
  highlight?: string; // teal box, this beat only
  bad?: string; // red box, this beat only
  good?: string; // green box, this beat only
  parts?: Part[]; // formula breakdown card
  key?: string; // keycap badge, e.g. "Enter"
  badge?: string; // small note chip under the step label
  dash?: Partial<DashState> | null; // sticky (merged): show the dashboard view; null or a `sheet` beat goes back to the grid
  dropdown?: { cell: string; items: string[]; pick?: number }; // in-cell dropdown list, this beat only
  dialog?: { title: string; rows: [string, string][] }; // Excel dialog box, this beat only
  menu?: string; // ribbon tab lit up this beat, e.g. "Data"
  nameBox?: string; // overrides the name box text this beat, e.g. a defined name
};

export type Tutorial = {
  id: string;
  title: string;
  channel: string;
  fps: number;
  sheets: Sheet[];
  beats: Beat[];
  music?: string | null; // file in the public dir
  sfx?: { pop: string; whoosh: string } | null; // step and transition sounds, files in the public dir
  logo?: string | null;
  header?: { series: string; title: string }; // 9:16 Shorts: series label and hook above the sheet
};
