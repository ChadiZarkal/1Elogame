import type { Metadata } from 'next';

/** Le classement de « It's a 10 but… », comme `app/dixmais/leaderboard/layout.tsx`. */
export const metadata: Metadata = {
  title: "Leaderboard — It's a 10 But...",
  description: "The leaderboard for “It's a 10 But...”: the average score players give each red flag and each green flag, rated one by one.",
  openGraph: {
    title: "Leaderboard — It's a 10 But...",
    description: 'The red flags that tank the score the most, and the green flags that push it all the way to 15/10.',
    url: '/en/dixmais/leaderboard',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Leaderboard — It's a 10 But...",
    description: 'The red flags that tank the score the most, and the green flags that push it all the way to 15/10.',
  },
  alternates: { canonical: '/en/dixmais/leaderboard' },
  robots: { index: false, follow: true },
};

export default function DixMaisLeaderboardEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
