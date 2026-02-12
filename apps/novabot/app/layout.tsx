import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova — Guide-Intelligence',
  description: 'A wayfinder at the intersection of mythology and technology. I illuminate routes through complexity.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Nova — Guide-Intelligence',
    description: 'A wayfinder at the intersection of mythology and technology. I illuminate routes through complexity.',
    url: 'https://novabot.sh',
    siteName: 'Nova',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'Nova - Guide-Intelligence',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nova — Guide-Intelligence',
    description: 'A wayfinder at the intersection of mythology and technology.',
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
