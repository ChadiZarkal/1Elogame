import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choisis ta catégorie — Red or Green Duel',
  description: 'Choisis une catégorie de comportements et lance le duel : entre deux situations, laquelle est le plus gros red flag ?',
  openGraph: {
    title: 'Choisis ta catégorie — Red or Green Duel',
    description: 'Entre deux comportements, lequel est le plus gros red flag ? À toi de trancher.',
    url: '/jeu/jouer',
  },
  alternates: { canonical: '/jeu/jouer' },
};

export default function JeuJouerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
