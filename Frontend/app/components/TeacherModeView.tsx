'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Edit3,
  Save,
  RotateCcw,
  UserCheck,
  Lightbulb,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { ScanResult, SimplifiedPoint } from '@/types';
import confetti from 'canvas-confetti';

interface TeacherModeViewProps {
  lesson: ScanResult;
  onUpdateLesson: (updated: ScanResult) => void;
  speakText: (text: string) => void;
  calmMode?: boolean;
}

export function TeacherModeView({
  lesson,
  onUpdateLesson,
  speakText,
  calmMode = false,
}: TeacherModeViewProps) {
  const [points, setPoints] = useState<SimplifiedPoint[]>(lesson.points || []);
  const [title, setTitle] = useState(lesson.title);
  const [teacherName, setTeacherName] = useState(
    lesson.teacher_verification?.verifiedBy || 'Ibu Guru / Pendamping'
  );
  const [notes, setNotes] = useState(lesson.teacher_verification?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sinkronkan editor saat guru membuka materi lain.
  useEffect(() => {
    setPoints(lesson.points || []);
    setTitle(lesson.title);
    setTeacherName(
      lesson.teacher_verification?.verifiedBy || 'Ibu Guru / Pendamping'
    );
    setNotes(lesson.teacher_verification?.notes || '');
    setSavedSuccess(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset state form editor hanya saat beralih ke ID materi lain
  }, [lesson.id]);

  const isAlreadyVerified = lesson.teacher_verification?.isVerified || false;

  const handlePointChange = (idx: number, newText: string) => {
    setPoints((prev) =>
      prev.map((pt, i) => (i === idx ? { ...pt, text: newText } : pt))
    );
  };

  const handleAnalogyChange = (idx: number, newAnalogy: string) => {
    setPoints((prev) =>
      prev.map((pt, i) => (i === idx ? { ...pt, analogy: newAnalogy } : pt))
    );
  };

  const handleVerifyAndSave = () => {
    const cleanTitle = title.trim() || lesson.title;
    const hasEdits =
      lesson.teacher_verification?.edited === true ||
      cleanTitle !== lesson.title.trim() ||
      points.some((pt, idx) => {
        const original = lesson.points[idx];
        if (!original) return true;
        return (
          pt.text.trim() !== original.text.trim() ||
          (pt.analogy || '').trim() !== (original.analogy || '').trim()
        );
      });

    const updated: ScanResult = {
      ...lesson,
      title: cleanTitle,
      points,
      teacher_verification: {
        verifiedBy: teacherName.trim() || 'Guru / Pendamping',
        verifiedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        notes: notes.trim(),
        isVerified: true,
        edited: hasEdits,
      },
    };

    onUpdateLesson(updated);
    setSavedSuccess(true);
    speakText('Materi berhasil diverifikasi dan disimpan untuk murid.');
    if (!calmMode) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleRevokeVerification = () => {
    const updated: ScanResult = {
      ...lesson,
      teacher_verification: lesson.teacher_verification
        ? { ...lesson.teacher_verification, isVerified: false }
        : undefined,
    };
    onUpdateLesson(updated);
    speakText('Status verifikasi dicabut.');
  };

  return (
    <div className="space-y-6">
      {/* Banner Mode Guru */}
      <div className="rounded-3xl border-3 border-ink bg-white p-4 sm:p-6 shadow-[4px_4px_0_#17304F]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#DCE8FD] text-[#1F5F85] border-2 border-ink">
              <UserCheck className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-ink md:text-2xl break-words">
                  Panel Verifikasi Guru & Pendamping
                </h2>
                {isAlreadyVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint border border-forest px-3 py-0.5 text-xs font-bold text-forest">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi
                  </span>
                )}
              </div>
              <p className="text-xs text-slateText md:text-sm mt-0.5">
                Bandingkan hasil rangkuman AI dengan teks asli buku, koreksi poin jika perlu, dan berikan cap verifikasi.
              </p>
            </div>
          </div>

          <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
            {isAlreadyVerified ? (
              <button
                type="button"
                onClick={handleRevokeVerification}
                className="secondary-button flex-1 sm:flex-initial text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                title="Batal verifikasi jika ingin mengedit ulang"
              >
                <RotateCcw className="h-4 w-4" /> Batalkan Verifikasi
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleVerifyAndSave}
              className="primary-button flex-1 sm:flex-initial text-sm py-2.5 px-4 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isAlreadyVerified ? 'Perbarui Verifikasi' : 'Verifikasi & Simpan'}</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-mint/50 border-2 border-forest p-3 text-xs md:text-sm font-bold text-forest">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Materi berhasil diverifikasi! Judul, poin, dan catatan akan tampil di layar belajar siswa setelah tersinkron.</span>
          </div>
        )}
      </div>

      {/* Grid: Teks Buku Asli (OCR) vs Editor Poin AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Teks Buku Asli (OCR) */}
        <div className="lg:col-span-5 min-w-0 rounded-3xl border-3 border-ink bg-[#FFFDF9] p-4 sm:p-5 shadow-[3px_3px_0_#17304F]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0 text-forest" />
              <h3 className="font-extrabold text-ink text-sm sm:text-base">
                Teks Asli Buku Pelajaran (OCR)
              </h3>
            </div>
            <span className="text-[11px] font-bold bg-peach px-2 py-0.5 rounded-full border border-ink text-ink">
              Sumber Asli
            </span>
          </div>

          <p className="mt-2 text-xs text-slateText break-words">
            Halaman: <strong>&ldquo;{lesson.title}&rdquo;</strong>
          </p>

          <div className="mt-3 max-h-[360px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden rounded-2xl border-2 border-ink bg-white p-3.5 sm:p-4 font-mono text-xs leading-relaxed text-ink/90 whitespace-pre-wrap break-words select-all">
            {lesson.ocr_text || '(Tidak ada teks OCR yang terdeteksi)'}
          </div>

          <div className="mt-4 rounded-xl bg-sky/30 border border-ink p-3 text-xs text-ink/80 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-forest flex-shrink-0 mt-0.5" />
            <span>
              Periksa apakah AI telah menyarikan konsep penting dengan benar tanpa menghilangkan fakta kunci buku.
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Editor Poin Belajar Siswa */}
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="rounded-3xl border-3 border-ink bg-white p-4 sm:p-5 shadow-[3px_3px_0_#17304F]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 flex-shrink-0 text-forest" />
                <h3 className="font-extrabold text-ink text-sm sm:text-base">
                  Edit Poin Pembelajaran Siswa ({points.length} Poin)
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-mint px-2 py-0.5 rounded-full border border-forest text-forest">
                Dapat Disunting
              </span>
            </div>

            {/* Judul Materi */}
            <div className="mt-4">
              <label
                htmlFor="teacher-lesson-title"
                className="block text-xs font-bold text-ink mb-1"
              >
                Judul Materi:
              </label>
              <input
                id="teacher-lesson-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lesson.title}
                maxLength={120}
                className="w-full rounded-xl border-2 border-ink bg-white p-2.5 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
              />
              <p className="mt-1 text-[11px] text-slateText">
                Judul ini tampil di daftar Materi Saya siswa. Kosongkan untuk memakai judul asli.
              </p>
            </div>

            {/* List Poin yang Bisa Diedit */}
            <div className="mt-4 space-y-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto overflow-x-hidden pr-1">
              {points.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-ink bg-[#FAF6F0] p-3.5 sm:p-4 space-y-2 shadow-[2px_2px_0_#17304F]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="rounded-full bg-sky px-2.5 py-0.5 text-xs font-extrabold text-ink border border-ink">
                      Poin #{idx + 1}
                    </span>
                    <span className="min-w-0 text-[11px] text-slateText font-medium break-words">
                      Kutipan Sumber: &ldquo;{(pt.source_quote || '').slice(0, 35)}...&rdquo;
                    </span>
                  </div>

                  {/* Input Teks Poin */}
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Kalimat Sederhana untuk Murid:
                    </label>
                    <textarea
                      rows={2}
                      value={pt.text}
                      onChange={(e) => handlePointChange(idx, e.target.value)}
                      className="w-full rounded-xl border-2 border-ink bg-white p-2.5 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
                    />
                  </div>

                  {/* Input Analogi */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-amber-900 mb-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                      Analogi Dunia Nyata (Opsional):
                    </label>
                    <input
                      type="text"
                      value={pt.analogy || ''}
                      placeholder="Contoh perumpamaan konkret..."
                      onChange={(e) => handleAnalogyChange(idx, e.target.value)}
                      className="w-full rounded-xl border-2 border-ink bg-white p-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Form Identitas Guru & Catatan Pendamping */}
            <div className="mt-5 pt-4 border-t-2 border-dashed border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Nama Guru / Pendamping:
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Contoh: Ibu Rina, S.Pd (Guru Pendamping)"
                  className="w-full rounded-xl border-2 border-ink bg-white p-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Catatan Guru untuk Siswa (Opsional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pelajari poin 1 dan 2 terlebih dahulu."
                  className="w-full rounded-xl border-2 border-ink bg-white p-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleVerifyAndSave}
                className="primary-button w-full sm:w-auto text-sm py-2.5 px-6 flex items-center justify-center gap-2"
              >
                <Award className="h-4 w-4" />
                Simpan & Berikan Cap Verifikasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
