import { ImageResponse } from 'next/og';

export const alt = 'PahamInklusif AI — Satu halaman buku, banyak cara memahami.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#17304F';
const CREAM = '#F8F0E3';
const BUTTER = '#FFF9E6';
const SKY = '#DCE8FD';
const MINT = '#DDF3E8';
const PEACH = '#FBE6C8';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: CREAM,
          padding: 40,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: BUTTER,
            border: `10px solid ${INK}`,
            borderRadius: 20,
            boxShadow: `14px 14px 0 ${INK}`,
            padding: '48px 56px',
            color: INK,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <svg width="120" height="120" viewBox="0 0 64 64">
              <rect x="3" y="3" width="58" height="58" rx="16" fill={CREAM} stroke={INK} strokeWidth="5" />
              <path d="M17 13h17a13 13 0 0 1 0 26h-7v12H17z" fill={INK} />
              <path d="M27 21h6a5 5 0 0 1 0 10h-6z" fill={SKY} />
              <circle cx="46" cy="46" r="7" fill={MINT} stroke={INK} strokeWidth="4" />
            </svg>
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>
              PahamInklusif AI
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 50, lineHeight: 1.25, maxWidth: 960 }}>
            Satu halaman buku, banyak cara memahami.
          </div>

          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 30,
                background: PEACH,
                border: `4px solid ${INK}`,
                borderRadius: 20,
                padding: '12px 26px',
              }}
            >
              LOGICODIX 2026 · Smart &amp; Fun Education
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

