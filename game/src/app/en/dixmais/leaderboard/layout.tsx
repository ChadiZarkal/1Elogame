import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

/** Le classement de « It's a 10 but… », comme `app/dixmais/leaderboard/layout.tsx`. */
export const metadata: Metadata = {
  title: "He's a 10 But… Leaderboard: the Red Flags That Cost the Most",
  description: "The “He's a 10 but…” leaderboard: the average score players give each red flag and each green flag, from the deal-breakers that tank a 10 to the green flags that push it to 15/10.",
  openGraph: {
    title: "He's a 10 But… — the leaderboard",
    description: 'The red flags that tank the score the most, and the green flags that push it all the way to 15/10.',
    url: '/en/dixmais/leaderboard',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "He's a 10 But… — the leaderboard",
    description: 'The red flags that tank the score the most, and the green flags that push it all the way to 15/10.',
  },
  alternates: alternances('en', '/dixmais/leaderboard'),
};

export default function DixMaisLeaderboardEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
