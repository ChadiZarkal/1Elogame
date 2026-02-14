import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flag or Not — L\'IA juge si c\'est un Red Flag',
  description: 'Écris un comportement, une situation ou un objet et laisse l\'IA décider : Red Flag ou Green Flag ? Découvre les tendances de la communauté. Gratuit et anonyme.',
  openGraph: {
    title: 'Flag or Not — L\'IA juge si c\'est un Red Flag',
    description: 'Soumets n\'importe quoi et l\'IA te dit si c\'est un Red Flag ou un Green Flag. Rejoins la communauté !',
    url: '/flagornot',
  },
  alternates: { canonical: '/flagornot' },
};

export default function FlagOrNotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
