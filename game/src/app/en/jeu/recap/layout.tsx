import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

// Page d'état éphémère, hors index : voir `app/jeu/recap/layout.tsx`.
export const metadata: Metadata = {
  title: 'Your game recap',
  robots: { index: false, follow: true },
  alternates: alternances('en', '/jeu/recap'),
};

export default function JeuRecapEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
