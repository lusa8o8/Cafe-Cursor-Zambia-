import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cafe Cursor Zambia',
    short_name: 'Cafe Cursor',
    description: 'A local-first event networking card for Cafe Cursor Zambia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1916',
    theme_color: '#1a1916',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
