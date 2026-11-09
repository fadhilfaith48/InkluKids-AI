'use client';

import React from 'react';

interface MascotProps {
  message: string;
}

export function Mascot({ message }: MascotProps) {
  return (
    <aside className="mascot-wrap" aria-label={`Milo berkata: ${message}`}>
      <div className="mascot-bubble">
        <p>{message}</p>
      </div>
      <svg
        className="mascot"
        viewBox="0 0 150 160"
        role="img"
        aria-label="Milo, maskot beruang ramah"
      >
        {/* Telinga */}
        <circle cx="43" cy="40" r="25" fill="#A9DCCB" stroke="#17324D" strokeWidth="4" />
        <circle cx="107" cy="40" r="25" fill="#A9DCCB" stroke="#17324D" strokeWidth="4" />
        <circle cx="43" cy="40" r="12" fill="#F7F0E3" />
        <circle cx="107" cy="40" r="12" fill="#F7F0E3" />

        {/* Kepala dan Tubuh */}
        <path
          d="M26 83c0-34 20-57 49-57s49 23 49 57v36c0 20-19 31-49 31s-49-11-49-31Z"
          fill="#BDE8D9"
          stroke="#17324D"
          strokeWidth="4"
        />

        {/* Mata */}
        <circle cx="57" cy="80" r="4.5" fill="#17324D" />
        <circle cx="93" cy="80" r="4.5" fill="#17324D" />

        {/* Moncong */}
        <ellipse cx="75" cy="99" rx="17" ry="14" fill="#F7F0E3" />
        <path d="M70 95q5-5 10 0-1 7-5 7t-5-7Z" fill="#17324D" />

        {/* Senyum */}
        <path
          d="M64 106q11 9 22 0"
          fill="none"
          stroke="#17324D"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Tangan melambai */}
        <path
          d="M27 117 13 104M123 117l14-13"
          stroke="#17324D"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </aside>
  );
}
