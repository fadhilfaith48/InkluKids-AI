import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PahamInklusif AI',
    short_name: 'PahamInklusif',
    description: 'Satu halaman buku, banyak cara memahami.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F0E3',
    theme_color: '#17304F',
    lang: 'id',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

