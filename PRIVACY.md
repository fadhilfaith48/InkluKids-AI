# Kebijakan Privasi PahamInklusif AI

> **Status: draf untuk karya lomba LOGICODIX 2026.** Dokumen ini menjelaskan praktik yang dirancang untuk aplikasi, dan bukan nasihat hukum. Sebelum dipakai secara nyata oleh publik, perlu ditinjau oleh pihak yang berkompeten. Bagian bertanda `<isi>` harus diputuskan dan diisi.

Pengguna utama aplikasi ini adalah **anak-anak penyandang disabilitas**. Karena itu aplikasi dirancang untuk mengumpulkan data sesedikit mungkin.

## 1. Data yang Diproses

| Data | Tempat | Tujuan | Catatan |
|---|---|---|---|
| Gambar halaman buku | Dikirim ke backend dan Gemini; saat ini **tidak disimpan** permanen. Rencana: disimpan di bucket privat Supabase Storage dan diakses lewat signed URL | OCR dan penyederhanaan materi | Pengguna diminta hanya memotret halaman buku |
| Cache hasil scan | Memori proses backend, maksimal 1 jam | Mencegah pemrosesan gambar yang sama dua kali (Green IT) | Berisi hash gambar dan hasil teks; hilang saat server restart |
| Teks hasil OCR, poin, istilah, dan kutipan sumber | `localStorage` (default) atau database Supabase bila `NEXT_PUBLIC_DATA_MODE=supabase` | Riwayat materi dan Lihat Sumber | Dapat dihapus dari menu Materi Saya |
| Bintang | `localStorage` atau database Supabase (bagian dari materi) | Elemen menyenangkan | Tidak dipakai untuk iklan |
| Nama guru, catatan guru, status verifikasi | `localStorage` (default) atau database Supabase | Fitur Mode Guru | Terlihat oleh guru dan siswa yang terhubung |
| Skor kuis (terakhir, terbaik, total soal, jumlah percobaan) dan status selesai | `localStorage` (default) atau database Supabase | Latihan mandiri (bukan penilaian resmi) | Terlihat oleh siswa dan guru binaannya |
| Akun login | Supabase Auth (email, kata sandi terenkripsi, peran) | Login guru/siswa | Siswa dapat mendaftar dengan email; akun guru dibuat pengelola |
| Materi buatan guru (judul, teks, poin) dan salinannya untuk siswa | Database Supabase saat `NEXT_PUBLIC_DATA_MODE=supabase` | Guru membuat materi, lalu membagikannya ke siswa binaan | Salinan materi dimiliki tiap siswa; guru binaan dapat melihatnya |
| Pengaturan tampilan | Profil Supabase (`accessibility_settings`) setelah login; memori sesi untuk tamu | Menyesuaikan tampilan dan kebutuhan aksesibilitas | Dapat diubah kapan saja dari menu Pengaturan |
| Log teknis server | Server hosting | Diagnosis kegagalan | Hanya nama jenis error, tanpa isi gambar atau teks |

Aplikasi **tidak** memakai pelacak iklan dan **tidak** menjual data. Siswa dapat
mendaftar dengan email dan kata sandi; akun guru dibuat oleh pengelola.
Persetujuan orang tua/guru untuk pengguna di bawah umur masih dilakukan secara
manual oleh pendamping, belum berupa alur digital.

## 2. Yang Diminta dari Pengguna

- Memotret **hanya halaman buku**. Jangan memotret wajah, dokumen identitas, atau informasi pribadi.
- Penggunaan oleh siswa di bawah umur sebaiknya didampingi atau disetujui orang tua atau guru.

## 3. Pihak Ketiga yang Memproses Data

| Pihak | Data | Tujuan |
|---|---|---|
| Layanan Gemini API (Google) | Gambar halaman buku dan teks yang dikirim untuk diproses | OCR, penyederhanaan, dan penjelasan alternatif |
| Supabase (bila `NEXT_PUBLIC_DATA_MODE=supabase`) | Akun, materi, verifikasi guru, dan hasil kuis | Login, penyimpanan, dan sinkronisasi antar perangkat |
| Hosting backend (Render/Railway/Cloud Run/VPS) | Permintaan HTTP dan log teknis | Menjalankan API FastAPI |
| Vercel (bila dipakai untuk hosting) | Permintaan HTTP ke aplikasi | Hosting frontend |

Text-to-Speech memakai Web Speech API browser. Pada sebagian browser, suara dapat diproses oleh penyedia browser; aplikasi tidak merekam atau menyimpan audio.

**Perlu diperiksa dan dicantumkan:** ketentuan penggunaan data pada layanan Gemini API yang dipakai (misalnya apakah data masukan dapat dipakai untuk peningkatan layanan pada paket tertentu). Tuliskan hasil pemeriksaan di sini: `<isi sesudah memeriksa ketentuan layanan>`.

## 4. Keamanan

- API key Gemini hanya berada di sisi server dan tidak dikirim ke browser.
- Frontend hanya memakai anon/publishable key Supabase; service role key tidak pernah dipakai di browser.
- Akses data diatur Row Level Security: siswa hanya melihat datanya sendiri, guru hanya melihat siswa binaannya.
- Guru tidak boleh mengubah poin siswa secara langsung; perubahan materi difasilitasi melalui alur verifikasi (RPC `verify_scan`).
- Verifikasi token Supabase (JWT) di backend sudah aktif via JWKS (`AUTH_MODE=optional`/`required`), dan endpoint AI dilindungi rate limit per akun (atau per IP untuk tamu). Gambar halaman buku tidak disimpan permanen (zero image retention; rencana Supabase Storage masih direncanakan).
- Tanpa login, riwayat dan data belajar tetap berada di perangkat pengguna dan dapat dihapus kapan saja.
- Input divalidasi di server (tipe, ukuran gambar, panjang teks).

## 5. Lama Penyimpanan

| Data | Lama penyimpanan |
|---|---|
| Gambar halaman buku | Saat ini tidak disimpan permanen; hanya diproses saat permintaan. Jika Supabase Storage diaktifkan: sampai pengguna menghapus materi/akun |
| Cache hasil scan | Maksimal 1 jam di memori backend, lalu dihapus otomatis |
| Hasil materi dan riwayat | Sampai pengguna menghapus dari Materi Saya atau membersihkan data browser |
| Nama guru, catatan, status verifikasi, dan skor kuis | Sampai pengguna menghapus materi terkait atau membersihkan data browser |
| Log teknis | `<isi, mis. 30 hari>` |

## 6. Hak Pengguna

- **Menghapus materi:** buka **Materi Saya**, lalu tekan **Hapus** pada materi yang ingin dihapus.
- **Menghapus semua data lokal:** hapus data situs di pengaturan browser.
- **Mengakses data:** seluruh materi yang tersimpan dapat dilihat di Materi Saya.
- **Akun Supabase:** pengguna dapat meminta penghapusan akun dan data terkait (materi, verifikasi, hasil kuis, gambar bila Storage aktif) melalui kontak tim. Saat ini belum ada tombol hapus akun di aplikasi.
- Pertanyaan atau permintaan terkait data dapat dikirim ke: `<isi kontak tim>`.

## 7. Landasan Hukum

Aplikasi dirancang dengan memperhatikan **Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi** dan prinsip minimisasi data, terutama karena penggunanya anak-anak.

## 8. Transparansi AI

- Setiap konten dari AI diberi label "Dibuat oleh AI" pada antarmuka.
- Tombol **Lihat Sumber** menampilkan kutipan teks asli yang menjadi dasar penjelasan.
- Poin yang tidak dapat dirujuk ke teks sumber ditandai "Belum dapat dirujuk".
- AI tidak dipakai untuk diagnosis atau penilaian siswa.
- Kuis Ceria disusun lokal dari poin materi, bukan penilaian resmi, dan tidak memanggil AI.

## 9. Ramah Anak

- Tanpa streak harian, hadiah tanpa batas, atau notifikasi bujukan.
- Pengingat istirahat dan Mode Tenang tersedia.

## 10. Perubahan Kebijakan

Perubahan akan dicatat pada dokumen ini beserta tanggalnya.

| Tanggal | Perubahan |
|---|---|
| 7 November 2026 | Draf awal disesuaikan dengan MVP tanpa akun dan riwayat lokal |
| 9 November 2026 | Menambahkan data Mode Guru (nama, catatan, verifikasi) dan skor kuis yang tersimpan lokal |
| 9 November 2026 | Menambahkan sinkronisasi Supabase dan materi buatan guru yang dibagikan ke siswa |
| 9 November 2026 | Menyesuaikan status: registrasi siswa, Supabase Storage, dan verifikasi JWT masih direncanakan; menambahkan hak hapus akun/data Supabase |
| 11 November 2026 | Registrasi siswa aktif dan pengaturan aksesibilitas disimpan ke profil Supabase |
| 11 November 2026 | Token login diverifikasi di backend; klien tidak dapat mengubah peran akun sendiri |

## 11. Kontak

`<isi kontak tim>`
