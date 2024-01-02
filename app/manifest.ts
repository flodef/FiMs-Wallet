import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FiMs Wallet - Porte-monnaie',
    short_name: 'FiMs Wallet',
    description: 'Porte-monnaie pour gérer ses investissements avec FiMs',
    start_url: '/',
    scope: '/',
    lang: 'fr',
    display: 'fullscreen',
    display_override: ['window-controls-overlay'],
    orientation: 'portrait',
    background_color: '#3367D6',
    theme_color: '#3367D6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '128x128',
        type: 'image/x-icon',
      },
      {
        src: '/images/icons-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        src: '/images/icons-256.png',
        type: 'image/png',
        sizes: '256x256',
      },
      {
        src: '/images/icons-512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
  };
}
