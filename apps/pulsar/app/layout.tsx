import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulsar - Royalty-Free Music API",
  description: "Generate instrumental music via x402 payment protocol. Pay per generation with USDC on Base. Built by Nova.",
  openGraph: {
    title: "Pulsar - Royalty-Free Music API",
    description: "Generate instrumental music via x402. Pay with USDC on Base.",
    url: "https://pulsar.novabot.sh",
    siteName: "Pulsar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulsar",
    description: "Royalty-free music generation API via x402",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💫</text></svg>",
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
