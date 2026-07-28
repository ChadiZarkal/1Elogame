import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Classement — C'est un 10 mais...",
  description: "Le classement des révélations les plus éliminatoires du jeu « C'est un 10 mais... », établi à partir des notes de la communauté.",
  openGraph: {
    title: "Classement — C'est un 10 mais...",
    description: "Les révélations qui font le plus chuter la note, classées par la communauté.",
    url: '/dixmais/leaderboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Classement — C'est un 10 mais...",
    description: "Les révélations qui font le plus chuter la note, classées par la communauté.",
  },
  alternates: { canonical: '/dixmais/leaderboard' },
};

export default function DixMaisLeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
