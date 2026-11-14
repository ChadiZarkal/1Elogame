import type { Metadata } from 'next';

/** Le classement en anglais. Fermé aux moteurs comme tout `/en` pour l'instant. */
export const metadata: Metadata = {
  title: 'Red Flag Rankings — the worst behaviors, ranked',
  description: 'The biggest red flags as voted by the community. Filter by gender and age group. Live Elo rankings.',
  keywords: [
    'red flag rankings',
    'top red flags',
    'worst red flags',
    'red or green rankings',
    'best green flags',
    'elo rankings',
  ],
  openGraph: {
    title: 'Red Flag Rankings — the worst behaviors, ranked',
    description: 'What are the worst red flags according to the community? See the live rankings.',
    url: '/en/classement',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Flag Rankings — the worst behaviors, ranked',
    description: 'What are the worst red flags according to the community? See the live rankings.',
  },
  alternates: { canonical: '/en/classement' },
  robots: { index: false, follow: true },
};

export default function ClassementEnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
