# CLAUDE.md

Panduan singkat untuk asisten AI yang membantu pengembangan repo ini. Sesuaikan dengan struktur dan perintah final.

## Proyek

**PahamInklusif AI**: aplikasi web yang mengubah foto halaman buku menjadi materi yang sesuai kebutuhan anak penyandang disabilitas, lewat tiga Mode Belajar (Baca, Visual, Suara), dengan tombol Lihat Sumber (Explainable AI). Karya LOGICODIX 2026, Subtema 1 Smart & Fun Education.

Dokumen acuan: `Docs/Archive/PRD InkluKids AI.md`, `Docs/ARCHITECTURE.md`, `Docs/AI.md`, `Backend/README.md`.

## Stack

- Next.js 15 (App Router, TypeScript), Tailwind CSS
- Backend Python 3.12 + FastAPI (`Backend/`); Gemini dipanggil dari backend,
  dengan Route Handler Next.js (`app/api/scan`, `app/api/explain`) sebagai cadangan
- Web Speech API untuk suara
- Supabase Auth, PostgreSQL (tabel `scans`, `teacher_verifications`, `quiz_results`), dan rencana Supabase Storage
- Riwayat materi: Supabase bila `NEXT_PUBLIC_DATA_MODE=supabase`, dengan fallback `localStorage` untuk mode tamu/jaringan
- Aplikasi harus berjalan di localhost dengan `Backend/` (uvicorn) dan `Frontend/` (npm run dev)

## Perintah

```bash
# Backend (terminal 1)
cd Backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (terminal 2)
cd Frontend
npm install        # pasang dependensi
npm run dev        # jalankan di localhost:3000
npm run build      # build produksi
npm start          # jalankan hasil build
npm run lint       # lint
```

Tidak ada perintah seed terpisah; data contoh ada di `Frontend/lib/seed-data.ts`
dan `Backend/app/services/demo_data.py`.

Supabase: isi `Frontend/.env.local` dari `.env.example`
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_DATA_MODE`). Jalankan SQL skema/RLS di Supabase SQL Editor sebelum
memakai mode `supabase`. Jangan pernah memakai `service_role` di frontend.

Status fitur yang belum selesai (per 9 November 2026): antarmuka daftar siswa
binaan, pemindaian atas nama siswa, registrasi siswa, Supabase Storage,
verifikasi JWT di FastAPI, RPC verifikasi guru, dan file SQL skema lengkap di
repository. Jangan menulis di dokumentasi bahwa fitur tersebut sudah tersedia
sampai kodenya benar-benar ada.

## Aturan Wajib

1. **Rahasia:** jangan pernah menaruh `GEMINI_API_KEY` di kode klien, repo, atau log. Gunakan `.env.local`; jaga `.env.example` tanpa nilai asli.
2. **Gemini hanya dari server.** Tidak ada pemanggilan AI langsung dari browser.
3. **Validasi kutipan sumber** di server sebelum hasil ditampilkan. Poin tanpa rujukan valid ditandai.
4. **Dua layanan saja.** UI di `Frontend/` (Next.js) dan AI di `Backend/`
   (FastAPI). Route Handler Next.js hanya cadangan. Jangan menambah layanan
   backend lain. Supabase dipakai untuk Auth/PostgreSQL/(rencana) Storage, bukan
   sebagai layanan backend baru. RLS wajib aktif di semua tabel dan setiap tabel
   baru harus punya kebijakan.
5. **Privasi anak:** jangan menambah pengumpulan data pribadi. Jangan mencatat isi gambar atau teks ke log. Riwayat harus bisa dihapus pengguna. Gambar hanya boleh disimpan di bucket privat dengan signed URL (rencana Storage).
6. **Aksesibilitas bukan opsional:** HTML semantik, label ARIA, fokus keyboard, kontras, target sentuh minimal 44 px, satu aksi utama per layar.
7. **Ramah anak:** tanpa streak harian, hadiah tanpa batas, atau notifikasi bujukan. Animasi harus bisa dimatikan (Mode Tenang).
8. **Label AI:** konten dari AI selalu diberi label "Dibuat oleh AI" dan punya Lihat Sumber.
9. **Jangan menambah fitur di luar scope tanpa persetujuan pemilik proyek.**
   Fitur yang sudah disetujui: **Fase 1** (alur siswa, login/registrasi,
   riwayat, Storage, JWT) dan **Fase 1.5** (guru: daftar siswa binaan,
   verifikasi tersinkron, materi guru + AI, berbagi ke siswa, hasil kuis).
   Status implementasi sebagian ada di `README.md`; jangan menulis fitur yang
   belum ada sebagai "Tersedia".
10. **Guru tidak boleh `UPDATE scans` bebas.** Perubahan poin/judul siswa hanya
    melalui alur verifikasi (RPC/transaksi yang memeriksa `guardianships`).
11. **Role dari database.** Jangan menentukan Mode Guru dari state frontend,
    `localStorage`, atau metadata pengguna. Baca role dari tabel `profiles`.
12. **Efisiensi:** kompres gambar di klien, jangan memanggil AI saat membuka riwayat atau berganti mode.

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
