'use client';

import React, { useState } from 'react';
import { X, Sparkles, Smile, Lightbulb, BookA, Loader2, Volume2, ShieldCheck } from 'lucide-react';
import { askAITutor } from '@/lib/api-client';
import { ExplanationResult } from '@/types';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointText: string;
  ocrText: string;
  speakText?: (text: string) => void;
  onViewSource?: (quote: string, isValid: boolean) => void;
}

export function AITutorModal({
  isOpen,
  onClose,
  pointText,
  ocrText,
  speakText,
  onViewSource,
}: AITutorModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [selectedType, setSelectedType] = useState<
    'lebih_mudah' | 'beri_contoh' | 'kata_sulit' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequest = async (type: 'lebih_mudah' | 'beri_contoh' | 'kata_sulit') => {
    setSelectedType(type);
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const res = await askAITutor(pointText, ocrText, type);
      setExplanation(res);
      if (speakText && res.text) {
        speakText(res.text);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal meminta penjelasan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-modal-title"
    >
      <div className="modal-card relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={onClose}
          aria-label="Tutup jendela AI tutor"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-sky text-ink">
            <Sparkles className="h-6 w-6 stroke-[2.5]" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-peach px-3 py-1 text-xs font-bold text-ink">
              Tutor Ramah Anak
            </span>
            <h2 id="tutor-modal-title" className="mt-1 text-2xl font-bold text-ink">
              Tanya Penjelasan Lain
            </h2>
          </div>
        </div>

        {/* Poin dasar */}
        <div className="mt-5 rounded-2xl border-2 border-ink bg-[#FAF6F0] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slateText">
            Materi yang ditanyakan:
          </p>
          <p className="mt-1 text-base font-bold text-ink leading-snug">
            {pointText}
          </p>
        </div>

        {/* Tombol Pilihan Cepat */}
        <div className="mt-5">
          <p className="text-xs font-bold text-slateText uppercase tracking-wider">
            Pilih jenis bantuan yang kamu mau:
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-ink p-3 text-sm font-bold transition-all focus-ring ${
                selectedType === 'lebih_mudah'
                  ? 'bg-mint text-forest shadow-[2px_2px_0_#17304F]'
                  : 'bg-white text-ink hover:bg-gray-50'
              }`}
              onClick={() => handleRequest('lebih_mudah')}
              disabled={loading}
            >
              <Smile className="h-4 w-4" />
              Lebih Mudah
            </button>

            <button
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-ink p-3 text-sm font-bold transition-all focus-ring ${
                selectedType === 'beri_contoh'
                  ? 'bg-peach text-ink shadow-[2px_2px_0_#17304F]'
                  : 'bg-white text-ink hover:bg-gray-50'
              }`}
              onClick={() => handleRequest('beri_contoh')}
              disabled={loading}
            >
              <Lightbulb className="h-4 w-4" />
              Beri Contoh
            </button>

            <button
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-ink p-3 text-sm font-bold transition-all focus-ring ${
                selectedType === 'kata_sulit'
                  ? 'bg-sky text-ink shadow-[2px_2px_0_#17304F]'
                  : 'bg-white text-ink hover:bg-gray-50'
              }`}
              onClick={() => handleRequest('kata_sulit')}
              disabled={loading}
            >
              <BookA className="h-4 w-4" />
              Kata Sulit
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-6 flex flex-col items-center justify-center py-6 text-slateText">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
            <p className="mt-3 text-sm font-bold text-ink">Milo sedang menyiapkan jawaban ramah untukmu...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-5 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        {/* Hasil Penjelasan AI */}
        {explanation && !loading && (
          <div className="mt-6 rounded-3xl border-3 border-ink bg-mint/40 p-5 shadow-[3px_3px_0_#17304F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Jawaban Tutor AI:
              </span>
              {speakText && (
                <button
                  className="flex items-center gap-1.5 rounded-xl border border-ink bg-white px-2.5 py-1 text-xs font-bold text-ink focus-ring"
                  onClick={() => speakText(explanation.text)}
                >
                  <Volume2 className="h-3.5 w-3.5 text-forest" /> Bacakan
                </button>
              )}
            </div>

            <p className="mt-3 text-lg font-bold text-ink leading-relaxed">
              {explanation.text}
            </p>

            {/* Rujukan sumber penjelasan */}
            {explanation.source_quote && (
              <div className="mt-4 pt-3 border-t-2 border-dashed border-ink/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-slateText italic line-clamp-1">
                  Sumber: &ldquo;{explanation.source_quote}&rdquo;
                </span>
                {onViewSource && (
                  <button
                    className="flex-shrink-0 text-xs font-bold text-forest underline focus-ring ml-2"
                    onClick={() =>
                      onViewSource(
                        explanation.source_quote,
                        explanation.is_valid_quote ?? true
                      )
                    }
                  >
                    Lihat Sumber
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="secondary-button mt-6 w-full font-bold focus-ring"
          onClick={onClose}
        >
          Selesai Bertanya
        </button>
      </div>
    </div>
  );
}
