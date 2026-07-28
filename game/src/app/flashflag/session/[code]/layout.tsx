import type { Metadata } from 'next';

// Session de jeu éphémère, propre à un code : rien de stable à indexer.
export const metadata: Metadata = {
  title: 'Session Flash Flag',
  robots: { index: false, follow: true },
};

export default function FlashFlagSessionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
