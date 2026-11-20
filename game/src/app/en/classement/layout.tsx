import type { Metadata } from 'next';
import { alternances } from '@/lib/i18n/alternances';

/** Le classement en anglais. */
export const metadata: Metadata = {
  title: 'Red Flag Rankings: the Worst Red Flags, Voted',
  description: 'The worst red flags in dating and everyday life, ranked by thousands of player votes. Filter by gender and age group. Live rankings.',
  keywords: [
    'red flag rankings',
    'top red flags',
    'worst red flags',
    'biggest red flags',
    'dating red flags',
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
  alternates: alternances('en', '/classement'),
};

export default function ClassementEnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
