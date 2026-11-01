# Upload LND · Dashboard Learning & Development Interaktif di Excel

File: `LND.mp4` (1920x1080, 4:24, tanpa narasi, musik upbeat orisinal + sound effect), `LND-thumbnail.png` (1280x720), file latihan `LnD-dashboard.xlsx`.
Render ulang: `cd video && npm run render:youtube -- LND`. Naskah ada di `video/src/youtube/lnd.ts`.
Data & file Excel dibikin ulang dengan `python3 youtube/scripts/build_lnd_dashboard.py` (angka di video otomatis ikut).

Jadwal: video bonus di luar kalender T1–T9. Saran: tayang Selasa/Rabu 19.00 supaya nggak tabrakan sama tutorial Jumat, spoiler diposting 1–2 hari sebelumnya.

## Judul

```
Bikin Dashboard Training (L&D) Interaktif di Excel, Tanpa Pivot & Macro
```

Cadangan:

- `Dashboard HR Learning & Development di Excel: 1 Klik Semua Berubah`
- `Cara Bikin Dashboard Excel Modern untuk Tim Training (File Gratis)`

## Deskripsi

```
Data training 360 baris diubah jadi dashboard L&D yang bisa difilter per departemen dan metode, sekali klik. Tanpa PivotTable, tanpa macro, jalan di Excel 2010 ke atas. Tanpa suara, jadi bisa ditonton di mana aja.

📂 File dashboard + data latihan (gratis): [link Google Drive ke LnD-dashboard.xlsx]
Level: Menengah · Excel 2010 ke atas, Excel 365, Excel versi web

⏱️ Chapter
00:00 Hasil akhir: dashboard interaktif
00:26 Langkah 1 · Jadikan data sebuah Table
00:50 Langkah 2 · Bikin dropdown filter
01:20 Langkah 3 · Trik kriteria "Semua"
01:45 Langkah 4 · Rumus KPI
02:28 Langkah 5 · Tabel bantu buat chart
02:56 Langkah 6 · Desain dashboard modern
03:37 Demo: dashboard-nya hidup
04:03 Rekap

🧮 Rumus di video ini
Kriteria: =IF(Dashboard!$B$6="Semua","*",Dashboard!$B$6)
Peserta:  =COUNTIFS(T_Training[Departemen],$B$2,T_Training[Metode],$B$3)
Selesai:  =COUNTIFS(T_Training[Departemen],$B$2,T_Training[Metode],$B$3,T_Training[Status],"Selesai")
Skor:     =IFERROR(AVERAGEIFS(T_Training[Kenaikan],T_Training[Departemen],$B$2,T_Training[Metode],$B$3,T_Training[Status],"Selesai"),0)
Terbaik:  =INDEX(D2:D7,MATCH(MAX(G2:G7),G2:G7,0))

KPI: peserta, completion rate, kenaikan skor (post-test vs pre-test), kepuasan, jam belajar, biaya.
Data di file ini dummy, bebas dipakai latihan.

#Excel #DashboardExcel #LearningAndDevelopment
```

## Tags

```
dashboard excel, dashboard hr excel, dashboard training, learning and development, dashboard l&d, excel hr, countifs, averageifs, data validation dropdown, dashboard interaktif excel, tutorial excel, excel bahasa indonesia, excel kantor, kpi training, laporan training karyawan
```

## Setelan YouTube Studio

| Setelan | Isi |
| --- | --- |
| Playlist | Dashboard & Visualisasi, Naik Kelas (Menengah) |
| Audience | No, it's not made for kids |
| Category | Education |
| Bahasa video & judul | Indonesian |
| Subtitle | Nggak perlu, teks sudah tertanam di video |
| Musik latar | Sudah tertanam: `music-upbeat.mp3`, track upbeat orisinal yang disintesis dari nol pakai `youtube/scripts/synth_music_upbeat.py` (tanpa sampel), aman dari klaim copyright |
| End screen | Mulai 04:10 (14 detik terakhir): 1 video (T4 dashboard penjualan, atau "Best for viewer") + tombol Subscribe |
| Cards | 01:20 ke T1 (XLOOKUP) buat yang belum paham rumus lookup |
| Komentar pin | "Coba pilih IT + Online di file latihan. Completion-nya berapa persen? Tulis di komen 👇" |

## Spoiler WA / IG / TikTok (9:16, semua di bawah 30 detik)

Posting 1–2 hari sebelum full video tayang. Di WA Status langsung upload file-nya (di bawah 30 detik jadi nggak kepotong). Di TikTok/Reels/Shorts pakai caption di bawah.

| File | Isi | Durasi |
| --- | --- | --- |
| `LND-S1.mp4` | Spoiler: dashboard jadi, ganti filter, semua angka berubah | 25 dtk |
| `LND-S2.mp4` | Trik rumus "Semua" pakai bintang `*` + hasilnya di dashboard | 30 dtk |
| `LND-S3.mp4` | Before → after: data mentah 360 baris jadi dashboard | 24 dtk |

Caption S1:
```
Dashboard training, 1 klik semua berubah. Excel biasa, tanpa macro 🔥
Full tutorial step-by-step + file gratis: YouTube Rumus Kerja
#Excel #DashboardExcel #HR #ExcelTips
```

Caption S2:
```
Dropdown "Semua" bikin COUNTIFS error? Ganti jadi bintang * ⭐
Simpan dulu biar nggak lupa. Full tutorial di YouTube Rumus Kerja
#Excel #RumusExcel #COUNTIFS #TrikExcel
```

Caption S3:
```
Dari 360 baris data training jadi dashboard yang bisa diklik 📊
Mau file-nya? Cek YouTube Rumus Kerja
#Excel #DashboardExcel #LearningAndDevelopment #HR
```

Teks status WA (tempel di bawah video):
```
Lagi bikin dashboard training di Excel, tinggal klik semua angka berubah. Full video-nya tayang di YouTube Rumus Kerja 👀
```

## Sebelum upload

- [ ] Upload `LnD-dashboard.xlsx` ke Google Drive, set "Anyone with the link", tempel link di deskripsi.
- [ ] Buka file-nya sekali di Excel dan coba ganti dropdown (sel B6 dan F6) biar yakin chart ikut berubah.
- [ ] Tonton sekali full-screen di HP untuk cek teks kebaca, terutama spoiler 9:16.
