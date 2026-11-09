'use client';

import React from 'react';
import { Camera, BookOpen, ShieldCheck, Star } from 'lucide-react';
import { StepProgress } from '@/types';

interface LearningStepsIndicatorProps {
  currentStep: StepProgress;
}

export function LearningStepsIndicator({ currentStep }: LearningStepsIndicatorProps) {
  const steps: { id: StepProgress; label: string; icon: React.ReactNode }[] = [
    { id: 'photo', label: '1. Foto', icon: <Camera className="h-4 w-4" /> },
    { id: 'read', label: '2. Baca', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'source', label: '3. Cek Sumber', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'star', label: '4. Bintang', icon: <Star className="h-4 w-4" /> },
  ];

  const getStepIndex = (step: StepProgress) => {
    switch (step) {
      case 'photo':
        return 0;
      case 'read':
        return 1;
      case 'source':
        return 2;
      case 'star':
        return 3;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-3 border-ink bg-white px-4 py-3 shadow-[2px_2px_0_#17304F]"
      aria-label="Langkah Belajar Visual: Foto, Baca, Cek Sumber, Bintang"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slateText">
          Alur Belajar:
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isDone = idx < currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-2 border-ink bg-sky text-ink shadow-[2px_2px_0_#17304F]'
                    : isDone
                      ? 'border border-ink bg-mint text-forest'
                      : 'bg-gray-100 text-gray-400'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-xs font-bold text-gray-300">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
