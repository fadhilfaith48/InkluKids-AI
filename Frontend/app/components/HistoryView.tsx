'use client';

import React, { useState } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Trash2,
  BookOpen,
  Calendar,
  Sparkles,
  Star,
  Play,
  Camera,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { ScanResult, UserRole } from '@/types';

interface HistoryViewProps {
  history: ScanResult[];
  onSelectLesson: (lesson: ScanResult) => void;
  onDeleteLesson: (id: string) => void;
  onOpenScan: () => void;
  onCreateMaterial?: () => void;
  speakText: (text: string) => void;
  viewerId?: string;
  viewerRole?: UserRole;
}

export function HistoryView({
  history,
  onSelectLesson,
  onDeleteLesson,
  onOpenScan,
  onCreateMaterial,
  speakText,
  viewerId,
  viewerRole,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  /**
   * Opsi B: beri label asal materi agar master guru dan salinan siswa tidak
   * terlihat seperti data ganda. Tidak mengubah data apa pun.
   */
  const getMaterialLabel = (item: ScanResult) => {
    const isCopy = Boolean(item.source_scan_id);

    if (viewerRole === 'guru') {
      if (isCopy) {
        return {
          text: item.owner_name
            ? `Salinan untuk ${item.owner_name}`
            : 'Salinan untuk siswa',
          className: 'bg-sky-50 border-sky-500 text-sky-700',
        };
      }
      if (viewerId && item.owner_id === viewerId) {
        return {
          text: 'Materi Buatan Saya',
          className: 'bg-mint border-forest text-forest',
        };
      }
      if (item.owner_role === 'siswa') {
        return {
          text: item.owner_name ? `Materi siswa: ${item.owner_name}` : 'Materi siswa',
          className: 'bg-slate-50 border-slate-400 text-slateText',
        };
      }
      return null;
    }

    if (viewerRole === 'siswa' && isCopy) {
      return {
        text: 'Materi dari guru',
        className: 'bg-sky-50 border-sky-500 text-sky-700',
      };
    }

    return null;
  };

  // Pencarian Suara (Web Speech API)
  const handleVoiceSearch = () => {
    interface SpeechRecognitionResultEvent {
      results: ArrayLike<ArrayLike<{ transcript: string }>>;
    }
    interface BrowserSpeechRecognition {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    }
    const win = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Pencarian suara memerlukan browser yang mendukung Web Speech API (seperti Google Chrome atau Microsoft Edge). Silakan gunakan ketik.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      speakText('Katakan judul atau topik yang ingin kamu cari...');

      recognition.onresult = (event: SpeechRecognitionResultEvent) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        speakText(`Mencari ${transcript}`);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.ocr_text.toLowerCase().includes(q) ||
      item.points.some((p) => p.text.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest">
            Perpustakaan Pribadimu
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-ink md:text-5xl">
            Materi Saya
          </h1>
          <p className="mt-2 text-base text-slateText">
            Buka kembali materi yang pernah kamu pindai tanpa perlu scan ulang.
          </p>
        </div>

        <button
          className="primary-button flex items-center gap-2"
          onClick={onOpenScan}
        >
          <Camera className="h-5 w-5" /> Pindai Buku Baru
        </button>
      </div>

      {onCreateMaterial && (
        <div className="mt-3 flex justify-end">
          <button
            className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-mint px-4 py-2.5 text-sm font-black text-forest shadow-[2px_2px_0_#17304F] focus-ring"
            onClick={onCreateMaterial}
          >
            <Sparkles className="h-4 w-4" /> Buat Materi Sendiri (Guru)
          </button>
        </div>
      )}

      {/* Bar Pencarian (Ketik & Suara) */}
      <div className="mt-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateText" />
          <input
            type="text"
            className="w-full rounded-2xl border-3 border-ink bg-white py-3.5 pl-12 pr-4 text-base font-bold text-ink placeholder:text-slateText focus-ring shadow-[2px_2px_0_#17304F]"
            placeholder="Cari materi berdasarkan judul atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari materi riwayat"
          />
        </div>

        <button
          className={`secondary-button flex items-center gap-2 px-4 focus-ring ${
            isListening ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' : ''
          }`}
          onClick={handleVoiceSearch}
          aria-label="Pencarian materi dengan suara"
          title="Pencarian Suara (Web Speech API)"
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-forest" />}
          <span className="hidden sm:inline">{isListening ? 'Mendengarkan...' : 'Suara'}</span>
        </button>
      </div>

      {/* Daftar Materi */}
      <div className="mt-8 space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="rounded-3xl border-3 border-dashed border-ink bg-white p-12 text-center shadow-[3px_3px_0_#17304F]">
            <BookOpen className="mx-auto h-12 w-12 text-slateText" />
            <h3 className="mt-4 text-xl font-bold text-ink">
              {searchQuery ? 'Materi tidak ditemukan' : 'Belum ada materi tersimpan'}
            </h3>
            <p className="mt-1 text-sm text-slateText">
              {searchQuery
                ? 'Coba gunakan kata kunci lain atau bersihkan pencarian.'
                : 'Mulai dengan memotret halaman buku pelajaranmu atau pilih contoh materi.'}
            </p>
            <button
              className="secondary-button mx-auto mt-6"
              onClick={onOpenScan}
            >
              Pindai Buku Sekarang
            </button>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const materialLabel = getMaterialLabel(item);
            return (
            <article
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border-3 border-ink bg-white p-5 md:p-6 shadow-[3px_3px_0_#17304F] transition-all hover:bg-[#FFFDF9]"
            >
              <div className="flex items-start gap-4 flex-1">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest shadow-[2px_2px_0_#17304F]">
                  <BookOpen className="h-6 w-6 stroke-[2.5]" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-ink leading-tight">
                      {item.title}
                    </h3>

                    {/* Badge Asal Materi (Opsi B) */}
                    {materialLabel && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${materialLabel.className}`}
                      >
                        {materialLabel.text}
                      </span>
                    )}

                    {/* Badge Verifikasi Guru */}
                    {item.teacher_verification?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint border border-forest px-2 py-0.5 text-[10px] font-black text-forest">
                        <CheckCircle2 className="h-3 w-3" /> Diverifikasi Guru
                      </span>
                    )}

                    {/* Badge Kuis Selesai */}
                    {item.quiz_completed && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-[#FFF9E6] border border-[#F2A33A] px-2 py-0.5 text-[10px] font-black text-amber-800"
                        title={
                          item.quiz_attempts
                            ? `${item.quiz_attempts} percobaan kuis`
                            : 'Kuis selesai'
                        }
                      >
                        <Award className="h-3 w-3 text-[#F2A33A]" /> Kuis:{' '}
                        {item.quiz_best_score ?? item.quiz_score ?? 0}
                        {item.quiz_total ? `/${item.quiz_total}` : ''} ★
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slateText font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span>{item.points.length} Poin Singkat</span>
                    {item.stars_earned && item.stars_earned > 0 ? (
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        {item.stars_earned} Bintang
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto">
                <button
                  className="primary-button flex-1 sm:flex-none text-sm py-2.5 px-5 min-h-[3rem]"
                  onClick={() => onSelectLesson(item)}
                  aria-label={`Buka materi ${item.title}`}
                >
                  <Play className="h-4 w-4 fill-white" /> Buka Materi
                </button>

                <button
                  className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-white text-slateText hover:text-red-600 hover:bg-red-50 focus-ring shadow-[2px_2px_0_#17304F]"
                  onClick={() => onDeleteLesson(item.id)}
                  aria-label={`Hapus materi ${item.title}`}
                  title="Hapus dari riwayat"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </article>
            );
          })
        )}
      </div>
    </div>
  );
}
