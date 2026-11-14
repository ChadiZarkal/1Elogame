import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES_EN, articleParSlug } from '@/content/articles';
import { ArticleVue, metadataArticle } from '@/app/articles/[slug]/ArticleVue';

/**
 * Un article en anglais, à la même adresse que le français sous `/en`.
 * Voir `app/articles/[slug]/page.tsx`.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES_EN.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return metadataArticle(slug, 'en');
}

export default async function PageArticleEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleParSlug(slug, 'en');
  if (!article) notFound();
  return <ArticleVue article={article} langue="en" />;
}
