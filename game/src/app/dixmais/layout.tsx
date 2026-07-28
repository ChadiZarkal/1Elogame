import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "C'est un 10 mais... — Le jeu de notation des red flags",
  description: "Il commence à 10/10. Puis les révélations s'enchaînent. À chaque info, tu réévalues sa note : jusqu'où va-t-il chuter ? Un jeu de notation gratuit et anonyme.",
  keywords: [
    "c'est un 10 mais",
    'jeu de notation',
    'red flag',
    'jeu red flag',
    'jeu de soirée',
    'noter un profil',
    'jeu gratuit en ligne',
  ],
  openGraph: {
    title: "C'est un 10 mais... — Le jeu de notation des red flags",
    description: "Il commence à 10/10. À chaque révélation, tu réévalues sa note. Jusqu'où va-t-il chuter ?",
    url: '/dixmais',
  },
  twitter: {
    card: 'summary_large_image',
    title: "C'est un 10 mais... — Le jeu de notation des red flags",
    description: "Il commence à 10/10. À chaque révélation, tu réévalues sa note. Jusqu'où va-t-il chuter ?",
  },
  alternates: { canonical: '/dixmais' },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

function DixMaisJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: "C'est un 10 mais...",
    description: "Il commence à 10/10. À chaque révélation, tu réévalues sa note. Le 0 est éliminatoire.",
    url: `${SITE_URL}/dixmais`,
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

export default function DixMaisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DixMaisJsonLd />
      {children}
    </>
  );
}
