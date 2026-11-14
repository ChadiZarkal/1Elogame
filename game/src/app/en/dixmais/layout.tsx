import type { Metadata } from 'next';

/**
 * « C'est un 10 mais… » en anglais (traduction du 2026-11-14) : « It's a 10
 * but… ». Mêmes composants que `app/dixmais`, dans la langue que pose
 * `LangueFournie` (`app/en/layout.tsx`). Les énoncés arrivent traduits du
 * serveur (`lib/dixmais/traduction`) ; les notes sont communes aux deux
 * langues. La console d'administration reste en français, sous `/dixmais/admin`.
 *
 * Fermé aux moteurs comme tout `/en` pour l'instant (voir `app/en/layout.tsx`).
 */
export const metadata: Metadata = {
  title: "It's a 10 But... — The red flag rating game",
  description: "It's a 10, but… Red flags and green flags rated one by one, from 0 to 15/10: their final score is your average. A free, anonymous rating game.",
  keywords: [
    "it's a 10 but",
    'rating game',
    'red flag',
    'red flag game',
    'party game',
    'rate a profile',
    'free online game',
  ],
  openGraph: {
    title: "It's a 10 But... — The red flag rating game",
    description: 'Red flags and green flags, rated one by one up to 15/10. Their final score is your average. What would you give them?',
    url: '/en/dixmais',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "It's a 10 But... — The red flag rating game",
    description: 'Red flags and green flags, rated one by one up to 15/10. Their final score is your average. What would you give them?',
  },
  alternates: { canonical: '/en/dixmais' },
  robots: { index: false, follow: true },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

function DixMaisJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: "It's a 10 But...",
    description: 'Seven reveals rated one by one, from 0 to 15/10. The profile’s score is the average of all seven.',
    url: `${SITE_URL}/en/dixmais`,
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

export default function DixMaisEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DixMaisJsonLd />
      {children}
    </>
  );
}
