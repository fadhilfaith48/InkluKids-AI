import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'InkluKids AI — Belajar dengan Caramu',
  description:
    'Aplikasi edukasi ramah disabilitas (Disleksia, ADHD, Tunarungu, Autisme, Tunanetra) berbasis AI dengan fitur Explainable AI.',
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
