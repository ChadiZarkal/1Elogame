'use client';

/**
 * @module redflagtest/stats/StatsClient
 * Ce que les autres ont répondu.
 *
 * LA PHRASE QUE CETTE PAGE DOIT PRODUIRE
 *   « 80 % ont répondu oui à “es-tu féministe” ; 70 % chez les hommes, 90 % chez
 *   les femmes. » Le total ne suffit pas : c'est l'ÉCART entre les deux qui se
 *   discute, et c'est lui qu'on met en avant, trié par ampleur.
 *
 * TROIS DÉNOMINATEURS, ET PAS UN
 *   Chaque part est calculée sur sa propre population. Rapporter un nombre
 *   d'hommes au total général donnerait des pourcentages qui ne somment pas à
 *   cent et des écarts entièrement inventés.
 *
 * AUCUN POINT N'EST AFFICHÉ ICI
 *   La page est publique. Y faire figurer le barème le rendrait consultable par
 *   tout le monde, et le test truquable — c'est la même règle que pour le
 *   questionnaire lui-même.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from '@/components/ui/LienIntention';
import type { StatQuestion } from '@/lib/rft/types';
import { useTextesRft } from '../textes';
import { useLangue } from '@/lib/i18n/LangueContexte';
import { cheminLocalise } from '@/lib/i18n/langue';

/**
 * En dessous de ce nombre de réponses, la question n'est pas montrée.
 *
 * Un « 100 % des femmes » calculé sur deux joueuses n'est pas une statistique,
 * c'est une coïncidence affichée en gras.
 */
const MINIMUM = 10;

/** Et l'écart hommes/femmes n'est comparé qu'au-delà de cela, de chaque côté. */
const MINIMUM_PAR_SEXE = 8;

type Tri = 'ordre' | 'ecart';

function pourcent(n: number, total: number): number {
  return total <= 0 ? 0 : Math.round((n / total) * 100);
}

/** L'écart hommes/femmes le plus grand de la question, en points. */
function ecartMaximal(q: StatQuestion): number | null {
  if (q.totalH < MINIMUM_PAR_SEXE || q.totalF < MINIMUM_PAR_SEXE) return null;
  return Math.max(
    ...q.reponses.map((r) =>
      Math.abs(pourcent(r.choixH, q.totalH) - pourcent(r.choixF, q.totalF)),
    ),
  );
}

export function StatsClient() {
  const [questions, setQuestions] = useState<StatQuestion[] | null>(null);
  const [erreur, setErreur] = useState('');
  const [tri, setTri] = useState<Tri>('ecart');
  const t = useTextesRft();
  const langue = useLangue();
  const test = cheminLocalise(langue, '/redflagtest');

  useEffect(() => {
    let vivant = true;
    (async () => {
      try {
        const json = await fetch(`/api/redflagtest/stats?lang=${langue}`).then((r) => r.json());
        if (!vivant) return;
        if (!json.success) {
          setErreur(json.error?.message ?? t.statsErreur);
          return;
        }
        setQuestions(json.data.questions);
      } catch {
        if (vivant) setErreur(t.erreurConnexion);
      }
    })();
    return () => { vivant = false; };
  }, [langue, t]);

  const visibles = useMemo(() => {
    if (!questions) return [];
    const assez = questions.filter((q) => q.total >= MINIMUM);
    if (tri === 'ordre') return assez;
    // Les questions qui divisent le plus d'abord : ce sont elles qu'on lit.
    return [...assez].sort((a, b) => (ecartMaximal(b) ?? -1) - (ecartMaximal(a) ?? -1));
  }, [questions, tri]);

  if (erreur) {
    return (
      <div className="error-message">
        <p>{erreur}</p>
        <Link href={test}>{t.revenirAuTest}</Link>
      </div>
    );
  }

  if (!questions) return <p className="loading-message">{t.chargement}</p>;

  if (visibles.length === 0) {
    return (
      <div className="error-message">
        <p>{t.statsPasAssez(MINIMUM)}</p>
        <Link href={test}>{t.faireLeTest}</Link>
      </div>
    );
  }

  return (
    <section className="stats-page">
      <div className="stats-page-tri">
        <button
          type="button"
          className={tri === 'ecart' ? 'stats-tri-actif' : ''}
          onClick={() => setTri('ecart')}
        >
          {t.statsDivise}
        </button>
        <button
          type="button"
          className={tri === 'ordre' ? 'stats-tri-actif' : ''}
          onClick={() => setTri('ordre')}
        >
          {t.statsOrdre}
        </button>
      </div>

      {visibles.map((q) => (
        <Question key={q.questionId} q={q} />
      ))}

      <p className="intro-note">{t.statsNote(MINIMUM, MINIMUM_PAR_SEXE)}</p>
    </section>
  );
}

function Question({ q }: { q: StatQuestion }) {
  const ecart = ecartMaximal(q);
  const comparable = ecart !== null;
  const t = useTextesRft();

  return (
    <article className="stats-question">
      <h3>{q.texte}</h3>
      <p className="stats-question-base">
        {t.statsReponses(q.total)}
        {comparable && t.statsHF(q.totalH, q.totalF)}
        {comparable && ecart >= 15 && (
          <span className="stats-question-divise">{t.statsEcart(ecart)}</span>
        )}
      </p>

      <ul className="stats-barres">
        {q.reponses.map((r) => {
          const tous = pourcent(r.choix, q.total);
          const h = pourcent(r.choixH, q.totalH);
          const f = pourcent(r.choixF, q.totalF);

          return (
            <li key={r.answerId}>
              <p className="stats-barre-texte">{r.texte}</p>

              <div className="stats-barre">
                <span className="stats-barre-fond" style={{ width: `${tous}%` }} />
                <span className="stats-barre-valeur">{t.pct(tous)}</span>
              </div>

              {comparable && (
                <p className="stats-barre-sexes">
                  <span className="stats-sexe-h">{t.statsHommes(h)}</span>
                  <span className="stats-sexe-f">{t.statsFemmes(f)}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
