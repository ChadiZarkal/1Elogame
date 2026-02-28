import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classement Red Flag — Top des pires comportements',
  description: 'Découvre le classement des plus gros Red Flags votés par la communauté. Filtres par sexe, tranche d\'âge. Classement ELO en temps réel.',
  keywords: [
    'classement red flag',
    'top red flags',
    'pires red flags',
    'red flag classement',
    'red or green classement',
    'meilleurs green flags',
    'classement elo',
  ],
  openGraph: {
    title: 'Classement Red Flag — Top des pires comportements',
    description: 'Quels sont les pires Red Flags selon la communauté ? Découvre le classement en temps réel.',
    url: '/classement',
  },
  alternates: { canonical: '/classement' },
};

const SITE_URL = 'https://redflaggames.fr';

export default function ClassementLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Classement Red Flag — Top des pires comportements',
            description:
              'Classement en temps réel des pires Red Flags et meilleurs Green Flags, votés par la communauté.',
            url: `${SITE_URL}/classement`,
            numberOfItems: 50,
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
          }),
        }}
      />
      {children}
    </>
  );
}
