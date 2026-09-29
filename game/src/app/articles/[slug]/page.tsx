/**
 * @module app/articles/[slug]
 * Un article. Rendu à la construction : le texte ne dépend d'aucune donnée
 * vivante — les chiffres sont datés dans l'article lui-même.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, articleParSlug, dateLongue } from '@/content/articles';
import { ArticleRendu } from '@/components/content/ArticleRendu';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) return {};
  return {
    title: article.titre,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.titre,
      description: article.description,
      url: `/articles/${article.slug}`,
      publishedTime: article.publie,
      modifiedTime: article.misAJour,
    },
  };
}

export default async function PageArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) notFound();

  const url = `${SITE_URL}/articles/${article.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.titre,
        description: article.description,
        url,
        mainEntityOfPage: url,
        datePublished: article.publie,
        dateModified: article.misAJour,
        inLanguage: 'fr-FR',
        author: { '@type': 'Organization', name: article.auteur, url: `${SITE_URL}/a-propos` },
        publisher: {
          '@type': 'Organization',
          name: 'Red or Green',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-rog-new.svg` },
        },
        ...(article.sources.length
          ? { citation: article.sources.map((s) => ({ '@type': 'CreativeWork', name: s.titre, url: s.url })) }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
          { '@type': 'ListItem', position: 3, name: article.titre, item: url },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="legal-page">
      <article className="legal-page__container">
        <nav aria-label="Fil d'Ariane" className="article-ariane">
          <Link href="/articles">Articles</Link>
        </nav>
        <h1 className="legal-page__title">{article.titre}</h1>
        <p className="legal-page__updated">
          {article.auteur} · publié le {dateLongue(article.publie)}
          {article.misAJour !== article.publie ? ` · mis à jour le ${dateLongue(article.misAJour)}` : ''}
          {article.chiffresAu ? ` · chiffres arrêtés au ${article.chiffresAu}` : ''}
        </p>

        <p className="article-chapo">{article.chapo}</p>

        <ArticleRendu blocs={article.blocs} />

        {article.sources.length > 0 && (
          <section className="legal-page__section" aria-labelledby="titre-sources">
            <h2 id="titre-sources">Sources</h2>
            <ul>
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer" target="_blank">{s.titre}</a>
                  {' — '}
                  {s.editeur}
                  {s.date ? `, ${s.date}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="legal-page__section" aria-labelledby="titre-suite">
          <h2 id="titre-suite">Pour aller plus loin</h2>
          <ul>
            {article.suite.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
