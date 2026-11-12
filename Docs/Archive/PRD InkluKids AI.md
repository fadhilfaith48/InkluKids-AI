# PRODUCT REQUIREMENTS DOCUMENT

**Nama Produk :** PahamInklusif AI — Aplikasi Edukasi Ramah Disabilitas Berbasis AI

**Tanggal :** 9 November 2026 (revisi 2 — penyesuaian implementasi Supabase, Auth, dan fitur guru Fase 1.5)

**Penyusun :** Fadhil Faith Al Abrisam Dewanto

## 1. Ringkasan Eksekutif

PahamInklusif AI adalah aplikasi web edukasi yang membantu anak penyandang disabilitas dari berbagai golongan belajar secara mandiri dari buku pelajaran umum. Satu halaman buku yang dipotret diubah menjadi materi yang sesuai kebutuhan melalui tiga Mode Belajar: Mode Baca (ringkasan poin pendek dan font ramah disleksia untuk disleksia dan ADHD), Mode Visual (flashcard visual untuk tunarungu dan autisme), dan Mode Suara (pembacaan suara untuk tunanetra dan low vision, dukungan dasar pada MVP). Pemrosesan dilakukan oleh Gemini AI (Vision & Text), dan setiap penjelasan AI dilengkapi tombol transparansi (Explainable AI) agar pengguna dan guru dapat melihat bagian teks sumber yang menjadi dasar penjelasan.

**Subtema LOGICODIX 2026:** Smart & Fun Education — solusi digital yang membuat proses belajar-mengajar lebih interaktif, aksesibel, dan menyenangkan, termasuk penggunaan AI sebagai tutor pribadi dan alat bantu visualisasi materi.

### Latar Belakang

Anak-anak berkebutuhan khusus yang belajar di sekolah umum atau secara mandiri umumnya menghadapi beberapa masalah:

- Buku paket ditulis dengan paragraf panjang dan istilah abstrak yang sulit dibaca oleh siswa disleksia dan sulit dipertahankan fokusnya oleh siswa ADHD.
- Siswa tunarungu kesulitan memahami kata-kata abstrak atau istilah sains (misalnya "fotosintesis" dan "metamorfosis") karena materi belajar sangat bergantung pada teks dan penjelasan lisan.
- Siswa tunanetra atau low vision bergantung pada pendamping atau pembaca layar karena buku cetak jarang tersedia dalam format audio atau braille, sehingga sulit belajar mandiri.
- Materi belajar yang sudah disesuaikan untuk disabilitas jarang tersedia, dan guru pendamping tidak punya waktu menyederhanakan setiap halaman buku secara manual.
- Alat bantu berbasis AI umumnya tidak menunjukkan dari mana penjelasan diambil, sehingga rawan salah informasi (halusinasi) dan sulit dipercaya untuk konteks pendidikan anak.

### Kalimat Masalah

Siswa penyandang disabilitas (disleksia/ADHD, tunarungu/autisme, tunanetra/low vision) perlu belajar dari buku pelajaran umum, tapi buku itu berisi paragraf panjang dan istilah abstrak tanpa format alternatif, sehingga mereka bergantung pada pendamping yang tidak punya waktu menyederhanakan tiap halaman.

Kalimat ini tidak menyebut aplikasi atau AI dan menjadi alat ukur: setiap fitur dalam PRD diperiksa apakah mengurangi hambatan di kalimat ini, dan fitur yang tidak mengurangi ditunda. Kalimat ini akan dicek ke 2–3 guru atau pendamping dengan pertanyaan "kejadian terakhir" (dijadwalkan Hari 4), dan jawabannya dicatat sebagai bukti masalah.

### Tujuan Produk

- Menyediakan jembatan instan antara buku pelajaran umum dan materi yang ramah disabilitas, cukup dengan memotret halaman buku.
- Menyediakan tiga Mode Belajar (Baca, Visual, Suara) dari satu sumber materi agar anak dengan golongan disabilitas berbeda dapat belajar dari buku yang sama.
- Menyederhanakan teks panjang menjadi poin-poin pendek, analogi dunia nyata, dan tampilan yang ramah disleksia.
- Membantu pemahaman kata abstrak melalui flashcard visual untuk siswa tunarungu dan autisme, serta pembacaan suara untuk siswa tunanetra.
- Menjaga kepercayaan dan keamanan penggunaan AI lewat fitur Explainable AI yang menautkan setiap penjelasan ke teks sumbernya.
- Menyimpan riwayat materi yang pernah dipindai agar dapat dibaca ulang tanpa memindai ulang.

### Pembanding dengan Cara yang Sudah Ada

| Cara yang sudah ada | Yang sudah bisa | Kekurangan untuk kasus ini | Pembeda PahamInklusif AI |
| --- | --- | --- | --- |
| Chatbot AI umum | Tanya jawab dan ringkasan teks | Tidak menunjukkan bagian halaman buku yang menjadi dasar jawaban; tampilan tidak dirancang untuk disabilitas | Rujukan sumber yang divalidasi, tiga Mode Belajar, tampilan ramah disabilitas |
| Pembaca layar atau text-to-speech bawaan perangkat | Membacakan teks | Membacakan apa adanya tanpa menyederhanakan; buku cetak tetap harus dijadikan teks | Teks disederhanakan lebih dulu, baru dibacakan, langsung dari foto halaman |
| Aplikasi pemindai teks (OCR) | Mengubah foto menjadi teks | Hanya menghasilkan teks mentah, tanpa penyederhanaan atau visual | Poin pendek, analogi, dan flashcard visual |
| Guru atau pendamping menyederhanakan manual | Paling sesuai dengan kebutuhan anak | Memakan waktu dan tidak tersedia setiap saat | Mempercepat kerja pendamping; verifikasi guru tersedia pada Fase 1.5 |

Alasan pindah yang terasa di pekerjaan pengguna: pendamping tidak perlu menyederhanakan halaman satu per satu, dan setiap penjelasan dapat dicek ke teks aslinya. Perbandingan ini gambaran umum dari perancangan, belum hasil uji tiap alat, dan kemampuan alat dapat berubah.

### Pertimbangan Memilih Ide

- Seberapa sering dan merepotkan: terjadi setiap kali siswa belajar dari buku paket, dan penyederhanaan manual memakan waktu pendamping.
- Apa bedanya dengan cara sekarang: lihat tabel pembanding di atas.
- Datanya bisa didapat: foto halaman buku yang diambil pengguna sendiri, tanpa akses ke sistem sekolah; data anak dilindungi (Bab 8).
- Bisa dibangun dengan waktu yang ada: ya, dengan fokus pada satu alur utama MVP (Bab 3) dan fitur tambahan sebagai stretch goal.

### Informasi Produk

|  |  |
| --- | --- |
| Jenis Produk | Aplikasi Berbasis Web (responsif) |
| Deskripsi Singkat | Aplikasi yang mengubah foto halaman buku menjadi materi sesuai kebutuhan anak disabilitas melalui tiga Mode Belajar: ringkasan bahasa sederhana (Mode Baca), flashcard visual/isyarat (Mode Visual), dan pembacaan suara (Mode Suara), dengan tombol transparansi AI untuk melihat sumber penjelasan dan fitur tanya penjelasan lain (AI tutor). |
| Target Pengguna | Anak penyandang disabilitas (disleksia, ADHD, tunarungu, autisme, tunanetra/low vision) sebagai fokus MVP; Guru/Pendamping pada Fase 1.5; Admin pada fase lanjutan |
| Framework Frontend | Next.js 15 (App Router, TypeScript) + Tailwind CSS |
| Framework Backend | Python (FastAPI) sebagai REST API |
| Database, Auth & Storage | Supabase: PostgreSQL, Auth, dan Storage (bucket privat) |
| AI | Gemini API (Vision & Text) |
| Struktur Repository | Satu repository dengan dua folder: Frontend/ dan Backend/ |
| Deployment | Frontend di Vercel; backend di-deploy di layanan hosting agar dapat diakses juri; localhost hanya untuk demo Grand Final |

## 2. Target Audiens & Persona Pengguna

### "Siswa Disleksia / ADHD"

- Karakteristik: Siswa SD–SMP usia 7–15 tahun yang kesulitan membaca teks panjang atau mudah kehilangan fokus, namun mampu memahami materi bila disajikan singkat dan konkret.
- Pain Points:
  - Huruf dan baris teks pada buku paket terasa "menari" atau terlalu padat sehingga melelahkan dibaca.
  - Sulit menangkap inti materi dari paragraf panjang.
  - Cepat kehilangan fokus sebelum selesai membaca satu halaman.

### "Siswa Tunarungu / Autisme"

- Karakteristik: Siswa SD–SMP usia 7–15 tahun yang belajar paling baik melalui visual, urutan langkah yang jelas, dan contoh konkret. Siswa tunarungu mengandalkan bahasa isyarat dan visual, sedangkan siswa autisme sering kesulitan dengan bahasa kiasan dan konsep abstrak.
- Pain Points:
  - Kata abstrak dan istilah sains sulit dipahami hanya dari definisi teks.
  - Penjelasan guru yang bersifat lisan tidak dapat diikuti sepenuhnya.
  - Kesulitan memahami bahasa kiasan atau penjelasan yang tidak berurutan.

### "Siswa Tunanetra / Low Vision"

- Karakteristik: Siswa usia sekolah dengan hambatan penglihatan total atau sebagian, mengandalkan suara dan pembaca layar, serta sering didampingi guru atau orang tua.
- Pain Points:
  - Buku cetak jarang tersedia dalam format audio atau braille.
  - Sulit mengarahkan kamera untuk memotret halaman buku sendiri.
  - Materi digital sering tidak ramah pembaca layar dan sulit dinavigasi tanpa penglihatan.

### "Guru / Pendamping"

- Karakteristik: Guru sekolah inklusi, guru pendamping khusus (GPK), atau orang tua yang mendampingi belajar siswa disabilitas.
- Pain Points:
  - Tidak punya waktu menyederhanakan materi buku untuk tiap siswa secara manual.
  - Perlu memastikan penjelasan AI akurat dan sesuai isi buku sebelum diberikan ke anak.
  - Sulit memantau materi apa yang sudah dan belum dipelajari siswa.

### "Admin"

- Karakteristik: Pengelola aplikasi yang menjaga kualitas dan keamanan layanan.
- Pain Points:
  - Perlu memantau penggunaan AI (jumlah permintaan, kegagalan) agar kuota dan biaya terkendali.
  - Perlu menangani laporan hasil AI yang keliru atau tidak pantas.

## 3. Ruang Lingkup Produk & Batasan

### Dalam Ruang Lingkup (In Scope - Fase 1)

**Alur utama MVP (wajib jalan dari awal sampai akhir):** masuk, foto halaman buku, ringkasan poin pendek, Lihat Sumber, Bacakan, lalu tersimpan di riwayat. Fitur lain dikelompokkan pada Peta Prioritas Fitur di akhir bab ini.

- Registrasi & login untuk Siswa menggunakan Supabase Auth. Role Guru sudah dipakai pada Fase 1.5; role Admin disiapkan di skema dan antarmukanya fase lanjutan.
- Pengaturan aksesibilitas dan Mode Belajar per pengguna: pilihan Mode Baca, Mode Visual, atau Mode Suara (dapat digabung), serta ukuran teks, jenis font (OpenDyslexic / standar), mode kontras tinggi, jarak antarbaris, dan pembacaan suara (text-to-speech).
- Fitur 1 "Buku ke Bahasa Sederhana": ambil foto/unggah gambar halaman buku, OCR oleh Gemini, hasil berupa poin-poin pendek, analogi dunia nyata, dan istilah sulit beserta artinya.
- Fitur 2 "Buku ke Visual/Isyarat" versi ringkas: pilih atau ketik kata abstrak, hasil berupa 3–5 kartu langkah visual berurutan dengan arti sederhana, ilustrasi (ikon/SVG), dan deskripsi isyarat dalam teks.
- Mode Suara (dukungan dasar): hasil dibacakan otomatis dengan text-to-speech, navigasi dengan tombol besar dan keyboard, label ARIA agar kompatibel dengan screen reader pada alur utama, serta panduan suara sederhana saat memotret (misalnya gambar terlalu gelap atau terpotong); pendamping dapat membantu memotret.
- Tombol "Lihat Sumber" (Explainable AI): menampilkan potongan teks asli yang menjadi dasar setiap poin atau flashcard, dengan label bahwa konten dihasilkan AI.
- Fitur "Tanya Penjelasan Lain" (AI tutor): tombol pada setiap poin untuk meminta penjelasan yang lebih mudah atau contoh lain, tetap berpegang pada teks halaman yang dipindai.
- Penyimpanan gambar di Supabase Storage dan riwayat materi (daftar scan, buka kembali, hapus).
- Efisiensi sumber daya (Green IT): kompresi gambar di sisi klien dan cache hasil scan agar AI tidak dipanggil dua kali untuk gambar yang sama.
- Satu repository dengan dua folder (`Frontend/` Next.js dan `Backend/` Python); frontend di-deploy ke Vercel, backend di-deploy ke layanan hosting agar dapat diakses juri (localhost hanya untuk demo Grand Final).
- Registrasi akun siswa dan verifikasi email, dengan persetujuan orang tua/guru untuk pengguna di bawah umur. Login guru memakai akun yang dibuat pengelola; tidak ada pendaftaran guru publik.
- Keamanan antar-layanan: backend FastAPI memverifikasi JWT Supabase pada setiap endpoint yang memakai AI, dan akses data dilindungi Row Level Security (RLS) di semua tabel.

* Elemen menyenangkan (Smart & Fun): bintang atau stiker penghargaan setelah menyelesaikan kartu atau satu materi, dengan umpan balik positif yang ramah anak dan dapat dimatikan.
* Fitur tambahan MVP (demo lokal): Mode Guru/Pendamping untuk memverifikasi dan menyunting poin materi, serta Kuis Ceria dari poin materi. Mode Guru versi Supabase (Fase 1.5) memakai login dan sinkronisasi; mode `local` tanpa login tetap dipertahankan sebagai cadangan demo di satu perangkat.
* Aplikasi dapat dijalankan secara lokal (localhost) sesuai ketentuan Grand Final, dilengkapi README, file .env.example, dan data contoh cadangan.
* Video demo 3–5 menit di YouTube (Unlisted atau Public) yang merekam aplikasi asli berjalan dari commit final dan menampilkan integrasi AI secara langsung. Narasi bersifat opsional (dipilih caption di layar), dan penyuntingan hanya boleh memotong waktu tunggu atau menambah teks dan musik.
* README.md di direktori utama wajib memuat: nama tim dan anggota, kategori (Web), nama aplikasi, deskripsi solusi, masalah yang diangkat, target pengguna, daftar fitur yang berhasil diimplementasikan, teknologi yang digunakan, diagram arsitektur dan alur data, panduan instalasi dan konfigurasi, daftar variabel lingkungan (.env.example), akun demo, dokumentasi penggunaan AI (layanan atau model dan bagian produk yang memakainya), serta atribusi seluruh template, aset, dataset, dan kode pihak ketiga (misalnya OpenDyslexic dan Lucide).
* Surat Pernyataan Orisinalitas Karya sesuai format resmi panitia, berupa PDF bermeterai Rp10.000 (atau e-meterai) dan ditandatangani Ketua Tim. Seluruh berkas (repository GitHub publik, video YouTube, dan surat ini) dikumpulkan sekali melalui portal submission resmi paling lambat 14 November 2026 pukul 23.59 WIB; submission bersifat final.
* Akun demo siap pakai untuk juri (tanpa alur persetujuan orang tua, tanpa biaya, dan tanpa akses khusus) dicantumkan di README; aplikasi yang di-deploy, Supabase, dan kuota Gemini harus tetap aktif selama penilaian.
* Aturan repository: dibuat setelah Hacking Kick-off dan berstatus Public sampai penilaian selesai; commit berkala dari akun GitHub anggota terdaftar dengan pesan yang jelas (feat:, fix:, docs:, style:, refactor:, chore:); tanpa bulk upload, force push, rebase, squash, penghapusan commit, atau manipulasi tanggal commit; file .env masuk .gitignore.

- Pencarian materi dengan suara atau ketik: pengguna mengucapkan (Web Speech API, bahasa id-ID) atau mengetik kata kunci untuk mencari di riwayat materi yang sudah dipindai; input ketik selalu tersedia sebagai pilihan lain.

* Kartu Respons Simbol: tombol simbol gambar besar dengan suara ("Aku bingung", "Ulangi", "Lebih mudah", "Beri contoh", "Aku mau istirahat") sebagai pilihan cepat bagi anak yang sulit mengetik atau berbicara.
* Langkah Belajar Visual: penanda urutan sesi berbentuk ikon (Foto, Baca, Cek Sumber, Bintang) agar alur dapat ditebak.
* Mode Tenang: satu tombol untuk mengurangi rangsangan (animasi dan efek suara dimatikan, warna dilembutkan).
* Prinsip ramah anak (anti-adiktif): tanpa streak harian, hadiah tanpa batas, atau notifikasi bujukan, dilengkapi pengingat istirahat.

### Dalam Ruang Lingkup (Fase 1.5 — Fitur Guru)

Fase 1.5 adalah lanjutan yang sudah disetujui dan dikembangkan setelah alur siswa stabil. Fitur pada fase ini tidak menghapus atau menggantikan fitur Fase 1.

- Login guru memakai Supabase Auth. Peran dibaca dari tabel `profiles`, bukan dari state frontend atau metadata pengguna.
- Guru melihat daftar siswa binaan melalui tabel `guardianships` (antarmuka daftar siswa masih direncanakan; RLS sudah membatasi akses berdasarkan relasi ini).
- Guru membuka materi siswa, membandingkan poin AI dengan teks sumber, menyunting poin, dan menandai materi terverifikasi. Perubahan poin hanya boleh terjadi melalui alur verifikasi (satu transaksi/RPC), bukan `UPDATE scans` bebas.
- Verifikasi guru, catatan, dan hasil suntingan tersinkron ke perangkat siswa.
- Guru dapat membuat materi sendiri dari teks, dibantu AI (`POST /api/simplify`), lalu membagikannya sebagai salinan ke siswa binaan.
- Guru dapat melihat hasil Kuis Ceria siswa binaan.
- Semua akses guru dibatasi RLS: hanya siswa yang terhubung lewat `guardianships`.

### Di Luar Ruang Lingkup (Out of Scope - Fase 1)

- Dashboard Admin (laporan hasil AI, statistik) — skema tabelnya disiapkan, antarmukanya fase lanjutan. Fitur Guru/Pendamping sudah dipindah ke **Fase 1.5** di atas dan tidak lagi termasuk daftar ini.
- Pengelompokan materi per mata pelajaran (folder), favorit, dan PWA — fase lanjutan.
- Penerjemahan otomatis ke bahasa isyarat resmi (SIBI/BISINDO) dalam bentuk video atau avatar; fase 1 hanya deskripsi isyarat berbasis teks dan visual sederhana.
- Dukungan penuh untuk tunanetra: pemotretan halaman secara mandiri dengan panduan kamera otomatis, keluaran braille, dan pengujian screen reader menyeluruh — fase lanjutan (MVP hanya dukungan dasar).
- Dukungan khusus untuk disabilitas lain (misalnya tunadaksa dan tunagrahita), meskipun tombol besar dan alur sederhana sudah membantu — fase lanjutan.
- Aplikasi mobile native (Android/iOS) — fase 1 fokus pada web responsif.
- Mode offline penuh untuk pemrosesan AI.
- Integrasi dengan sistem sekolah (LMS/Dapodik) dan fitur penilaian/kuis otomatis berbasis AI; Kuis Ceria lokal dari poin materi sudah tersedia sebagai latihan, bukan penilaian resmi. Hasil kuis boleh tersinkron untuk dilihat guru binaan pada Fase 1.5, tetapi tetap bukan penilaian resmi.
- Multi-bahasa (fase 1 hanya Bahasa Indonesia).

* Integrasi pencarian e-book dari sumber eksternal — tahap 2: terhubung ke satu sumber terbuka dengan lisensi jelas (misalnya buku sekolah elektronik resmi atau Open Library) bila Fitur 1 dan 2 sudah stabil; tahap 3: banyak sumber, katalog sendiri, dan impor buku. Keduanya fase lanjutan. Tidak melakukan scraping tanpa izin; hanya sumber berlisensi terbuka atau yang menyediakan API/unduhan resmi.

### Peta Prioritas Fitur

| Wajib jalan | Boleh pakai data contoh | Nanti dulu (stretch goal) |
| --- | --- | --- |
| Registrasi dan login; scan halaman dengan OCR Gemini menjadi poin ringkas; Lihat Sumber dengan validasi kutipan; Bacakan (text-to-speech); pengaturan tampilan dan pilihan Mode Belajar; riwayat scan; deploy online | Flashcard visual versi ringkas dengan beberapa kata contoh siap pakai; hasil scan contoh sebagai cadangan demo; ilustrasi berupa ikon sederhana | Tanya Penjelasan Lain; Kartu Respons Simbol; Langkah Belajar Visual; Mode Tenang; pencarian suara atau ketik; dashboard Admin; integrasi e-book eksternal |

Aturannya: bila satu fitur di kolom pertama tidak jalan, produk tidak bisa dicoba, sehingga kolom pertama dikerjakan lebih dulu. Fitur di kolom ketiga hanya dikerjakan dalam versi sederhana bila alur utama dan deploy sudah stabil. Fitur guru tidak lagi berada di kolom ketiga karena sudah dipindah ke **Fase 1.5**.

### Skenario Demo

- Kasus normal: foto halaman yang jelas (misalnya siklus air) menjadi kartu poin ringkas dengan analogi, lalu penonton melihat Lihat Sumber dan tombol Bacakan, dan materi tersimpan di riwayat.
- Kasus sulit: foto buram atau terpotong, lalu aplikasi memberi pesan ramah dan opsi foto ulang tanpa menebak isi halaman; poin tanpa rujukan yang valid ditandai.
- Pengaturan aksesibilitas: ukuran teks, font ramah disleksia, dan pergantian Mode Belajar ditampilkan singkat.
- Data demo disiapkan sejak awal agar dapat dipakai juga sebagai data uji, dan video direkam dari commit final.

## 4. Fitur Utama & Kebutuhan

### Modul Siswa

#### Registrasi, Login & Pengaturan Aksesibilitas

- Deskripsi: Siswa (atau guru/orang tua yang membantu) mendaftar menggunakan email, lalu memilih preferensi tampilan: ukuran teks, font OpenDyslexic, kontras tinggi, dan suara. Pengaturan tersimpan di profil dan diterapkan di seluruh halaman.
- Skenario Penggunaan: Siswa baru membuka aplikasi → klik tombol besar "Masuk/Daftar" → isi data → pada langkah awal memilih "Aku mau tulisan lebih besar dan font khusus" → pengaturan langsung diterapkan.

#### Mode Belajar (Baca, Visual, Suara)

- Deskripsi: Pada pengaturan awal, pengguna atau pendamping memilih satu atau lebih mode. Mode Baca menampilkan poin pendek dengan font ramah disleksia; Mode Visual mengutamakan flashcard langkah visual tanpa ketergantungan pada suara; Mode Suara membacakan hasil secara otomatis dengan navigasi tombol besar/keyboard dan label ARIA untuk screen reader. Semua mode memakai hasil scan yang sama, hanya cara penyajiannya yang berbeda, dan mode dapat diganti kapan saja.
- Skenario Penggunaan: Pendamping memotret halaman IPA untuk siswa tunanetra → hasil dibuka dalam Mode Suara → poin dibacakan satu per satu dan siswa menekan tombol besar "Lanjut" atau "Ulangi" → siswa tunarungu di kelas yang sama membuka hasil yang sama dalam Mode Visual.
- Keterbatasan MVP: Pemotretan halaman secara mandiri oleh pengguna tunanetra belum didukung penuh; aplikasi hanya memberi panduan suara dasar dan pendamping dapat membantu memotret.

#### Elemen Menyenangkan (Smart & Fun)

- Deskripsi: Setelah menyelesaikan satu kartu poin atau satu set flashcard, siswa mendapat bintang atau stiker dengan animasi singkat yang tidak berkedip, disertai kalimat penyemangat yang sederhana. Perolehan bintang tersimpan di riwayat materi. Elemen ini opsional dan dapat dimatikan dari pengaturan agar tidak mengganggu siswa yang sensitif terhadap rangsangan (misalnya autisme).
- Skenario Penggunaan: Siswa menyelesaikan lima kartu tentang siklus air → muncul bintang dan tulisan "Hebat, kamu selesai!" → bintang tersimpan pada materi tersebut.

#### Kartu Respons Simbol

- Deskripsi: Tombol respons berupa simbol gambar besar dengan label singkat dan suara, sebagai pilihan cepat bagi anak yang sulit mengetik atau berbicara: "Aku bingung", "Ulangi", "Lebih mudah", "Beri contoh", dan "Aku mau istirahat". Simbol terhubung ke fitur Tanya Penjelasan Lain (misalnya "Lebih mudah" langsung meminta penjelasan yang disederhanakan), sedangkan "Aku mau istirahat" menjeda sesi. Semua simbol memiliki teks alternatif untuk screen reader.
- Skenario Penggunaan: Siswa autisme yang belum lancar berbicara menyentuh simbol "Lebih mudah" pada sebuah poin → AI menjelaskan ulang dengan kalimat lebih pendek → siswa menyentuh simbol "Ulangi" untuk mendengarkannya lagi.

#### Langkah Belajar Visual

- Deskripsi: Penanda urutan sesi di bagian atas layar yang menunjukkan langkah yang sedang dijalani dan yang akan datang dalam bentuk ikon: Foto → Baca → Cek Sumber → Bintang. Penanda ini membuat alur dapat ditebak sehingga siswa yang cemas terhadap perubahan, terutama autisme dan ADHD, merasa tenang. Urutan langkah selalu sama dan langkah aktif ditandai jelas.
- Skenario Penggunaan: Siswa membuka sesi baru → melihat empat ikon langkah dengan langkah "Foto" menyala → setelah memotret, langkah "Baca" menyala → di akhir sesi muncul bintang.

#### Mode Tenang

- Deskripsi: Satu tombol di pengaturan untuk mengurangi rangsangan: animasi dimatikan, efek suara dimatikan (suara pembacaan hasil tetap dapat dipilih), dan warna dilembutkan. Mode ini juga mengganti bintang animasi dari Elemen Menyenangkan dengan tanda centang sederhana. Disarankan untuk siswa yang sensitif terhadap rangsangan sensorik.
- Skenario Penggunaan: Pendamping mengaktifkan Mode Tenang untuk siswa autisme → layar tampil statis dengan warna lembut tanpa animasi dan efek suara → bintang berubah menjadi tanda centang sederhana.

#### Prinsip Ramah Anak (Anti-Adiktif)

- Deskripsi: Aplikasi tidak memakai mekanik yang mendorong penggunaan berlebihan seperti streak harian, hadiah tanpa batas, atau notifikasi bujukan. Setelah beberapa materi dalam satu sesi, tampil pengingat istirahat yang ramah. Prinsip ini mendukung kriteria etika dan perlindungan pengguna anak.

#### Fitur 1 — Buku ke Bahasa Sederhana (Disleksia & ADHD)

- Deskripsi: Siswa memotret atau mengunggah halaman buku. Gambar dikirim ke Gemini untuk dibaca (OCR) lalu diubah menjadi: (1) judul singkat topik, (2) 3–6 poin ringkas dengan kalimat pendek, (3) satu analogi dunia nyata, (4) daftar istilah sulit beserta arti sederhana. Gambar akan disimpan di Supabase Storage (target Fase 1). Hasil ditampilkan dengan font ramah disleksia, teks diperbesar, satu poin per kartu agar fokus, dan tombol "Bacakan" untuk suara.
- Skenario Penggunaan: Siswa memotret halaman tentang siklus air → aplikasi menampilkan indikator proses → muncul kartu "Air di laut menguap karena panas matahari" dengan analogi "seperti air panas yang mengeluarkan uap" → siswa menekan "Bacakan" untuk mendengarkan, lalu "Lihat Sumber" untuk melihat kalimat asli di buku.

#### Fitur 2 — Buku ke Visual/Isyarat (Tunarungu & Autisme)

- Deskripsi: Dari hasil scan (atau input manual), siswa memilih kata abstrak. AI memecah konsep menjadi langkah-langkah berurutan dan menyusun flashcard berisi: kata, arti dalam satu kalimat sederhana, 3–5 langkah visual (ikon/ilustrasi sederhana per langkah), contoh kalimat konkret, dan deskripsi gestur/isyarat dalam teks. Bahasa kiasan dihindari untuk siswa autisme.
- Skenario Penggunaan: Siswa memilih kata "Metamorfosis" → sistem menampilkan flashcard berurutan: telur → ulat → kepompong → kupu-kupu, masing-masing dengan ikon dan satu kalimat pendek → siswa menggeser kartu satu per satu.

#### Explainable AI — Tombol "Lihat Sumber"

- Deskripsi: Setiap poin ringkasan dan setiap flashcard memiliki tombol "Lihat Sumber" yang membuka panel berisi potongan teks asli hasil OCR yang dirujuk AI, dengan penanda bagian yang relevan. Terdapat label "Dibuat oleh AI" dan status "Terverifikasi guru" bila sudah ditinjau (tersedia pada Fase 1.5). Konten yang tidak dapat dikaitkan ke teks sumber diberi tanda peringatan.
- Skenario Penggunaan: Siswa atau guru menekan "Lihat Sumber" pada poin "Klorofil memberi warna hijau pada daun" → panel menampilkan kalimat asli dari halaman buku yang memuat informasi tersebut.

#### Tanya Penjelasan Lain (AI Tutor)

- Deskripsi: Setiap poin ringkasan memiliki tombol "Tanya Penjelasan Lain" dengan pilihan cepat: "Lebih mudah", "Beri contoh", dan "Jelaskan kata sulitnya". AI menjawab singkat berdasarkan teks halaman yang dipindai, dan jawabannya juga dilengkapi tombol "Lihat Sumber". Pertanyaan bebas tidak disediakan pada MVP agar jawaban tetap terjaga dan mudah diverifikasi.
- Skenario Penggunaan: Siswa merasa poin "Klorofil menyerap cahaya matahari" masih sulit → menekan "Lebih mudah" → AI menjelaskan dengan kalimat lebih pendek dan satu contoh sehari-hari → siswa menekan "Bacakan" untuk mendengarkannya.

#### Riwayat & Perpustakaan Materi

- Deskripsi: Seluruh hasil scan tersimpan sehingga dapat dibuka kembali, dan dapat dihapus (pengelompokan folder dan favorit pada fase lanjutan).
- Skenario Penggunaan: Siswa membuka menu "Materi Saya" → memilih scan "Siklus Air" dari daftar riwayat → membuka kembali ringkasannya tanpa memindai ulang.

#### Pencarian Materi (Suara & Ketik)

- Deskripsi: Pengguna dapat mencari materi pada riwayat scan dengan mengucapkan atau mengetik kata kunci. Pencarian suara memakai Web Speech API (SpeechRecognition, bahasa id-ID) dengan input ketik sebagai pilihan lain. Hasil pencarian dapat dibacakan dalam Mode Suara.
- Skenario Penggunaan: Siswa menekan tombol mikrofon besar dan berkata "siklus air" → daftar materi yang cocok tampil dan dibacakan → siswa membuka materi yang diinginkan.
- Catatan: Pencarian suara terutama didukung browser Chrome dan Edge, dan pada sebagian besar browser audio diproses oleh server penyedia browser sehingga hal ini dinyatakan dalam kebijakan privasi. Pencarian e-book dari sumber eksternal direncanakan sebagai fase lanjutan dengan syarat lisensi yang jelas.

### Modul Guru/Pendamping (Fase 1.5)

> **Status implementasi:** login Supabase, registrasi akun siswa, verifikasi materi, penyuntingan poin,
> nama guru, catatan pendamping, sinkronisasi ke siswa, verifikasi JWT di FastAPI, dan RPC
> `verify_scan` di skema SQL sudah tersedia.
> Skema `guardianships`, `teacher_verifications`, dan `quiz_results` sudah dipakai.
> **Belum tersedia:** antarmuka daftar siswa binaan, pemindaian atas nama siswa,
> dan penyimpanan gambar di Supabase Storage (gambar buku saat ini diproses OCR tanpa retensi permanen).

#### Dashboard Guru & Verifikasi Konten

- Deskripsi: Guru membuka materi yang dapat diaksesnya, meninjau hasil AI berdampingan dengan teks sumber, lalu menandainya "terverifikasi" atau menyuntingnya bila ada kekeliruan. Daftar siswa binaan khusus dan pemilihan materi per siswa masih **direncanakan**; saat ini guru membuka materi dari daftar materi yang tersedia.
- Skenario Penggunaan: Guru membuka materi "Fotosintesis" milik siswa → membandingkan poin AI dengan teks sumber → mengoreksi satu kalimat → menandai terverifikasi.

#### Pemindaian Atas Nama Siswa (Direncanakan)

- Deskripsi: Guru dapat memindai halaman buku dan membagikan hasilnya ke siswa binaan tertentu. Fitur ini **belum tersedia**; yang sudah berjalan adalah guru membuat materi dari teks lalu membagikannya sebagai salinan.

### Modul Admin (Fase Lanjutan)

#### Manajemen Pengguna & Laporan AI

- Deskripsi: Admin mengelola akun, meninjau laporan hasil AI yang keliru, dan melihat statistik penggunaan (jumlah scan, tingkat gagal, estimasi pemakaian kuota Gemini).
- Skenario Penggunaan: Admin menerima laporan "hasil tidak sesuai buku" → membuka scan beserta teks sumber → menandai kasus dan memperbaiki prompt bila ditemukan pola kesalahan.

## 5. Alur Pengguna & Navigasi

### Siswa — Memindai Buku menjadi Bahasa Sederhana

Siswa login, memilih "Scan Buku", memotret halaman atau mengunggah gambar. Sistem mengompres gambar lalu mengirimkannya ke backend Python (FastAPI); penyimpanan gambar ke Supabase Storage masih target Fase 1. Backend mengirim gambar ke Gemini dengan prompt khusus. Hasil JSON (poin, analogi, istilah, rujukan teks sumber) divalidasi, disimpan ke database, dan ditampilkan dalam kartu satu-per-satu dengan font dan ukuran sesuai pengaturan siswa. Siswa dapat menekan "Bacakan", "Lihat Sumber", atau "Buat Flashcard" pada istilah sulit.

### Siswa — Membuat Flashcard Visual

Siswa memilih istilah dari hasil scan atau mengetik kata. Sistem meminta Gemini menyusun langkah visual dan deskripsi isyarat, lalu menampilkan kartu bergeser satu per satu. Siswa dapat menyimpan set flashcard ke "Materi Saya" dan membuka "Lihat Sumber" kapan saja.

### Siswa Tunanetra — Belajar dengan Mode Suara

Siswa atau pendamping memilih Mode Suara, lalu memotret halaman buku dengan bantuan panduan suara sederhana (misalnya "gambar terlalu gelap" atau "halaman terpotong"). Setelah hasil diproses, poin dibacakan otomatis satu per satu. Siswa bernavigasi dengan tombol besar atau keyboard untuk lanjut, mengulang, meminta penjelasan lain, atau mendengarkan sumber dari teks asli.

### Guru — Verifikasi Materi (Fase 1.5)

Guru login, membuka materi siswa yang dapat diaksesnya (antarmuka daftar siswa binaan masih direncanakan), membandingkan hasil AI dengan teks sumber, menyunting bila perlu, lalu menandai terverifikasi sehingga label tersebut tampil di sisi siswa. Perubahan poin hanya disimpan melalui alur verifikasi.

### Guru — Membuat dan Membagikan Materi (Fase 1.5)

Guru menulis teks materi, meminta AI menyederhanakannya (atau menyusun poin manual), menyunting hasil, lalu membagikannya sebagai salinan materi ke siswa binaan. Siswa melihat salinan itu di **Materi Saya** dan dapat mengerjakan Kuis Ceria; guru dapat melihat hasil kuis siswa binaan.

### Admin — Memantau Layanan (Fase Lanjutan)

Admin login, melihat statistik penggunaan dan daftar laporan hasil AI yang keliru, meninjau kasus, serta menonaktifkan akun yang menyalahgunakan layanan bila diperlukan.

## 6. Kebutuhan Data & Arsitektur

### Entitas Data Utama

- profiles — Data pengguna (terhubung ke Supabase Auth): `id`, `name`, `role` (siswa/guru/admin), `grade`, `created_at`. Rencana: dibuat otomatis oleh trigger saat akun mendaftar; role selalu `siswa` kecuali dipromosikan pengelola.
- guardianships — Relasi guru/pendamping dengan siswa binaan: `teacher_id`, `student_id`, unik per pasangan.
- scans — Satu baris per materi: `id`, `owner_id`, `title`, `ocr_text`, `points` (JSONB), `glossary` (JSONB), `flashcards` (JSONB), `image_path` (rencana Supabase Storage), `readable`, `stars_earned`, `lesson_completed`, `source_scan_id`, `created_at`.
- teacher\_verifications — Status verifikasi guru: `scan_id` (unik), `teacher_id`, `is_verified`, `edited`, `notes`, `verified_at`.
- quiz\_results — Hasil Kuis Ceria per materi: `scan_id` (unik), `student_id`, `score`, `total`, `best_score`, `attempts`, `completed`, `updated_at`.
- accessibility\_settings — Preferensi tampilan per pengguna: mode belajar, ukuran teks, font, kontras, jarak baris, suara. Untuk sementara berlaku per sesi browser dan belum disimpan ke profil.
- ai\_reports — Laporan hasil AI yang keliru dari pengguna (fase lanjutan).
- ai\_usage\_logs — Catatan pemakaian API untuk pemantauan kuota (fase lanjutan).

Entitas rancangan awal berikut belum dinormalisasi dan tetap menjadi acuan pengembangan lanjutan: `subjects`, `simplified_points`, `glossary_terms`, `flashcard_sets`, `flashcards`, dan `source_references`. Saat ini poin, glosarium, dan flashcard disimpan sebagai JSONB di `scans` agar hasil AI dapat ditampilkan tanpa join tambahan.

Catatan implementasi: secara default data disimpan di `localStorage` per perangkat. Bila `NEXT_PUBLIC_DATA_MODE=supabase`, data disimpan di tabel di atas dan disinkronkan lintas perangkat. Fallback ke `localStorage` hanya untuk mode tamu atau gangguan jaringan; error otorisasi (401/403/RLS) harus ditampilkan sebagai pesan, bukan disamarkan sebagai data lokal.

### Relasi Utama

- profiles one-to-many scans (`scans.owner_id`).
- profiles one-to-many teacher\_verifications dan quiz\_results.
- guardianships many-to-many antara guru dan siswa.
- scans one-to-one teacher\_verifications dan one-to-one quiz\_results (unik pada `scan_id`).
- scans self-reference melalui `source_scan_id` untuk salinan materi guru ke siswa.
- RLS membatasi: siswa hanya data miliknya; guru hanya data siswa yang terhubung di `guardianships`.

### Catatan Arsitektur

- Struktur repository: satu repository dengan dua folder, `Frontend/` (Next.js 15) dan `Backend/` (FastAPI). Keduanya dijalankan bersamaan di localhost.
- Alur data: Kamera/Upload di Next.js → gambar dikompres di klien → frontend memanggil backend (`POST /api/scan`) dengan base64 dan token Supabase → backend memverifikasi token, memanggil Gemini dengan prompt khusus → hasil terstruktur divalidasi → frontend menyimpan materi ke Supabase (atau `localStorage` pada mode lokal) dan menampilkan tombol "Lihat Sumber". Penyimpanan gambar ke Supabase Storage (bucket privat) adalah target Fase 1 yang belum diterapkan; saat ini gambar hanya diproses untuk OCR.
- Gemini hanya dipanggil dari backend. API key disimpan sebagai environment variable backend (file .env lokal atau konfigurasi server) dan tidak pernah dikirim ke browser. Pembatasan laju diterapkan per pengguna.
- Backend memverifikasi token (JWT) Supabase pada setiap endpoint yang memakai AI, dan CORS dibatasi pada alamat frontend (localhost dan alamat Vercel). Verifikasi JWT adalah target yang sedang diimplementasikan; sampai selesai, endpoint AI masih dilindungi rate limit per IP.
- Gemini diminta menghasilkan keluaran JSON terstruktur (structured output) berisi poin, analogi, istilah, dan kutipan teks sumber per poin. Pydantic memvalidasi bentuk JSON, lalu validasi kutipan (normalisasi teks dan fuzzy matching) memastikan setiap kutipan ada pada teks OCR; poin tanpa rujukan valid ditandai atau dibuang.
- Akses data dilindungi Supabase Row Level Security (RLS): siswa hanya dapat mengakses datanya sendiri; guru hanya data siswa binaannya. Bucket gambar bersifat privat dan diakses lewat signed URL (target Storage).
- Tabel guardianships, teacher_verifications, dan quiz_results sudah dipakai pada Fase 1.5. Tabel ai_reports dan ai_usage_logs tetap disiapkan untuk fase lanjutan.
- Guru tidak boleh mengubah poin siswa secara langsung. Perubahan poin hanya melalui alur verifikasi (RPC/transaksi yang memeriksa relasi guardianships), sehingga RLS tidak perlu memberi guru izin `UPDATE scans` bebas.
- Hasil scan dicache berdasarkan hash gambar sehingga gambar yang sama tidak diproses ulang oleh AI.
- Mode Grand Final: frontend (npm run dev) dan backend (uvicorn) dijalankan di localhost pada laptop finalis, sedangkan Supabase dan Gemini tetap diakses lewat internet. Data scan contoh disiapkan sebagai cadangan bila koneksi atau layanan AI bermasalah.
- Versi online (wajib untuk submission): frontend di Vercel dan backend di VPS di belakang reverse proxy dengan HTTPS, firewall, dan user non-root. Guidebook mewajibkan aplikasi web sudah di-deploy dan dapat diakses juri lewat browser; localhost hanya dipakai saat Grand Final. Hosting backend dapat berupa Render, Railway, Cloud Run, atau VPS.
- Pembagian tugas: model (Gemini) menafsirkan foto dan menyederhanakan teks; kode backend memvalidasi bentuk JSON dan kutipan sumber, menyimpan data, serta membatasi laju; manusia (siswa, pendamping, kelak guru) memutuskan dan memverifikasi. Bagian yang tidak butuh AI, seperti text-to-speech bawaan browser, pencarian riwayat, dan pengaturan tampilan, dibuat dengan kode biasa.

## 7. Teknologi & Integrasi

|  |  |
| --- | --- |
| Frontend | Next.js 15 (App Router, TypeScript) + Tailwind CSS, klien Supabase untuk autentikasi dan (rencana) unggah gambar |
| Backend | Python (FastAPI) sebagai REST API; Pydantic untuk memvalidasi skema JSON keluaran AI |
| Database, Auth & Storage | Supabase: PostgreSQL, Auth, Storage (bucket privat), Row Level Security |
| AI | Gemini API (model multimodal ringan) untuk OCR, penyederhanaan teks, penyusunan flashcard, dan tanya penjelasan lain, dengan structured output (JSON); sebelum dijadikan inti produk, pastikan model yang dipilih mendukung input gambar dan structured output (tidak semua model, terutama yang gratis, mendukung keduanya) |
| Validasi Sumber | Normalisasi teks dan pencocokan kutipan terhadap teks OCR (fuzzy matching) di backend Python |
| Keamanan Antar-Layanan | Backend memverifikasi token (JWT) Supabase pada setiap endpoint yang memakai AI; CORS dibatasi pada alamat frontend |
| Font Ramah Disleksia | OpenDyslexic (self-hosted) dengan opsi font standar |
| Text-to-Speech | Web Speech API bawaan browser: speechSynthesis untuk membacakan dan SpeechRecognition untuk pencarian suara (dukungan utama Chrome/Edge), Bahasa Indonesia |
| Ilustrasi Flashcard | Pustaka ikon sederhana (mis. Lucide) dan SVG yang dirangkai dari data langkah visual |
| Deployment | Frontend: Vercel (paket Hobby untuk proyek non-komersial). Backend: di-deploy ke layanan hosting (Render, Railway, Cloud Run, atau VPS) dengan HTTPS agar dapat diakses juri; localhost (uvicorn) hanya untuk demo Grand Final |
| Pengujian Aksesibilitas | Lighthouse, axe DevTools |
| Teknologi Baru | Gemini API (Vision + structured output) dengan validasi sumber untuk Explainable AI |

Gemini API (Vision) dipilih karena satu model dapat membaca gambar halaman buku, menyederhanakan isinya, dan mengembalikan rujukan sumber dalam format terstruktur. Next.js dan Python (FastAPI) dipilih agar frontend dan backend terpisah dengan jelas: API key tetap di backend, dan Pydantic membantu memvalidasi keluaran JSON dari AI.

### Kebutuhan Integrasi

- Gemini API untuk pemrosesan gambar dan teks, dipanggil dari backend Python.
- Supabase (Auth, Database, Storage) sebagai penyedia autentikasi, database, dan penyimpanan terkelola.
- Vercel untuk hosting frontend selama pengembangan dan submission, dengan deploy otomatis dari GitHub.
- Hosting backend (Render, Railway, Cloud Run, atau VPS) dengan HTTPS agar aplikasi dapat diakses juri; wajib untuk submission, dengan API key disimpan di environment variable hosting.
- GitHub untuk pengumpulan source code sesuai ketentuan panitia.
- Web Speech API untuk pembacaan suara di browser.
- (Opsional, fase lanjutan) Tautan referensi ke kamus isyarat BISINDO/SIBI sebagai acuan visual tambahan.

## 8. Kebutuhan Non-Fungsional (NFR)

| Aspek | Kebutuhan |
| --- | --- |
| Aksesibilitas | Mengacu pada WCAG 2.1 level AA: kontras warna minimal 4.5:1, ukuran teks dapat diperbesar hingga 200% tanpa merusak tata letak, target sentuh tombol minimal 44x44 px, navigasi penuh dengan keyboard, label ARIA yang benar (alur utama kompatibel dengan screen reader), dan teks alternatif untuk seluruh ikon dan ilustrasi. Tampilan memuat satu aksi utama per layar dan menghindari animasi berkedip. |
| Keamanan & Privasi | API key Gemini hanya berada di backend (environment variable) dan tidak pernah dikirim ke browser. Backend memverifikasi token Supabase dan membatasi CORS (target yang sedang diimplementasikan; sementara endpoint AI dilindungi rate limit per IP). Row Level Security wajib aktif pada semua tabel. Gambar buku disimpan di bucket privat (target Supabase Storage; saat ini gambar hanya diproses untuk OCR). Data siswa anak dilindungi sesuai UU Pelindungan Data Pribadi; pendaftaran siswa di bawah umur memerlukan persetujuan orang tua/guru. Untuk juri disediakan akun demo di README agar tidak terhambat alur persetujuan. Pengguna diingatkan untuk hanya memotret halaman buku, tanpa identitas pribadi. Pencarian suara memakai pemrosesan audio oleh penyedia browser; hal ini dinyatakan dalam kebijakan privasi dan input ketik selalu tersedia. |
| Akurasi & Transparansi AI | Setiap poin AI harus memiliki rujukan teks sumber yang tervalidasi. Konten yang tidak dapat dirujuk ditandai. Label "Dibuat oleh AI" selalu tampil, dan konten materi sains/medis disarankan diverifikasi guru; penggunaan AI (layanan atau model dan bagian produk yang memanfaatkannya) serta atribusi seluruh pustaka, font, ikon, dan aset pihak ketiga didokumentasikan di README. |
| Efisiensi Sumber Daya (Green IT) | Gambar dikompres di sisi klien sebelum diunggah. Hasil scan dicache berdasarkan hash gambar agar AI tidak dipanggil ulang. Memakai model Gemini ringan dengan panjang keluaran dibatasi. Tidak ada polling terus-menerus, dan animasi berat dihindari. |
| Performa | Hasil Fitur 1 ditargetkan tampil dalam 15 detik pada koneksi standar dengan indikator progres yang jelas. Halaman utama dimuat di bawah 3 detik. |
| Keandalan | Penanganan kegagalan AI (timeout, gambar buram, kuota habis) dengan pesan ramah dan opsi coba lagi. Batas laju per pengguna untuk melindungi kuota. Backup database terjadwal melalui fitur Supabase. Frontend dan backend harus dapat dijalankan bersamaan secara lokal (localhost) dengan README dan .env.example, termasuk data contoh cadangan bila koneksi bermasalah. |
| Usability | Antarmuka responsif, bahasa instruksi sederhana dan konsisten, tombol besar dengan ikon pendamping teks, dan alur scan maksimal 3 langkah (ambil foto, tunggu, baca). Tersedia Mode Tenang dan pengingat istirahat, tanpa mekanik yang membuat ketagihan (streak harian, hadiah tanpa batas). |

## 9. Asumsi & Ketergantungan

### Asumsi

- Pengguna memiliki smartphone atau laptop dengan kamera dan koneksi internet.
- Siswa didampingi guru atau orang tua saat pertama kali menggunakan aplikasi, terutama untuk pengaturan aksesibilitas.
- Halaman buku yang dipindai memuat teks cetak yang cukup jelas dan berbahasa Indonesia.
- Untuk fase 1, aplikasi digunakan sebagai alat bantu belajar, bukan pengganti guru atau diagnosis.

### Dependencies

- Ketersediaan dan kuota Gemini API (tier gratis memiliki batas permintaan sehingga perlu pembatasan laju dan cache).
- Ketersediaan layanan Supabase (Auth, Storage, Database) dan Vercel untuk frontend (paket Hobby, hanya untuk proyek non-komersial); hosting backend wajib tersedia sampai penilaian selesai.
- Dukungan Web Speech API dan suara Bahasa Indonesia pada browser pengguna.
- Ketentuan rulebook LOGICODIX 2026, termasuk kewajiban demo di localhost saat Grand Final dan video demo 3–5 menit dari commit final (narasi opsional).
- Kepatuhan terhadap UU Pelindungan Data Pribadi karena pengguna utama adalah anak-anak. Registrasi siswa di bawah umur memerlukan persetujuan orang tua/guru; akun demo disediakan untuk juri.
- Verifikasi JWT Supabase di backend dan pengujian RLS wajib diselesaikan sebelum submission; jangan mengandalkan pembatasan di sisi frontend.
- Gemini API, Supabase, frontend (Vercel), dan hosting backend harus tetap aktif sampai seluruh penilaian dan pengumuman hasil selesai; cek batas dan kebijakan paket gratis (termasuk proyek Supabase gratis yang dapat dijeda bila lama tidak aktif) dan pantau secara berkala.

* Dukungan SpeechRecognition pada browser pengguna (terutama Chrome dan Edge) untuk pencarian suara; pemrosesan audio dilakukan oleh penyedia browser.
* (Fase lanjutan) Lisensi dan akses resmi (API atau unduhan) dari sumber e-book eksternal sebelum diintegrasikan.

- Python beserta pustaka backend (FastAPI, Pydantic, pustaka Gemini, pustaka fuzzy matching) dan Node.js terpasang di laptop final agar frontend dan backend dapat dijalankan bersamaan.

## 10. Rencana Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| AI menghasilkan penjelasan keliru atau mengarang (halusinasi) | Tinggi | Wajibkan rujukan teks sumber tervalidasi di server, tampilkan tombol "Lihat Sumber", tandai konten tanpa rujukan, batasi AI tutor pada teks halaman yang dipindai |
| OCR gagal pada foto buram, miring, atau berbayang (termasuk foto yang diambil pengguna tunanetra tanpa bantuan) | Sedang | Panduan pengambilan foto di layar kamera, pratinjau sebelum kirim, pesan error ramah dengan opsi foto ulang, panduan suara posisi kamera, dan bantuan pendamping untuk memotret |
| API key Gemini bocor | Tinggi | Panggil Gemini hanya dari backend, simpan key di environment variable backend, jangan komit file .env, ganti key bila pernah terkomit |
| Kuota Gemini API habis | Sedang | Rate limit per pengguna, cache hasil scan, pesan antrean yang jelas |
| Deskripsi isyarat dan visual dari AI kurang akurat | Tinggi | Sebut sebagai "saran visual", batasi fase 1 pada deskripsi teks dan ilustrasi sederhana, siapkan verifikasi guru (Fase 1.5) |
| Data anak dan foto buku disalahgunakan atau bocor | Tinggi | RLS ketat, bucket privat, persetujuan orang tua/guru, dan kebijakan penghapusan data oleh pengguna |
| Waktu Hacking Week hanya 8 hari untuk satu orang | Tinggi | Fokus MVP pada Fitur 1, Lihat Sumber, dan Fitur 2 ringkas; checkpoint Fitur 1 end-to-end di hari 3; fitur lanjutan ditunda; pemisahan frontend dan backend menambah sekitar satu hari kerja untuk setup dan integrasi, sehingga deploy online (Vercel dan hosting backend) tetap wajib dan dijadikan checkpoint pada Hari 3-4 (9-10 Nov) |
| Frontend atau backend gagal berjalan di localhost saat Grand Final (konfigurasi, dependensi Python/Node, atau koneksi internet) | Sedang | Siapkan README dan .env.example, uji menjalankan aplikasi dari nol di laptop final berulang kali, sediakan skrip yang menjalankan frontend dan backend sekaligus, catat versi dependensi Python dan Node, siapkan hasil scan cadangan |
| Demo gagal karena jaringan atau layanan AI bermasalah | Sedang | Simpan hasil scan contoh yang sudah jadi sebagai cadangan, uji alur demo berulang kali, patuhi code freeze 14 Nov pukul 23.59 WIB (setelah itu hanya commit final yang dinilai, dan deployment, APK, serta video demo harus berasal dari commit tersebut) |

## 11. Indikator Keberhasilan

- Tingkat keberhasilan scan: minimal 90% foto halaman buku yang jelas berhasil diproses menjadi ringkasan.
- Waktu pemrosesan: rata-rata hasil Fitur 1 tampil kurang dari 15 detik.
- Transparansi AI: minimal 95% poin hasil AI memiliki rujukan teks sumber yang tervalidasi.
- Akurasi menurut guru: minimal 85% poin yang ditinjau guru dinyatakan sesuai isi buku (diukur pada uji coba kecil dengan 1–3 guru atau pendamping; bila belum sempat, menjadi target pasca-MVP).
- Aksesibilitas: skor Lighthouse Accessibility minimal 90 pada halaman utama.
- Kepuasan pengguna: rata-rata skor kemudahan memahami materi minimal 4 dari 5 pada uji coba dengan siswa dan guru pendamping (bila uji coba dengan pengguna nyata belum sempat, menjadi target pasca-MVP).
- Pemakaian ulang: minimal 50% pengguna uji coba membuka kembali materi dari riwayat tanpa memindai ulang.

## 12. Milestone & Perkiraan Waktu

| Tahap | Waktu | Deliverable |
| --- | --- | --- |
| Persiapan | Sebelum 7 Nov (non-kode: desain, dokumen, akun layanan) | PRD, ERD, wireframe/UI mockup, rancangan prompt dan skema JSON, akun Supabase, Vercel, dan Gemini API |
| Hari 1 | 9 Nov | Mentoring Navasena (09.30–15.30), setup repository dengan folder `Frontend/` (Next.js 15) dan `Backend/` (FastAPI), Supabase, autentikasi dan RLS dasar, verifikasi token Supabase di backend; deploy awal frontend ke Vercel dan backend ke layanan hosting (cukup endpoint health check) agar jalur deployment teruji sejak awal |
| Hari 2 | 9 Nov | Unggah gambar ke Storage, endpoint backend ke Gemini, struktur JSON terstruktur |
| Hari 3 | 9 Nov | Checkpoint: Fitur 1 end-to-end (kartu per poin, font/ukuran teks, text-to-speech, pemilih Mode Belajar), dan deploy frontend serta backend ke hosting sehingga dapat diakses lewat browser |
| Hari 4 | 10 Nov | Tombol "Lihat Sumber" dengan validasi kutipan, riwayat scan, pencarian suara/ketik pada riwayat; tanya 2–3 guru atau pendamping lewat WhatsApp ("Terakhir kali menyederhanakan satu halaman buku untuk siswa, bagian mana yang paling lama?") dan catat jawabannya sebagai bukti masalah |
| Hari 5 | 11 Nov | Fitur 2: flashcard visual versi ringkas, Mode Suara dasar |
| Hari 6 | 12 Nov | penyempurnaan prompt, uji alur demo end-to-end; stretch goal (versi sederhana bila alur utama dan deploy sudah stabil): Tanya Penjelasan Lain, Kartu Respons Simbol, Langkah Belajar Visual, Mode Tenang |
| Hari 7 | 13 Nov | Uji aksesibilitas (Lighthouse/axe, uji screen reader dasar), uji coba singkat dengan 1–3 guru atau pendamping untuk indikator Bab 11, perbaikan bug, kompresi gambar dan cache, README (termasuk cara menjalankan frontend dan backend di localhost), .env.example, diagram arsitektur dan alur data, nama tim, deskripsi dan target pengguna, daftar fitur, akun demo, dokumentasi penggunaan AI, serta atribusi pihak ketiga |
| Hari 8 | 14 Nov | Submission akhir (jangan menunggu menit terakhir): source code ke GitHub, video demo 3–5 menit yang diunggah ke YouTube (Unlisted atau Public) dan direkam dari commit final, dengan caption di layar (narasi opsional), hasil scan cadangan; kode tidak boleh diubah setelah batas waktu; submission hanya sekali lewat portal resmi sebelum 14 Nov pukul 23.59 WIB, termasuk Surat Pernyataan Orisinalitas (PDF, meterai Rp10.000, ditandatangani ketua tim) |
| Pitching Finalis | 29 Nov | Final 15 menit (7 menit presentasi dan live demo di localhost, 3 menit tanya jawab) bila lolos Top 8; pengumuman finalis 21 Nov dan technical meeting 22 Nov |

**Status implementasi per 11 November 2026:** alur siswa (scan, tiga Mode Belajar, Lihat Sumber, riwayat, pengaturan aksesibilitas tersimpan ke profil), backend FastAPI, login & registrasi siswa Supabase Auth, sinkronisasi materi, verifikasi JWT di FastAPI (`AUTH_MODE=optional`), RPC verifikasi guru di skema SQL, verifikasi guru tersinkron, materi guru + AI, berbagi ke siswa, dan Kuis Ceria sudah tersedia. Yang masih direncanakan untuk fase lanjutan: antarmuka daftar siswa binaan, pemindaian atas nama siswa, dan Supabase Storage untuk gambar permanen (saat ini gambar menerapkan zero-retention/hanya diproses OCR).
