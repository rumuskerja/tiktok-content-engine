# T5 · Rekap Absensi Otomatis, Tinggal Copy Rumus

| | |
| --- | --- |
| Tayang | Selasa 24 November 2026, 19.00 WIB |
| Pillar · Level | Otomasi & Rapihin Data · Menengah |
| Durasi target | 6 sampai 8 menit |
| File latihan | [`latihan/T5-absensi.xlsx`](../latihan/T5-absensi.xlsx) (10 karyawan, log 2 sampai 27 Nov 2026) |
| Excel | 2010 ke atas |
| Thumbnail | Kiri: log absen panjang. Kanan: rekap rapi dengan merah/hijau. Teks: **"ABSEN BERES"** |

## Script layar

| Waktu | Di layar | Caption | Efek |
| --- | --- | --- | --- |
| 0:00 | Sheet Kunci Jawaban, telat >3 kali merah | Rekap absensi sebulan, otomatis. | |
| 0:04 | Sheet Log Absensi | Datanya: log jam masuk tiap hari. | Scroll cepat |
| 0:09 | Sheet Latihan, kolom kuning | Tugas: hitung hadir, telat, alpa, % hadir. | |
| 0:14 | Kartu chapter | Langkah 1/5 · Hari kerja | |
| 0:16 | `=NETWORKDAYS($I$1,$I$2)` | NETWORKDAYS: hitung hari kerja, Sabtu-Minggu dilewati. | Kartu rumus |
| 0:30 | Teks kecil | Ada libur nasional? Tambah argumen ke-3. | |
| 0:35 | Kartu chapter | Langkah 2/5 · Hadir | |
| 0:37 | `=COUNTIFS('Log Absensi'!B:B,A2)` | Hitung berapa kali nama muncul di log. | |
| 0:50 | Kartu chapter | Langkah 3/5 · Telat | |
| 0:52 | `=COUNTIFS('Log Absensi'!B:B,A2,'Log Absensi'!C:C,">"&$I$3)` | Tambah syarat: jam masuk lewat 08:00. | Zoom ke `">"&` |
| 1:10 | Kartu chapter | Langkah 4/5 · Alpa & % hadir | |
| 1:12 | `=B2-C2` dan `=C2/B2` format % | Alpa = hari kerja − hadir. | |
| 1:25 | Kartu checkpoint | Cek: Intan hadir 15 dari 20 hari. | |
| 1:30 | Kartu chapter | Langkah 5/5 · Warna otomatis | |
| 1:32 | Conditional Formatting > New Rule > `=$D2>3` merah | Telat lebih dari 3 kali: merah. | |
| 1:48 | `=$F2>=0.95` hijau | Hadir 95% ke atas: hijau. | |
| 2:00 | Ganti tanggal akhir, semua update | Bulan depan? Ganti tanggal saja. | |
| 2:08 | Kartu rekap | NETWORKDAYS · COUNTIFS · Conditional Formatting | |
| 2:15 | End screen | Lanjut: Soal Tes Excel (T6) | |

Perpanjang dengan bonus: daftar libur nasional di sheet terpisah dan dipakai di NETWORKDAYS.
