'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  Share2,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  Loader2,
  PencilLine,
} from 'lucide-react';
import { ScanResult, SimplifiedPoint } from '@/types';
import { simplifyMaterialText } from '@/lib/api-client';

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: ScanResult, share: boolean) => void;
  speakText: (text: string) => void;
}

function draftPointsFromText(text: string): SimplifiedPoint[] {
  const sentences = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .slice(0, 6);

  return sentences.map((sentence, index) => ({
    order: index + 1,
    text: sentence.slice(0, 160),
    analogy: null,
    source_quote: sentence,
    is_valid_quote: true,
  }));
}

export function CreateMaterialModal({
  isOpen,
  onClose,
  onSave,
  speakText,
}: CreateMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [points, setPoints] = useState<SimplifiedPoint[]>([]);
  const [glossary, setGlossary] = useState<ScanResult['glossary']>([]);
  const [flashcards, setFlashcards] = useState<ScanResult['flashcards']>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset setiap kali modal dibuka.
  useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setSourceText('');
    setPoints([]);
    setGlossary([]);
    setFlashcards([]);
    setError(null);
    setLoading(false);
    setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const buildLesson = (): ScanResult => ({
    id: `scan-teacher-${Date.now()}`,
    title: title.trim() || 'Materi Buatan Guru',
    ocr_text: sourceText.trim(),
    points: points
      .map((point, index) => ({ ...point, order: index + 1 }))
      .filter((point) => point.text.trim().length > 0),
    glossary,
    flashcards,
    readable: true,
    created_at: new Date().toISOString(),
    stars_earned: 0,
  });

  const handleSimplify = async () => {
    if (!sourceText.trim()) {
      setError('Tulis atau tempel teks materi terlebih dahulu.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await simplifyMaterialText(sourceText.trim(), title.trim());
      setPoints(result.points || []);
      setGlossary(result.glossary || []);
      setFlashcards(result.flashcards || []);
      if (!title.trim() && result.title) setTitle(result.title);
      speakText('AI sudah menyederhanakan materi. Periksa dan sunting poinnya.');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'AI belum bisa menyederhanakan teks. Coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPoints = () => {
    if (!sourceText.trim()) {
      setError('Tulis atau tempel teks materi terlebih dahulu.');
      return;
    }
    setError(null);
    setPoints(draftPointsFromText(sourceText));
    speakText('Poin dibuat dari teks. Kamu bisa menyuntingnya.');
  };

  const handlePointChange = (index: number, field: 'text' | 'analogy', value: string) => {
    setPoints((prev) =>
      prev.map((point, idx) => (idx === index ? { ...point, [field]: value } : point))
    );
  };

  const handleRemovePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPoint = () => {
    setPoints((prev) => [
      ...prev,
      { order: prev.length + 1, text: '', analogy: null, source_quote: '', is_valid_quote: true },
    ]);
  };

  const handleSave = (share: boolean) => {
    if (!sourceText.trim()) {
      setError('Teks materi masih kosong.');
      return;
    }
    if (points.filter((point) => point.text.trim()).length === 0) {
      setError('Tambahkan minimal satu poin materi.');
      return;
    }

    const lesson = buildLesson();
    setSaved(true);
    onSave(lesson, share);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-material-title"
    >
      <div className="modal-card relative w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={onClose}
          aria-label="Tutup jendela buat materi"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest">
            <PencilLine className="h-6 w-6 stroke-[2.5]" />
          </span>
          <div>
            <h2 id="create-material-title" className="text-2xl font-bold text-ink">
              Buat Materi Sendiri
            </h2>
            <p className="text-xs text-slateText">
              Tulis teks, biarkan AI menyederhanakan, lalu sunting sesukamu.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="material-title" className="mb-1 block text-sm font-bold text-ink">
              Judul Materi
            </label>
            <input
              id="material-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Siklus Air dan Hujan"
              maxLength={120}
              className="w-full rounded-2xl border-2 border-ink bg-white px-3 py-2.5 text-sm font-bold text-ink placeholder:text-slateText focus-ring"
            />
          </div>

          <div>
            <label htmlFor="material-text" className="mb-1 block text-sm font-bold text-ink">
              Teks Materi
            </label>
            <textarea
              id="material-text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Tempel atau tulis isi materi di sini..."
              rows={6}
              className="w-full rounded-2xl border-2 border-ink bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-slateText focus-ring resize-y"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSimplify}
                disabled={loading}
                className="primary-button flex items-center gap-2 px-4 py-2 text-xs font-black focus-ring disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? 'AI sedang menyederhanakan…' : 'Sederhanakan dengan AI'}
              </button>
              <button
                type="button"
                onClick={handleManualPoints}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-4 py-2 text-xs font-bold text-ink focus-ring disabled:opacity-60"
              >
                <BookOpen className="h-4 w-4" /> Buat poin tanpa AI
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border-2 border-[#B23A48] bg-[#FDECEE] p-3 text-xs font-medium text-[#7A1F2B]"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-ink">Poin Materi</label>
              <button
                type="button"
                onClick={handleAddPoint}
                className="flex items-center gap-1 rounded-xl border-2 border-ink bg-white px-2.5 py-1 text-[11px] font-bold text-ink focus-ring"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Poin
              </button>
            </div>

            {points.length === 0 ? (
              <p className="mt-2 rounded-2xl border-2 border-dashed border-slateText/40 p-4 text-center text-xs text-slateText">
                Belum ada poin. Klik “Sederhanakan dengan AI” atau “Buat poin tanpa AI”.
              </p>
            ) : (
              <div className="mt-2 space-y-3">
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border-2 border-ink bg-[#FAF6F0] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-ink text-[11px] font-black text-white">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={point.text}
                          onChange={(e) => handlePointChange(index, 'text', e.target.value)}
                          rows={2}
                          placeholder="Poin materi"
                          className="w-full rounded-xl border-2 border-ink bg-white px-2.5 py-1.5 text-sm font-bold text-ink focus-ring resize-y"
                        />
                        <input
                          type="text"
                          value={point.analogy || ''}
                          onChange={(e) => handlePointChange(index, 'analogy', e.target.value)}
                          placeholder="Analogi sederhana (opsional)"
                          className="w-full rounded-xl border border-slateText/40 bg-white px-2.5 py-1.5 text-xs text-ink focus-ring"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(index)}
                        className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl border-2 border-[#B23A48] bg-white text-[#B23A48] focus-ring"
                        aria-label={`Hapus poin ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saved}
            className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold text-ink focus-ring disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Simpan
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saved}
            className="primary-button flex items-center gap-2 px-4 py-2.5 text-sm font-black focus-ring disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" /> Simpan &amp; Bagikan ke Siswa
          </button>
        </div>
      </div>
    </div>
  );
}
