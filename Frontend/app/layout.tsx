import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

const APP_NAME = 'PahamInklusif AI';
const APP_TAGLINE = 'Satu halaman buku, banyak cara memahami.';
const APP_DESCRIPTION =
  'Aplikasi edukasi ramah disabilitas (Disleksia, ADHD, Tunarungu, Autisme, Tunanetra) berbasis AI dengan fitur Explainable AI.';

function resolveMetadataBase(): URL {
  const fallback = 'http://localhost:3000';
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || fallback);
  } catch {
    // Nilai env yang bukan URL valid tidak boleh menggagalkan build.
    return new URL(fallback);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: `${APP_NAME} — Belajar dengan Caramu`,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    locale: 'id_ID',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#F8F0E3" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
