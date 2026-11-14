/**
 * @module app/articles/[slug]/ArticleVue
 * Un article, dans les deux langues : `/articles/[slug]` et
 * `/en/articles/[slug]` rendent ce composant (traduction du 2026-11-14).
 * Les métadonnées aussi sont construites ici, pour que les deux routes
 * déclarent la même chose.
 */

import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { articleParSlug, dateLongue, type Article } from '@/content/articles';
import { ArticleRendu } from '@/components/content/ArticleRendu';
import { cheminLocalise, localeDe, type Langue } from '@/lib/i18n/langue';
import { alternances } from '@/lib/i18n/alternances';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

const TEXTES = {
  fr: {
    accueil: 'Accueil',
    articles: 'Articles',
    ariane: "Fil d'Ariane",
    publie: 'publié le',
    misAJour: 'mis à jour le',
    chiffresAu: 'chiffres arrêtés au',
    sources: 'Sources',
    suite: 'Pour aller plus loin',
  },
  en: {
    accueil: 'Home',
    articles: 'Articles',
    ariane: 'Breadcrumb',
    publie: 'published',
    misAJour: 'updated',
    chiffresAu: 'figures as of',
    sources: 'Sources',
    suite: 'Keep reading',
  },
} satisfies Record<Langue, Record<string, string>>;

export function metadataArticle(slug: string, langue: Langue): Metadata {
  const article = articleParSlug(slug, langue);
  if (!article) return {};
  const chemin = cheminLocalise(langue, `/articles/${article.slug}`);
  return {
    title: article.titre,
    description: article.description,
    alternates: alternances(langue, `/articles/${article.slug}`),
    openGraph: {
      type: 'article',
      title: article.titre,
      description: article.description,
      url: chemin,
      publishedTime: article.publie,
      modifiedTime: article.misAJour,
      ...(langue === 'en' ? { locale: 'en_US' } : {}),
    },
  };
}

export function ArticleVue({ article, langue }: { article: Article; langue: Langue }) {
  const t = TEXTES[langue];
  const url = `${SITE_URL}${cheminLocalise(langue, `/articles/${article.slug}`)}`;
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
        inLanguage: localeDe(langue),
        author: { '@type': 'Organization', name: article.auteur, url: `${SITE_URL}${cheminLocalise(langue, '/a-propos')}` },
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
          { '@type': 'ListItem', position: 1, name: t.accueil, item: `${SITE_URL}${langue === 'en' ? '/en' : ''}` },
          { '@type': 'ListItem', position: 2, name: t.articles, item: `${SITE_URL}${cheminLocalise(langue, '/articles')}` },
          { '@type': 'ListItem', position: 3, name: article.titre, item: url },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="legal-page">
      <article className="legal-page__container">
        <nav aria-label={t.ariane} className="article-ariane">
          <Link href={cheminLocalise(langue, '/articles')}>{t.articles}</Link>
        </nav>
        <h1 className="legal-page__title">{article.titre}</h1>
        <p className="legal-page__updated">
          {/* Trois nœuds de texte, comme avant le partage : le HTML français ne bouge pas. */}
          {article.auteur}{` · ${t.publie} `}{dateLongue(article.publie, langue)}
          {article.misAJour !== article.publie ? ` · ${t.misAJour} ${dateLongue(article.misAJour, langue)}` : ''}
          {article.chiffresAu ? ` · ${t.chiffresAu} ${article.chiffresAu}` : ''}
        </p>

        <p className="article-chapo">{article.chapo}</p>

        <ArticleRendu blocs={article.blocs} langue={langue} />

        {article.sources.length > 0 && (
          <section className="legal-page__section" aria-labelledby="titre-sources">
            <h2 id="titre-sources">{t.sources}</h2>
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
          <h2 id="titre-suite">{t.suite}</h2>
          <ul>
            {article.suite.map((l) => (
              <li key={l.href}>
                <Link href={cheminLocalise(langue, l.href)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
