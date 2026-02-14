import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Red Flag - Quel est le plus gros Red Flag ?',
  description: 'Joue au jeu Red Flag : choisis entre deux comportements, lequel est le pire ? Vote, compare tes réponses et débats avec tes amis. Classement en temps réel.',
  openGraph: {
    title: 'Red Flag - Quel est le plus gros Red Flag ?',
    description: 'Choisis entre deux comportements : lequel est le plus gros Red Flag ? Un party game addictif et gratuit.',
    url: '/jeu',
  },
  alternates: { canonical: '/jeu' },
};

export default function JeuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
