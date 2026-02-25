import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oracle — Red Flag ou Green Flag ?',
  description: 'Écris un comportement, une situation ou un objet et découvre le verdict : Red Flag ou Green Flag ? Gratuit et anonyme.',
  openGraph: {
    title: 'Oracle — Red Flag ou Green Flag ?',
    description: 'Soumets n\'importe quoi et découvre si c\'est un Red Flag ou un Green Flag. Rejoins la communauté !',
    url: '/flagornot',
  },
  alternates: { canonical: '/flagornot' },
};

export default function FlagOrNotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
