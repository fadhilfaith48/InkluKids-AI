'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Star,
  Award,
} from 'lucide-react';
import { ScanResult, SimplifiedPoint } from '@/types';
import confetti from 'canvas-confetti';

interface SoundModeViewProps {
  lesson: ScanResult;
  onOpenSourceModal: (pointText: string, quote: string, isValid?: boolean) => void;
  onOpenQuiz?: () => void;
  speakText: (text: string) => void;
  onCompleteLesson: () => void;
  calmMode?: boolean;
}

export function SoundModeView({
  lesson,
  onOpenSourceModal,
  onOpenQuiz,
  speakText,
  onCompleteLesson,
  calmMode = false,
}: SoundModeViewProps) {
  const points = lesson.points || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentPoint: SimplifiedPoint | undefined = points[currentIdx];
  const isLast = currentIdx === points.length - 1;

  // Baca otomatis saat berpindah kartu jika mode suara aktif
  useEffect(() => {
    if (currentPoint && !isCompleted) {
      const speech = `Poin ${currentIdx + 1} dari ${points.length}. ${currentPoint.text}. ${
        currentPoint.analogy ? 'Perumpamaannya: ' + currentPoint.analogy : ''
      }`;
      speakText(speech);
    }
  }, [currentIdx, isCompleted]);

  const handleNext = () => {
    if (isLast) {
      setIsCompleted(true);
      speakText('Hebat sekali! Kamu sudah menyelesaikan seluruh materi suara ini!');
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

  const handleRepeat = () => {
    if (currentPoint) {
      speakText(
        `Mengulang poin ${currentIdx + 1}. ${currentPoint.text}. ${
          currentPoint.analogy ? 'Perumpamaannya: ' + currentPoint.analogy : ''
        }`
      );
    }
  };

  if (!currentPoint) {
    return (
      <div className="learning-card text-center p-8">
        <p className="text-lg font-bold text-ink">Materi suara tidak ditemukan.</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <article className="learning-card text-center py-12 px-6" aria-live="polite">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-ink bg-[#FBE6C8] shadow-[4px_4px_0_#17304F]">
          <Star className="h-16 w-16 fill-[#F2A33A] text-ink" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-ink md:text-5xl">
          Materi Suara Selesai!
        </h2>
        <p className="mt-4 text-xl font-bold text-slateText max-w-md mx-auto">
          Kamu sudah mendengarkan seluruh {points.length} penjelasan dengan sangat baik!
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {onOpenQuiz && (
            <button
              className="primary-button text-lg px-8 py-4 flex items-center gap-2 focus-ring"
              onClick={onOpenQuiz}
            >
              <Award className="h-6 w-6" />
              Mulai Kuis Ceria Singkat!
            </button>
          )}

          <button
            className="secondary-button text-lg px-8 py-4 min-h-[4.5rem] focus-ring"
            onClick={() => {
              setIsCompleted(false);
              setCurrentIdx(0);
            }}
          >
            <RotateCcw className="h-6 w-6" /> Dengarkan Lagi dari Awal
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="learning-card bg-[#FFFDF9]"
      aria-label={`Mode Suara: Poin ${currentIdx + 1} dari ${points.length}`}
      aria-live="polite"
    >
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-peach px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_#17304F]">
            <Volume2 className="h-5 w-5 text-ink animate-pulse" />
            Mode Suara Aktif · Poin {currentIdx + 1} dari {points.length}
          </span>

          {lesson.teacher_verification?.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint border border-forest px-2.5 py-1 text-xs font-bold text-forest">
              <CheckCircle2 className="h-4 w-4" />
              Terverifikasi Guru
              {lesson.teacher_verification.verifiedBy
                ? ` (${lesson.teacher_verification.verifiedBy})`
                : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={onOpenQuiz}
              className="secondary-button text-xs font-bold px-3 py-2 flex items-center gap-1.5"
            >
              <Award className="h-4 w-4 text-[#F2A33A]" />
              Kuis Ceria
            </button>
          )}

          <button
            className="secondary-button text-sm font-bold px-4 py-2"
            onClick={() =>
              onOpenSourceModal(
                currentPoint.text,
                currentPoint.source_quote,
                currentPoint.is_valid_quote
              )
            }
          >
            <ShieldCheck className="h-4 w-4 text-forest" />
            Dengarkan Sumber Asli
          </button>
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

      {/* Teks Ekstra Besar & Jelas untuk Low Vision */}
      <div className="my-8 rounded-3xl border-3 border-ink bg-white p-6 md:p-8 shadow-[3px_3px_0_#17304F]">
        <h2 className="text-2xl font-extrabold leading-relaxed text-ink md:text-4xl">
          {currentPoint.text}
        </h2>

        {currentPoint.analogy && (
          <div className="mt-6 rounded-2xl border-2 border-ink bg-peach/30 p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-900">
              Perumpamaan Sehari-Hari:
            </p>
            <p className="mt-1 text-lg font-bold text-ink leading-normal">
              &ldquo;{currentPoint.analogy}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Tombol Kontrol Suara Utama (Ekstra Besar untuk Motorik & Low Vision) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className="secondary-button min-h-[4.5rem] text-lg font-extrabold flex items-center justify-center gap-3 focus-ring"
          onClick={handleRepeat}
          aria-label="Ulangi pembacaan suara poin ini"
        >
          <RotateCcw className="h-6 w-6 stroke-[2.5]" />
          Ulangi Suara Poin Ini
        </button>

        <button
          className="primary-button min-h-[4.5rem] text-lg font-extrabold flex items-center justify-center gap-3 focus-ring"
          onClick={handleNext}
          aria-label={isLast ? 'Selesaikan materi suara' : 'Lanjut ke poin suara berikutnya'}
        >
          <span>{isLast ? 'Selesai Belajar' : 'Lanjut ke Poin Berikutnya'}</span>
          {isLast ? <CheckCircle2 className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
        </button>
      </div>

      {/* Navigasi Tambahan */}
      {currentIdx > 0 && (
        <div className="mt-4 text-center">
          <button
            className="text-sm font-bold text-slateText underline hover:text-ink focus-ring p-2"
            onClick={handlePrev}
          >
            ← Kembali ke poin sebelumnya
          </button>
        </div>
      )}
    </article>
  );
}
