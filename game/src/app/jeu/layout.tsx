import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Red or Green — Quel est le plus gros Red Flag ?',
  description: 'Joue au jeu Red or Green : choisis entre deux comportements, lequel est le pire ? Vote, compare tes réponses et débats avec tes amis. Classement en temps réel.',
  keywords: [
    'red or green',
    'red flag game',
    'jeu de red flags',
    'jeu en ligne gratuit',
    'party game',
    'red flag ou green flag',
    'jeu de société en ligne',
    'red or green jeu',
  ],
  openGraph: {
    title: 'Red or Green — Quel est le plus gros Red Flag ?',
    description: 'Choisis entre deux comportements : lequel est le plus gros Red Flag ? Un party game addictif et gratuit.',
    url: '/jeu',
  },
  alternates: { canonical: '/jeu' },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

function JeuJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Red or Green',
    description: 'Choisis entre deux comportements : lequel est le plus gros Red Flag ? Un party game addictif et gratuit.',
    url: `${SITE_URL}/jeu`,
    genre: 'Party Game',
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1 },
    playMode: 'SinglePlayer',
    gamePlatform: 'Web Browser',
    inLanguage: 'fr-FR',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
    author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function JeuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JeuJsonLd />
      {children}
    </>
  );
}
