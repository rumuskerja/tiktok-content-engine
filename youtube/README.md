# Rumus Kerja · YouTube (faceless, tanpa voice over)

Folder ini isi eksekusi blueprint channel YouTube Rumus Kerja: Excel menengah ke atas plus desain presentasi, tanpa wajah dan tanpa narasi. Angle-nya **"dari data mentah sampai slide yang bikin bos ngangguk"**.

| File | Isi |
| --- | --- |
| [`calendar.md`](calendar.md) | Kalender konten 30 Oktober sampai 27 Desember 2026: 1 tutorial tiap akhir pekan |
| [`calendar.csv`](calendar.csv) | Data kalender yang sama, buat dibuka di Excel atau Google Sheets dan update status |
| [`channel-setup.md`](channel-setup.md) | Nama, handle, deskripsi channel, banner, playlist, template deskripsi video, aturan visual |
| [`briefs/`](briefs/) | Brief produksi 6 tutorial pertama: caption per langkah, timing, efek, thumbnail, chapter |
| [`shorts.md`](shorts.md) | 18 Shorts, 2 tiap akhir pekan, dipotong dari tutorial pekan itu |
| [`latihan/`](latihan/) | File latihan Excel untuk tiap tutorial (sheet Latihan, Kunci Jawaban, Tantangan) |
| [`videos/`](videos/) | Aset dan paket upload per video. T1 sudah jadi video animasi lewat Remotion: [`videos/T1/upload.md`](videos/T1/upload.md). Shorts pekan 1: [`videos/shorts-pekan-1.md`](videos/shorts-pekan-1.md). Logo, musik, dan sound effect bersama ada di [`assets/`](assets/) |

Shorts juga bisa dibikin lewat engine TikTok di repo ini (`python -m engine new "topik"`), tapi ingat channel YouTube ini **tanpa voice over**, jadi pakai versi tanpa audio narasi.

## Render video animasi (tanpa rekam layar)

Tutorial bisa dibikin sebagai animasi Excel di Remotion, tanpa rekam layar: naskah per adegan ada di `video/src/youtube/<id>.ts` (contoh `t1.ts`), komponennya `video/src/youtube/Tutorial.tsx`.

```
cd video && npm install
npm run render:youtube -- T1      # youtube/videos/T1/T1.mp4 + T1-thumbnail.png
npm run render:youtube -- S01     # Shorts 9:16 (naskah di video/src/youtube/shorts.ts)
npm run studio                    # preview sambil edit naskah
```

## Alur produksi satu tutorial (rekam layar)

1. Buka brief di `briefs/` dan file latihannya di `latihan/`.
2. Rekam layar pakai auto-zoom (Screen Studio, FocuSee, atau OBS) dengan KeyCastr/Carnac nyala, resolusi 1920x1080, zoom Excel 130%.
3. Ketik rumus pelan, beri jeda 1 detik setelah hasil muncul.
4. Edit di CapCut: tempel caption persis dari tabel brief, tambah callout, sound effect "pop" tiap ganti langkah, musik lo-fi di -25 dB.
5. Export, upload Jumat 19.00 WIB (paling telat Minggu), isi deskripsi pakai template di `channel-setup.md`, lampirkan link file latihan.
6. Potong 1 sampai 2 Shorts dari momen before/after (lihat `shorts.md`).
7. Ubah status di `calendar.csv`: `belum` → `siap` → `tayang`.

## Review

Tiap akhir bulan (Minggu 29 November dan 27 Desember 2026) cek YouTube Studio:

- **CTR thumbnail** di atas 5%. Di bawah itu, ganti thumbnail dulu sebelum ganti topik.
- **Retensi 30 detik pertama** di atas 60%. Kalau jebol, hook atau before/after kurang cepat.
- **Topik dengan view per hari tertinggi**: bikin 2 video turunan dari topik itu bulan depan.
- **Komentar "minta dibahas"**: masukin ke bank ide di bawah.

## Bank ide (Januari 2027 dan seterusnya)

- LAMBDA: bikin rumus sendiri tanpa VBA
- GROUPBY dan PIVOTBY: pivot tanpa PivotTable
- Copilot di Excel: Kerja 1 Hari Jadi 10 Menit
- Python in Excel buat orang non-programmer
- Rumus Excel yang Nggak Diajarin di Kampus
- Morph di PowerPoint: animasi chart yang bikin rapat melek
- Rekap THR dan lembur otomatis

## Catatan teknis

Kunci jawaban T1 dan T6 pakai XLOOKUP, jadi butuh Excel 2021, Excel 365, atau Excel versi web. Di Excel 2016/2019 hasilnya `#NAME?`, dan itu momen bagus buat nunjukin alternatif INDEX MATCH di video.
