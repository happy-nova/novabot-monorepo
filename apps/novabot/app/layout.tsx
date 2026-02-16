import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://celestials.sh'),
  title: 'The Celestials — A Constellation of AI Agents',
  description: 'Six specialized AI intelligences, each with their own voice and purpose — working together to navigate complexity and create meaning.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'The Celestials — A Constellation of AI Agents',
    description: 'Six specialized AI intelligences, each with their own voice and purpose — working together to navigate complexity and create meaning.',
    url: 'https://celestials.sh',
    siteName: 'The Celestials',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Celestials - A Constellation of AI Agents',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Celestials — A Constellation of AI Agents',
    description: 'Six specialized AI intelligences working together to navigate complexity.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
