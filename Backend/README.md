# PahamInklusif AI — Backend FastAPI

Backend REST API untuk OCR, penyederhanaan teks, validasi kutipan sumber
(Explainable AI), dan flashcard visual. **Gemini hanya dipanggil dari sini**,
sehingga API key tidak pernah sampai ke browser.

## Menjalankan

Dari folder `Backend`:

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

uvicorn app.main:app --reload --port 8000
```

- Dokumentasi interaktif: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Tanpa `GEMINI_API_KEY`, endpoint `/api/scan` mengembalikan pesan ramah (503)
dan aplikasi tetap bisa memakai tombol **Contoh Halaman** di frontend.
Endpoint `/api/explain` memakai jawaban contoh aman.

Variabel yang direncanakan untuk verifikasi JWT (belum dipakai kode saat ini):

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_JWT_AUD=authenticated
```

`GEMINI_API_KEY` tidak pernah dikirim ke browser. Jangan menaruh `service_role`
key di frontend.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | Status server, model, dan kesiapan API key |
| POST | `/api/scan` | JSON `{ imageBase64, mimeType, imagePreview }` atau multipart `file` |
| POST | `/api/explain` | `{ pointText, ocrText, requestType }` |
| POST | `/api/flashcards` | `{ word, ocrText, sourceQuote }` |
| POST | `/api/simplify` | `{ text, titleHint? }` → penyederhanaan teks materi guru |
| GET | `/api/demo` | Daftar materi contoh |
| GET | `/api/demo/{id}` | Satu materi contoh |

> **Status keamanan:** endpoint AI saat ini dilindungi rate limit per IP.
> Verifikasi JWT Supabase (header `Authorization: Bearer <access token>`) masih
> **direncanakan** dan belum diterapkan.

## Struktur

```
Backend/
├── app/
│   ├── main.py          # FastAPI, CORS, security header, exception handler
│   ├── config.py        # environment variable
│   ├── schemas.py       # Pydantic (bentuk sama dengan types/index.ts)
│   ├── deps.py          # rate limit, cache, helper hash; rencana verifikasi JWT
│   ├── routers/         # health, scan, explain, flashcards, simplify, demo
│   └── services/        # gemini, validator, cache, rate limit, transform
├── tests/
├── requirements.txt
└── .env.example
```

## Catatan keamanan & efisiensi

- Ukuran gambar maksimal 10 MB; hanya JPG/PNG/WEBP; tipe dideteksi dari isi file.
- Rate limit per IP (default 12 permintaan/menit); rencana: per pengguna setelah JWT.
- Rencana verifikasi JWT Supabase: `SUPABASE_URL` + JWKS, cek `aud` dan `exp`.
  Tambahkan `Authorization` ke `allow_headers` CORS saat diaktifkan.
- Hasil scan dicache berdasarkan SHA-256 gambar (default 1 jam, 50 entri); teks
  `/api/simplify` memakai cache teks di memori yang sama.
- Log tidak memuat isi gambar atau teks halaman.
- Cache dan rate limit disimpan di memori proses; untuk multi-worker gunakan
  Redis atau Supabase sebagai pengganti.

## Pengujian

```bash
pytest
```
