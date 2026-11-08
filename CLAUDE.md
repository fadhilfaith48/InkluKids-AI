# CLAUDE.md

Panduan singkat untuk asisten AI yang membantu pengembangan repo ini. Sesuaikan dengan struktur dan perintah final.

## Proyek

**PahamInklusif AI**: aplikasi web yang mengubah foto halaman buku menjadi materi yang sesuai kebutuhan anak penyandang disabilitas, lewat tiga Mode Belajar (Baca, Visual, Suara), dengan tombol Lihat Sumber (Explainable AI). Karya LOGICODIX 2026, Subtema 1 Smart & Fun Education.

Dokumen acuan: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/AI.md`, `docs/DATABASE.md`.

## Stack

- Next.js 15 (App Router, TypeScript), Tailwind CSS
- Gemini API, dipanggil **hanya dari server** (Route Handler `app/api/scan` dan `app/api/explain`)
- Web Speech API untuk suara
- Riwayat materi disimpan di `localStorage` per perangkat
- **Tidak ada layanan backend terpisah.** Implementasi Python/FastAPI lama ada di `archive/backend-fastapi/` dan tidak dijalankan.
- Aplikasi harus berjalan di localhost hanya dengan `frontend/`

## Perintah

```bash
cd frontend        # seluruh perintah dijalankan dari folder ini
npm install        # pasang dependensi
npm run dev        # jalankan di localhost:3000
npm run build      # build produksi
npm start          # jalankan hasil build
npm run lint       # lint
```

Tidak ada perintah seed terpisah; data contoh ada di `frontend/lib/seed-data.ts`.

## Aturan Wajib

1. **Rahasia:** jangan pernah menaruh `GEMINI_API_KEY` di kode klien, repo, atau log. Gunakan `.env.local`; jaga `.env.example` tanpa nilai asli.
2. **Gemini hanya dari server.** Tidak ada pemanggilan AI langsung dari browser.
3. **Validasi kutipan sumber** di server sebelum hasil ditampilkan. Poin tanpa rujukan valid ditandai.
4. **Satu arsitektur.** Jangan menambahkan layanan backend baru. Jika kelak memakai Supabase, RLS wajib aktif dan setiap tabel baru harus punya kebijakan.
5. **Privasi anak:** jangan menambah pengumpulan data pribadi. Jangan mencatat isi gambar atau teks ke log. Riwayat lokal harus bisa dihapus pengguna.
6. **Aksesibilitas bukan opsional:** HTML semantik, label ARIA, fokus keyboard, kontras, target sentuh minimal 44 px, satu aksi utama per layar.
7. **Ramah anak:** tanpa streak harian, hadiah tanpa batas, atau notifikasi bujukan. Animasi harus bisa dimatikan (Mode Tenang).
8. **Label AI:** konten dari AI selalu diberi label "Dibuat oleh AI" dan punya Lihat Sumber.
9. **Jangan menambah fitur di luar MVP** (lihat `ROADMAP.md`) tanpa persetujuan pemilik proyek.
10. **Efisiensi:** kompres gambar di klien, jangan memanggil AI saat membuka riwayat atau berganti mode.

## Konvensi

- Bahasa antarmuka dan dokumentasi: **Bahasa Indonesia**, kalimat pendek dan sederhana.
- Nama kode (variabel, fungsi, tabel) memakai bahasa Inggris.
- Komponen kecil dan dapat diuji; logika validasi dan normalisasi teks di `lib/`.
- Pesan error ramah dan menawarkan langkah berikutnya.
- Commit kecil dengan pesan yang jelas.

## Batasan Ketentuan Lomba

- Source code yang dinilai adalah versi terakhir sebelum batas submission (14 November 2026); tidak boleh diubah sesudahnya.
- Karya harus orisinal dan dapat dipertanggungjawabkan oleh peserta, termasuk kode yang dibantu AI: peserta harus memahami dan dapat menjelaskannya.
- Aset (font, ikon, ilustrasi) harus berlisensi jelas dan dicatat di README.

## Saat Ragu

Tanyakan kepada pemilik proyek sebelum mengubah skema database, kebijakan RLS, prompt AI, atau alur autentikasi.
