import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema Unificado · 2026–2029',
  description: 'Rotina, marcos e acompanhamento.',
  // Nada aqui deve aparecer em busca: o conteúdo é pessoal e fica atrás de login.
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0E1C1E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
