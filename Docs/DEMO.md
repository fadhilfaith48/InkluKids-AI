# Naskah Demo — PahamInklusif AI

> [!WARNING]
> **File ini belum siap submit sampai keempat baris aset di bawah terisi.**

Karya LOGICODIX 2026 Hackathon Competition, Subtema 1: *Smart & Fun Education*.
Durasi video target: **3 menit (180 detik)**.

## Aset demo

| Aset | Nilai |
|---|---|
| Video demo (YouTube Unlisted/Public) | WAJIB DIISI SEBELUM SUBMIT |
| Aplikasi (URL Vercel) | WAJIB DIISI SEBELUM SUBMIT |
| Backend (URL API) | WAJIB DIISI SEBELUM SUBMIT |
| Akun demo guru | WAJIB DIISI SEBELUM SUBMIT |

## Naskah 3 menit

Label tombol di bawah sama dengan teks yang tampil di aplikasi.

| Waktu | Aksi di layar | Kalimat yang diucapkan |
|---|---|---|
| 0:00–0:20 | Tampilkan satu halaman buku pelajaran cetak (misalnya materi siklus air). | "Satu halaman buku pelajaran biasanya ditulis untuk satu jenis pembaca. Padahal anak disleksia sulit membaca paragraf panjang, anak ADHD sulit menjaga fokus, anak tunarungu dan autisme sulit memahami istilah abstrak, dan anak tunanetra butuh versi suara. Satu halaman buku tidak cocok untuk semua anak." |
| 0:20–0:45 | Buka aplikasi. Klik **Pindai Buku**, pilih tab **Unggah File**, lalu unggah foto halaman buku. Tunjukkan indikator proses. | "Ini PahamInklusif AI. Saya cukup menekan Pindai Buku dan mengunggah foto halaman tadi. Gambar dikompres dulu di browser sebelum dikirim, jadi hemat kuota dan cepat diproses." |
| 0:45–1:05 | Hasil muncul. Sorot judul, poin ringkas, glosarium istilah, dan flashcard. | "Dalam beberapa detik, halaman buku berubah menjadi judul, poin-poin ringkas, glosarium istilah sulit, dan flashcard. Semuanya dari satu foto yang sama." |
| 1:05–1:20 | Tetap di **Mode Baca**. Geser antar kartu poin. | "Mode Baca menampilkan satu poin pendek per kartu dengan analogi sehari-hari. Hurufnya Lexend, yang dirancang agar lebih mudah dibaca, termasuk oleh anak disleksia." |
| 1:20–1:35 | Klik **Lihat Sumber** pada satu poin. Tunjukkan kutipan asli dan status validasinya. | "Setiap penjelasan punya tombol Lihat Sumber. Di sini terlihat kutipan asli dari buku beserta status validasinya. Kutipan ini dicek oleh backend terhadap teks halaman, bukan dikarang oleh model. Inilah Explainable AI." |
| 1:35–1:50 | Pindah ke **Mode Visual**. Tunjukkan langkah berurutan dan bagian **Saran Gerakan Isyarat Teks**. | "Mode Visual untuk anak tunarungu dan autisme: konsep disajikan sebagai langkah berurutan, lengkap dengan deskripsi gerakan isyarat dalam bentuk teks." |
| 1:50–2:05 | Pindah ke **Mode Suara**. Biarkan materi dibacakan, lalu tunjukkan navigasi dengan tombol besar dan keyboard. | "Mode Suara membacakan materi secara otomatis dalam Bahasa Indonesia. Tombolnya besar dan semuanya bisa dijalankan dengan keyboard." |
| 2:05–2:20 | Kembali ke Mode Baca, klik **Tanya Tutor AI**. Di modal **Tanya Penjelasan Lain**, ajukan satu pertanyaan. Tunjukkan jawaban dan tombol **Lihat Sumber**-nya. | "Kalau masih bingung, anak bisa bertanya. Jawaban tutor AI tetap menyertakan sumber dari halaman buku, jadi guru dan orang tua bisa memeriksanya." |
| 2:20–2:40 | Klik **Masuk**, login dengan akun guru. Buka **Mode Guru**, sunting poin bila perlu, klik **Verifikasi & Simpan**. Lalu buka **Materi Saya** → **Buat Materi Sendiri** → **Simpan & Bagikan ke Siswa**. | "Guru login ke Mode Guru, membandingkan hasil AI dengan teks asli, mengoreksi bila perlu, lalu memberi cap verifikasi. Guru juga bisa membuat materi sendiri dan membagikannya ke siswa binaannya." |
| 2:40–3:00 | Kembali ke layar utama dengan materi yang sudah terverifikasi. | "PahamInklusif AI membantu satu halaman buku dipahami dengan banyak cara. Kami hanya memproses foto halaman buku, tanpa wajah atau identitas anak. Silakan coba sendiri lewat tautan di deskripsi." |

## Rencana B (kuota habis / internet mati)

- **Tanpa kuota AI:** buka **Pindai Buku** → tab **Contoh Halaman**. Data contoh berasal dari
  `Frontend/lib/seed-data.ts` dan tidak memanggil Gemini.
- **Data contoh dari backend:** backend menyediakan `GET /api/demo` dengan data yang sama.
- **Backend mati:** frontend otomatis beralih ke Route Handler Next.js (`/api/scan`,
  `/api/explain`), sehingga demo tetap berjalan selama `GEMINI_API_KEY` frontend tersedia.
- **Waktu rekam:** kuota harian Gemini tier gratis reset sekitar pukul 15.00 WIB. Disarankan
  merekam sebelum jam itu.

## Persiapan sebelum merekam

- [ ] Resolusi layar perekaman lebar 1280–1920 px.
- [ ] Gunakan Chrome atau Edge (suara Bahasa Indonesia untuk Mode Suara).
- [ ] Mikrofon dicek: level suara jelas, tanpa gema.
- [ ] Tutup tab dan notifikasi lain.
- [ ] Kuota Gemini dicek dengan satu kali pindai uji.
- [ ] Urutan klik pada tabel di atas dicetak dan diletakkan di samping layar.
- [ ] Foto halaman buku untuk diunggah sudah siap di folder yang mudah dijangkau.
- [ ] Akun guru sudah bisa login sebelum mulai merekam.
