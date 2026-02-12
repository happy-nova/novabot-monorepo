import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulsar — Royalty-Free Music API",
  description: "Generate unique instrumental tracks via API. Pay with USDC on Base. Powered by x402.",
  openGraph: {
    title: "Pulsar — Royalty-Free Music API",
    description: "Generate unique instrumental tracks via API. Pay with USDC on Base.",
    url: "https://pulsar.novabot.sh",
    siteName: "Pulsar",
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'Pulsar - Royalty-Free Music API',
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulsar — Royalty-Free Music API",
    description: "Generate unique instrumental tracks via API. Pay with USDC on Base.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
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
