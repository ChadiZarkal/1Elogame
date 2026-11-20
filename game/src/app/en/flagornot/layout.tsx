import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

/**
 * L'Oracle en anglais (traduction du 2026-11-14).
 *
 * Mêmes composants que la version française (`app/flagornot`), dans la langue
 * que pose `LangueFournie` (gabarit `app/en/layout.tsx`). La justification du
 * verdict est écrite en anglais par l'IA : la page envoie `langue: 'en'` à
 * `/api/flagornot/judge`.
 */
export const metadata: Metadata = {
  title: 'Is It a Red Flag? Ask the Oracle',
  description:
    'Is it a red flag or a green flag? Type any behavior, text or situation and the Oracle gives its verdict, with its reason. Free, anonymous, no sign-up.',
  keywords: [
    'is it a red flag',
    'red flag or green flag',
    'red flag checker',
    'is this a red flag',
    'red flag oracle',
    'is it a red flag',
    'flag or not',
    'red or green oracle',
    'red flag test',
    'green flag test',
  ],
  openGraph: {
    title: 'Is it a red flag? Ask the Oracle',
    description: 'Submit anything and find out if it’s a Red Flag or a Green Flag. The AI doesn’t do maybe.',
    url: '/en/flagornot',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is it a red flag? Ask the Oracle',
    description: 'Submit anything and find out if it’s a Red Flag or a Green Flag. The AI doesn’t do maybe.',
  },
  alternates: alternances('en', '/flagornot'),
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
