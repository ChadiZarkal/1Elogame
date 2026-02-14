import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Red Flag — Règles du jeu',
  description: 'Découvre les règles du jeu Red Flag : choisis entre deux comportements, vote pour le pire, et compare avec les autres joueurs. Gratuit et sans inscription.',
  openGraph: {
    title: 'Red Flag — Découvre les règles du jeu',
    description: 'Le jeu des Red Flags : compare tes réponses avec la communauté. Gratuit et anonyme.',
    url: '/redflag',
  },
  alternates: { canonical: '/redflag' },
};

export default function RedFlagLayout({ children }: { children: React.ReactNode }) {
  return children;
}
