import type { Metadata } from 'next';

const SITE_URL = 'https://redflaggames.fr';

export const metadata: Metadata = {
  title: 'Red Flag — Le party game qui fait débat 🚩',
  description:
    'Red Flag : le jeu où tu choisis entre deux comportements lequel est le pire red flag. Gratuit, anonyme, en ligne. Compare tes réponses avec des milliers de joueurs sur Red or Green.',
  keywords: [
    'red flag',
    'red or green',
    'party game',
    'jeu en ligne',
    'red flag game',
    'jeu de red flags',
    'red flag ou green flag',
    'jeu gratuit',
    'red flag jeu',
  ],
  openGraph: {
    title: 'Red Flag — Le party game qui fait débat 🚩',
    description:
      'Choisis entre deux comportements lequel est le pire Red Flag. Gratuit et anonyme.',
    url: '/redflag',
  },
  alternates: { canonical: '/redflag' },
};

export default function RedFlagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: 'Red Flag — Le party game',
            url: `${SITE_URL}/redflag`,
            description:
              'Choisis entre deux comportements lequel est le pire Red Flag. Compare tes résultats avec la communauté.',
            genre: ['Party Game', 'Social Game', 'Quiz'],
            playMode: 'SinglePlayer',
            gamePlatform: ['Web Browser', 'Mobile'],
            applicationCategory: 'Game',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
            },
            isPartOf: {
              '@type': 'WebSite',
              name: 'Red Flag Games',
              url: SITE_URL,
            },
          }),
        }}
      />
      {children}
    </>
  );
}
