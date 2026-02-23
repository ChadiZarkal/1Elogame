import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { ResourceButton } from "@/components/ResourceButton";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redflaggames.fr';
const SITE_NAME = 'Red Flag Games';
const SITE_DESCRIPTION = 'Red Flag, Green Flag... Choisis ton jeu et amuse-toi entre amis ! Party games mobiles gratuits, sans inscription, jouables instantanément. Découvre si tu es un Red Flag avec l\'IA !';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Le jeu des Red Flags entre amis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'red flag', 'green flag', 'party game', 'jeu entre amis', 'jeu mobile',
    'red flag test', 'flag or not', 'jeu gratuit', 'jeu en ligne', 'débat',
    'jeu de société', 'icebreaker', 'jeu soirée', 'quiz couple',
    'red flag definition', 'green flag definition', 'jeu IA',
    'classement red flag', 'comportement red flag',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  alternates: {
    canonical: '/',
    languages: { 'fr-FR': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Le jeu des Red Flags entre amis`,
    description: SITE_DESCRIPTION,
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Red Flag Games - Party game mobile gratuit',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Le jeu des Red Flags entre amis`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'games',
  classification: 'Entertainment',
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
    { media: '(prefers-color-scheme: light)', color: '#0D0D0D' },
  ],
  colorScheme: 'dark',
};

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnalyticsProvider } from '@/components/ui/AnalyticsProvider';
import { Toaster } from 'sonner';

// JSON-LD structured data for Google
function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    inLanguage: 'fr-FR',
    browserRequirements: 'Requires JavaScript',
    softwareVersion: '3.7',
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <JsonLd />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${spaceGrotesk.className} antialiased min-h-full`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
            <ResourceButton />
          </AnalyticsProvider>
        </ErrorBoundary>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: { background: '#1A1A1A', border: '1px solid #333', color: '#F5F5F5' },
          }}
        />
      </body>
    </html>
  );
}
