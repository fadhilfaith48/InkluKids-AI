'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
  Volume2,
  Star,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { ScanResult, QuizQuestion } from '@/types';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScanResult;
  onCompleteQuiz: (score: number, total: number) => void;
  speakText: (text: string) => void;
  calmMode?: boolean;
  onOpenSource?: (pointText: string, quote: string, isValid?: boolean) => void;
}

export function QuizModal({
  isOpen,
  onClose,
  lesson,
  onCompleteQuiz,
  speakText,
  calmMode = false,
  onOpenSource,
}: QuizModalProps) {
  // Generate 2-3 pertanyaan sederhana dari poin materi secara otomatis
  const questions: QuizQuestion[] = useMemo(() => {
    const pts = lesson.points || [];
    if (pts.length === 0) return [];

    const qs: QuizQuestion[] = [];

    // Pertanyaan 1 dari poin pertama
    if (pts[0]) {
      const main = pts[0].text;
      qs.push({
        id: 'q1',
        question: `Berdasarkan pelajaran tadi, apa yang dijelaskan tentang "${lesson.title}"?`,
        options: [
          main,
          'Semua proses terjadi tanpa adanya cahaya dan udara sama sekali.',
          'Benda-benda di alam tidak mengalami perubahan apa pun.',
        ],
        correctIndex: 0,
        explanation: `Tepat sekali! Poin pentingnya: ${main}`,
        sourcePointText: main,
        sourceQuote: pts[0].source_quote,
        isValidQuote: pts[0].is_valid_quote,
      });
    }

    // Pertanyaan 2 dari poin kedua atau analogi
    if (pts[1]) {
      const p2 = pts[1];
      const rightAns = p2.text;
      qs.push({
        id: 'q2',
        question: `Bagaimana langkah atau proses berikutnya berlangsung?`,
        options: [
          'Proses langsung berhenti begitu saja tanpa hasil.',
          rightAns,
          'Semua bahan langsung lenyap seketika.',
        ],
        correctIndex: 1,
        explanation: `Hebat! ${rightAns}`,
        sourcePointText: rightAns,
        sourceQuote: p2.source_quote,
        isValidQuote: p2.is_valid_quote,
      });
    }

    // Pertanyaan 3 jika ada poin ketiga
    if (pts[2]) {
      const p3 = pts[2];
      qs.push({
        id: 'q3',
        question: `Mengapa proses dalam materi "${lesson.title}" ini penting?`,
        options: [
          'Agar kita tidak perlu belajar apa pun lagi.',
          'Proses ini hanya terjadi di tempat yang sangat gelap.',
          p3.analogy ? `Karena ${p3.analogy}` : p3.text,
        ],
        correctIndex: 2,
        explanation: `Bagus sekali! ${p3.analogy || p3.text}`,
        sourcePointText: p3.text,
        sourceQuote: p3.source_quote,
        isValidQuote: p3.is_valid_quote,
      });
    }

    return qs;
  }, [lesson]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mulai dari awal setiap kali modal dibuka atau materi berganti.
  useEffect(() => {
    if (!isOpen) return;
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  }, [isOpen, lesson.id]);

  // Fokus masuk ke modal, Escape menutup, dan Tab berputar di dalam modal.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getFocusable = () => {
      const node = dialogRef.current;
      if (!node) return [] as HTMLElement[];
      return Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    const focusTimer = window.setTimeout(() => getFocusable()[0]?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (!calmMode) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
      speakText('Jawabanmu benar! Hebat sekali!');
    } else {
      speakText('Kurang tepat, tapi tidak apa-apa! Mari kita pelajari bersama.');
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onCompleteQuiz(score, questions.length);
      if (!calmMode) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      speakText(`Kuis Ceria selesai! Kamu mendapatkan ${score} dari ${questions.length} bintang!`);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fadeIn"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-xl rounded-3xl border-3 border-ink bg-[#FFFDF9] p-4 sm:p-6 shadow-[8px_8px_0_#17304F] max-h-[90vh] overflow-y-auto overflow-x-hidden"
      >
        {/* Tombol Tutup (Sticky agar tetap terlihat saat digulir vertikal) */}
        <div className="sticky top-0 z-10 flex justify-end -mt-1 -mr-1 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto grid min-h-12 min-w-12 place-items-center rounded-2xl border-2 border-ink bg-white shadow-[2px_2px_0_#17304F] hover:bg-red-50 focus-ring"
            aria-label="Tutup kuis ceria"
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        {/* Jika belum ada pertanyaan */}
        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-base font-bold text-ink">
              Materi ini belum memiliki poin untuk dijadikan kuis.
            </p>
            <button onClick={onClose} className="primary-button mt-4 px-6 py-2">
              Tutup
            </button>
          </div>
        ) : isFinished ? (
          /* ================= TAMPILAN SELESAI KUIS ================= */
          <div className="py-6 text-center space-y-4" role="status" aria-live="polite">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-3 border-ink bg-[#FFF2B2] shadow-[3px_3px_0_#17304F]">
              <Award className="h-12 w-12 text-[#F2A33A]" />
            </div>

            <h2 id="quiz-modal-title" className="text-2xl font-extrabold text-ink md:text-3xl">
              Pintar Sekali! Kuis Selesai!
            </h2>

            <p className="text-sm md:text-base text-slateText max-w-md mx-auto">
              Kamu telah menyelesaikan Kuis Ceria untuk materi &ldquo;{lesson.title}&rdquo;.
            </p>

            <div className="inline-flex items-center gap-3 rounded-2xl border-2 border-ink bg-white px-5 py-3 shadow-[2px_2px_0_#17304F]">
              <Star className="h-7 w-7 fill-[#F2A33A] text-ink" />
              <div className="text-left">
                <div className="text-xs font-bold text-slateText">Bintang Terkumpul</div>
                <div className="text-xl font-extrabold text-ink">
                  {score} dari {questions.length} Benar
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="secondary-button text-sm py-2.5 px-5 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Coba Kuis Lagi
              </button>

              <button
                type="button"
                onClick={onClose}
                className="primary-button text-sm py-2.5 px-6 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Kembali Belajar
              </button>
            </div>
          </div>
        ) : (
          /* ================= TAMPILAN PERTANYAAN AKTIF ================= */
          <div className="-mt-8 space-y-5">
            {/* Header Kuis */}
            <div className="flex items-center gap-2 pr-12">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#FFF2B2] border-2 border-ink text-ink shadow-[1px_1px_0_#17304F]">
                <Sparkles className="h-5 w-5 text-[#F2A33A]" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
                  Kuis Ceria Singkat
                </span>
                <h2 id="quiz-modal-title" className="text-base sm:text-lg font-extrabold text-ink">
                  Pertanyaan {currentIdx + 1} dari {questions.length}
                </h2>
              </div>
            </div>

            {/* Kotak Pertanyaan */}
            <div className="rounded-2xl border-2 border-ink bg-white p-3.5 sm:p-4 shadow-[2px_2px_0_#17304F]">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-base md:text-lg font-bold text-ink leading-snug break-words">
                  {currentQ.question}
                </p>
                <button
                  type="button"
                  onClick={() => speakText(currentQ.question)}
                  className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-ink p-2 text-forest hover:bg-mint/40 focus-ring flex-shrink-0"
                  aria-label="Bacakan pertanyaan ini"
                  title="Bacakan pertanyaan"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Pilihan Jawaban (Touch-friendly, min 50px) */}
            <div className="space-y-3" role="radiogroup" aria-label="Pilihan jawaban">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const isCorrect = oIdx === currentQ.correctIndex;

                let btnStyle = 'border-2 border-ink bg-white text-ink hover:bg-[#FAF6F0]';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-3 border-forest bg-mint text-forest font-extrabold shadow-[2px_2px_0_#277A5B]';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-2 border-rose-500 bg-rose-50 text-rose-800 opacity-80';
                  } else {
                    btnStyle = 'border-2 border-gray-200 bg-gray-50 text-gray-400';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full rounded-2xl p-4 text-left text-sm md:text-base font-bold transition-all flex items-start gap-3 shadow-[2px_2px_0_#17304F] focus-ring min-h-[3.5rem] ${btnStyle}`}
                  >
                    <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-xl border border-ink bg-white text-xs font-extrabold">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug break-words">{opt}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="h-6 w-6 text-forest flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Penjelasan Lembut Setelah Menjawab */}
            {isAnswered && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 border-ink p-4 text-xs md:text-sm animate-fadeIn ${
                  selectedAnswer === currentQ.correctIndex
                    ? 'bg-mint/40 text-forest font-bold'
                    : 'bg-[#FFF9E6] text-amber-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Smile className="h-4 w-4" />
                  <strong>
                    {selectedAnswer === currentQ.correctIndex
                      ? 'Hebat! Jawabanmu Tepat!'
                      : 'Mari Kita Ingat Kembali:'}
                  </strong>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>

                {onOpenSource && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSource(
                        currentQ.sourcePointText,
                        currentQ.sourceQuote || '',
                        currentQ.isValidQuote
                      )
                    }
                    className="secondary-button mt-3 py-2 px-3 text-xs font-bold flex items-center gap-1.5 focus-ring"
                  >
                    <ShieldCheck className="h-4 w-4 text-forest" />
                    Lihat Sumber
                  </button>
                )}
              </div>
            )}

            {/* Tombol Lanjut ke Pertanyaan Berikutnya */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="primary-button text-sm py-3 px-6 flex items-center gap-2"
                >
                  <span>
                    {currentIdx < questions.length - 1
                      ? 'Pertanyaan Berikutnya'
                      : 'Lihat Hasil Kuis'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
