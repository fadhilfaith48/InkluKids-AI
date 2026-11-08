# Kebijakan Privasi PahamInklusif AI

> **Status: draf untuk karya lomba LOGICODIX 2026.** Dokumen ini menjelaskan praktik yang dirancang untuk aplikasi, dan bukan nasihat hukum. Sebelum dipakai secara nyata oleh publik, perlu ditinjau oleh pihak yang berkompeten. Bagian bertanda `<isi>` harus diputuskan dan diisi.

Pengguna utama aplikasi ini adalah **anak-anak penyandang disabilitas**. Karena itu aplikasi dirancang untuk mengumpulkan data sesedikit mungkin.

## 1. Data yang Diproses

| Data | Tempat | Tujuan | Catatan |
|---|---|---|---|
| Gambar halaman buku | Dikirim ke Gemini, **tidak disimpan** oleh aplikasi | OCR dan penyederhanaan materi | Pengguna diminta hanya memotret halaman buku |
| Teks hasil OCR, poin, istilah, dan kutipan sumber | `localStorage` di browser pengguna | Riwayat materi dan Lihat Sumber | Dapat dihapus dari menu Materi Saya |
| Bintang | Memori sesi browser | Elemen menyenangkan | Tidak dikirim ke server |
| Pengaturan tampilan | Memori sesi browser | Menyesuaikan tampilan | Belum disimpan permanen |
| Log teknis server | Server hosting | Diagnosis kegagalan | Hanya nama jenis error, tanpa isi gambar atau teks |

Aplikasi **tidak** memakai pelacak iklan, **tidak** membuat akun, dan **tidak** menjual data.

## 2. Yang Diminta dari Pengguna

- Memotret **hanya halaman buku**. Jangan memotret wajah, dokumen identitas, atau informasi pribadi.
- Penggunaan oleh siswa di bawah umur sebaiknya didampingi atau disetujui orang tua atau guru.

## 3. Pihak Ketiga yang Memproses Data

| Pihak | Data | Tujuan |
|---|---|---|
| Layanan Gemini API (Google) | Gambar halaman buku dan teks yang dikirim untuk diproses | OCR, penyederhanaan, dan penjelasan alternatif |
| Vercel (bila dipakai untuk hosting) | Permintaan HTTP ke aplikasi | Hosting |

Text-to-Speech memakai Web Speech API browser. Pada sebagian browser, suara dapat diproses oleh penyedia browser; aplikasi tidak merekam atau menyimpan audio.

**Perlu diperiksa dan dicantumkan:** ketentuan penggunaan data pada layanan Gemini API yang dipakai (misalnya apakah data masukan dapat dipakai untuk peningkatan layanan pada paket tertentu). Tuliskan hasil pemeriksaan di sini: `<isi sesudah memeriksa ketentuan layanan>`.

## 4. Keamanan

- API key Gemini hanya berada di sisi server dan tidak dikirim ke browser.
- Tidak ada database pengguna pada MVP, sehingga tidak ada data akun yang disimpan.
- Riwayat hanya berada di perangkat pengguna dan dapat dihapus kapan saja.
- Input divalidasi di server (tipe, ukuran gambar, panjang teks).

## 5. Lama Penyimpanan

| Data | Lama penyimpanan |
|---|---|
| Gambar halaman buku | Tidak disimpan oleh aplikasi; hanya diproses saat permintaan |
| Hasil materi dan riwayat | Sampai pengguna menghapus dari Materi Saya atau membersihkan data browser |
| Log teknis | `<isi, mis. 30 hari>` |

## 6. Hak Pengguna

- **Menghapus materi:** buka **Materi Saya**, lalu tekan **Hapus** pada materi yang ingin dihapus.
- **Menghapus semua data lokal:** hapus data situs di pengaturan browser.
- **Mengakses data:** seluruh materi yang tersimpan dapat dilihat di Materi Saya.
- Karena MVP tidak memakai akun, tidak ada data akun yang perlu dihapus dari server.
- Pertanyaan atau permintaan terkait data dapat dikirim ke: `<isi kontak tim>`.

## 7. Landasan Hukum

Aplikasi dirancang dengan memperhatikan **Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi** dan prinsip minimisasi data, terutama karena penggunanya anak-anak.

## 8. Transparansi AI

- Setiap konten dari AI diberi label "Dibuat oleh AI". *(Catatan: label ini masih perlu ditambahkan pada antarmuka; lihat docs/TESTING.md.)*
- Tombol **Lihat Sumber** menampilkan kutipan teks asli yang menjadi dasar penjelasan.
- Poin yang tidak dapat dirujuk ke teks sumber ditandai "Belum dapat dirujuk".
- AI tidak dipakai untuk diagnosis atau penilaian siswa.

## 9. Ramah Anak

- Tanpa streak harian, hadiah tanpa batas, atau notifikasi bujukan.
- Pengingat istirahat dan Mode Tenang tersedia.

## 10. Perubahan Kebijakan

Perubahan akan dicatat pada dokumen ini beserta tanggalnya.

| Tanggal | Perubahan |
|---|---|
| 4 November 2026 | Draf awal disesuaikan dengan MVP tanpa akun dan riwayat lokal |

## 11. Kontak

`<isi kontak tim>`
