import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Red or Green - Quel est le plus gros Red Flag ?',
  description: 'Joue au jeu Red or Green : choisis entre deux comportements, lequel est le pire ? Vote, compare tes réponses et débats avec tes amis. Classement en temps réel.',
  openGraph: {
    title: 'Red or Green - Quel est le plus gros Red Flag ?',
    description: 'Choisis entre deux comportements : lequel est le plus gros Red Flag ? Un party game addictif et gratuit.',
    url: '/jeu',
  },
  alternates: { canonical: '/jeu' },
};

export default function JeuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
