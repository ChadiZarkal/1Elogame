import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const metadata: Metadata = {
  title: 'Flash Flag Sprint — Quiz Red Flag chronométré',
  description:
    'Lance un sprint de questions Red Flag avec temps limité. Crée une session, joue en local ou partage le lien. Résultats immédiats, gratuit et sans inscription.',
  keywords: [
    'flash flag', 'flashflag sprint', 'quiz red flag rapide', 'test chronométré',
    'partager quiz couple', 'test red flag envoi lien', 'quiz temps limité',
    'red flag test rapide', 'jeu questions soirée', 'test compatibilité lien',
  ],
  openGraph: {
    title: 'Flash Flag Sprint — Quiz Red Flag chronométré',
    description:
      'Lance un sprint de questions Red Flag avec temps limité. Joue en local ou envoie un lien, résultats immédiats.',
    url: '/flashflag',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flash Flag Sprint — Quiz Red Flag chronométré',
    description:
      'Lance un sprint de questions Red Flag avec temps limité. Joue en local ou envoie un lien.',
  },
  alternates: { canonical: '/flashflag' },
};

function FlashFlagJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Flash Flag Sprint',
        url: `${SITE_URL}/flashflag`,
        description:
          'Quiz Red Flag chronométré. Crée une session, partage le lien ou joue en local. Lis les résultats en temps réel.',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web Browser',
        inLanguage: 'fr-FR',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        isPartOf: {
          '@type': 'WebSite',
          name: 'Red or Green',
          url: SITE_URL,
        },
        author: {
          '@type': 'Organization',
          name: 'Red or Green',
          url: SITE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Flash Flag Sprint', item: `${SITE_URL}/flashflag` },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function FlashFlagLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlashFlagJsonLd />
      {children}
    </>
  );
}
