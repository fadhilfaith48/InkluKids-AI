# PahamInklusif AI

> **Satu halaman buku, banyak cara memahami.**

Aplikasi web edukasi yang mengubah foto halaman buku pelajaran menjadi materi yang sesuai kebutuhan anak penyandang disabilitas. Karya untuk **LOGICODIX 2026 Hackathon Competition**, Subtema 1: *Smart & Fun Education*.

- Tim: **Git_Commit** — Fadhil Faith Al Abrisam Dewanto
- Repository: https://github.com/fadhilfaith48/InkluKids-AI
- Video demo: `<URL YouTube (Unlisted/Public)>`
- Aplikasi (Vercel): `<URL frontend>`
- Backend API: `<URL backend>`

> **Template submission:** ganti semua teks di dalam `<...>` dengan data asli
> sebelum commit final. Jangan mengisi dengan data palsu.

---

## 1. Masalah

Buku pelajaran umum ditulis untuk anak tanpa hambatan belajar.

- Anak **disleksia dan ADHD** sulit membaca paragraf panjang dan menjaga fokus.
- Anak **tunarungu dan autisme** sulit memahami istilah abstrak dan bahasa kiasan.
- Anak **tunanetra dan low vision** jarang mendapat buku dalam format audio atau braille.
- Guru pendamping tidak punya waktu menyederhanakan setiap halaman secara manual.
- Alat AI umum tidak menunjukkan dari mana jawabannya berasal, sehingga rawan halusinasi.

## 2. Solusi

Pengguna memotret satu halaman buku. Gemini membaca halaman itu, lalu aplikasi menyajikannya lewat tiga **Mode Belajar**:

| Mode | Untuk | Tampilan |
|---|---|---|
| **Mode Baca** | Disleksia, ADHD | Poin pendek, analogi sehari-hari, satu poin per kartu |
| **Mode Visual** | Tunarungu, autisme | Langkah berurutan dan deskripsi isyarat dalam teks |
| **Mode Suara** | Tunanetra, low vision (dukungan dasar) | Hasil dibacakan otomatis, tombol besar, navigasi keyboard, label ARIA |

Setiap penjelasan AI punya tombol **Lihat Sumber** yang menampilkan kutipan teks asli beserta status validasinya (Explainable AI).

## 3. Status Fitur MVP

| Fitur | Status |
|---|---|
| Backend FastAPI (scan, explain, simplify, flashcard, health) | Tersedia |
| Validasi kutipan sumber di backend | Tersedia |
| Cache hash gambar + rate limit | Tersedia (di memori proses) |
| Pindai lewat unggah, kamera, atau data contoh | Tersedia |
| Kompresi gambar di browser | Tersedia |
| OCR + penyederhanaan dengan Gemini | Tersedia (butuh `GEMINI_API_KEY`) |
| Tiga Mode Belajar dari satu hasil | Tersedia |
| Lihat Sumber + validasi kutipan | Tersedia |
| Tanya Penjelasan Lain (AI tutor) | Tersedia |
| Kartu Respons Simbol + pengingat istirahat | Tersedia |
| Mode Tenang, kontras tinggi, huruf lebar, teks 100–200% | Tersedia |
| Bintang dan elemen menyenangkan | Tersedia |
| Mode Guru / verifikasi materi | Tersedia (login Supabase; judul, poin, dan catatan tersinkron) |
| Kuis Ceria dari poin materi | Tersedia (soal disusun lokal; total soal dan skor terbaik disimpan, bukan penilaian resmi) |
| Buat materi sendiri (guru) + bantuan AI | Tersedia (butuh kuota Gemini; ada opsi poin tanpa AI) |
| Bagikan materi guru ke siswa binaan | Tersedia (salinan per siswa; jalankan `Docs/SQL-teacher-materials.sql`) |
| TTS Bahasa Indonesia | Tersedia |
| Pencarian suara pada riwayat (Chrome/Edge) | Tersedia |
| Riwayat materi lokal (maks. 20 materi) | Tersedia |
| Endpoint flashcard AI | Tersedia (UI memakai flashcard hasil scan) |
| Login/akun Supabase | Tersedia (peran guru/siswa; belum ada signup publik) |
| Sinkronisasi lintas perangkat | Tersedia untuk materi, verifikasi, dan skor kuis; Supabase Storage belum |
| Registrasi akun siswa | **Direncanakan** (belum ada di kode) |
| Penyimpanan gambar di Supabase Storage | **Direncanakan** (gambar saat ini hanya diproses untuk OCR) |
| Verifikasi JWT Supabase di backend | **Direncanakan** (saat ini rate limit per IP) |
| RPC verifikasi guru (tanpa `UPDATE scans` bebas) | **Direncanakan** |
| File SQL skema + RLS lengkap di repository | **Direncanakan** (baru ada SQL materi guru) |

Rincian batasan ada di [PRD](Docs/Archive/PRD%20InkluKids%20AI.md) dan [Arsitektur](Docs/ARCHITECTURE.md).

> **Catatan status:** baris **Direncanakan** adalah target yang belum ada di kode
> per 9 November 2026. Jangan menulis "Tersedia" untuk fitur tersebut sampai
> implementasinya selesai dan diuji.

## 4. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript), Tailwind CSS |
| Backend | Python 3.12 + FastAPI, Pydantic, `google-genai` |
| AI | Gemini API (model multimodal ringan, structured output JSON), dipanggil **hanya dari server** |
| Suara | Web Speech API (`speechSynthesis`, `SpeechRecognition`) |
| Auth & database | Supabase Auth + PostgreSQL; RLS di semua tabel; rencana Supabase Storage |
| Riwayat | Supabase (`scans`, `teacher_verifications`, `quiz_results`) + fallback `localStorage` |
| Deployment | Vercel (frontend) + hosting backend (Render/Railway/Cloud Run/VPS); localhost untuk Grand Final |

Frontend memanggil backend FastAPI lewat `NEXT_PUBLIC_API_BASE_URL`. Bila backend
sedang tidak berjalan, Route Handler Next.js (`/api/scan`, `/api/explain`,
`/api/simplify`) menjadi cadangan sehingga demo tidak terhenti. Detail ada di
[Arsitektur](Docs/ARCHITECTURE.md).

## 5. Menjalankan di Localhost

### Prasyarat

- Node.js versi LTS terbaru dan npm
- Python 3.11 atau lebih baru
- API key Gemini (opsional untuk demo karena tersedia materi contoh)
- Browser Chrome atau Edge (disarankan untuk suara Bahasa Indonesia)

### Langkah

1. **Clone repository**
   ```bash
   git clone <url repository>
   cd <nama folder>
   ```

2. **Jalankan backend FastAPI**
   ```bash
   cd Backend
   python -m venv .venv
   # Windows PowerShell
   .venv\Scripts\Activate.ps1
   # macOS/Linux: source .venv/bin/activate

   pip install -r requirements.txt
   copy .env.example .env      # Windows
   # cp .env.example .env      # macOS/Linux
   ```

   Isi `Backend/.env` bila sudah punya kunci:
   ```
   GEMINI_API_KEY=<kunci asli>
   GEMINI_MODEL=gemini-3.6-flash

   # Rencana verifikasi JWT Supabase (belum dipakai kode saat ini)
   # SUPABASE_URL=https://<project>.supabase.co
   # SUPABASE_JWT_AUD=authenticated
   ```

   Jalankan:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Cek http://localhost:8000/health.

3. **Jalankan frontend**
   ```bash
   cd ../Frontend
   npm install
   copy ..\.env.example .env.local      # Windows
   # cp ../.env.example .env.local      # macOS/Linux
   ```

   Pastikan `Frontend/.env.local` memuat:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

   # Supabase (hanya anon/publishable key, JANGAN service_role)
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
   # 'supabase' = sinkron lintas perangkat, 'local' = localStorage
   NEXT_PUBLIC_DATA_MODE=supabase

   GEMINI_API_KEY=            # hanya untuk Route Handler cadangan
   ```

   Jalankan:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`.

> Backend dan frontend dijalankan bersamaan di dua terminal. Bila
> `NEXT_PUBLIC_API_BASE_URL` dikosongkan, frontend memakai Route Handler
> Next.js saja. Bila backend mati, frontend otomatis beralih ke route handler.

### Mode produksi lokal (opsional)

```bash
npm run build
npm start
```

### Data contoh

Tidak perlu perintah seed terpisah. Frontend memuat contoh materi "Siklus Air
dan Hujan" dari `Frontend/lib/seed-data.ts`, dan modal pindai menyediakan pilihan
contoh halaman. Backend juga menyediakan data yang sama lewat `GET /api/demo`.
Data ini dipakai untuk demo saat internet atau kuota AI bermasalah.

### Akun demo

Login memakai **Supabase Auth**. Sumber data diatur lewat
`NEXT_PUBLIC_DATA_MODE`:

| Mode | Perilaku |
|---|---|
| `supabase` | Materi, verifikasi guru, dan skor kuis tersinkron lintas perangkat |
| `local` | Semua data disimpan di `localStorage` perangkat (cadangan demo) |

| Peran | Email | Password |
|---|---|---|
| Guru | `guru@demo.com` | `GuruDemo2026!` |
| Siswa | `siswa@demo.com` | `SiswaDemo2026!` |

Tanpa login, aplikasi tetap bisa dipakai sebagai demo lokal. Setelah masuk
sebagai siswa, tombol **Mode Guru** disembunyikan. Setelah masuk sebagai guru,
guru dapat beralih antara tampilan guru dan siswa.

> **Registrasi publik belum tersedia.** Saat ini akun dibuat lewat dashboard
> Supabase. Registrasi siswa (dengan persetujuan orang tua/guru) adalah target
> yang belum diimplementasikan.

### Fitur Materi Kelas (guru)

Guru dapat membuat materi sendiri dari teks, dibantu AI, lalu membagikannya ke
semua siswa binaan. Jalankan **sekali** di Supabase SQL Editor:

```text
Docs/SQL-teacher-materials.sql
```

Tanpa SQL tersebut, tombol **Simpan & Bagikan ke Siswa** akan gagal. Materi guru
disimpan sebagai master, lalu dibuatkan salinan milik tiap siswa agar kuis,
progres, dan badge skor tetap berjalan.

### Kuota AI

Gemini tier gratis memiliki batas harian (sekitar 20 permintaan/hari per
proyek). Bila kuota habis:

- gunakan **Buat poin tanpa AI** pada modal materi guru, atau
- gunakan **Contoh Halaman** pada modal pindai (tidak memanggil Gemini).

Pesan error kuota sudah dibedakan dari gangguan jaringan.

## 6. Struktur Folder

```
.
├── Backend/                   # REST API FastAPI (Gemini + validasi sumber)
│   ├── app/
│   │   ├── main.py            # CORS, security header, exception handler
│   │   ├── config.py          # environment variable
│   │   ├── schemas.py         # Pydantic (sama dengan types frontend)
│   │   ├── routers/           # scan, simplify, explain, flashcards, demo, health
│   │   └── services/          # gemini, validator, cache, rate limit
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── Frontend/                  # aplikasi Next.js (UI + route handler cadangan)
│   ├── app/
│   │   ├── api/scan/          # Route Handler cadangan
│   │   ├── api/explain/       # Route Handler cadangan
│   │   ├── api/simplify/      # Route Handler cadangan (materi guru)
│   │   ├── components/        # komponen UI (termasuk CreateMaterialModal)
│   │   ├── page.tsx           # layar utama
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── api-client.ts      # pemanggil backend + fallback
│   │   ├── auth.tsx           # sesi & profil Supabase
│   │   ├── supabase.ts        # klien Supabase (validasi env)
│   │   ├── materials.ts       # data materi, verifikasi, kuis, bagikan ke siswa
│   │   ├── storage.ts         # (rencana) unggah gambar ke bucket privat
│   │   ├── gemini.ts          # prompt untuk route handler cadangan
│   │   ├── history.ts         # riwayat lokal
│   │   ├── seed-data.ts       # materi contoh
│   │   └── source-validator.ts
│   ├── types/
│   └── package.json
├── Docs/                      # dokumentasi teknis
│   ├── SQL-teacher-materials.sql  # SQL wajib untuk fitur materi guru
│   ├── SQL-schema.sql         # (rencana) skema + RLS lengkap
│   ├── ARCHITECTURE.md
│   └── AI.md
├── .env.example
├── PRIVACY.md
└── README.md
```

## 7. Alur Demo

0. Jalankan backend (`uvicorn`) dan frontend (`npm run dev`), lalu pastikan
   `http://localhost:8000/health` merespons `status: ok`.
1. Buka aplikasi. Materi contoh langsung tampil.
2. Tekan **Pindai Buku** → unggah foto, ambil foto, atau pilih contoh halaman.
3. Tunggu indikator proses. Hasil muncul dalam Mode Baca.
4. Tekan **Lihat Sumber** untuk memeriksa kutipan asli dan status validasinya.
5. Ganti ke Mode Visual atau Mode Suara.
6. Coba **Tanya Tutor AI** dan **Materi Saya**.
7. Buka kembali materi dari riwayat tanpa memanggil AI.
8. **Guru:** login → **Materi Saya** → **Buat Materi Sendiri** → tulis judul dan
   teks → **Sederhanakan dengan AI** (atau **Buat poin tanpa AI**) → sunting poin
   → **Simpan & Bagikan ke Siswa**.
9. **Siswa:** refresh → materi guru muncul di **Materi Saya** → selesaikan kuis.
10. **Guru:** refresh → badge `Kuis: x/y ★` muncul pada materi siswa.

Bila kuota AI bermasalah, gunakan **Contoh Halaman** pada modal pindai atau
**Buat poin tanpa AI** pada modal materi guru.

## 8. Batasan MVP

- Deskripsi isyarat berupa teks, **bukan** video atau avatar bahasa isyarat.
- Mode Suara adalah dukungan dasar; pemotretan mandiri oleh pengguna tunanetra belum didukung penuh.
- Pada mode `supabase`, materi/verifikasi/skor kuis tersinkron; mode `local` tetap tersedia sebagai cadangan demo.
- Gambar hanya diproses untuk OCR dan tidak disimpan permanen. Supabase Storage (bucket privat + signed URL) masih **direncanakan**.
- Cache hash dan rate limit disimpan di memori proses (hilang saat restart).
- Endpoint `POST /api/flashcards` sudah tersedia, tetapi UI Mode Visual masih memakai flashcard dari hasil scan atau materi contoh.
- Pencarian suara didukung Chrome/Edge; input ketik selalu tersedia.
- Hasil AI dapat keliru. Setiap poin disertai Lihat Sumber, dan materi sains disarankan diperiksa guru.
- Mode Guru, verifikasi, dan Kuis Ceria sudah memakai login Supabase. Belum ada dashboard daftar siswa terpisah.
- Materi buatan guru dibagikan sebagai **salinan per siswa**; guru melihat master dan salinannya di daftar materi.
- Fitur materi guru membutuhkan `Docs/SQL-teacher-materials.sql` yang dijalankan sekali di Supabase.
- Registrasi publik belum tersedia; gunakan akun demo. Registrasi siswa (dengan persetujuan orang tua/guru) masih **direncanakan**.
- Pengaturan aksesibilitas belum disimpan ke profil Supabase (hanya berlaku selama sesi).
- Backend AI belum memverifikasi JWT Supabase; endpoint AI masih dilindungi rate limit per IP. Verifikasi JWT masih **direncanakan**.
- Perubahan poin oleh guru masih membutuhkan policy `scans_update_teacher`. Targetnya, perubahan hanya lewat RPC verifikasi agar guru tidak punya akses `UPDATE scans` bebas.
- Skema + RLS lengkap belum tersimpan di repository; baru `Docs/SQL-teacher-materials.sql`. File `Docs/SQL-schema.sql` masih **direncanakan**.
- Kuota Gemini tier gratis terbatas (sekitar 20 permintaan/hari per proyek).

### Rencana sebelum submission (9–14 November 2026)

1. Registrasi siswa di `lib/auth.tsx` + `LoginModal.tsx`, role selalu `siswa`.
2. Supabase Storage: bucket privat `scans`, `lib/storage.ts`, signed URL.
3. Verifikasi JWT Supabase di FastAPI (JWKS + `aud` + `exp`) dan header
   `Authorization` dari frontend.
4. RPC verifikasi guru agar perubahan poin tidak memakai `UPDATE scans` bebas.
5. `Docs/SQL-schema.sql` berisi 5 tabel, trigger profil, RLS, index, dan policy
   Storage.
6. Uji RLS lintas akun, uji JWT, `npm run build`, `pytest`, dan deploy ulang.

## 9. Privasi, Etika, dan Efisiensi

- **Transparansi AI:** label AI dan tombol Lihat Sumber pada setiap penjelasan.
- **Privasi:** tidak meminta identitas pribadi anak; riwayat dapat dihapus. Lihat [PRIVACY.md](PRIVACY.md).
- **Efisiensi:** gambar dikompres sebelum dikirim, model Gemini ringan, tidak ada panggilan AI saat membuka riwayat.
- **Ramah anak:** tanpa streak harian atau hadiah tanpa batas; ada pengingat istirahat dan Mode Tenang.

## 10. Dokumentasi

| Dokumen | Isi |
|---|---|
| [PRD](Docs/Archive/PRD%20InkluKids%20AI.md) | Product Requirements Document |
| [Arsitektur](Docs/ARCHITECTURE.md) | Arsitektur dan alur data |
| [AI](Docs/AI.md) | Prompt, skema JSON, validasi sumber |
| [SQL Materi Guru](Docs/SQL-teacher-materials.sql) | SQL Supabase untuk fitur materi guru dan berbagi ke siswa |
| SQL Skema (rencana) | `Docs/SQL-schema.sql`: 5 tabel, trigger profil, RLS, index, policy Storage |
| [Backend README](Backend/README.md) | Cara menjalankan API, endpoint, dan pengujian |
| [PRIVACY.md](PRIVACY.md) | Kebijakan privasi |

## 11. Lisensi dan Atribusi

- Lisensi kode: [MIT](LICENSE)
- Ikon: [Lucide](https://lucide.dev) (lisensi ISC)
- Font: [Lexend](https://fonts.google.com/specimen/Lexend) via Google Fonts (SIL Open Font License). Opsi "Huruf Lebar" memakai fallback sistem (Comic Sans MS/Chalkboard SE) karena OpenDyslexic belum di-self-host.
- Animasi konfeti: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) (ISC)
- AI: Google Gemini API
- Ilustrasi: tidak ada aset ilustrasi eksternal
- Seluruh kode dan data lain dikembangkan oleh tim atau memakai sumber berlisensi terbuka seperti tercantum di atas.
