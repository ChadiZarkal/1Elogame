import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { CONTACT_EMAIL, INSTAGRAM_URL } from "@/config/contact";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';
const SITE_NAME = 'Red or Green';
const SITE_DESCRIPTION = 'Red or Green, Red Flag, Green Flag... Choisis ton jeu et amuse-toi entre amis ! Party games mobiles gratuits, sans inscription, jouables instantanément. Violentomètre, consentomètre et outils d\'auto-évaluation inclus.';

const rawGaId = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
const rawAdSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim() || '';
const adSenseClientId = rawAdSenseId
  ? (rawAdSenseId.startsWith('ca-pub-') ? rawAdSenseId : `ca-pub-${rawAdSenseId}`)
  : '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Red or Green — ${SITE_NAME} | Jeu de Red Flags gratuit en ligne`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'red or green', 'red flag', 'green flag',
    'classement red flag', 'violentomètre', 'consentomètre',
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
      alt: 'Red or Green — Party game mobile gratuit',
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
  manifest: '/manifest.json',
  /* Sans ce bloc, iOS ouvre le raccourci installé dans un Safari complet, avec
     sa barre d'adresse : l'utilisateur croit que « l'installation n'a rien
     fait ». `statusBarStyle` en `black-translucent` laisse le fond du site
     remonter derrière l'encoche, ce que `viewportFit: 'cover'` rend gérable. */
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  other: {
    // Une balise vide serait servie sur toutes les pages : ne l'émettre qu'une
    // fois la valeur réellement fournie.
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { 'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(adSenseClientId ? { 'google-adsense-account': adSenseClientId } : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  /* Sans `viewport-fit=cover`, `env(safe-area-inset-*)` résout à `0px` : tous
     les calages écrits contre l'encoche et la barre gestuelle des trois jeux
     retombaient sur leur plancher, et les boutons du bas passaient sous la
     barre. C'est la clé de voûte de la tenue à l'écran sur iPhone. */
  viewportFit: 'cover',
  /* Une seule teinte, identique au fond réellement peint par `body`
     (`--bg-primary`) et au `background_color` du manifeste : en mode installé,
     la barre d'état, l'écran de démarrage et la première peinture forment un
     aplat continu au lieu de trois noirs légèrement différents. */
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
};

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AnalyticsProvider } from '@/components/ui/AnalyticsProvider';
import { MotionPreferences } from '@/components/ui/MotionPreferences';
import { ServiceWorker } from '@/components/ui/ServiceWorker';
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
        alternateName: ['RedOrGreen', 'redorgreen.fr', 'Red Flag Games'],
        url: SITE_URL,
        inLanguage: 'fr-FR',
      },
      {
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: 'Red or Green',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-rog-new.svg`,
        email: CONTACT_EMAIL,
        sameAs: [INSTAGRAM_URL],
      },
      // Pas de BreadcrumbList ici : ce graphe est émis sur toutes les routes, y
      // compris les pages légales, et le site n'affiche aucun fil d'Ariane. Un
      // balisage décrivant une navigation absente de l'écran est un motif de
      // signalement. Les fils d'Ariane réels restent déclarés route par route.
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
        {rawGaId && (
          <>
            {/* Google Analytics */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${rawGaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${rawGaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {adSenseClientId && (
          <>
            {/* Google AdSense — chargé via next/script, hors routes admin */}
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
            <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
            <AdSenseScript clientId={adSenseClientId} />
          </>
        )}
        {/* Les balises de manifeste et d'icône ne sont plus écrites ici : elles
            étaient en double avec celles que Next émet depuis `metadata.manifest`
            et depuis `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico`. */}
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceGrotesk.className} antialiased min-h-full`}>
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        <ErrorBoundary>
          <AnalyticsProvider>
            <MotionPreferences>
              <SiteHeader />
              {children}
              <SiteFooter />
            </MotionPreferences>
          </AnalyticsProvider>
        </ErrorBoundary>
        <Toaster
          theme="dark"
          position="top-center"
          /* Depuis `viewport-fit=cover`, un décalage fixe placerait les
             notifications sous l'encoche. */
          offset="max(1rem, calc(env(safe-area-inset-top) + 0.5rem))"
          toastOptions={{
            style: { background: '#1A1A1A', border: '1px solid #333', color: '#F5F5F5' },
          }}
        />
        <ServiceWorker />
        <Analytics />
        <SpeedInsights />
        {/* Data layer for manual events (optional) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];`,
          }}
        />
      </body>
    </html>
  );
}
