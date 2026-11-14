/**
 * @module app/articles/[slug]
 * Un article. Rendu à la construction : le texte ne dépend d'aucune donnée
 * vivante — les chiffres sont datés dans l'article lui-même.
 *
 * La mise en page est dans `ArticleVue`, partagée avec `/en/articles/[slug]`.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES, articleParSlug } from '@/content/articles';
import { ArticleVue, metadataArticle } from './ArticleVue';

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return metadataArticle(slug, 'fr');
}

export default async function PageArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) notFound();
  return <ArticleVue article={article} langue="fr" />;
}
