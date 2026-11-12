'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Sun,
  Waves,
  Cloud,
  CloudRain,
  Droplet,
  Wind,
  Leaf,
  Heart,
  Eye,
  Hand,
  Umbrella,
  BookOpen,
  CheckCircle2,
  Star,
  Award,
} from 'lucide-react';
import { ScanResult, Flashcard } from '@/types';
import confetti from 'canvas-confetti';

interface VisualModeViewProps {
  lesson: ScanResult;
  selectedTerm?: string | null;
  onOpenSourceModal: (pointText: string, quote: string, isValid?: boolean) => void;
  onOpenQuiz?: () => void;
  onCardChange?: (index: number) => void;
  speakText: (text: string) => void;
  onCompleteLesson: () => void;
  calmMode?: boolean;
}

export function VisualModeView({
  lesson,
  selectedTerm,
  onOpenSourceModal,
  onOpenQuiz,
  onCardChange,
  speakText,
  onCompleteLesson,
  calmMode = false,
}: VisualModeViewProps) {
  const flashcards = lesson.flashcards || [];
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fallback jika scan belum ada flashcard (buat dari poin)
  const effectiveCards: Flashcard[] =
    flashcards.length > 0
      ? flashcards
      : (lesson.points || []).map((pt) => ({
          word: lesson.title,
          meaning: pt.text,
          steps: [
            { order: 1, icon: 'eye', text: 'Perhatikan konsep pada buku' },
            { order: 2, icon: 'sparkles', text: pt.text },
            { order: 3, icon: 'leaf', text: pt.analogy || 'Konsep penting untuk diingat' },
          ],
          sign_description: 'Tangan terbuka membentuk lingkaran perlahan di depan dada melambangkan pemahaman.',
          example_sentence: pt.analogy || pt.text,
          source_quote: pt.source_quote,
          is_valid_quote: pt.is_valid_quote,
        }));

  useEffect(() => {
    setIsCompleted(false);
    if (selectedTerm && effectiveCards.length > 0) {
      const target = selectedTerm.trim().toLowerCase();
      const matchIdx = effectiveCards.findIndex(
        (card) =>
          card.word.toLowerCase().includes(target) ||
          target.includes(card.word.toLowerCase())
      );
      setActiveCardIdx(matchIdx >= 0 ? matchIdx : 0);
    } else {
      setActiveCardIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, selectedTerm]);

  useEffect(() => {
    onCardChange?.(activeCardIdx);
  }, [activeCardIdx, onCardChange]);

  const currentCard = effectiveCards[activeCardIdx];
  const isLast = activeCardIdx === effectiveCards.length - 1;

  const renderIcon = (name: string) => {
    const props = { className: 'h-6 w-6 text-forest' };
    switch (name.toLowerCase()) {
      case 'sun':
        return <Sun {...props} />;
      case 'waves':
        return <Waves {...props} />;
      case 'cloud':
        return <Cloud {...props} />;
      case 'cloud-rain':
        return <CloudRain {...props} />;
      case 'droplet':
      case 'droplets':
        return <Droplet {...props} />;
      case 'wind':
        return <Wind {...props} />;
      case 'leaf':
        return <Leaf {...props} />;
      case 'heart':
        return <Heart {...props} />;
      case 'eye':
        return <Eye {...props} />;
      case 'arrow-up':
        return <ArrowUp {...props} />;
      case 'umbrella':
        return <Umbrella {...props} />;
      case 'book':
        return <BookOpen {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

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
      setActiveCardIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeCardIdx > 0) {
      setActiveCardIdx((prev) => prev - 1);
    }
  };

  if (!currentCard) {
    return (
      <div className="learning-card text-center p-8">
        <p className="text-lg font-bold text-ink">Tidak ada kartu visual yang tersedia.</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <article className="learning-card text-center py-12 px-6">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-3 border-ink bg-mint shadow-[3px_3px_0_#17304F]">
          {calmMode ? (
            <CheckCircle2 className="h-12 w-12 text-forest" />
          ) : (
            <Star className="h-12 w-12 fill-[#277A5B] text-ink" />
          )}
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-ink md:text-4xl">
          Visual Flashcard Selesai!
        </h2>
        <p className="mt-3 text-lg text-slateText max-w-md mx-auto">
          Kamu sudah menyelesaikan semua langkah visual pada materi ini!
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
            onClick={() => {
              setIsCompleted(false);
              setActiveCardIdx(0);
            }}
          >
            Ulangi Flashcard Visual
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="learning-card" aria-label="Mode Visual Flashcard">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest border border-forest">
              Kartu Visual {activeCardIdx + 1} dari {effectiveCards.length}
            </span>

            {lesson.teacher_verification?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-forest px-2.5 py-0.5 text-[11px] font-extrabold text-forest shadow-[1px_1px_0_#277A5B]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Diverifikasi Guru
                {lesson.teacher_verification.verifiedBy
                  ? ` (${lesson.teacher_verification.verifiedBy})`
                  : ''}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-ink md:text-3xl">
            {currentCard.word}
          </h2>
          <p className="mt-1 text-base font-semibold text-slateText">
            {currentCard.meaning}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink bg-[#FFF9E6] px-3 py-1.5 text-xs font-bold text-ink hover:bg-[#FFF2B2] shadow-[1px_1px_0_#17304F] transition-all"
            >
              <Award className="h-3.5 w-3.5 text-[#F2A33A]" />
              Kuis Ceria
            </button>
          )}

          <button
            className="secondary-button text-xs font-bold flex items-center gap-1.5 focus-ring"
            onClick={() =>
              onOpenSourceModal(
                currentCard.word,
                currentCard.source_quote,
                currentCard.is_valid_quote
              )
            }
          >
            <ShieldCheck className="h-4 w-4 text-forest" />
            Lihat Sumber
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

      {/* Langkah-langkah Visual Berurutan (3-5 Langkah) */}
      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slateText">
          Langkah Visual Berurutan:
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentCard.steps.map((step) => (
            <div
              key={step.order}
              className="flex flex-col items-center rounded-2xl border-3 border-ink bg-[#FAF6F0] p-5 text-center shadow-[2px_2px_0_#17304F]"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink bg-white shadow-[2px_2px_0_#17304F]">
                {renderIcon(step.icon)}
              </div>
              <span className="mt-3 rounded-full bg-mint px-2.5 py-0.5 text-xs font-bold text-forest">
                Langkah {step.order}
              </span>
              <p className="mt-2 text-sm font-bold text-ink leading-snug">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deskripsi Isyarat Berbasis Teks (Ramah Tunarungu) */}
      {currentCard.sign_description && (
        <div className="mt-6 rounded-2xl border-2 border-ink bg-sky/40 p-4 shadow-[2px_2px_0_#17304F]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
            <Hand className="h-4 w-4 text-ink" />
            Saran Gerakan Isyarat Teks:
          </div>
          <p className="mt-1.5 text-sm font-semibold text-ink leading-relaxed">
            {currentCard.sign_description}
          </p>
        </div>
      )}

      {/* Contoh Kalimat Konkret (Ramah Autisme) */}
      {currentCard.example_sentence && (
        <div className="mt-4 rounded-2xl border-2 border-ink bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slateText">
            Contoh Kalimat Nyata:
          </p>
          <p className="mt-1 text-sm font-bold text-ink italic">
            &ldquo;{currentCard.example_sentence}&rdquo;
          </p>
        </div>
      )}

      {/* Navigasi Card */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-dashed border-gray-200 pt-6">
        <button
          className="secondary-button px-5"
          onClick={handlePrev}
          disabled={activeCardIdx === 0}
          aria-label="Kartu visual sebelumnya"
        >
          <ArrowLeft className="h-5 w-5" /> Sebelumnya
        </button>

        <button
          className="primary-button px-8 flex items-center gap-2"
          onClick={handleNext}
          aria-label={isLast ? 'Selesaikan visual flashcard' : 'Lanjut ke kartu visual berikutnya'}
        >
          <span>{isLast ? 'Selesai Flashcard' : 'Lanjut'}</span>
          {isLast ? <CheckCircle2 className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </article>
  );
}
