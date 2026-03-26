import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vitrine.ai — Seja encontrado no Google e nas IAs",
    template: "%s | Vitrine.ai",
  },
  description:
    "SEO Local + GEO com IA para negócios físicos. Apareça no Google Maps, Google Search e nas respostas de ChatGPT, Gemini e Perplexity.",
  keywords: [
    "SEO local",
    "Google Meu Negócio",
    "Google Maps",
    "GEO",
    "IA generativa",
    "ChatGPT",
    "Gemini",
    "Perplexity",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vitrine.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Vitrine.ai — Seja encontrado no Google e nas IAs",
    description:
      "SEO Local + GEO com IA para negócios físicos. De invisível a indispensável. Apareça no ChatGPT, Gemini e Perplexity.",
    url: './',
    siteName: 'Vitrine.ai',
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: 'Vitrine.ai Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vitrine.ai — Seja encontrado no Google e nas IAs",
    description: "SEO Local + GEO com IA para negócios físicos. Apareça no ChatGPT, Gemini e Perplexity.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
