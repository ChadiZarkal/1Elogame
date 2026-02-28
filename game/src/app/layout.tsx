import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redflaggames.fr';
const SITE_NAME = 'Red Flag Games';
const SITE_DESCRIPTION = 'Red or Green, Red Flag, Green Flag... Choisis ton jeu et amuse-toi entre amis ! Party games mobiles gratuits, sans inscription, jouables instantanément. Violentomètre, consentomètre et outils d\'auto-évaluation inclus.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Red or Green — ${SITE_NAME} | Jeu de Red Flags gratuit en ligne`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'red or green', 'red or green.fr', 'redorgreen', 'red flag games',
    'red flag', 'green flag', 'party game', 'jeu entre amis', 'jeu mobile',
    'red flag test', 'flag or not', 'jeu gratuit', 'jeu en ligne', 'débat',
    'jeu de société', 'icebreaker', 'jeu soirée', 'quiz couple',
    'red flag definition', 'green flag definition', 'oracle jeu',
    'classement red flag', 'comportement red flag',
    'violentomètre', 'consentomètre', 'violentometre en ligne',
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
    title: `Red or Green — ${SITE_NAME} | Jeu de Red Flags gratuit`,
    description: SITE_DESCRIPTION,
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Red or Green — Red Flag Games, party game mobile gratuit',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Red or Green — ${SITE_NAME} | Jeu de Red Flags gratuit`,
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
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
    '@graph': [
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        alternateName: 'Red or Green',
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
        softwareVersion: '4.0',
        author: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: ['Red or Green', 'RedOrGreen', 'Red Flag Games', 'redflaggames.fr'],
        url: SITE_URL,
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: 'Red or Green',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-rog-new.svg`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Red or Green', item: `${SITE_URL}/jeu` },
          { '@type': 'ListItem', position: 3, name: 'Oracle', item: `${SITE_URL}/flagornot` },
          { '@type': 'ListItem', position: 4, name: 'Classement', item: `${SITE_URL}/classement` },
          { '@type': 'ListItem', position: 5, name: 'Ressources', item: `${SITE_URL}/ressources` },
        ],
      },
    ],
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${spaceGrotesk.className} antialiased min-h-full`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: { background: '#1A1A1A', border: '1px solid #333', color: '#F5F5F5' },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
