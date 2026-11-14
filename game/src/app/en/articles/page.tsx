import type { Metadata } from 'next';
import { PageArticles } from '@/app/articles/PageArticles';

/** La liste des articles en anglais. Voir `app/articles/page.tsx`. */
export const metadata: Metadata = {
  title: 'Articles: what the votes say about red flags',
  description:
    'Analysis drawn from the votes of Red or Green players, and guides to the self-assessment tools: red flags, gaps between men and women, the violence meter.',
  alternates: { canonical: '/en/articles' },
  openGraph: { locale: 'en_US', url: '/en/articles' },
};

export default function PageArticlesEn() {
  return <PageArticles langue="en" />;
}
