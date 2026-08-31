import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const sans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sistema Unificado · 2026–2029',
  description: 'Rotina, marcos e acompanhamento.',
  // Nada aqui deve aparecer em busca: o conteúdo é pessoal e fica atrás de login.
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  // Duas cores porque o tema segue a preferência do sistema.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111318' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  // Sem isto a tela não vai até a borda em aparelhos com entalhe, e
  // env(safe-area-inset-*) no CSS devolve sempre zero.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
