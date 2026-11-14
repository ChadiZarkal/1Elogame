import type { Metadata } from 'next';
import { GUIDE_FAQ_EN } from '@/app/guide/faq';
import { alternances } from '@/lib/i18n/alternances';

/**
 * Le guide des flags en anglais (2026-11-14) : métadonnées et balisage. Même
 * construction que `app/guide/layout.tsx`, en anglais. L'indexation reste
 * fermée par `app/en/layout.tsx`.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const metadata: Metadata = {
  title: 'Red Flag: meaning and examples (Green, Orange, Black Flag)',
  description:
    'Red flag: what it means, with real-life examples. Plus the difference between a green flag, an orange flag, a black flag and a white flag, to read the signals in a relationship.',
  keywords: ['red flag', 'redflag', 'red flag meaning', 'what is a red flag', 'green flag', 'black flag', 'orange flag', 'white flag'],
  openGraph: {
    title: 'Flag Guide — Red, Green, Black, Orange & White Flags',
    description: 'Understand the 5 types of relationship signals, with definitions and real-life examples.',
    url: '/en/guide',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flag Guide — Definitions and real-life examples',
    description: 'Red, Green, Black, Orange, White Flag: every relationship signal explained, with examples.',
  },
  alternates: alternances('en', '/guide'),
};

function GuideJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Red flag: meaning and examples — and the other flags',
        description:
          'Understand the 5 types of relationship signals, with full definitions and real-life examples.',
        url: `${SITE_URL}/en/guide`,
        author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'Red or Green',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-rog-new.svg` },
        },
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', name: 'Red or Green', url: SITE_URL },
      },
      {
        '@type': 'FAQPage',
        // Ces questions sont rendues visiblement en bas de /en/guide (GUIDE_FAQ_EN).
        mainEntity: GUIDE_FAQ_EN.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
          { '@type': 'ListItem', position: 2, name: 'Flag Guide', item: `${SITE_URL}/en/guide` },
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

export default function GuideEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd />
      {children}
    </>
  );
}
