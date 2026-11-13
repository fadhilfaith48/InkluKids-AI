'use client';

import React from 'react';
import { X, ShieldCheck, AlertTriangle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pointText: string;
  sourceQuote: string;
  isValidQuote?: boolean;
  ocrFullText: string;
  teacherEdited?: boolean;
  verifiedBy?: string;
}

export function SourceModal({
  isOpen,
  onClose,
  pointText,
  sourceQuote,
  isValidQuote = true,
  ocrFullText,
  teacherEdited = false,
  verifiedBy,
}: SourceModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-modal-title"
    >
      <div className="modal-card relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={onClose}
          aria-label="Tutup jendela rujukan sumber"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest">
            <ShieldCheck className="h-7 w-7 stroke-[2.5]" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1 text-xs font-bold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-forest" />
              Explainable AI (Transparansi)
            </span>
            <h2 id="source-modal-title" className="mt-1 text-2xl font-bold text-ink">
              Rujukan Sumber Teks
            </h2>
          </div>
        </div>

        {/* Status Verifikasi Badge */}
        <div className="mt-6">
          {isValidQuote ? (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-forest bg-[#EBF7F0] p-4 text-forest">
              <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-base">Kutipan Sumber Tervalidasi</p>
                <p className="mt-0.5 text-xs text-[#2A654C]">
                  Penjelasan AI ini terbukti bersumber langsung dari teks asli di halaman buku yang kamu pindai.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-600 bg-amber-50 p-4 text-amber-900">
              <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-bold text-base">Perlu Ditinjau (Kutipan Tidak Ditemukan Penuh)</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  AI mungkin menyusun kalimat sendiri atau teks asli terpotong saat foto diambil.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Poin Ringkasan AI */}
        <div className="mt-6 rounded-2xl border-2 border-ink bg-[#FAF6F0] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slateText">
            {teacherEdited ? 'Ringkasan yang Disunting Guru:' : 'Ringkasan AI:'}
          </p>
          <p className="mt-1 text-lg font-bold text-ink leading-relaxed">
            {pointText}
          </p>
        </div>

        {/* Kutipan Teks Asli dari Buku */}
        <div className="mt-4 rounded-2xl border-2 border-ink bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slateText">
            <FileText className="h-4 w-4 text-forest" />
            Potongan Kalimat Asli di Buku:
          </div>
          <blockquote className="mt-2 rounded-xl bg-mint/50 p-3 text-base italic text-ink border-l-4 border-forest">
            &ldquo;{sourceQuote || 'Tidak ada kutipan yang disertakan.'}&rdquo;
          </blockquote>
        </div>

        {/* Teks OCR Keseluruhan (Accordion / Preview) */}
        {ocrFullText && (
          <details className="mt-4 rounded-2xl border-2 border-ink bg-white p-4">
            <summary className="cursor-pointer font-bold text-sm text-ink hover:text-forest">
              Lihat Seluruh Teks Halaman yang Terbaca (OCR)
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slateText max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-3 border border-gray-200">
              {ocrFullText}
            </p>
          </details>
        )}

        {/* Label AI & Disclaimer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-gray-200 pt-4 text-xs text-slateText">
          <span className="inline-flex items-center gap-1 font-semibold text-ink">
            {teacherEdited ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-forest" /> Disunting &amp;
                diverifikasi guru{verifiedBy ? ` (${verifiedBy})` : ''}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-forest" /> Dibuat oleh AI (Gemini
                Multimodal)
              </>
            )}
          </span>
          <span>PahamInklusif AI · LOGICODIX 2026</span>
        </div>

        <button
          className="secondary-button mt-6 w-full font-bold focus-ring"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
