/**
 * @module app/articles
 * La liste des articles.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ARTICLES, dateLongue } from '@/content/articles';

export const metadata: Metadata = {
  title: 'Articles : ce que les votes disent des red flags',
  description:
    "Analyses tirées des votes des joueurs de Red or Green, et explications des outils d'auto-évaluation : red flags, écarts entre hommes et femmes, violentomètre.",
  alternates: { canonical: '/articles' },
};

export default function PageArticles() {
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Articles</h1>
        <p className="legal-page__updated">
          Ce que les votes disent des red flags, et comment se servir des outils
        </p>

        <section className="legal-page__section">
          <p>
            Les jeux du site produisent des chiffres qu&apos;on ne trouve nulle part
            ailleurs : des milliers de duels tranchés par des joueurs dont on connaît le
            sexe et la tranche d&apos;âge. Ces articles les lisent, disent ce qu&apos;ils
            montrent et ce qu&apos;ils ne montrent pas, et renvoient aux études quand
            elles existent. D&apos;autres expliquent les outils d&apos;auto-évaluation.
          </p>
        </section>

        <ul className="article-liste">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link href={`/articles/${a.slug}`} className="article-carte">
                <span className="article-carte__emoji" aria-hidden="true">{a.emoji}</span>
                <span className="article-carte__corps">
                  <span className="article-carte__titre">{a.titre}</span>
                  <span className="article-carte__chapo">{a.chapo}</span>
                  <span className="article-carte__date">{dateLongue(a.publie)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
