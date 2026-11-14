import type { Metadata } from 'next';

// Page d'état éphémère, hors index : voir `app/jeu/recap/layout.tsx`.
export const metadata: Metadata = {
  title: 'Your game recap',
  robots: { index: false, follow: true },
  alternates: { canonical: '/en/jeu/recap' },
};

export default function JeuRecapEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
