import type { Metadata } from 'next';

/** Voir `app/jeu/jouer/layout.tsx` : écran de partie, hors index. */
export const metadata: Metadata = {
  title: 'Pick your category — Red or Green Duel',
  description: 'Pick a category of behaviors and start the duel: between two situations, which one is the bigger red flag?',
  openGraph: {
    title: 'Pick your category — Red or Green Duel',
    description: 'Between two behaviors, which one is the bigger red flag? You decide.',
    url: '/en/jeu/jouer',
    locale: 'en_US',
  },
  alternates: { canonical: '/en/jeu/jouer' },
  robots: { index: false, follow: true },
};

export default function JeuJouerEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
