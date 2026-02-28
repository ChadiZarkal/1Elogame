import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oracle — Red Flag ou Green Flag ?',
  description: 'Écris un comportement, une situation ou un objet et découvre le verdict : Red Flag ou Green Flag ? Gratuit et anonyme.',
  keywords: [
    'red flag ou green flag',
    'oracle red flag',
    'flag or not',
    'red or green oracle',
    'est-ce un red flag',
    'red flag test',
    'green flag test',
  ],
  openGraph: {
    title: 'Oracle — Red Flag ou Green Flag ?',
    description: 'Soumets n\'importe quoi et découvre si c\'est un Red Flag ou un Green Flag. Rejoins la communauté !',
    url: '/flagornot',
  },
  alternates: { canonical: '/flagornot' },
};

const SITE_URL = 'https://redorgreen.fr';

export default function FlagOrNotLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Oracle — Red Flag ou Green Flag',
            url: `${SITE_URL}/flagornot`,
            description:
              'Soumets un comportement et découvre le verdict de l\'Oracle : Red Flag ou Green Flag ? Propulsé par IA.',
            applicationCategory: 'Entertainment',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
            },
            isPartOf: {
              '@type': 'WebSite',
              name: 'Red or Green',
              url: SITE_URL,
            },
          }),
        }}
      />
      {children}
    </>
  );
}
