# Penggunaan AI di PahamInklusif AI

Dokumen ini menjelaskan peran AI, prompt, skema keluaran, validasi sumber, dan batasannya. Prompt dan ambang di bawah adalah **rancangan awal (v0)** yang harus diuji dan disesuaikan saat pengembangan.

> **Status implementasi:** OCR, penyederhanaan, Tanya Penjelasan Lain, penyederhanaan
> teks materi guru (`POST /api/simplify`), dan endpoint flashcard visual sudah
> tersedia di backend FastAPI. UI Mode Visual memakai flashcard dari hasil scan
> atau materi contoh; tombol pembuatan flashcard AI dari kata bebas belum
> ditambahkan ke antarmuka. Verifikasi JWT Supabase di backend **belum
> diterapkan**; endpoint AI saat ini dilindungi rate limit per IP.

## 1. Peran AI

| Tugas | Masukan | Keluaran |
|---|---|---|
| OCR + penyederhanaan (Fitur 1) | Foto halaman buku | Judul, poin pendek, analogi, istilah sulit, kutipan sumber per poin |
| Flashcard visual (Fitur 2) | Kata abstrak + teks halaman | Arti sederhana, langkah visual berurutan, deskripsi isyarat teks, contoh kalimat, kutipan sumber |
| Tanya Penjelasan Lain | Satu poin + jenis permintaan | Penjelasan lebih mudah, contoh, atau arti kata sulit, dengan kutipan sumber |
| Penyederhanaan materi guru (`/api/simplify`) | Teks yang ditulis guru + judul opsional | Judul, poin, analogi, istilah sulit, kutipan dari teks guru |

AI **tidak** dipakai untuk diagnosis, penilaian siswa, atau menghasilkan konten di luar teks halaman yang dipindai.

> **Catatan Kuis Ceria:** soal kuis disusun lokal di frontend dari poin hasil
> scan, bukan keluaran AI dan bukan penilaian resmi. Karena itu tidak ada prompt
> atau skema AI khusus untuk kuis.

## 2. Prinsip

1. **Hanya dari teks halaman.** AI diminta tidak menambah fakta di luar teks yang dipindai.
2. **Setiap poin punya kutipan sumber.** Kutipan harus berupa potongan teks asli dari halaman.
3. **Validasi di server.** Kutipan dicocokkan dengan teks OCR sebelum hasil ditampilkan.
4. **Bahasa ramah anak.** Kalimat pendek, kata sehari-hari, tanpa bahasa kiasan, terutama untuk siswa autisme.
5. **Label jelas.** Konten selalu diberi label "Dibuat oleh AI".

## 3. Skema Keluaran

### 3.1 Fitur 1: `scan_result`

```json
{
  "title": "string, judul topik singkat",
  "ocr_text": "string, teks yang terbaca dari halaman",
  "points": [
    {
      "order": 1,
      "text": "string, satu ide, kalimat pendek",
      "analogy": "string atau null, perumpamaan sehari-hari",
      "source_quote": "string, potongan teks asli dari ocr_text"
    }
  ],
  "glossary": [
    {
      "term": "string",
      "meaning": "string, arti dalam satu kalimat sederhana",
      "source_quote": "string atau null"
    }
  ],
  "readable": true
}
```

- `readable: false` dipakai bila foto terlalu buram atau bukan halaman teks; server menampilkan pesan ramah untuk memotret ulang.
- Jumlah poin: 3 sampai 6.

### 3.2 Fitur 2: `flashcard`

> **Endpoint `POST /api/flashcards` sudah tersedia di backend.** Skema ini dipakai
> oleh endpoint tersebut; antarmuka pembuatan flashcard dari kata bebas masih
> menjadi pengembangan lanjutan.

```json
{
  "word": "string",
  "meaning": "string, satu kalimat sederhana",
  "steps": [
    { "order": 1, "icon": "string, nama ikon dari daftar yang diizinkan", "text": "string, satu kalimat pendek" }
  ],
  "sign_description": "string, deskripsi gerakan isyarat dalam teks, diberi label saran visual",
  "example_sentence": "string, contoh konkret",
  "source_quote": "string, potongan teks asli yang memuat kata tersebut"
}
```

- `steps`: 3 sampai 5 langkah.
- `icon` dibatasi pada daftar ikon yang tersedia di aplikasi agar tampilan konsisten.

### 3.3 Materi guru: `POST /api/simplify`

Permintaan: `{ "text": "...", "titleHint": "..." }`

Keluaran memakai skema `scan_result` yang sama (judul, `ocr_text`, poin,
glosarium, `readable`). Bedanya, sumber kutipan adalah **teks yang ditulis guru**,
bukan hasil OCR gambar. Server menimpa `ocr_text` dengan teks guru agar validasi
kutipan tetap dapat diperiksa. Bila `GEMINI_API_KEY` kosong, endpoint
mengembalikan 503 dan guru dapat menyusun poin secara manual.

### 3.4 Tanya Penjelasan Lain: `explanation`

Permintaan: `{ "pointText": "...", "ocrText": "...", "requestType": "lebih_mudah | beri_contoh | kata_sulit" }`

```json
{
  "text": "string, penjelasan singkat",
  "source_quote": "string, potongan teks asli yang menjadi dasar"
}
```

## 4. Draf Prompt (v0)

### 4.1 Instruksi sistem Fitur 1

```
Kamu adalah pendamping belajar untuk anak penyandang disabilitas usia sekolah.
Tugasmu: membaca halaman buku pada gambar, lalu menyederhanakannya.

Aturan:
1. Gunakan hanya informasi yang ada pada halaman. Jangan menambah fakta lain.
2. Tulis kalimat pendek (maksimal sekitar 12 kata), kata sehari-hari, tanpa bahasa kiasan.
3. Satu poin hanya berisi satu ide.
4. Untuk setiap poin, sertakan "source_quote": potongan teks asli dari halaman,
   disalin persis seperti yang terbaca.
5. Beri satu perumpamaan sehari-hari (analogy) bila membantu; jika tidak, isi null.
6. Daftar istilah sulit beserta arti satu kalimat.
7. Jika gambar buram atau bukan halaman teks, kembalikan "readable": false.
8. Keluarkan hanya JSON sesuai skema. Tanpa teks tambahan.
```

### 4.2 Variasi per mode

| Mode | Penyesuaian prompt |
|---|---|
| Baca | Poin lebih pendek, analogi dianjurkan, hindari istilah asing tanpa arti |
| Visual | Utamakan urutan langkah dan benda konkret; hindari bahasa kiasan; siapkan kata kunci untuk flashcard |
| Suara | Kalimat yang enak didengar; hindari tabel, simbol, dan rujukan visual seperti "lihat gambar di atas" |

> Hasil poin dibuat satu kali per scan; perbedaan mode sebagian besar ada pada penyajian. Variasi prompt hanya dipakai bila uji menunjukkan perlu.

### 4.3 Tanya Penjelasan Lain

```
Jelaskan ulang poin berikut untuk anak usia sekolah.
Jenis: {lebih_mudah | beri_contoh | kata_sulit}
Poin: {pointText}
Teks halaman: {ocrText}

Gunakan hanya informasi dari teks halaman. Sertakan "source_quote" berupa
potongan teks asli yang menjadi dasar. Keluarkan hanya JSON.
```

## 5. Validasi Kutipan Sumber

Dilakukan di server sebelum hasil ditampilkan, memakai satu aturan yang sama di
`Backend/app/services/source_validator.py` dan `Frontend/lib/source-validator.ts`
agar hasil `/api/scan` dan `/api/explain` konsisten.

1. **Normalisasi:** ubah ke huruf kecil, hapus diakritik, rapikan spasi, dan hapus tanda baca berlebih pada kedua teks.
2. **Cocokkan:**
   - cocok persis (substring) pada teks OCR ternormalisasi, atau
   - proporsi kata kutipan yang ditemukan di OCR minimal **0,85**. Kata dengan panjang ≤ 2 huruf diabaikan.
3. **Hasil per poin:**
   - `valid`: kutipan ditemukan, poin tampil dengan tombol Lihat Sumber.
   - `tidak valid`: antarmuka menandai "Belum dapat dirujuk" dan menyarankan kehati-hatian.
4. **Indikator di layar:** status verifikasi ditampilkan di panel Lihat Sumber.
5. Pencatatan posisi kutipan (`start_offset`, `end_offset`) ke tabel `source_references` **belum diterapkan**; masuk roadmap bersama database.

> Ambang 0,85 adalah nilai awal untuk diuji, bukan hasil pengukuran. Pendekatan saat ini adalah kecocokan substring dan proporsi kata, bukan fuzzy matching penuh.

## 6. Penanganan Kesalahan

| Kasus | Penanganan |
|---|---|
| Foto buram atau bukan halaman teks | `readable: false`, pesan ramah dan opsi foto ulang |
| JSON tidak valid | Coba ulang satu kali; bila gagal, tampilkan pesan dan jangan simpan hasil |
| Semua kutipan tidak valid | Tampilkan peringatan, jangan tampilkan poin sebagai hasil terverifikasi |
| Kuota atau batas laju terlampaui | Pesan antrean yang jelas; tawarkan membuka materi dari riwayat |
| Internet putus | Pesan ramah; materi di riwayat tetap dapat dibuka bila sudah termuat |
| Waktu habis (timeout) | Pesan dan opsi coba lagi |

## 7. Efisiensi

- Gambar dikompres di klien sebelum dikirim.
- Memakai model Gemini ringan dan membatasi panjang keluaran.
- Tidak ada pemanggilan AI saat membuka riwayat atau berganti mode, kecuali pengguna meminta penjelasan baru.
- **Sudah diterapkan di backend:** cache hasil scan berdasarkan SHA-256 gambar
  (TTL 1 jam, maksimal 50 entri, di memori proses). Endpoint `/api/simplify`
  memakai cache teks (`sha256` teks + judul) di memori yang sama. Route Handler
  Next.js cadangan belum memakai cache.

## 8. Batasan AI

- AI dapat salah membaca teks (OCR) atau menyederhanakan secara keliru. Lihat Sumber membantu pengecekan, namun tidak menjamin kebenaran isi buku itu sendiri.
- Deskripsi isyarat adalah **saran visual dalam teks**, bukan terjemahan bahasa isyarat resmi (SIBI/BISINDO).
- Materi sains dan kesehatan sebaiknya diperiksa guru atau pendamping.
- Kualitas hasil bergantung pada kejelasan foto.

## 9. Catatan Privasi Terkait AI

Gambar halaman buku dikirim ke layanan Gemini untuk diproses dan tidak disimpan permanen oleh aplikasi. Riwayat teks hasil scan disimpan di `localStorage` perangkat pengguna atau di Supabase bila `NEXT_PUBLIC_DATA_MODE=supabase`. Rencana Supabase Storage (bucket privat + signed URL) belum diterapkan. Pengguna diminta hanya memotret halaman buku, tanpa identitas pribadi.

Verifikasi JWT Supabase di backend belum diterapkan. Setelah aktif, setiap
permintaan AI harus menyertakan token pengguna dan backend akan memeriksa
`aud`, `exp`, dan tanda tangan JWKS sebelum memanggil Gemini. Ketentuan
penggunaan data pada layanan Gemini perlu diperiksa dan dicantumkan di
[PRIVACY.md](../PRIVACY.md).

## 10. Catatan Pengujian Prompt

Isi saat pengembangan:

| Tanggal | Versi prompt | Perubahan | Hasil |
|---|---|---|---|
| `<isi>` | v0 | Draf awal | `<isi>` |
