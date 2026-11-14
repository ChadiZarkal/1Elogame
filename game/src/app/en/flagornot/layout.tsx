import type { Metadata } from 'next';

/**
 * L'Oracle en anglais (traduction du 2026-11-14).
 *
 * Mêmes composants que la version française (`app/flagornot`), dans la langue
 * que pose `LangueFournie` (gabarit `app/en/layout.tsx`). La justification du
 * verdict est écrite en anglais par l'IA : la page envoie `langue: 'en'` à
 * `/api/flagornot/judge`.
 *
 * FERMÉ AUX MOTEURS POUR L'INSTANT, comme tout `/en` : retirer `robots` et
 * déclarer `alternates.languages` des deux côtés quand l'anglais sera relu.
 */
export const metadata: Metadata = {
  title: 'The Oracle — Red Flag or Green Flag?',
  description:
    'Type a behavior, a situation or literally anything and get the verdict: Red Flag or Green Flag? Free and anonymous.',
  keywords: [
    'red flag or green flag',
    'red flag oracle',
    'is it a red flag',
    'flag or not',
    'red or green oracle',
    'red flag test',
    'green flag test',
  ],
  openGraph: {
    title: 'The Oracle — Red Flag or Green Flag?',
    description: 'Submit anything and find out if it’s a Red Flag or a Green Flag. The AI doesn’t do maybe.',
    url: '/en/flagornot',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Oracle — Red Flag or Green Flag?',
    description: 'Submit anything and find out if it’s a Red Flag or a Green Flag. The AI doesn’t do maybe.',
  },
  alternates: { canonical: '/en/flagornot' },
  robots: { index: false, follow: true },
};

const SITE_URL = 'https://redorgreen.fr';

export default function FlagOrNotEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'The Oracle — Red Flag or Green Flag',
            url: `${SITE_URL}/en/flagornot`,
            inLanguage: 'en',
            description:
              'Submit a behavior and get the Oracle’s verdict: Red Flag or Green Flag? Powered by AI.',
            applicationCategory: 'Entertainment',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
            },
            isPartOf: {
              '@type': 'WebSite',
              name: 'Red or Green',
              url: SITE_URL,
            },
          }),
        }}
      />
      {children}
    </>
  );
}
