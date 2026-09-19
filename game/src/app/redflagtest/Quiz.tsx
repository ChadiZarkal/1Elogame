'use client';

/**
 * @module redflagtest/Quiz
 * La boucle de jeu, sur le markup de référence.
 *
 *   div.game-wrapper > div.bracket-message
 *                    > div.progress-bar > div.score-cursor
 *                                       > div.rounded-wrapper > div.progress-bar-cell
 *                    > div.progress-bar-captions
 *                    > div.finish-block
 *                    > div.question-container > div.question-block
 *
 * Ces noms de classes ne sont pas décoratifs : ce sont exactement ceux que
 * `flac.css` stylise. Les renommer laisserait tomber le design sans un
 * avertissement.
 *
 * La phase est portée par <body> — `switch-quiz-ongoing`, `switch-quiz-end`,
 * `switch-loading` — comme dans l'original. Plusieurs règles en dépendent :
 * l'apparition du mesureur, les légendes de la barre, le repli du logo, la
 * pulsation du fond pendant le calcul. Poser ces classes n'est pas cosmétique,
 * c'est ce qui allume le design.
 *
 * AUCUN APPEL RÉSEAU. Les questions viennent de `donnees.ts`, le récap de
 * `resultat.ts`, tous deux dans ce dossier.
 */

import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS, type Reponse } from './donnees';
import { calculer } from './resultat';
import { Recap } from './Recap';

type Phase = 'jeu' | 'calcul' | 'recap';

/** La classe que `flac.css` attend sur <body> pour chaque phase. */
const CLASSE_BODY: Record<Phase, string> = {
  jeu: 'switch-quiz-ongoing',
  calcul: 'switch-loading',
  recap: 'switch-quiz-end',
};

const TOUTES_LES_CLASSES = Object.values(CLASSE_BODY);

/**
 * Le temps que dure l'écran de calcul.
 *
 * Rien n'est calculé — tout est déjà connu au moment du dernier clic. Cette
 * pause existe parce que l'écran de chargement fait partie du front-end de
 * référence : le fond pulse, le mesureur disparaît, et le récap arrive comme un
 * verdict plutôt que comme un changement d'onglet.
 */
const DUREE_CALCUL_MS = 1400;

export function Quiz() {
  const [phase, setPhase] = useState<Phase>('jeu');
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<Map<string, Reponse>>(new Map());
  const [clique, setClique] = useState<string | null>(null);
  const [aiguille, setAiguille] = useState(50);

  const question = QUESTIONS[index];
  const resultat = useMemo(() => calculer(choix), [choix]);

  // Pousser un état dans le DOM est la seule chose pour laquelle un effet est
  // réellement fait.
  useEffect(() => {
    document.body.classList.remove(...TOUTES_LES_CLASSES);
    document.body.classList.add(CLASSE_BODY[phase]);
    return () => document.body.classList.remove(...TOUTES_LES_CLASSES);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'calcul') return;
    const minuteur = setTimeout(() => setPhase('recap'), DUREE_CALCUL_MS);
    return () => clearTimeout(minuteur);
  }, [phase]);

  const repondre = (reponse: Reponse) => {
    if (clique) return; // Le temps de l'animation, un deuxième clic ne compte pas.
    setClique(reponse.id);

    const suivants = new Map(choix).set(question.id, reponse);
    setChoix(suivants);

    // L'aiguille ne fait jamais le chemin inverse du sens de la réponse : une
    // réponse rouge ne part pas à gauche. Le pas est calé sur la longueur du
    // quiz pour qu'une partie entièrement rouge traverse tout le cadran.
    const pas = (reponse.poids * 2 - 1) * (50 / QUESTIONS.length);
    setAiguille((position) => Math.min(100, Math.max(0, position + pas)));

    setTimeout(() => {
      setClique(null);
      if (index + 1 >= QUESTIONS.length) setPhase('calcul');
      else setIndex((i) => i + 1);
    }, 220);
  };

  const recommencer = () => {
    setChoix(new Map());
    setIndex(0);
    setClique(null);
    setAiguille(50);
    setPhase('jeu');
  };

  return (
    <>
      <div className="game-wrapper">
        {phase === 'recap' && (
          <div className="bracket-message">
            <h2>
              {resultat.verdict.emoji} {resultat.verdict.titre}
            </h2>
            <p className="subtitle">{resultat.verdict.soustitre}</p>
          </div>
        )}

        <ProgressBar
          total={QUESTIONS.length}
          repondues={choix.size}
          curseur={phase === 'recap' ? resultat.score : aiguille}
        />

        {/* Masquées pendant le jeu, révélées sous `switch-quiz-end`. */}
        <div className="progress-bar-captions">
          <span className="caption-left">Green Flag</span>
          <span className="caption-right">Red Flag</span>
        </div>

        {/* `flac.css` cache ce bloc hors de la phase de fin, et c'est lui qui
            porte la mise en forme de tout le récap : sortir le contenu d'ici,
            c'est perdre les drapeaux, les highlights et la pastille du score. */}
        <div className="finish-block">
          {phase === 'calcul' && <p className="loading-message">On compte les dégâts…</p>}
          {phase === 'recap' && <Recap resultat={resultat} onRecommencer={recommencer} />}
        </div>

        <div className="question-container">
          {phase === 'jeu' && (
            <div className="question-block" data-question={index}>
              <div className="prompt">
                <p>{question.texte}</p>
                {question.precision && <p className="prompt-helper">{question.precision}</p>}
              </div>
              <div className="button-container">
                {question.reponses.map((reponse) => (
                  <button
                    key={reponse.id}
                    type="button"
                    className={`button-answer${clique === reponse.id ? ' is-picked' : ''}`}
                    onClick={() => repondre(reponse)}
                  >
                    {reponse.texte}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Meter position={aiguille} />
    </>
  );
}

/**
 * La barre de progression : une cellule par question, plus le curseur
 * triangulaire qui glisse au-dessus.
 */
function ProgressBar({
  total,
  repondues,
  curseur,
}: {
  total: number;
  repondues: number;
  /** 0..100 — la position du curseur de score. */
  curseur: number;
}) {
  return (
    <div className="progress-bar">
      <div className="score-cursor" style={{ left: `${curseur}%` }} />
      <div className="rounded-wrapper">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`progress-bar-cell cell-${i + 1}${i < repondues ? ' cell-active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Le « redflag-o-meter », ancré en bas de l'écran.
 *
 * Il n'affiche jamais de nombre : tout l'effet du récap tient à ce que cinq
 * questions soient passées sans en montrer un seul. `flac.css` ne le rend
 * visible que sous `body.switch-quiz-ongoing`, donc sa disparition au moment du
 * calcul n'est pas pilotée ici.
 */
function Meter({ position }: { position: number }) {
  return (
    <div className="redflag-o-meter" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- markup de
          référence : `flac.css` dimensionne ces images par leur classe, et
          next/image réécrirait le src, ce qui ferait cesser de correspondre la
          feuille conforme. */}
      <img className="meter-bg" src="/rft/img/redflag-o-meter-bg.svg" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element -- idem. */}
      <img
        className="meter-cursor"
        src="/rft/img/cursor-triangle.svg"
        alt=""
        style={{ left: `${position}%` }}
      />
    </div>
  );
}
