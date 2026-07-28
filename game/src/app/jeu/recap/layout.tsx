import type { Metadata } from 'next';

// Page d'état éphémère (récapitulatif d'une partie) : aucun contenu éditeur
// stable à indexer. `noindex` plutôt qu'un blocage robots.txt, afin que Google
// puisse explorer la page et prendre la directive en compte.
export const metadata: Metadata = {
  title: 'Récapitulatif de ta partie',
  robots: { index: false, follow: true },
  alternates: { canonical: '/jeu/recap' },
};

export default function JeuRecapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
