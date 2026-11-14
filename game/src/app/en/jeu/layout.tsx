import type { Metadata } from 'next';

/**
 * « Le pire des deux » en anglais (traduction du 2026-11-14) : « The Worse of
 * Two ». Mêmes composants que `app/jeu`, dans la langue que pose
 * `LangueFournie` (`app/en/layout.tsx`). Les comportements arrivent traduits du
 * serveur (`lib/jeu/traduction`) ; les votes sont communs aux deux langues.
 *
 * Fermé aux moteurs comme tout `/en` pour l'instant (voir `app/en/layout.tsx`).
 */
export const metadata: Metadata = {
  title: 'The Worse of Two — which one is the bigger red flag?',
  description: 'Play The Worse of Two by Red or Green: two behaviors, you pick the worse one. Vote, see how everyone else voted and argue about it with your friends. Live rankings.',
  keywords: [
    'red or green',
    'red flag game',
    'which is worse game',
    'free online game',
    'party game',
    'red flag or green flag',
  ],
  openGraph: {
    title: 'The Worse of Two — which one is the bigger red flag?',
    description: 'Two behaviors: which one is the bigger red flag? An addictive, free party game.',
    url: '/en/jeu',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Worse of Two — which one is the bigger red flag?',
    description: 'Two behaviors: which one is the bigger red flag? An addictive, free party game.',
  },
  alternates: { canonical: '/en/jeu' },
  robots: { index: false, follow: true },
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
