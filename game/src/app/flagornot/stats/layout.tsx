import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Statistiques de l'Oracle — Red or Green",
  description: "Les verdicts rendus par l'Oracle IA : répartition red flag / green flag et tendances observées sur les situations soumises par la communauté.",
  openGraph: {
    title: "Statistiques de l'Oracle — Red or Green",
    description: "Répartition des verdicts et tendances sur les situations soumises à l'Oracle IA.",
    url: '/flagornot/stats',
  },
  alternates: { canonical: '/flagornot/stats' },
  // Les chiffres sont chargés côté navigateur : le HTML servi ne contient que
  // « Chargement des stats... ». Tant que la page n'est pas rendue côté
  // serveur, elle ne doit pas être indexée.
  robots: { index: false, follow: true },
};

export default function FlagOrNotStatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
