import type { Metadata } from 'next';
import { METERS } from '@/config/meters-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const metadata: Metadata = {
  title: 'Violentomètre, Consentomètre & Auto-évaluation — Outils gratuits',
  description:
    'Évalue ta situation avec nos outils gratuits et anonymes : violentomètre, consentomètre, incestomètre, harcèlomètre, discriminomètre. 100% confidentiel, aucune donnée collectée.',
  keywords: [
    'violentomètre', 'consentomètre', 'incestomètre', 'harcèlomètre', 'discriminomètre',
    'violentometre en ligne', 'test violence couple', 'test harcèlement',
    'outil auto-évaluation violence', 'quiz consentement', 'red flag test',
  ],
  openGraph: {
    title: 'Violentomètre & Consentomètre — Outils d\'auto-évaluation gratuits',
    description:
      'Évalue ta situation avec nos outils anonymes : violentomètre, consentomètre, harcèlomètre et plus. Gratuit et confidentiel.',
    url: '/ressources',
  },
  alternates: { canonical: '/ressources' },
};

function RessourcesJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Outils d\'auto-évaluation',
        description: 'Violentomètre, consentomètre et autres outils de sensibilisation gratuits',
        url: `${SITE_URL}/ressources`,
        numberOfItems: METERS.length,
        itemListElement: METERS.map((meter, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: meter.name,
          url: `${SITE_URL}/ressources/${meter.slug}`,
          description: meter.description,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Ressources', item: `${SITE_URL}/ressources` },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function RessourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RessourcesJsonLd />
      {children}
    </>
  );
}
