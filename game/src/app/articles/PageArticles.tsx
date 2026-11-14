/**
 * @module app/articles/PageArticles
 * La liste des articles, dans les deux langues : `/articles` et
 * `/en/articles` rendent ce composant (traduction du 2026-11-14).
 */

import Link from '@/components/ui/LienIntention';
import { articlesDe, dateLongue } from '@/content/articles';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';

const TEXTES = {
  fr: {
    titre: 'Articles',
    sous: 'Ce que les votes disent des red flags, et comment se servir des outils',
    intro: (
      <>
        Les jeux du site produisent des chiffres qu&apos;on ne trouve nulle part
        ailleurs : des milliers de duels tranchés par des joueurs dont on connaît le
        sexe et la tranche d&apos;âge. Ces articles les lisent, disent ce qu&apos;ils
        montrent et ce qu&apos;ils ne montrent pas, et renvoient aux études quand
        elles existent. D&apos;autres expliquent les outils d&apos;auto-évaluation.
      </>
    ),
  },
  en: {
    titre: 'Articles',
    sous: 'What the votes say about red flags, and how to use the tools',
    intro: (
      <>
        The site’s games produce numbers you won’t find anywhere else: thousands of
        duels decided by players whose gender and age bracket we know. These articles
        read those numbers, say what they show and what they don’t, and point to
        research when it exists. Others explain the self-assessment tools.
      </>
    ),
  },
} satisfies Record<Langue, Record<string, React.ReactNode>>;

export function PageArticles({ langue }: { langue: Langue }) {
  const t = TEXTES[langue];
  return (
    <main id="main-content" className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">{t.titre}</h1>
        <p className="legal-page__updated">
          {t.sous}
        </p>

        <section className="legal-page__section">
          <p>
            {t.intro}
          </p>
        </section>

        <ul className="article-liste">
          {articlesDe(langue).map((a) => (
            <li key={a.slug}>
              <Link href={cheminLocalise(langue, `/articles/${a.slug}`)} className="article-carte">
                <span className="article-carte__emoji" aria-hidden="true">{a.emoji}</span>
                <span className="article-carte__corps">
                  <span className="article-carte__titre">{a.titre}</span>
                  <span className="article-carte__chapo">{a.chapo}</span>
                  <span className="article-carte__date">{dateLongue(a.publie, langue)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
