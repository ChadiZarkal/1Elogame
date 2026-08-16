import type { Metadata } from 'next';
import { GUIDE_FAQ } from './faq';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const metadata: Metadata = {
  title: 'Guide des Flags — Définitions Red Flag, Green Flag, Black Flag...',
  description:
    'Comprends la différence entre Green Flag, Orange Flag, Red Flag, Black Flag et White Flag. Définitions claires avec exemples concrets pour reconnaître les signaux relationnels.',
  keywords: ['red flag', 'green flag', 'black flag', 'orange flag', 'white flag'],
  openGraph: {
    title: 'Guide des Flags — Red, Green, Black, Orange & White Flag',
    description: 'Comprends les 5 types de signaux relationnels avec définitions et exemples concrets.',
    url: '/guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guide des Flags — Définitions et exemples concrets',
    description: 'Red, Green, Black, Orange, White Flag : tous les signaux relationnels expliqués avec exemples.',
  },
  alternates: { canonical: '/guide' },
};

function GuideJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Guide des Flags : Red Flag, Green Flag, Black Flag, Orange Flag et White Flag',
        description:
          'Comprendre les 5 types de signaux relationnels avec définitions complètes et exemples concrets.',
        url: `${SITE_URL}/guide`,
        author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'Red or Green',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-rog-new.svg` },
        },
        inLanguage: 'fr-FR',
        isPartOf: { '@type': 'WebSite', name: 'Red or Green', url: SITE_URL },
      },
      {
        '@type': 'FAQPage',
        // Ces questions sont rendues visiblement en bas de /guide (GUIDE_FAQ).
        mainEntity: GUIDE_FAQ.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Guide des Flags', item: `${SITE_URL}/guide` },
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

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd />
      {children}
    </>
  );
}
