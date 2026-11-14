import type { Metadata } from 'next';
import { METERS_EN } from '@/config/meters-data-en';
import { alternances } from '@/lib/i18n/alternances';

/**
 * Les outils d'auto-évaluation en anglais (traduction du 2026-11-14). Pendant
 * de `app/ressources/layout.tsx` ; l'indexation reste fermée par le gabarit
 * `/en`.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

const DESCRIPTION =
  'Free, anonymous self-assessment tools based on French scales: Violentomètre (violence meter), Consentomètre (consent meter), Incestomètre, Harcèlomètre and Discriminomètre. 100% confidential, no data collected.';

export const metadata: Metadata = {
  title: 'Violence Meter, Consent Meter & Self-assessment — Free tools',
  description: DESCRIPTION,
  keywords: ['violentometre', 'violence meter', 'consentometre', 'consent meter', 'self-assessment', 'domestic violence'],
  openGraph: {
    title: 'Violence Meter & Consent Meter — Free self-assessment tools',
    description:
      'Assess your situation with our anonymous tools: Violentomètre, Consentomètre, Harcèlomètre and more. Free and confidential.',
    url: '/en/ressources',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Violence Meter & Consent Meter — Free self-assessment tools',
    description:
      'Assess your situation with our anonymous tools: Violentomètre, Consentomètre, Harcèlomètre and more. Free and confidential.',
  },
  alternates: alternances('en', '/ressources'),
};

function RessourcesJsonLd() {
  const racine = `${SITE_URL}/en`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Self-assessment tools',
        description: 'Violence meter, consent meter and other free awareness tools',
        url: `${racine}/ressources`,
        numberOfItems: METERS_EN.length,
        itemListElement: METERS_EN.map((meter, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: meter.name,
          url: `${racine}/ressources/${meter.slug}`,
          description: meter.description,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: racine },
          { '@type': 'ListItem', position: 2, name: 'Resources', item: `${racine}/ressources` },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default function RessourcesEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RessourcesJsonLd />
      {children}
    </>
  );
}
