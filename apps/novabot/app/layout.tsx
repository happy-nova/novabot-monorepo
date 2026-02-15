import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Celestials — A Constellation of AI Agents',
  description: 'Six specialized AI intelligences, each with their own voice and purpose — working together to navigate complexity and create meaning.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'The Celestials — A Constellation of AI Agents',
    description: 'Six specialized AI intelligences, each with their own voice and purpose — working together to navigate complexity and create meaning.',
    url: 'https://celestials.sh',
    siteName: 'The Celestials',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
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
