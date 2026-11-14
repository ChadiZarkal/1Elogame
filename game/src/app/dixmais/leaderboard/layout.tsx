import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

export const metadata: Metadata = {
  title: "Classement — C'est un 10 mais...",
  description: "Le classement du jeu « C'est un 10 mais... » : la note moyenne que les joueurs donnent à chaque red flag et à chaque green flag, notés un par un.",
  openGraph: {
    title: "Classement — C'est un 10 mais...",
    description: "Les red flags qui font le plus chuter la note, les green flags qui la font monter jusqu'à 15/10.",
    url: '/dixmais/leaderboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Classement — C'est un 10 mais...",
    description: "Les red flags qui font le plus chuter la note, les green flags qui la font monter jusqu'à 15/10.",
  },
  alternates: alternances('fr', '/dixmais/leaderboard'),
};

export default function DixMaisLeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
