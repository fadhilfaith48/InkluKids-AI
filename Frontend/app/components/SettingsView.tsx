'use client';

import React from 'react';
import {
  Type,
  Moon,
  Contrast,
  Volume2,
  Check,
  Sliders,
} from 'lucide-react';
import { AccessibilitySettings, FontSizePreference } from '@/types';

interface SettingsViewProps {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  speakText: (text: string) => void;
}

export function SettingsView({
  settings,
  updateSettings,
  speakText,
}: SettingsViewProps) {
  const fontSizes: { value: FontSizePreference; label: string; preview: string }[] = [
    { value: 'normal', label: 'Normal', preview: 'A' },
    { value: 'large', label: 'Besar', preview: 'A+' },
    { value: 'extra', label: 'Sangat Besar', preview: 'A++' },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest">
          Kenyamanan Belajar
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-ink md:text-5xl">
          Pengaturan Aksesibilitas
        </h1>
        <p className="mt-2 text-base text-slateText">
          Sesuaikan ukuran tulisan, jenis huruf, dan mode kenyamanan sensorik sesuai kebutuhanmu.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* 1. Ukuran Teks */}
        <section className="setting-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-forest border border-ink">
              <Type className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Ukuran Teks</h2>
              <p className="text-xs text-slateText">
                Pilih ukuran huruf agar teks buku pelajaran mudah dibaca.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fontSizes.map((item) => {
              const isSelected = settings.fontSize === item.value;
              return (
                <button
                  key={item.value}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-3 border-ink transition-all focus-ring ${
                    isSelected
                      ? 'bg-sky shadow-[3px_3px_0_#17304F]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    updateSettings({ fontSize: item.value });
                    speakText(`Ukuran teks diubah menjadi ${item.label}`);
                  }}
                  aria-pressed={isSelected}
                >
                  <span className="text-2xl font-black text-ink">{item.preview}</span>
                  <span className="mt-1 text-sm font-bold text-ink">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Font Ramah Disleksia */}
        <section className="setting-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky text-ink border border-ink">
              <Type className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Bentuk Huruf (Font)</h2>
              <p className="text-xs text-slateText">
                Gunakan bentuk huruf khusus yang memudahkan anak dengan disleksia.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              className={`p-4 rounded-2xl border-3 border-ink text-left transition-all focus-ring ${
                settings.fontPreference === 'lexend'
                  ? 'bg-sky shadow-[3px_3px_0_#17304F]'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => {
                updateSettings({ fontPreference: 'lexend' });
                speakText('Font diubah ke Lexend standar');
              }}
              aria-pressed={settings.fontPreference === 'lexend'}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-ink font-sans">Lexend (Standar)</span>
                {settings.fontPreference === 'lexend' && (
                  <Check className="h-5 w-5 text-forest stroke-[3]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slateText font-sans">
                Huruf bersih, proporsional, dan sangat mudah dibaca di layar digital.
              </p>
            </button>

            <button
              className={`p-4 rounded-2xl border-3 border-ink text-left transition-all focus-ring ${
                settings.fontPreference === 'dyslexic'
                  ? 'bg-sky shadow-[3px_3px_0_#17304F]'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => {
                updateSettings({ fontPreference: 'dyslexic' });
                speakText('Font diubah ke font ramah disleksia');
              }}
              aria-pressed={settings.fontPreference === 'dyslexic'}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-ink font-dyslexic">
                  OpenDyslexic
                </span>
                {settings.fontPreference === 'dyslexic' && (
                  <Check className="h-5 w-5 text-forest stroke-[3]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slateText font-dyslexic">
                Beban bawah lebih tebal untuk mencegah huruf tampak terbalik atau menari.
              </p>
            </button>
          </div>
        </section>

        {/* 3. Jarak Antarbaris (Line Spacing) */}
        <section className="setting-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-peach text-ink border border-ink">
              <Sliders className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Jarak Antarbaris (Line Spacing)</h2>
              <p className="text-xs text-slateText">
                Jarak antarbaris yang lebih renggang membantu anak disleksia agar baris teks tidak saling bertumpuk.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              className={`p-4 rounded-2xl border-3 border-ink text-left transition-all focus-ring ${
                settings.lineSpacing === 'normal'
                  ? 'bg-sky shadow-[3px_3px_0_#17304F]'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => {
                updateSettings({ lineSpacing: 'normal' });
                speakText('Jarak antarbaris normal');
              }}
              aria-pressed={settings.lineSpacing === 'normal'}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-ink">Normal (Standar)</span>
                {settings.lineSpacing === 'normal' && (
                  <Check className="h-5 w-5 text-forest stroke-[3]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slateText">
                Jarak baris teks standar yang proporsional.
              </p>
            </button>

            <button
              className={`p-4 rounded-2xl border-3 border-ink text-left transition-all focus-ring ${
                settings.lineSpacing === 'wide'
                  ? 'bg-sky shadow-[3px_3px_0_#17304F]'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => {
                updateSettings({ lineSpacing: 'wide' });
                speakText('Jarak antarbaris renggang');
              }}
              aria-pressed={settings.lineSpacing === 'wide'}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-ink">Renggang (Ekstra Lega)</span>
                {settings.lineSpacing === 'wide' && (
                  <Check className="h-5 w-5 text-forest stroke-[3]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slateText">
                Jarak baris lebih tinggi dan lega untuk kenyamanan fokus membaca.
              </p>
            </button>
          </div>
        </section>

        {/* 4. Mode Tenang (Calm Mode) */}
        <section className="setting-card flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-peach text-ink border border-ink">
              <Moon className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Mode Tenang (Calm Mode)</h2>
              <p className="text-xs text-slateText max-w-md">
                Menonaktifkan efek gerak (animasi) dan suara berlebih. Sangat cocok bagi anak yang sensitif terhadap stimulasi sensorik (autisme & ADHD).
              </p>
            </div>
          </div>

          <button
            role="switch"
            aria-checked={settings.calmMode}
            aria-label="Aktifkan Mode Tenang"
            onClick={() => {
              const next = !settings.calmMode;
              updateSettings({ calmMode: next });
              speakText(next ? 'Mode tenang diaktifkan' : 'Mode tenang dinonaktifkan');
            }}
            className={`toggle focus-ring ${settings.calmMode ? 'toggle-on' : ''}`}
          >
            <span />
          </button>
        </section>

        {/* 4. Kontras Tinggi */}
        <section className="setting-card flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gray-200 text-ink border border-ink">
              <Contrast className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Kontras Tinggi</h2>
              <p className="text-xs text-slateText max-w-md">
                Mempertebal garis batas hitam pekat dan memaksimalkan kontras warna teks untuk kemudahan penglihatan low vision.
              </p>
            </div>
          </div>

          <button
            role="switch"
            aria-checked={settings.highContrast}
            aria-label="Aktifkan Kontras Tinggi"
            onClick={() => {
              const next = !settings.highContrast;
              updateSettings({ highContrast: next });
              speakText(next ? 'Kontras tinggi diaktifkan' : 'Kontras tinggi dinonaktifkan');
            }}
            className={`toggle focus-ring ${settings.highContrast ? 'toggle-on' : ''}`}
          >
            <span />
          </button>
        </section>

        {/* 5. Pembacaan Suara Otomatis */}
        <section className="setting-card flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-mint text-forest border border-ink">
              <Volume2 className="h-5 w-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Suara Pendamping (TTS)</h2>
              <p className="text-xs text-slateText max-w-md">
                Mengaktifkan suara berbahasa Indonesia bawaan browser untuk membacakan kartu secara interaktif.
              </p>
            </div>
          </div>

          <button
            role="switch"
            aria-checked={settings.soundEnabled}
            aria-label="Aktifkan Suara Pendamping"
            onClick={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
            }}
            className={`toggle focus-ring ${settings.soundEnabled ? 'toggle-on' : ''}`}
          >
            <span />
          </button>
        </section>
      </div>
    </div>
  );
}
