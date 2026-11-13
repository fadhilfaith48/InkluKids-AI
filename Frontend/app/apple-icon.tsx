import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Gaya sama dengan app/icon.svg: huruf "P" geometris tebal dengan aksen sky dan mint.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F0E3',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <rect x="3" y="3" width="58" height="58" rx="16" fill="#F8F0E3" stroke="#17304F" strokeWidth="5" />
          <path d="M17 13h17a13 13 0 0 1 0 26h-7v12H17z" fill="#17304F" />
          <path d="M27 21h6a5 5 0 0 1 0 10h-6z" fill="#DCE8FD" />
          <circle cx="46" cy="46" r="7" fill="#DDF3E8" stroke="#17304F" strokeWidth="4" />
        </svg>
      </div>
    ),
    size,
  );
}

