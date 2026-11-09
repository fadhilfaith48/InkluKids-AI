'use client';

import React, { useState } from 'react';
import {
  Volume2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  BookA,
  Star,
  Award,
} from 'lucide-react';
import { ScanResult, SimplifiedPoint } from '@/types';
import confetti from 'canvas-confetti';

interface ReadModeViewProps {
  lesson: ScanResult;
  onOpenSourceModal: (pointText: string, quote: string, isValid?: boolean) => void;
  onOpenTutorModal: (pointText: string) => void;
  onOpenFlashcardForTerm?: (term: string) => void;
  onOpenQuiz?: () => void;
  speakText: (text: string) => void;
  onCompleteLesson: () => void;
  calmMode?: boolean;
}

export function ReadModeView({
  lesson,
  onOpenSourceModal,
  onOpenTutorModal,
  onOpenFlashcardForTerm,
  onOpenQuiz,
  speakText,
  onCompleteLesson,
  calmMode = false,
}: ReadModeViewProps) {
  const points = lesson.points || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentPoint: SimplifiedPoint | undefined = points[currentIdx];
  const isLast = currentIdx === points.length - 1;

  const handleNext = () => {
    if (isLast) {
      setIsCompleted(true);
      if (!calmMode) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      onCompleteLesson();
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentIdx(0);
  };

  if (points.length === 0) {
    return (
      <div className="learning-card text-center p-8">
        <p className="text-lg font-bold text-ink">Tidak ada poin materi yang terbaca.</p>
      </div>
    );
  }

  // Jika sudah selesai membaca semua kartu
  if (isCompleted) {
    return (
      <article className="learning-card text-center py-12 px-6">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-3 border-ink bg-[#FFF2B2] shadow-[3px_3px_0_#17304F]">
          <Star className="h-12 w-12 fill-[#F2A33A] text-ink" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-ink md:text-4xl">
          Hebat Sekali! Kamu Selesai!
        </h2>
        <p className="mt-3 text-lg text-slateText max-w-md mx-auto">
          Kamu sudah membaca seluruh {points.length} kartu materi &ldquo;{lesson.title}&rdquo;.
          Kamu dapat 1 Bintang Emas!
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {onOpenQuiz && (
            <button
              className="primary-button font-extrabold text-base px-7 py-3.5 flex items-center gap-2"
              onClick={onOpenQuiz}
            >
              <Award className="h-5 w-5" />
              Mulai Kuis Ceria Singkat!
            </button>
          )}

          <button
            className="secondary-button font-bold text-base px-6 py-3"
            onClick={handleRestart}
          >
            Baca Ulang Materi Ini
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="learning-card" aria-label={`Kartu belajar ${currentIdx + 1} dari ${points.length}`}>
      {/* Header Kartu */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-sky px-3 py-1 text-xs font-bold text-ink">
              Kartu {currentIdx + 1} dari {points.length}
            </span>

            {/* Badge Status Verifikasi Guru */}
            {lesson.teacher_verification?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint border border-forest px-2.5 py-0.5 text-[11px] font-extrabold text-forest shadow-[1px_1px_0_#277A5B]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Diverifikasi Guru ({lesson.teacher_verification.verifiedBy})
              </span>
            )}
          </div>

          <h2 className="mt-1 text-xl font-bold text-ink md:text-2xl">
            {lesson.title}
          </h2>
        </div>

        {/* Label AI & Tombol Kuis Cepat */}
        <div className="flex items-center gap-2">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink bg-[#FFF9E6] px-3 py-1.5 text-xs font-bold text-ink hover:bg-[#FFF2B2] shadow-[1px_1px_0_#17304F] transition-all"
              title="Buka Kuis Ceria Singkat untuk materi ini"
            >
              <Award className="h-3.5 w-3.5 text-[#F2A33A]" />
              Kuis Ceria
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-xl border border-ink bg-white px-2.5 py-1 text-xs font-bold text-slateText shadow-[1px_1px_0_#17304F]">
            {lesson.teacher_verification?.isVerified ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                {lesson.teacher_verification.edited
                  ? 'Disunting & diverifikasi guru'
                  : 'Diverifikasi guru'}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-forest" />
                Dibuat oleh AI
              </>
            )}
          </span>
        </div>
      </div>

      {/* Catatan Guru untuk Siswa */}
      {lesson.teacher_verification?.isVerified && lesson.teacher_verification.notes && (
        <div className="mt-4 rounded-2xl border-2 border-forest bg-mint/30 p-3 text-sm text-forest flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Catatan guru:</strong>{' '}
            <span className="text-ink font-medium">{lesson.teacher_verification.notes}</span>
          </p>
        </div>
      )}

      {/* Konten Poin Utama */}
      <div className="mt-6 min-h-[9rem]">
        <p className="text-2xl font-bold leading-relaxed text-ink md:text-3xl">
          {currentPoint.text}
        </p>
      </div>

      {/* Analogi Dunia Nyata (Bila ada) */}
      {currentPoint.analogy && (
        <div className="mt-4 rounded-2xl border-2 border-ink bg-[#FFF9E6] p-4 shadow-[2px_2px_0_#17304F]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            Contoh / Perumpamaan Nyata:
          </div>
          <p className="mt-1.5 text-base font-semibold text-ink leading-normal">
            &ldquo;{currentPoint.analogy}&rdquo;
          </p>
        </div>
      )}

      {/* Action Buttons: Bacakan, Lihat Sumber, Tanya Tutor AI */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="secondary-button text-sm font-bold flex items-center gap-2 focus-ring"
          onClick={() =>
            speakText(
              `${currentPoint.text}. ${
                currentPoint.analogy ? 'Perumpamaannya: ' + currentPoint.analogy : ''
              }`
            )
          }
          aria-label="Bacakan teks kartu ini"
        >
          <Volume2 className="h-4 w-4 text-forest" />
          Bacakan
        </button>

        <button
          className="secondary-button text-sm font-bold flex items-center gap-2 focus-ring"
          onClick={() =>
            onOpenSourceModal(
              currentPoint.text,
              currentPoint.source_quote,
              currentPoint.is_valid_quote
            )
          }
          aria-label="Buka bukti sumber kalimat buku"
        >
          <ShieldCheck className="h-4 w-4 text-forest" />
          Lihat Sumber
        </button>

        <button
          className="secondary-button text-sm font-bold flex items-center gap-2 focus-ring"
          onClick={() => onOpenTutorModal(currentPoint.text)}
          aria-label="Tanya penjelasan lain kepada tutor AI"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          Tanya Tutor AI
        </button>
      </div>

      {/* Glosarium Istilah Sulit (Jika ada) */}
      {lesson.glossary && lesson.glossary.length > 0 && (
        <div className="mt-8 rounded-2xl border-2 border-ink bg-[#FAF6F0] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slateText">
              <BookA className="h-4 w-4 text-forest" />
              Kamus Kata Penting di Halaman Ini:
            </div>
            <span className="text-[11px] font-medium text-slateText">
              Klik kata untuk melihat flashcard visual
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {lesson.glossary.map((item, gIdx) => (
              <button
                key={gIdx}
                className="group flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-ink bg-white px-3 py-2 text-xs font-bold text-ink shadow-[2px_2px_0_#17304F] hover:bg-mint/40 transition-all text-left focus-ring"
                onClick={() => onOpenFlashcardForTerm && onOpenFlashcardForTerm(item.term)}
                title="Buka Flashcard Visual untuk kata ini"
              >
                <span className="text-forest underline group-hover:text-ink">{item.term}:</span>{' '}
                <span className="text-slateText font-medium">{item.meaning}</span>
                <span className="ml-1 inline-flex items-center rounded-md bg-mint px-1.5 py-0.5 text-[10px] font-extrabold text-forest">
                  Visual ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigasi Kartu: Sebelumnya dan Lanjut */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-dashed border-gray-200 pt-6">
        <button
          className="secondary-button px-5"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          aria-label="Kartu sebelumnya"
        >
          <ArrowLeft className="h-5 w-5" /> Sebelumnya
        </button>

        <button
          className="primary-button px-8 flex items-center gap-2"
          onClick={handleNext}
          aria-label={isLast ? 'Selesaikan materi' : 'Lanjut ke kartu berikutnya'}
        >
          <span>{isLast ? 'Selesai Belajar' : 'Lanjut'}</span>
          {isLast ? <CheckCircle2 className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </article>
  );
}
