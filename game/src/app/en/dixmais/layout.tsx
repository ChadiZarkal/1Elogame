import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

/**
 * « C'est un 10 mais… » en anglais (traduction du 2026-11-14) : « It's a 10
 * but… ». Mêmes composants que `app/dixmais`, dans la langue que pose
 * `LangueFournie` (`app/en/layout.tsx`). Les énoncés arrivent traduits du
 * serveur (`lib/dixmais/traduction`) ; les notes sont communes aux deux
 * langues. La console d'administration reste en français, sous `/dixmais/admin`.
 */
export const metadata: Metadata = {
  title: "He's a 10 But… Game: Rate the Red Flags",
  description: "The “He's a 10 but…” game, also played as “She's a 10 but…”: start at 10, then rate each red flag and green flag from 0 to 15/10. Their final score is your average. Free and anonymous.",
  keywords: [
    "he's a 10 but",
    "she's a 10 but",
    "it's a 10 but",
    "he's a 10 but game",
    'rate the red flags',
    'rating game',
    'red flag',
    'red flag game',
    'party game',
    'rate a profile',
    'free online game',
  ],
  openGraph: {
    title: "He's a 10 But… Game: Rate the Red Flags",
    description: "He's a 10 but… he chews with his mouth open. Rate red flags and green flags from 0 to 15/10: what would you give them?",
    url: '/en/dixmais',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "He's a 10 But… Game: Rate the Red Flags",
    description: "He's a 10 but… he chews with his mouth open. Rate red flags and green flags from 0 to 15/10: what would you give them?",
  },
  alternates: alternances('en', '/dixmais'),
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
