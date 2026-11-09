'use client';

import React from 'react';
import { HelpCircle, RotateCcw, Smile, Lightbulb, Coffee } from 'lucide-react';
import { SymbolResponseType } from '@/types';

interface SymbolResponseBarProps {
  onSelectSymbol: (symbol: SymbolResponseType) => void;
  speakText?: (text: string) => void;
}

export function SymbolResponseBar({ onSelectSymbol, speakText }: SymbolResponseBarProps) {
  const symbols: {
    type: SymbolResponseType;
    label: string;
    speech: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'confused',
      label: 'Aku bingung',
      speech: 'Aku bingung dengan bagian ini.',
      icon: <HelpCircle className="h-6 w-6 stroke-[2.5] text-ink" />,
      color: 'bg-[#FBE6C8]', // Peach
    },
    {
      type: 'repeat',
      label: 'Ulangi',
      speech: 'Tolong ulangi lagi.',
      icon: <RotateCcw className="h-6 w-6 stroke-[2.5] text-ink" />,
      color: 'bg-[#DCE8FD]', // Sky
    },
    {
      type: 'easier',
      label: 'Lebih mudah',
      speech: 'Tolong jelaskan dengan lebih mudah.',
      icon: <Smile className="h-6 w-6 stroke-[2.5] text-ink" />,
      color: 'bg-[#DDF3E8]', // Mint
    },
    {
      type: 'example',
      label: 'Beri contoh',
      speech: 'Bisa berikan contoh lain?',
      icon: <Lightbulb className="h-6 w-6 stroke-[2.5] text-ink" />,
      color: 'bg-[#FFF2B2]', // Warm yellow
    },
    {
      type: 'rest',
      label: 'Mau istirahat',
      speech: 'Aku mau istirahat sebentar.',
      icon: <Coffee className="h-6 w-6 stroke-[2.5] text-ink" />,
      color: 'bg-[#F8E1DC]', // Soft rose
    },
  ];

  const handleClick = (item: (typeof symbols)[0]) => {
    if (speakText) {
      speakText(item.speech);
    }
    onSelectSymbol(item.type);
  };

  return (
    <aside
      className="mt-8 rounded-3xl border-3 border-ink bg-white p-4 shadow-[3px_3px_0_#17304F]"
      aria-label="Kartu Respons Simbol Cepat"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Kartu Respon Cepat</h3>
        <span className="text-xs text-slateText">Tekan jika butuh bantuan</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {symbols.map((item) => (
          <button
            key={item.type}
            className={`symbol-btn ${item.color} focus-ring`}
            onClick={() => handleClick(item)}
            aria-label={`${item.label} (${item.speech})`}
            title={item.speech}
          >
            {item.icon}
            <span className="font-bold leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
