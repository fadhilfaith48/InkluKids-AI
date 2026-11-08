# PahamInklusif AI

> **Satu halaman buku, banyak cara memahami.**

Aplikasi web edukasi yang mengubah foto halaman buku pelajaran menjadi materi yang sesuai kebutuhan anak penyandang disabilitas. Karya untuk **LOGICODIX 2026 Hackathon Competition**, Subtema 1: *Smart & Fun Education*.

- Tim: `<nama tim / nama peserta>`
- Repository: https://github.com/fadhilfaith48/InkluKids-AI
- Video demo: `<tautan video>`
- Aplikasi (opsional, Vercel): `<url deployment>`

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
| Pindai lewat unggah, kamera, atau data contoh | Tersedia |
| Kompresi gambar di browser | Tersedia |
| OCR + penyederhanaan dengan Gemini | Tersedia |
| Tiga Mode Belajar dari satu hasil | Tersedia |
| Lihat Sumber + validasi kutipan | Tersedia |
| Tanya Penjelasan Lain (AI tutor) | Tersedia |
| Kartu Respons Simbol + pengingat istirahat | Tersedia |
| Mode Tenang, kontras tinggi, huruf lebar, teks 100–200% | Tersedia |
| Bintang dan elemen menyenangkan | Tersedia |
| TTS Bahasa Indonesia | Tersedia |
| Riwayat materi lokal (maks. 20 materi) | Tersedia |
| Login/akun, sinkronisasi, Supabase Storage | Belum (roadmap) |
| Cache hash gambar | Belum (roadmap) |
| Flashcard visual AI penuh | Belum (roadmap) |
| Pencarian suara | Belum (roadmap) |

Rincian batasan ada di [docs/PRD.md](docs/PRD.md) dan [ROADMAP.md](ROADMAP.md).

## 4. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend dan server | Next.js 15 (App Router, TypeScript), Tailwind CSS, Route Handler |
| AI | Gemini API (model multimodal ringan, structured output JSON), dipanggil **hanya dari server** |
| Suara | Web Speech API (`speechSynthesis`) |
| Riwayat | `localStorage` per perangkat |
| Deployment | Vercel (root directory `frontend`); localhost untuk Grand Final |

Tidak ada layanan backend terpisah. Implementasi Python/FastAPI lama diarsipkan di `archive/backend-fastapi/`.

## 5. Menjalankan di Localhost

### Prasyarat

- Node.js versi LTS terbaru dan npm
- API key Gemini
- Browser Chrome atau Edge (disarankan untuk suara Bahasa Indonesia)

### Langkah

1. **Clone repository**
   ```bash
   git clone <url repository>
   cd <nama folder>
   ```

2. **Pasang dependensi**
   ```bash
   cd frontend
   npm install
   ```

3. **Siapkan environment**

   Salin `.env.example` dari root menjadi `frontend/.env.local`, lalu isi:
   ```
   GEMINI_API_KEY=                 # hanya server
   GEMINI_MODEL=gemini-1.5-flash   # sesuaikan dengan model yang tersedia
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   Jangan komit `.env.local`.

4. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`.

### Mode produksi lokal (opsional)

```bash
npm run build
npm start
```

### Data contoh

Tidak perlu perintah seed terpisah. Aplikasi memuat contoh materi "Siklus Air dan Hujan" dari `frontend/lib/seed-data.ts`, dan modal pindai menyediakan pilihan contoh halaman. Data ini dipakai untuk demo saat internet atau kuota AI bermasalah.

### Akun demo

Tidak ada login pada MVP. Aplikasi langsung dapat dipakai.

## 6. Struktur Folder

```
.
├── frontend/                  # aplikasi Next.js (satu-satunya runtime)
│   ├── app/
│   │   ├── api/scan/          # Route Handler OCR + penyederhanaan
│   │   ├── api/explain/       # Route Handler AI tutor
│   │   ├── components/        # komponen UI (modal pindai)
│   │   ├── page.tsx           # layar utama
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── api-client.ts      # pemanggil Route Handler
│   │   ├── gemini.ts          # prompt + klien Gemini
│   │   ├── history.ts         # riwayat lokal
│   │   ├── seed-data.ts       # materi contoh
│   │   └── source-validator.ts
│   ├── types/
│   └── package.json
├── docs/                      # dokumentasi teknis
├── archive/                   # kode/dokumen lama, tidak dipakai
├── .agent/skills/             # panduan tooling internal
├── .env.example
├── PRIVACY.md
├── ROADMAP.md
└── README.md
```

## 7. Alur Demo

1. Buka aplikasi. Materi contoh langsung tampil.
2. Tekan **Pindai Buku** → unggah foto, ambil foto, atau pilih contoh halaman.
3. Tunggu indikator proses. Hasil muncul dalam Mode Baca.
4. Tekan **Lihat Sumber** untuk memeriksa kutipan asli dan status validasinya.
5. Ganti ke Mode Visual atau Mode Suara.
6. Coba **Tanya Tutor AI** dan **Materi Saya**.
7. Buka kembali materi dari riwayat tanpa memanggil AI.

Panduan lengkap ada di [docs/DEMO.md](docs/DEMO.md).

## 8. Batasan MVP

- Deskripsi isyarat berupa teks, **bukan** video atau avatar bahasa isyarat. Pada MVP, Mode Visual masih memakai deskripsi gestur contoh yang sama untuk setiap poin.
- Mode Suara adalah dukungan dasar; pemotretan mandiri oleh pengguna tunanetra belum didukung penuh.
- Riwayat bersifat lokal per perangkat; belum ada akun atau sinkronisasi.
- Gambar hanya diproses, tidak disimpan permanen di server.
- Cache hash, pencarian suara, dan flashcard visual AI penuh belum tersedia.
- Hasil AI dapat keliru. Setiap poin disertai Lihat Sumber, dan materi sains disarankan diperiksa guru.

## 9. Privasi, Etika, dan Efisiensi

- **Transparansi AI:** label AI dan tombol Lihat Sumber pada setiap penjelasan.
- **Privasi:** tidak meminta identitas pribadi anak; riwayat lokal dapat dihapus. Lihat [PRIVACY.md](PRIVACY.md).
- **Efisiensi:** gambar dikompres sebelum dikirim, model Gemini ringan, tidak ada panggilan AI saat membuka riwayat.
- **Ramah anak:** tanpa streak harian atau hadiah tanpa batas; ada pengingat istirahat dan Mode Tenang.

## 10. Dokumentasi

| Dokumen | Isi |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product Requirements Document aktif |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur dan alur data |
| [docs/AI.md](docs/AI.md) | Prompt, skema JSON, validasi sumber |
| [docs/DATABASE.md](docs/DATABASE.md) | Rancangan database fase lanjutan |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Pemenuhan aksesibilitas |
| [docs/DEMO.md](docs/DEMO.md) | Skrip demo dan cadangan |
| [docs/TESTING.md](docs/TESTING.md) | Skenario dan hasil pengujian |
| [PRIVACY.md](PRIVACY.md) | Kebijakan privasi |
| [ROADMAP.md](ROADMAP.md) | Rencana pengembangan |

## 11. Lisensi dan Atribusi

- Lisensi kode: `<isi lisensi>`
- Ikon: [Lucide](https://lucide.dev) (lisensi ISC)
- Font: belum memakai font pihak ketiga; opsi "Huruf Lebar" memakai font sistem
- Ilustrasi: tidak ada aset ilustrasi eksternal
- Seluruh kode dan data lain dikembangkan oleh tim atau memakai sumber berlisensi terbuka seperti tercantum di atas.
