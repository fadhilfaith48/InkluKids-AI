'use client';

import React from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  Eye,
  Volume2,
  ShieldCheck,
  Camera,
  Award,
  UserCheck,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="modal-card relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={onClose}
          aria-label="Tutup jendela bantuan"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest">
            <HelpCircle className="h-7 w-7 stroke-[2.5]" />
          </span>
          <div>
            <h2 id="help-modal-title" className="text-2xl font-bold text-ink">
              Panduan PahamInklusif AI
            </h2>
            <p className="text-xs text-slateText">Cara belajar yang inklusif, ramah, dan terverifikasi</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm text-ink leading-relaxed">
          <div className="rounded-2xl border-2 border-ink bg-[#FAF6F0] p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <Camera className="h-4 w-4 text-forest" /> 1. Pindai Halaman Buku
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Tekan tombol &ldquo;Pindai Buku&rdquo; di atas untuk memotret atau mengunggah foto halaman buku cetak apa saja. Kamu juga bisa memilih contoh materi yang sudah disiapkan.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-sky/30 p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <BookOpen className="h-4 w-4 text-forest" /> 2. Mode Baca (Disleksia & ADHD)
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Kalimat panjang diubah menjadi poin-poin pendek 1 ide per kartu, dilengkapi analogi dunia nyata dan glosarium istilah sulit.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-mint/40 p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <Eye className="h-4 w-4 text-forest" /> 3. Mode Visual (Tunarungu & Autisme)
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Menampilkan urutan langkah visual bergambar, deskripsi gestur isyarat teks, dan contoh konkret tanpa bahasa kiasan.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-peach/40 p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <Volume2 className="h-4 w-4 text-forest" /> 4. Mode Suara (Tunanetra & Low Vision)
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Seluruh materi dibacakan secara otomatis dengan suara ramah berbahasa Indonesia, tombol kontrol ekstra besar, dan dukungan pembaca layar.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-[#FFF9E6] p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <ShieldCheck className="h-4 w-4 text-amber-700" /> 5. Explainable AI (Lihat Sumber)
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Setiap penjelasan AI dilengkapi tombol &ldquo;Lihat Sumber&rdquo; untuk memeriksa potongan kalimat asli dari buku, sehingga bebas dari halusinasi.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-[#FFF2B2]/60 p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <Award className="h-4 w-4 text-[#F2A33A]" /> 6. Kuis Ceria Singkat
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Uji pemahaman dengan 2-3 pertanyaan santai tanpa tekanan. Benar dapat bintang dan konfeti, salah tetap disemangati dengan penjelasan lembut!
            </p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-[#DCE8FD] p-4">
            <h3 className="font-extrabold flex items-center gap-2 text-ink">
              <UserCheck className="h-4 w-4 text-[#1F5F85]" /> 7. Mode Guru / Pendamping
            </h3>
            <p className="mt-1 text-xs text-slateText">
              Klik tombol &ldquo;Mode Guru?&rdquo; di header untuk membuka panel koreksi & validasi. Guru dapat membandingkan teks buku asli, mengedit poin materi, dan memberi stempel verifikasi resmi untuk murid.
            </p>
          </div>
        </div>

        <button
          className="primary-button mt-6 w-full"
          onClick={onClose}
        >
          Mengerti! Siap Belajar
        </button>
      </div>
    </div>
  );
}
