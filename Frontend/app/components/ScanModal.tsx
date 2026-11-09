'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  BookOpen,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { compressImage, scanBookImage } from '@/lib/api-client';
import { sampleLessons } from '@/lib/seed-data';
import { ScanResult } from '@/types';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: ScanResult) => void;
}

export function ScanModal({ isOpen, onClose, onScanSuccess }: ScanModalProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Sedang memproses...');
  const [error, setError] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  if (!isOpen) return null;

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      setError(
        'Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan atau gunakan opsi Unggah Foto.'
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    setError(null);
    setLoading(false);
    onClose();
  };

  const processAndUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setLoadingMessage('Mengompres foto agar hemat kuota...');

    try {
      const { base64, mimeType } = await compressImage(file);
      setLoadingMessage('Milo & Gemini sedang membaca dan menyederhanakan halaman...');

      const previewUrl = `data:${mimeType};base64,${base64}`;
      const result = await scanBookImage(base64, mimeType, previewUrl);

      handleClose();
      onScanSuccess(result);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(
        err?.message ||
          'Gagal membaca buku. Pastikan teks terlihat cukup jelas dan pencahayaan baik.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUpload(file);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured-book.jpg', { type: 'image/jpeg' });
        processAndUpload(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const selectSampleLesson = (sample: ScanResult) => {
    handleClose();
    onScanSuccess(sample);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-modal-title"
    >
      <div className="modal-card relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <button
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white text-ink focus-ring"
          onClick={handleClose}
          aria-label="Tutup jendela pindai"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-mint text-forest">
            <Camera className="h-6 w-6 stroke-[2.5]" />
          </span>
          <div>
            <h2 id="scan-modal-title" className="text-2xl font-bold text-ink">
              Pindai Halaman Buku
            </h2>
            <p className="text-xs text-slateText">
              Pilih cara mengambil foto halaman buku pelajaranmu
            </p>
          </div>
        </div>

        {/* Tab Pemilih Opsi */}
        <div className="mt-6 flex rounded-2xl border-2 border-ink bg-[#FAF6F0] p-1">
          <button
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all focus-ring ${
              activeMode === 'upload'
                ? 'bg-white text-ink border-2 border-ink shadow-[2px_2px_0_#17304F]'
                : 'text-slateText hover:text-ink'
            }`}
            onClick={() => {
              stopCamera();
              setActiveMode('upload');
            }}
            disabled={loading}
          >
            Unggah File
          </button>
          <button
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all focus-ring ${
              activeMode === 'camera'
                ? 'bg-white text-ink border-2 border-ink shadow-[2px_2px_0_#17304F]'
                : 'text-slateText hover:text-ink'
            }`}
            onClick={() => {
              setActiveMode('camera');
              startCamera();
            }}
            disabled={loading}
          >
            Kamera Langsung
          </button>
          <button
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all focus-ring ${
              activeMode === 'sample'
                ? 'bg-white text-ink border-2 border-ink shadow-[2px_2px_0_#17304F]'
                : 'text-slateText hover:text-ink'
            }`}
            onClick={() => {
              stopCamera();
              setActiveMode('sample');
            }}
            disabled={loading}
          >
            Contoh Halaman
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-xs font-bold text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-3 border-ink bg-sky/30 py-12 px-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-forest" />
            <p className="mt-4 text-lg font-bold text-ink">{loadingMessage}</p>
            <p className="mt-1 text-xs text-slateText">
              Hanya butuh beberapa detik. Mohon tunggu sebentar ya...
            </p>
          </div>
        )}

        {/* Mode 1: Unggah File */}
        {!loading && activeMode === 'upload' && (
          <div className="mt-6">
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-3 border-dashed border-ink bg-[#FAF6F0] p-6 text-center hover:bg-mint/30 transition-all focus-ring">
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-white text-forest shadow-[2px_2px_0_#17304F]">
                <Upload className="h-8 w-8" />
              </span>
              <span className="mt-4 text-base font-bold text-ink">
                Pilih atau Tarik Foto ke Sini
              </span>
              <span className="mt-1 text-xs text-slateText">
                Format JPG, PNG, atau WEBP (Maksimal 10 MB)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {/* Mode 2: Kamera Langsung */}
        {!loading && activeMode === 'camera' && (
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-3xl border-3 border-ink bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-white/50 m-4 rounded-2xl" />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="primary-button flex-1"
                onClick={capturePhoto}
              >
                <Camera className="h-5 w-5" /> Ambil Foto Halaman
              </button>
              <button
                className="secondary-button"
                onClick={startCamera}
                title="Muat Ulang Kamera"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slateText">
              Posisikan halaman buku tegak lurus dan pastikan teks terbaca jelas.
            </p>
          </div>
        )}

        {/* Mode 3: Contoh Halaman (Seed data untuk demo) */}
        {!loading && activeMode === 'sample' && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-bold text-slateText uppercase tracking-wider">
              Pilih materi contoh siap pakai (tanpa perlu kamera / kuota):
            </p>

            {sampleLessons.map((sample) => (
              <button
                key={sample.id}
                className="w-full flex items-center justify-between rounded-2xl border-2 border-ink bg-white p-4 text-left hover:bg-mint/30 transition-all focus-ring shadow-[2px_2px_0_#17304F]"
                onClick={() => selectSampleLesson(sample)}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-forest border border-ink">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-ink">{sample.title}</h4>
                    <p className="text-xs text-slateText line-clamp-1">
                      {sample.points.length} poin ringkas · Ada Glosarium & Flashcard
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-xs font-bold text-white">
                  Pilih <Sparkles className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 border-t-2 border-dashed border-gray-200 pt-4 text-center">
          <p className="text-xs text-slateText">
            💡 <strong>Tips Aksesibilitas:</strong> Hanya foto bagian halaman buku teks pelajaran. Jangan menyertakan foto wajah atau identitas pribadi.
          </p>
        </div>
      </div>
    </div>
  );
}
