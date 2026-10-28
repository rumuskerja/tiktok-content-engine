# T1 · Berhenti Pakai VLOOKUP, Ini Penggantinya di 2026

| | |
| --- | --- |
| Tayang | Selasa 10 November 2026, 19.00 WIB |
| Pillar · Level | Rumus Sakti · Menengah |
| Durasi target | 7 sampai 8 menit |
| File latihan | [`latihan/T1-xlookup.xlsx`](../latihan/T1-xlookup.xlsx) |
| Excel | 2021, 365, atau web (alternatif INDEX MATCH untuk 2016/2019) |
| Thumbnail | Kiri: `VLOOKUP` dicoret merah. Kanan: `XLOOKUP` teal. Teks: **"PENSIUN AJA"** |

## Script layar

| Waktu | Di layar | Caption | Efek |
| --- | --- | --- | --- |
| 0:00 | Sheet Kunci Jawaban, kolom Nama/Harga/Total terisi semua | VLOOKUP udah pensiun. | Teks besar tengah, SFX pop |
| 0:03 | Split: VLOOKUP error `#N/A` vs XLOOKUP "Tidak ada" | Ini penggantinya, dan lebih gampang. | Wipe kiri ke kanan |
| 0:07 | Sheet Latihan kosong | Kasus: transaksi cuma ada kode produk. | Zoom ke kolom Kode |
| 0:11 | Sheet Data_Produk | Nama dan harga ada di sheet lain. | Callout panah ke tab sheet |
| 0:15 | Kembali ke Latihan | Tugas: isi Nama, Harga, Total otomatis. | Highlight kolom kuning |
| 0:20 | Kartu chapter | Langkah 1/4 · Masalah VLOOKUP | Label kanan atas |
| 0:22 | Ketik `=VLOOKUP(B2,Data_Produk!A:D,2,0)` | Cara lama: harus hitung nomor kolom. | Zoom ke angka 2 |
| 0:32 | Sisipkan kolom di Data_Produk, hasil berubah salah | Kolom disisipin? Hasilnya langsung salah. | Kotak merah di sel salah |
| 0:42 | Undo | Itu kelemahan pertama VLOOKUP. | |
| 0:46 | Kartu chapter | Langkah 2/4 · XLOOKUP dasar | |
| 0:48 | Ketik `=XLOOKUP(B2,` | Argumen 1: apa yang dicari. | Kartu rumus, warna teal |
| 0:55 | Lanjut `Data_Produk!A:A,` | Argumen 2: dicari di kolom mana. | Warna kuning |
| 1:02 | Lanjut `Data_Produk!B:B)` | Argumen 3: ambil dari kolom mana. | Warna putih |
| 1:09 | Enter, hasil muncul | Nggak perlu hitung nomor kolom lagi. | Jeda 1 detik, SFX pop |
| 1:14 | Double-click fill handle | Copy ke bawah. | Ikon double-click |
| 1:18 | Ulangi untuk Harga (kolom D) | Harga: ganti kolom hasilnya saja. | |
| 1:30 | Total `=C2*F2` | Total = Qty × Harga. | |
| 1:40 | Kartu checkpoint | Sampai sini, hasil kamu harus seperti ini. | Screenshot hasil 5 baris |
| 1:45 | Kartu chapter | Langkah 3/4 · Kalau datanya nggak ada | |
| 1:47 | Zoom ke TRX-014 yang `#N/A` | Kode P099 nggak ada di daftar produk. | Kotak merah |
| 1:53 | Tambah `,"Tidak ada"` sebagai argumen 4 | Argumen 4: teks kalau nggak ketemu. | Kartu rumus |
| 2:03 | Hasil jadi "Tidak ada" | Laporan bersih, tanpa error. | SFX pop |
| 2:08 | Kartu chapter | Langkah 4/4 · Cari pakai 2 kriteria | |
| 2:10 | Sheet Tantangan | Cari target Bandung bulan Nov. | Highlight E2:F2 |
| 2:15 | Ketik `=XLOOKUP(E2&F2,A2:A10&B2:B10,C2:C10)` | Gabung 2 kriteria pakai tanda &. | Kartu rumus |
| 2:30 | Hasil muncul | VLOOKUP nggak bisa begini tanpa kolom bantu. | |
| 2:36 | Teks kecil | Excel lama: pakai INDEX MATCH (lihat file). | Badge "Excel 2016/2019" |
| 2:42 | Kartu rekap | XLOOKUP(apa, di mana, ambil apa, kalau nggak ada) | Bisa di-screenshot, tahan 5 detik |
| 2:50 | End screen | Lanjut: Laporan 2 Jam Jadi 2 Menit | Link ke T2 |

Catatan: durasi tabel di atas adalah inti langkah. Ketik rumus dengan kecepatan baca dan beri jeda setelah tiap hasil, biasanya total jadi 7 sampai 8 menit. Kalau masih di bawah 6 menit, tambah contoh: XLOOKUP cari dari bawah (argumen search_mode -1).

## Chapter

```
00:00 Hasil akhir
00:20 Masalah VLOOKUP
00:46 XLOOKUP dasar
01:45 Kalau datanya nggak ada
02:08 Cari pakai 2 kriteria
02:42 Rekap rumus
```

## Shorts dari video ini

S01 (rekap 30 detik XLOOKUP) dan S02 (tebak hasil TRX-014). Lihat [`shorts.md`](../shorts.md).
