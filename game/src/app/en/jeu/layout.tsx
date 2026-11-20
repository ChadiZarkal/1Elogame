import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

/**
 * « Le pire des deux » en anglais (traduction du 2026-11-14) : « The Worse of
 * Two ». Mêmes composants que `app/jeu`, dans la langue que pose
 * `LangueFournie` (`app/en/layout.tsx`). Les comportements arrivent traduits du
 * serveur (`lib/jeu/traduction`) ; les votes sont communs aux deux langues.
 */
export const metadata: Metadata = {
  title: 'Which Is the Bigger Red Flag? The Worse of Two',
  description: 'Would you rather, red flag edition: two behaviors, you pick the worse one, then see how everyone else voted. A free red flag party game with live rankings.',
  keywords: [
    'red or green',
    'red flag game',
    'would you rather red flag',
    'which is the bigger red flag',
    'which is worse game',
    'free online game',
    'party game',
    'red flag or green flag',
  ],
  openGraph: {
    title: 'Which is the bigger red flag? The Worse of Two',
    description: 'Two behaviors: which one is the bigger red flag? An addictive, free party game.',
    url: '/en/jeu',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Which is the bigger red flag? The Worse of Two',
    description: 'Two behaviors: which one is the bigger red flag? An addictive, free party game.',
  },
  alternates: alternances('en', '/jeu'),
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

function JeuJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Red or Green — The Worse of Two',
    description: 'Two behaviors: which one is the bigger red flag? An addictive, free party game.',
    url: `${SITE_URL}/en/jeu`,
    genre: 'Party Game',
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1 },
    playMode: 'SinglePlayer',
    gamePlatform: 'Web Browser',
    inLanguage: 'en-US',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
    author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function JeuEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JeuJsonLd />
      {children}
    </>
  );
}
