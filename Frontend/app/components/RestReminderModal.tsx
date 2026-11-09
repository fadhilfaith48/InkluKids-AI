'use client';

import React from 'react';
import { Coffee, Heart, CheckCircle2 } from 'lucide-react';

interface RestReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakText?: (text: string) => void;
}

export function RestReminderModal({ isOpen, onClose, speakText }: RestReminderModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rest-modal-title"
    >
      <div className="modal-card relative w-full max-w-md p-6 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-3 border-ink bg-peach shadow-[3px_3px_0_#17304F]">
          <Coffee className="h-10 w-10 text-ink" />
        </div>

        <h2 id="rest-modal-title" className="mt-5 text-2xl font-extrabold text-ink">
          Waktunya Istirahat Sejenak!
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slateText">
          Kamu sudah belajar dengan sangat hebat hari ini! Matamu butuh istirahat,
          minum air putih, dan regangkan badanmu selama beberapa menit ya.
        </p>

        <div className="mt-4 rounded-2xl bg-mint/40 border-2 border-ink p-3 text-xs font-bold text-forest flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-forest" />
          Kesehatan dan kenyamananmu adalah yang paling utama.
        </div>

        <button
          className="primary-button mt-6 w-full"
          onClick={onClose}
        >
          <CheckCircle2 className="h-5 w-5" /> Aku Siap Lanjut Belajar
        </button>
      </div>
    </div>
  );
}
