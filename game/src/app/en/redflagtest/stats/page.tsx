import type { Metadata } from 'next';
import { PageStats } from '@/app/redflagtest/stats/PageStats';
import { alternances } from '@/lib/i18n/alternances';

export const metadata: Metadata = {
  title: { absolute: 'Red Flag Test: what players answered | Red or Green' },
  description: 'The Red Flag Test answers, question by question, and the gap between men and women.',
  alternates: alternances('en', '/redflagtest/stats'),
};

export default function Page() {
  return <PageStats langue="en" />;
}
