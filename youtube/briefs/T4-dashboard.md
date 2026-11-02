# T4 · Bikin Dashboard Penjualan yang Bikin Bos Diam

| | |
| --- | --- |
| Tayang | Jumat 20 November 2026, 19.00 WIB |
| Pillar · Level | Dashboard & Visualisasi · Jago |
| Durasi target | 12 sampai 15 menit (deep dive) |
| File latihan | [`latihan/T4-dashboard.xlsx`](../latihan/T4-dashboard.xlsx) (600 transaksi Jan sampai Okt 2026) |
| Excel | 2016 ke atas |
| Thumbnail | Kiri: tabel 600 baris. Kanan: dashboard 4 KPI + 2 chart. Teks: **"BOS DIAM"** |

## Script layar

| Waktu | Di layar | Caption | Efek |
| --- | --- | --- | --- |
| 0:00 | Dashboard jadi, klik slicer cabang, semua berubah | Bikin dashboard kayak gini, dari nol. | SFX whoosh |
| 0:06 | Sheet Data | Bahannya: 600 transaksi, 3 cabang. | Scroll cepat 2x |
| 0:12 | Kartu chapter | Langkah 1/6 · Jadikan Table | |
| 0:14 | Ctrl+T, nama table TPenjualan | Ctrl+T dulu. Kasih nama TPenjualan. | Ikon keyboard |
| 0:25 | Kartu chapter | Langkah 2/6 · Kartu KPI | |
| 0:27 | Sheet Latihan, ketik `=SUM(TPenjualan[Total (Rp)])` | Total penjualan. Pakai nama kolom, bukan A1. | Kartu rumus |
| 0:42 | `=COUNT(TPenjualan[Total (Rp)])` | Jumlah transaksi. | |
| 0:50 | `=B2/B3` | Rata-rata per transaksi. | |
| 0:58 | Kartu chapter | Langkah 3/6 · Total per cabang & bulan | |
| 1:00 | `=SUMIFS(TPenjualan[Total (Rp)],TPenjualan[Cabang],A9)` | SUMIFS: jumlahkan kalau cabangnya cocok. | Kartu rumus 3 warna |
| 1:20 | SUMIFS bulan dengan `">="&DATE(2026,1,1)` | Per bulan: tanggal dari awal sampai akhir bulan. | Zoom ke DATE |
| 1:40 | `=INDEX(A9:A11,MATCH(MAX(B9:B11),B9:B11,0))` | Cabang terbaik otomatis. | |
| 1:55 | Kartu checkpoint | Cek: Jakarta paling besar. | |
| 2:00 | Kartu chapter | Langkah 4/6 · Chart | |
| 2:02 | Line chart per bulan, bar chart per cabang | Tren: line. Banding cabang: bar. | |
| 2:20 | Hapus gridline, warna teal, label data | Rapihin: buang yang nggak dibaca. | |
| 2:35 | Kartu chapter | Langkah 5/6 · Slicer | |
| 2:37 | Insert PivotTable dari TPenjualan, PivotChart, Insert Slicer Cabang & Kategori | Slicer: filter dengan sekali klik. | |
| 3:00 | Report Connections: slicer ke semua pivot | Satu slicer, semua chart ikut. | Zoom ke dialog |
| 3:15 | Kartu chapter | Langkah 6/6 · Tata letak | |
| 3:17 | Sheet baru "Dashboard", latar navy, 4 kartu KPI atas, 2 chart bawah, slicer kiri | Atas: angka. Bawah: cerita. Kiri: filter. | Grid guide |
| 3:45 | View > hilangkan Gridlines & Headings | Sembunyikan gridline biar kayak aplikasi. | |
| 3:55 | Demo klik slicer | Bos minta per kategori? Klik. | |
| 4:05 | Kartu rekap | Table → KPI → SUMIFS → Chart → Slicer → Layout | |
| 4:12 | End screen | Lanjut: Ubah dashboard ini jadi slide (T3) | |

Ini video deep dive, jadi tiap langkah boleh lebih lama: tunjukin format angka (Rp, jutaan pakai custom format `#,##0,, "jt"`), dan bikin versi dark/light.
