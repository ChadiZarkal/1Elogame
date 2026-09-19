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
import Link from 'next/link';
import type { StatQuestion } from '@/lib/rft/types';

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

  useEffect(() => {
    let vivant = true;
    (async () => {
      try {
        const json = await fetch('/api/redflagtest/stats').then((r) => r.json());
        if (!vivant) return;
        if (!json.success) {
          setErreur(json.error?.message ?? 'Chargement impossible.');
          return;
        }
        setQuestions(json.data.questions);
      } catch {
        if (vivant) setErreur('Connexion perdue.');
      }
    })();
    return () => { vivant = false; };
  }, []);

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
        <Link href="/redflagtest">Revenir au test</Link>
      </div>
    );
  }

  if (!questions) return <p className="loading-message">Chargement…</p>;

  if (visibles.length === 0) {
    return (
      <div className="error-message">
        <p>
          Pas encore assez de parties pour dire quoi que ce soit. Il en faut au moins{' '}
          {MINIMUM} par question.
        </p>
        <Link href="/redflagtest">Faire le test</Link>
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
          Ce qui divise le plus
        </button>
        <button
          type="button"
          className={tri === 'ordre' ? 'stats-tri-actif' : ''}
          onClick={() => setTri('ordre')}
        >
          Dans l’ordre du test
        </button>
      </div>

      {visibles.map((q) => (
        <Question key={q.questionId} q={q} />
      ))}

      <p className="intro-note">
        Seules les questions ayant reçu au moins {MINIMUM} réponses sont affichées. La
        répartition hommes / femmes n’apparaît qu’à partir de {MINIMUM_PAR_SEXE} de chaque
        côté — en dessous, un pourcentage ne dirait rien.
      </p>
    </section>
  );
}

function Question({ q }: { q: StatQuestion }) {
  const ecart = ecartMaximal(q);
  const comparable = ecart !== null;

  return (
    <article className="stats-question">
      <h3>{q.texte}</h3>
      <p className="stats-question-base">
        {q.total} réponse{q.total > 1 ? 's' : ''}
        {comparable && ` · ${q.totalH} hommes, ${q.totalF} femmes`}
        {comparable && ecart >= 15 && (
          <span className="stats-question-divise"> · {ecart} points d’écart</span>
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
                <span className="stats-barre-valeur">{tous} %</span>
              </div>

              {comparable && (
                <p className="stats-barre-sexes">
                  <span className="stats-sexe-h">{h} % des hommes</span>
                  <span className="stats-sexe-f">{f} % des femmes</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
