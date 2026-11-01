"""Builds the L&D dashboard practice file and the data the video renders from.

    python3 youtube/scripts/build_lnd_dashboard.py

Writes youtube/latihan/LnD-dashboard.xlsx (needs openpyxl) and
video/src/youtube/lnd-data.json, both from the same seeded dummy data, so the
numbers in the video match the workbook.
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, DoughnutChart, LineChart, Reference
from openpyxl.chart.data_source import NumFmt
from openpyxl.chart.label import DataLabelList
from openpyxl.chart.layout import Layout, ManualLayout
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.chart.text import RichText
from openpyxl.drawing.line import LineProperties
from openpyxl.drawing.spreadsheet_drawing import AnchorMarker, TwoCellAnchor
from openpyxl.drawing.text import CharacterProperties, Font as DFont, Paragraph, ParagraphProperties
from openpyxl.formatting.rule import DataBarRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo

ROOT = Path(__file__).resolve().parents[2]
XLSX = ROOT / "youtube" / "latihan" / "LnD-dashboard.xlsx"
JSON = ROOT / "video" / "src" / "youtube" / "lnd-data.json"

NAVY, NAVY2, TEAL, YELLOW, RED = "0F1C2E", "16294A", "2EC4B6", "FFC857", "E5585B"
CANVAS, INK, MUTED, WHITE = "EEF2F7", "1F2937", "6B7280", "FFFFFF"
FONT = "Segoe UI"

DEPTS = ["Sales", "Operasional", "Finance", "HR", "IT", "Marketing"]
METODE = ["Online", "Offline", "Blended"]
BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"]
# program: (jam, biaya per peserta, base completion, base kenaikan skor)
PROGRAM = {
    "Leadership Essentials": (16, 2_500_000, 0.80, 18),
    "Excel Lanjutan": (12, 900_000, 0.85, 24),
    "Customer Service": (8, 750_000, 0.83, 15),
    "Data Literacy": (10, 1_200_000, 0.70, 21),
    "K3 Dasar": (6, 400_000, 0.94, 12),
    "Public Speaking": (8, 1_100_000, 0.75, 17),
}
DEPT_PROGRAM_BIAS = {
    "Sales": ["Customer Service", "Public Speaking"],
    "Operasional": ["K3 Dasar", "Excel Lanjutan"],
    "Finance": ["Excel Lanjutan", "Data Literacy"],
    "HR": ["Leadership Essentials", "Public Speaking"],
    "IT": ["Data Literacy", "Excel Lanjutan"],
    "Marketing": ["Data Literacy", "Public Speaking"],
}
METODE_ADJ = {"Online": -0.10, "Offline": 0.04, "Blended": 0.02}
FIRST = "Andi Budi Citra Dewi Eka Fajar Gita Hadi Indah Joko Kartika Lina Maya Nanda Oki Putri Rizky Sari Tono Umi Vina Wahyu Yoga Zahra Bayu Dimas Fitri Galih Intan Raka".split()
LAST = "Pratama Santoso Wijaya Lestari Saputra Hidayat Nugroho Kusuma Permata Siregar Utami Halim".split()


def make_rows(n=360):
    rnd = random.Random(2026)
    people = sorted({f"{rnd.choice(FIRST)} {rnd.choice(LAST)}" for _ in range(200)})[:140]
    dept_of = {p: rnd.choice(DEPTS) for p in people}
    rows = []
    start = date(2026, 1, 5)
    for i in range(n):
        p = rnd.choice(people)
        d = dept_of[p]
        prog = rnd.choice(DEPT_PROGRAM_BIAS[d]) if rnd.random() < 0.55 else rnd.choice(list(PROGRAM))
        jam, biaya, comp, naik = PROGRAM[prog]
        tgl = start + timedelta(days=int(rnd.random() ** 0.85 * 295))
        bulan = BULAN[tgl.month - 1]
        met = rnd.choices(METODE, weights=[5, 3, 2])[0]
        # completion improves through the year: the L&D story the video tells
        p_done = comp + METODE_ADJ[met] + (tgl.month - 5) * 0.03
        late = tgl > date(2026, 10, 10)
        r = rnd.random()
        if late and r < 0.55:
            status = "Berjalan"
        elif r < p_done:
            status = "Selesai"
        elif r < p_done + 0.06:
            status = "Berjalan"
        else:
            status = "Tidak Hadir"
        pre = post = naik_v = kepuasan = None
        if status != "Tidak Hadir":
            pre = rnd.randint(48, 72)
        if status == "Selesai":
            naik_v = max(4, round(rnd.gauss(naik + (3 if met != "Online" else -2), 5)))
            post = min(100, pre + naik_v)
            naik_v = post - pre
            kepuasan = round(min(5.0, max(3.0, rnd.gauss(4.35 if met != "Online" else 4.05, 0.35))), 1)
        rows.append(
            {
                "id": f"TRN-{i + 1:03d}",
                "tanggal": tgl.isoformat(),
                "bulan": bulan,
                "karyawan": p,
                "dept": d,
                "program": prog,
                "metode": met,
                "jam": jam,
                "biaya": biaya,
                "status": status,
                "pre": pre,
                "post": post,
                "naik": naik_v,
                "kepuasan": kepuasan,
            }
        )
    rows.sort(key=lambda x: (x["tanggal"], x["id"]))
    for i, row in enumerate(rows):
        row["id"] = f"TRN-{i + 1:03d}"
    return rows


# ---------- styling helpers ----------

def fill(c):
    return PatternFill("solid", start_color=c, end_color=c)


def paint(ws, rng, color):
    for row in ws[rng]:
        for cell in row:
            cell.fill = fill(color)


def card(ws, c1, c2, r1, r2):
    """White card with a teal accent along its top edge."""
    paint(ws, f"{c1}{r1}:{c2}{r2}", WHITE)
    for col in range(ws[f"{c1}1"].column, ws[f"{c2}1"].column + 1):
        ws.cell(r1, col).border = Border(top=Side("thick", color=TEAL))


def rich(size=900, color=INK, bold=False):
    cp = CharacterProperties(sz=size, b=bold, solidFill=color, latin=DFont(typeface=FONT))
    return RichText(p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), endParaRPr=cp)])


def place(ws, chart, c1, r1, c2, r2):
    """Pin a chart to a cell box (0-based col/row, inclusive end)."""
    a = TwoCellAnchor()
    a._from = AnchorMarker(col=c1, row=r1, colOff=60000, rowOff=60000)
    a.to = AnchorMarker(col=c2 + 1, row=r2 + 1, colOff=-60000, rowOff=-60000)
    chart.anchor = a
    ws.add_chart(chart)


def clean_chart(ch, title):
    ch.title = title
    ch.title.tx.rich.p[0].pPr = ParagraphProperties(defRPr=CharacterProperties(sz=1200, b=True, solidFill=INK, latin=DFont(typeface=FONT)))
    ch.graphical_properties = GraphicalProperties(noFill=True, ln=LineProperties(noFill=True))
    ch.plot_area.graphicalProperties = GraphicalProperties(noFill=True)
    ch.legend = None


def tidy_axis(ax, fmt=None, hide=False):
    ax.majorGridlines = None
    ax.txPr = rich(900, MUTED)
    ax.graphicalProperties = GraphicalProperties(ln=LineProperties(solidFill="D9DEE5"))
    if fmt:
        ax.numFmt = NumFmt(formatCode=fmt, sourceLinked=False)
    ax.delete = hide


# ---------- workbook ----------

def build(rows):
    wb = Workbook()
    dash = wb.active
    dash.title = "Dashboard"
    hit = wb.create_sheet("Hitung")
    data = wb.create_sheet("Data_Training")
    guide = wb.create_sheet("Panduan")

    # Data_Training: an Excel Table so every formula reads T_Training[Kolom]
    head = ["ID", "Tanggal", "Bulan", "Karyawan", "Departemen", "Program", "Metode", "Jam", "Biaya (Rp)", "Status", "Pre-test", "Post-test", "Kenaikan", "Kepuasan"]
    data.append(head)
    for r in rows:
        data.append([r["id"], date.fromisoformat(r["tanggal"]), r["bulan"], r["karyawan"], r["dept"], r["program"], r["metode"], r["jam"], r["biaya"], r["status"], r["pre"], r["post"], r["naik"], r["kepuasan"]])
    last = len(rows) + 1
    tbl = Table(displayName="T_Training", ref=f"A1:N{last}")
    tbl.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    data.add_table(tbl)
    for col, w in zip("ABCDEFGHIJKLMN", [10, 12, 8, 20, 13, 22, 10, 7, 13, 12, 9, 10, 10, 10]):
        data.column_dimensions[col].width = w
    for r in range(2, last + 1):
        data[f"B{r}"].number_format = "dd-mmm-yy"
        data[f"I{r}"].number_format = "#,##0"
    data.freeze_panes = "A2"

    # Hitung: filter criteria, KPI and chart helper tables
    H = hit
    bold = Font(name=FONT, bold=True, color=WHITE)
    def header(cells):
        for ref, text in cells:
            H[ref] = text
            H[ref].font = bold
            H[ref].fill = fill(NAVY)

    header([("A1", "Kriteria"), ("B1", "Nilai")])
    H["A2"], H["B2"] = "Departemen", '=IF(Dashboard!$B$6="Semua","*",Dashboard!$B$6)'
    H["A3"], H["B3"] = "Metode", '=IF(Dashboard!$F$6="Semua","*",Dashboard!$F$6)'
    f = "T_Training[Departemen],$B$2,T_Training[Metode],$B$3"
    header([("A5", "KPI"), ("B5", "Nilai")])
    kpis = [
        ("Peserta", f"=COUNTIFS({f})", "#,##0"),
        ("Selesai", f'=COUNTIFS({f},T_Training[Status],"Selesai")', "#,##0"),
        ("Completion rate", "=IFERROR(B7/B6,0)", "0%"),
        ("Kenaikan skor", f'=IFERROR(AVERAGEIFS(T_Training[Kenaikan],{f},T_Training[Status],"Selesai"),0)', "+0.0"),
        ("Kepuasan", f'=IFERROR(AVERAGEIFS(T_Training[Kepuasan],{f},T_Training[Status],"Selesai"),0)', "0.0"),
        ("Jam belajar", f'=SUMIFS(T_Training[Jam],{f},T_Training[Status],"Selesai")', "#,##0"),
        ("Biaya", f"=SUMIFS(T_Training[Biaya (Rp)],{f})", "#,##0"),
    ]
    for i, (name, formula, nf) in enumerate(kpis):
        H[f"A{6 + i}"], H[f"B{6 + i}"] = name, formula
        H[f"B{6 + i}"].number_format = nf

    header([("D1", "Program"), ("E1", "Peserta"), ("F1", "Selesai"), ("G1", "Completion"), ("H1", "Kenaikan")])
    for i, prog in enumerate(PROGRAM):
        r = 2 + i
        H[f"D{r}"] = prog
        H[f"E{r}"] = f"=COUNTIFS({f},T_Training[Program],D{r})"
        H[f"F{r}"] = f'=COUNTIFS({f},T_Training[Program],D{r},T_Training[Status],"Selesai")'
        H[f"G{r}"] = f"=IFERROR(F{r}/E{r},0)"
        H[f"H{r}"] = f'=IFERROR(AVERAGEIFS(T_Training[Kenaikan],{f},T_Training[Program],D{r},T_Training[Status],"Selesai"),0)'
        H[f"G{r}"].number_format = "0%"
        H[f"H{r}"].number_format = "+0.0"

    header([("J1", "Bulan"), ("K1", "Peserta"), ("L1", "Completion")])
    for i, b in enumerate(BULAN):
        r = 2 + i
        H[f"J{r}"] = b
        H[f"K{r}"] = f"=COUNTIFS({f},T_Training[Bulan],J{r})"
        H[f"L{r}"] = f'=IFERROR(COUNTIFS({f},T_Training[Bulan],J{r},T_Training[Status],"Selesai")/K{r},0)'
        H[f"L{r}"].number_format = "0%"

    header([("N1", "Status"), ("O1", "Jumlah")])
    for i, s in enumerate(["Selesai", "Berjalan", "Tidak Hadir"]):
        H[f"N{2 + i}"] = s
        H[f"O{2 + i}"] = f"=COUNTIFS({f},T_Training[Status],N{2 + i})"

    H["A15"] = "Program terbaik"
    H["B15"] = "=INDEX(D2:D7,MATCH(MAX(G2:G7),G2:G7,0))"
    for col, w in zip("ABCDEFGHIJKLMNO", [16, 14, 2, 22, 9, 9, 11, 10, 2, 8, 9, 11, 2, 12, 9]):
        H.column_dimensions[col].width = w

    # Lists for the dropdowns
    header([("Q1", "List Departemen"), ("R1", "List Metode")])
    for i, v in enumerate(["Semua"] + DEPTS):
        H[f"Q{2 + i}"] = v
    for i, v in enumerate(["Semua"] + METODE):
        H[f"R{2 + i}"] = v
    H.column_dimensions["Q"].width = 16
    H.column_dimensions["R"].width = 13
    wb.defined_names["ListDept"] = DefinedName("ListDept", attr_text="Hitung!$Q$2:$Q$8")
    wb.defined_names["ListMetode"] = DefinedName("ListMetode", attr_text="Hitung!$R$2:$R$5")

    # ---------- Dashboard ----------
    D = dash
    D.sheet_view.showGridLines = False
    D.sheet_view.showRowColHeaders = False
    D.sheet_view.zoomScale = 90
    D.print_area = "A1:U47"
    D.page_setup.orientation = "landscape"
    D.page_setup.fitToWidth = 1
    D.page_setup.fitToHeight = 1
    D.sheet_properties.pageSetUpPr.fitToPage = True
    D.print_options.horizontalCentered = True
    widths = {"A": 2.5}
    cards_cols = ["BCDE", "GHIJ", "LMNO", "QRST"]
    for group in cards_cols:
        for c in group:
            widths[c] = 9.5
    for c in "FKPU":
        widths[c] = 2.5
    for c, w in widths.items():
        D.column_dimensions[c].width = w
    for r in range(1, 48):
        D.row_dimensions[r].height = 19
    paint(D, "A1:U47", CANVAS)
    paint(D, "A1:U3", NAVY)
    D.row_dimensions[2].height = 30
    D["B2"] = "Dashboard Learning & Development"
    D["B2"].font = Font(name=FONT, size=20, bold=True, color=WHITE)
    D["B3"] = "Data training karyawan · Jan–Okt 2026"
    D["B3"].font = Font(name=FONT, size=10, color="A9B4C6")
    D["Q2"] = "RUMUS KERJA"
    D["Q2"].font = Font(name=FONT, size=11, bold=True, color=TEAL)
    D["Q3"] = "bertumbuh"
    D["Q3"].font = Font(name=FONT, size=9, color=YELLOW)

    # filters
    for ref, text in [("B5", "DEPARTEMEN"), ("F5", "METODE")]:
        D[ref] = text
        D[ref].font = Font(name=FONT, size=8, bold=True, color=MUTED)
    D.merge_cells("B6:D6")
    D.merge_cells("F6:H6")
    for ref, val in [("B6", "Semua"), ("F6", "Semua")]:
        D[ref] = val
        D[ref].font = Font(name=FONT, size=11, bold=True, color=NAVY)
        D[ref].alignment = Alignment(horizontal="left", vertical="center", indent=1)
    for rng in ("B6:D6", "F6:H6"):
        paint(D, rng, WHITE)
        cells = [c for row in D[rng] for c in row]
        for i, c in enumerate(cells):
            c.border = Border(
                top=Side("thin", color=TEAL), bottom=Side("thin", color=TEAL),
                left=Side("thin", color=TEAL) if i == 0 else None,
                right=Side("thin", color=TEAL) if i == len(cells) - 1 else None,
            )
    D.row_dimensions[6].height = 24
    dv1 = DataValidation(type="list", formula1="=ListDept", allow_blank=False)
    dv2 = DataValidation(type="list", formula1="=ListMetode", allow_blank=False)
    dv1.add("B6")
    dv2.add("F6")
    D.add_data_validation(dv1)
    D.add_data_validation(dv2)
    D["J5"] = "INSIGHT"
    D["J5"].font = Font(name=FONT, size=8, bold=True, color=MUTED)
    D.merge_cells("J6:T6")
    D["J6"] = '="🏆 Completion tertinggi: "&Hitung!B15&" ("&TEXT(MAX(Hitung!G2:G7),"0%")&")"'
    D["J6"].font = Font(name=FONT, size=11, bold=True, color=NAVY)
    D["J6"].alignment = Alignment(vertical="center", indent=1)
    paint(D, "J6:T6", "FFF4D6")

    # KPI cards
    kpi_cards = [
        ("PESERTA", "=Hitung!B6", "#,##0", '="dari "&TEXT(Hitung!B7,"0")&" yang selesai"'),
        ("COMPLETION RATE", "=Hitung!B8", "0%", '=TEXT(Hitung!B11,"#,##0")&" jam belajar"'),
        ("KENAIKAN SKOR", "=Hitung!B9", '+0.0', '="poin, post-test vs pre-test"'),
        ("KEPUASAN", "=Hitung!B10", '0.0" / 5"', '="Biaya Rp "&TEXT(Hitung!B12/1000000,"0.0")&" jt"'),
    ]
    for group, (label, formula, nf, foot) in zip(cards_cols, kpi_cards):
        c1, c2 = group[0], group[-1]
        card(D, c1, c2, 8, 12)
        D[f"{c1}8"] = label
        D[f"{c1}8"].font = Font(name=FONT, size=8, bold=True, color=MUTED)
        D[f"{c1}8"].alignment = Alignment(vertical="bottom", indent=1)
        D.merge_cells(f"{c1}9:{c2}10")
        D[f"{c1}9"] = formula
        D[f"{c1}9"].number_format = nf
        D[f"{c1}9"].font = Font(name=FONT, size=26, bold=True, color=NAVY)
        D[f"{c1}9"].alignment = Alignment(horizontal="left", vertical="center", indent=1)
        D.merge_cells(f"{c1}11:{c2}11")
        D[f"{c1}11"] = foot
        D[f"{c1}11"].font = Font(name=FONT, size=9, color=TEAL, bold=True)
        D[f"{c1}11"].alignment = Alignment(indent=1)

    # chart cards
    card(D, "B", "J", 14, 29)
    card(D, "L", "T", 14, 29)
    card(D, "B", "J", 31, 46)
    card(D, "L", "T", 31, 46)

    # 1. trend: peserta (column) + completion (line, secondary axis)
    bar = BarChart()
    bar.type = "col"
    bar.add_data(Reference(H, min_col=11, min_row=1, max_row=11), titles_from_data=True)
    bar.set_categories(Reference(H, min_col=10, min_row=2, max_row=11))
    bar.series[0].graphicalProperties = GraphicalProperties(solidFill=TEAL, ln=LineProperties(noFill=True))
    bar.gapWidth = 60
    tidy_axis(bar.x_axis)
    tidy_axis(bar.y_axis, "0")
    line = LineChart()
    line.add_data(Reference(H, min_col=12, min_row=1, max_row=11), titles_from_data=True)
    s = line.series[0]
    s.graphicalProperties = GraphicalProperties(ln=LineProperties(solidFill=YELLOW, w=34000))
    s.marker.symbol = "circle"
    s.marker.size = 6
    s.marker.graphicalProperties = GraphicalProperties(solidFill=YELLOW, ln=LineProperties(solidFill=YELLOW))
    s.smooth = True
    line.y_axis.axId = 200
    line.y_axis.crosses = "max"
    line.y_axis.scaling.min = 0
    line.y_axis.scaling.max = 1
    tidy_axis(line.y_axis, "0%")
    bar += line
    clean_chart(bar, "Tren peserta & completion per bulan")
    from openpyxl.chart.legend import Legend
    bar.legend = Legend()
    bar.legend.position = "b"
    bar.legend.txPr = rich(900, MUTED)
    place(D, bar, 1, 13, 9, 28)

    # 2. completion by program (horizontal bars)
    pb = BarChart()
    pb.type = "bar"
    pb.add_data(Reference(H, min_col=7, min_row=1, max_row=7), titles_from_data=True)
    pb.set_categories(Reference(H, min_col=4, min_row=2, max_row=7))
    pb.series[0].graphicalProperties = GraphicalProperties(solidFill=NAVY2, ln=LineProperties(noFill=True))
    pb.gapWidth = 45
    pb.dataLabels = DataLabelList()
    pb.dataLabels.showVal = True
    pb.dataLabels.showSerName = pb.dataLabels.showCatName = pb.dataLabels.showLegendKey = False
    pb.dataLabels.numFmt = "0%"
    pb.dataLabels.txPr = rich(900, INK, True)
    tidy_axis(pb.x_axis)
    pb.x_axis.scaling.orientation = "maxMin"
    tidy_axis(pb.y_axis, "0%", hide=True)
    pb.y_axis.scaling.min = 0
    pb.y_axis.scaling.max = 1
    clean_chart(pb, "Completion rate per program")
    place(D, pb, 11, 13, 19, 28)

    # 3. status doughnut
    dn = DoughnutChart(holeSize=62)
    dn.add_data(Reference(H, min_col=15, min_row=1, max_row=4), titles_from_data=True)
    dn.set_categories(Reference(H, min_col=14, min_row=2, max_row=4))
    from openpyxl.chart.series import DataPoint
    for i, color in enumerate([TEAL, YELLOW, RED]):
        pt = DataPoint(idx=i)
        pt.graphicalProperties = GraphicalProperties(solidFill=color, ln=LineProperties(solidFill=WHITE, w=19050))
        dn.series[0].dPt.append(pt)
    dn.dataLabels = DataLabelList()
    dn.dataLabels.showPercent = True
    dn.dataLabels.showVal = dn.dataLabels.showSerName = dn.dataLabels.showCatName = dn.dataLabels.showLegendKey = False
    dn.dataLabels.txPr = rich(1000, INK, True)
    clean_chart(dn, "Status peserta")
    dn.legend = Legend()
    dn.legend.position = "r"
    dn.legend.txPr = rich(1000, INK)
    place(D, dn, 1, 30, 9, 45)

    # 4. per-program table with data bars
    D["L31"] = "Ringkasan per program"
    D["L31"].font = Font(name=FONT, size=12, bold=True, color=INK)
    D["L31"].alignment = Alignment(indent=1, vertical="center")
    D.row_dimensions[31].height = 26
    hdr = [("L33", "Program"), ("P33", "Peserta"), ("R33", "Completion"), ("S33", ""), ("T33", "Skor")]
    D.merge_cells("L33:O33")
    D.merge_cells("P33:Q33")
    D.merge_cells("R33:S33")
    for ref, text in hdr:
        if text:
            D[ref] = text
            D[ref].font = Font(name=FONT, size=8, bold=True, color=MUTED)
            D[ref].alignment = Alignment(indent=1)
    for c in "LMNOPQRST":
        D[f"{c}33"].border = Border(bottom=Side("thin", color="D9DEE5"))
    for i in range(6):
        r = 34 + i * 2
        D.merge_cells(f"L{r}:O{r + 1}")
        D.merge_cells(f"P{r}:Q{r + 1}")
        D.merge_cells(f"R{r}:S{r + 1}")
        D.merge_cells(f"T{r}:T{r + 1}")
        D[f"L{r}"] = f"=Hitung!D{2 + i}"
        D[f"P{r}"] = f"=Hitung!E{2 + i}"
        D[f"R{r}"] = f"=Hitung!G{2 + i}"
        D[f"T{r}"] = f"=Hitung!H{2 + i}"
        D[f"R{r}"].number_format = "0%"
        D[f"T{r}"].number_format = "+0.0"
        for ref, al in [(f"L{r}", "left"), (f"P{r}", "center"), (f"R{r}", "left"), (f"T{r}", "center")]:
            D[ref].font = Font(name=FONT, size=10, color=INK, bold=ref.startswith("L"))
            D[ref].alignment = Alignment(horizontal=al, vertical="center", indent=1 if al == "left" else 0)
    D.conditional_formatting.add(
        "R34:R45",
        DataBarRule(start_type="num", start_value=0, end_type="num", end_value=1, color=TEAL, showValue=True),
    )

    # Panduan
    G = guide
    G.column_dimensions["A"].width = 3
    G.column_dimensions["B"].width = 100
    lines = [
        ("Dashboard Learning & Development · Rumus Kerja", 16, True),
        ("", 10, False),
        ("Cara pakai", 12, True),
        ("1. Buka sheet Dashboard, pilih Departemen dan Metode dari dropdown (sel B6 dan F6).", 11, False),
        ("2. Semua KPI, chart, dan tabel ikut berubah. Pilih 'Semua' untuk lihat total.", 11, False),
        ("3. Tambah data baru di baris paling bawah sheet Data_Training. Table T_Training otomatis melebar.", 11, False),
        ("", 10, False),
        ("Rumus kunci (sheet Hitung)", 12, True),
        ('Kriteria:  =IF(Dashboard!$B$6="Semua","*",Dashboard!$B$6)   → "*" artinya semua isi teks', 11, False),
        ("Peserta:   =COUNTIFS(T_Training[Departemen],$B$2,T_Training[Metode],$B$3)", 11, False),
        ('Selesai:   =COUNTIFS(..., T_Training[Status],"Selesai")', 11, False),
        ('Skor:      =AVERAGEIFS(T_Training[Kenaikan], ..., T_Training[Status],"Selesai")', 11, False),
        ("Terbaik:   =INDEX(D2:D7,MATCH(MAX(G2:G7),G2:G7,0))", 11, False),
        ("", 10, False),
        ("Jalan di Excel 2010 ke atas, Excel 365, dan Excel versi web. Data dummy, bebas dipakai latihan.", 10, False),
    ]
    for i, (text, size, b) in enumerate(lines):
        G[f"B{2 + i}"] = text
        G[f"B{2 + i}"].font = Font(name=FONT if "=" not in text else "Consolas", size=size, bold=b, color=NAVY if b else INK)
    G.sheet_view.showGridLines = False

    wb.active = 0
    XLSX.parent.mkdir(parents=True, exist_ok=True)
    wb.save(XLSX)


if __name__ == "__main__":
    rows = make_rows()
    build(rows)
    JSON.write_text(json.dumps({"depts": DEPTS, "metode": METODE, "bulan": BULAN, "program": list(PROGRAM), "rows": rows}, ensure_ascii=False))
    done = sum(r["status"] == "Selesai" for r in rows)
    print(f"{len(rows)} rows, {done} selesai ({done / len(rows):.0%}) -> {XLSX.relative_to(ROOT)}, {JSON.relative_to(ROOT)}")
