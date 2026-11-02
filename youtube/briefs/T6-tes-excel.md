# T6 · Soal Tes Excel yang Bikin 80% Pelamar Gagal

| | |
| --- | --- |
| Tayang | Jumat 4 Desember 2026, 19.00 WIB |
| Pillar · Level | Tes & Karier · Menengah |
| Durasi target | 8 sampai 10 menit |
| File latihan | [`latihan/T6-tes-excel.xlsx`](../latihan/T6-tes-excel.xlsx) (10 soal + kunci) |
| Thumbnail | Timer 30 detik + soal blur. Teks: **"80% GAGAL"** |

Catatan: angka "80%" adalah hook, bukan data riset. Di video tulis kecil "versi kami" atau ganti jadi "Soal Tes Excel yang Sering Bikin Pelamar Gagal" kalau mau aman.

## Format

Tiap soal: tampilkan soal 3 detik, timer 30 detik di pojok (dipercepat 4x di video), lalu jawaban + rumus + penjelasan 1 kalimat. Ajak penonton pause dan hitung skor sendiri.

| No | Soal | Rumus jawaban | Caption penjelas |
| --- | --- | --- | --- |
| 1 | Total gaji divisi Sales | `=SUMIFS(D:D,C:C,"Sales")` | SUMIFS: jumlah dengan syarat. |
| 2 | Jumlah karyawan Finance | `=COUNTIFS(C:C,"Finance")` | COUNTIFS: hitung dengan syarat. |
| 3 | Rata-rata gaji HR | `=AVERAGEIFS(D:D,C:C,"HR")` | Rata-rata dengan syarat. |
| 4 | Gaji tertinggi | `=MAX(D:D)` | Pemanasan, jangan sampai salah. |
| 5 | Nama dengan gaji tertinggi | `=INDEX(B:B,MATCH(MAX(D:D),D:D,0))` | Di sini banyak yang gagal. |
| 6 | Divisi milik K007 | `=XLOOKUP("K007",A:A,C:C)` | Lookup dasar, wajib bisa. |
| 7 | Yang masuk sebelum 2022 | `=COUNTIFS(E:E,"<"&DATE(2022,1,1))` | Syarat tanggal pakai & dan DATE. |
| 8 | Masa kerja Andi (tahun) | `=DATEDIF(E2,DATE(2026,11,1),"Y")` | DATEDIF nggak muncul di autocomplete. |
| 9 | Gaji Bunga naik 10% | `=D3*1.1` | Bukan `D3+10%`. |
| 10 | Label Senior/Junior Citra | `=IF(DATEDIF(E4,DATE(2026,11,1),"Y")>=5,"Senior","Junior")` | Gabung IF + DATEDIF. |

## Pembuka & penutup

| Waktu | Di layar | Caption |
| --- | --- | --- |
| 0:00 | Soal no. 5 + timer | Bisa jawab ini dalam 30 detik? |
| 0:04 | Sheet Data | 10 soal yang sering keluar di tes kerja. |
| 0:08 | Kartu aturan | Pause, kerjakan, hitung skor kamu. |
| akhir | Kartu skor | 8+ siap tes. 5 sampai 7 latihan lagi. Di bawah 5? Mulai dari playlist Dasar. |
| akhir | Ajakan komentar | Tulis skor kamu di komentar. |
