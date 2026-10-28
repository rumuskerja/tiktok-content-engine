# T2 · Laporan 2 Jam Jadi 2 Menit dengan Power Query

| | |
| --- | --- |
| Tayang | Jumat 13 November 2026, 19.00 WIB |
| Pillar · Level | Otomasi & Rapihin Data · Menengah |
| Durasi target | 8 sampai 10 menit |
| File latihan | [`latihan/T2-power-query/`](../latihan/T2-power-query/) (3 file cabang yang sengaja berantakan) |
| Excel | 2016 ke atas (Windows), Excel 365 Mac |
| Thumbnail | Kiri: 3 file tumpuk berantakan. Kanan: 1 tabel rapi. Teks: **"2 JAM → 2 MENIT"** |

## Script layar

| Waktu | Di layar | Caption | Efek |
| --- | --- | --- | --- |
| 0:00 | Timer 2:00:00 berubah jadi 0:02:00 | Laporan 2 jam jadi 2 menit. | Teks besar, SFX whoosh |
| 0:04 | Klik Refresh All, tabel gabungan update | Cukup klik satu tombol tiap Senin. | Ikon klik |
| 0:08 | Folder berisi 3 file cabang | Kasus: tiap cabang kirim file sendiri. | |
| 0:13 | Buka 3 file sekilas | Formatnya beda-beda dan berantakan. | Callout merah: tanggal teks, baris TOTAL, spasi |
| 0:20 | Kartu chapter | Langkah 1/5 · Ambil semua file sekaligus | |
| 0:22 | Data > Get Data > From File > From Folder | Menu: Data > Get Data > From Folder. | Tulis nama menu besar |
| 0:32 | Pilih folder, klik Combine & Transform | Pilih folder, lalu Combine & Transform. | Zoom ke tombol |
| 0:45 | Power Query Editor terbuka | Ini Power Query. Semua langkah direkam. | Callout panel Applied Steps |
| 0:52 | Kartu chapter | Langkah 2/5 · Buang baris sampah | |
| 0:54 | Filter kolom Tanggal, hapus null dan "TOTAL" | Buang baris kosong dan TOTAL. | |
| 1:08 | Kartu chapter | Langkah 3/5 · Rapihin teks | |
| 1:10 | Kolom Produk > Transform > Format > Trim, lalu Capitalize Each Word | Trim buang spasi, Capitalize rapihin huruf. | Before/after kecil |
| 1:28 | Kartu chapter | Langkah 4/5 · Benerin tipe data | |
| 1:30 | Ubah tipe Qty ke Whole Number | Qty yang tersimpan sebagai teks, jadi angka. | Ikon "123" |
| 1:40 | Tanggal: Change Type > Using Locale > Indonesia | Tanggal campur format? Pakai Using Locale. | Zoom ke dialog |
| 1:55 | Tambah Custom Column `Total = [Qty]*[Harga]` | Tambah kolom Total. | Kartu rumus |
| 2:08 | Ganti nama kolom Source.Name jadi Cabang, hapus ".xlsx" | Nama file jadi nama cabang. | |
| 2:20 | Kartu chapter | Langkah 5/5 · Close & Load | |
| 2:22 | Home > Close & Load | Hasilnya jadi tabel di Excel. | |
| 2:30 | Kartu checkpoint | Sampai sini: 120 baris, 3 cabang, tanpa error. | |
| 2:36 | Copy file cabang baru ke folder, Refresh All | Bulan depan? Taruh file baru, klik Refresh. | Momen "wah", tahan 2 detik |
| 2:50 | Kartu rekap | Folder → Combine → Rapihin → Close & Load → Refresh | |
| 2:58 | End screen | Lanjut: Bikin Dashboard dari data ini | Link ke T4 |

Perpanjang ke 8 menit dengan memperlihatkan isi Applied Steps satu per satu (hapus satu step, lihat efeknya) dan tips menyimpan folder di OneDrive biar path nggak putus.

## Chapter

```
00:00 Hasil akhir
00:20 Ambil semua file sekaligus
00:52 Buang baris sampah
01:08 Rapihin teks
01:28 Benerin tipe data
02:20 Close & Load + Refresh
```
