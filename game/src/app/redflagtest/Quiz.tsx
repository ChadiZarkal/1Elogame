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
 * CE QUE CE COMPOSANT NE SAIT PAS, ET NE DOIT PAS SAVOIR
 *   Les points. Le serveur envoie un `indice` de 0 à 2 par réponse, qui suffit
 *   à faire bouger l'aiguille dans le bon sens et ne permet pas de reconstituer
 *   le barème. Le score est calculé à la soumission, à partir des seuls
 *   identifiants de réponses.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSession, initSession } from '@/lib/session';
import { avancerAiguille } from '@/lib/rft/score';
import type { PlayerProfile } from '@/types/game';
import type { Indice, QuestionPublique, Resultat, Verdict } from '@/lib/rft/types';
import { ProfilStep } from './ProfilStep';
import { Recap } from './Recap';
import {
  enregistrer,
  oublier,
  reprendre,
  reprendreA,
  type Choix,
  type PartieEnCours,
} from './partieEnCours';

type Phase = 'chargement' | 'profil' | 'reprise' | 'jeu' | 'calcul' | 'recap' | 'erreur';

/** La classe que `flac.css` attend sur <body> pour chaque phase. */
const CLASSE_BODY: Partial<Record<Phase, string>> = {
  jeu: 'switch-quiz-ongoing',
  calcul: 'switch-loading',
  recap: 'switch-quiz-end',
  chargement: 'switch-loading',
};

const TOUTES_LES_CLASSES = ['switch-quiz-ongoing', 'switch-loading', 'switch-quiz-end'];

interface QuizCharge {
  questions: QuestionPublique[];
  verdicts: Verdict[];
}

/**
 * Rejoue les réponses reprises pour retrouver la position de l'aiguille.
 *
 * Elle n'est pas sauvegardée : elle se déduit des réponses, et un état dupliqué
 * est un état qui finit par se contredire.
 */
function aiguillePour(questions: QuestionPublique[], choix: Choix[]): number {
  const indices = new Map<string, Indice>();
  for (const q of questions) {
    for (const r of q.reponses) indices.set(r.id, r.indice);
  }
  return choix.reduce(
    (position, c) => avancerAiguille(position, indices.get(c.answerId) ?? 1, questions.length),
    50,
  );
}

export function Quiz() {
  const [phase, setPhase] = useState<Phase>('chargement');
  const [quiz, setQuiz] = useState<QuizCharge | null>(null);
  const [profil, setProfil] = useState<PlayerProfile | null>(null);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<Choix[]>([]);
  const [clique, setClique] = useState<string | null>(null);
  const [aiguille, setAiguille] = useState(50);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [message, setMessage] = useState('');
  const [debut, setDebut] = useState<number | null>(null);
  /** La partie interrompue proposée à la reprise, le temps que le joueur tranche. */
  const [enAttente, setEnAttente] = useState<PartieEnCours | null>(null);

  // Pousser un état dans le DOM est la seule chose pour laquelle un effet est
  // réellement fait.
  useEffect(() => {
    document.body.classList.remove(...TOUTES_LES_CLASSES);
    const voulue = CLASSE_BODY[phase];
    if (voulue) document.body.classList.add(voulue);
    return () => document.body.classList.remove(...TOUTES_LES_CLASSES);
  }, [phase]);

  /** Entrer en partie, ou proposer de reprendre celle qui traîne. */
  const entrer = useCallback((questions: QuestionPublique[]) => {
    const interrompue = reprendre(questions);
    if (interrompue) {
      setEnAttente(interrompue);
      setPhase('reprise');
      return;
    }
    setDebut(Date.now());
    setPhase('jeu');
  }, []);

  useEffect(() => {
    let vivant = true;

    (async () => {
      try {
        const reponse = await fetch('/api/redflagtest/quiz');
        const json = await reponse.json();
        if (!vivant) return;

        if (!json.success) {
          setMessage(json.error?.message ?? 'Le test n’a pas pu être chargé.');
          setPhase('erreur');
          return;
        }
        if (json.data.questions.length === 0) {
          setMessage('Le test n’a pas encore de questions.');
          setPhase('erreur');
          return;
        }

        setQuiz({ questions: json.data.questions, verdicts: json.data.verdicts });

        // Le profil du site, donné une fois pour tous les jeux.
        const connu = getSession()?.profile ?? null;
        if (connu) {
          setProfil(connu);
          entrer(json.data.questions);
        } else {
          setPhase('profil');
        }
      } catch {
        if (!vivant) return;
        setMessage('Connexion perdue.');
        setPhase('erreur');
      }
    })();

    return () => { vivant = false; };
  }, [entrer]);

  const demarrer = (choisi: PlayerProfile) => {
    setProfil(choisi);
    // Enregistré comme session de site : les autres jeux le retrouveront.
    initSession(choisi);
    if (quiz) entrer(quiz.questions);
  };

  const reprendrePartie = () => {
    if (!quiz || !enAttente) return;
    setChoix(enAttente.choix);
    setIndex(reprendreA(quiz.questions, enAttente.choix));
    setAiguille(aiguillePour(quiz.questions, enAttente.choix));
    setDebut(enAttente.debut);
    setEnAttente(null);
    setPhase('jeu');
  };

  const repartirDeZero = () => {
    oublier();
    setEnAttente(null);
    setChoix([]);
    setIndex(0);
    setAiguille(50);
    setDebut(Date.now());
    setPhase('jeu');
  };

  const envoyer = useCallback(
    async (finaux: Choix[], qui: PlayerProfile | null, depuis: number | null) => {
      setPhase('calcul');
      // La partie est allée au bout : la sauvegarde n'a plus lieu d'être, et la
      // garder ferait proposer une reprise à quelqu'un qui a déjà son résultat.
      oublier();
      try {
        const reponse = await fetch('/api/redflagtest/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            choix: finaux,
            sexe: qui?.sex ?? null,
            age: qui?.age ?? null,
            dureeMs: depuis ? Date.now() - depuis : null,
          }),
        });
        const json = await reponse.json();
        if (!json.success) {
          setMessage(json.error?.message ?? 'Ton résultat n’a pas pu être calculé.');
          setPhase('erreur');
          return;
        }
        setResultat(json.data);
        setPhase('recap');
      } catch {
        setMessage('Connexion perdue. Ton résultat n’a pas pu être calculé.');
        setPhase('erreur');
      }
    },
    [],
  );

  const repondre = useCallback(
    (question: QuestionPublique, reponse: QuestionPublique['reponses'][number]) => {
      if (!quiz || clique) return; // Le temps de l'animation, un deuxième clic ne compte pas.
      setClique(reponse.id);

      const suivants = [
        ...choix.filter((c) => c.questionId !== question.id),
        { questionId: question.id, answerId: reponse.id },
      ];
      setChoix(suivants);
      setAiguille((p) => avancerAiguille(p, reponse.indice, quiz.questions.length));

      const depuis = debut ?? Date.now();
      if (debut === null) setDebut(depuis);
      // Sauvegardé à chaque réponse : c'est la seule façon de ne rien perdre
      // d'une interruption qui, par définition, ne prévient pas.
      enregistrer({ choix: suivants, debut: depuis, maj: Date.now() });

      setTimeout(() => {
        setClique(null);
        if (suivants.length >= quiz.questions.length) void envoyer(suivants, profil, depuis);
        else setIndex(reprendreA(quiz.questions, suivants));
      }, 220);
    },
    [quiz, clique, choix, debut, profil, envoyer],
  );

  const recommencer = () => {
    oublier();
    setChoix([]);
    setIndex(0);
    setClique(null);
    setAiguille(50);
    setResultat(null);
    setDebut(Date.now());
    setPhase('jeu');
  };

  if (phase === 'chargement') {
    return <p className="loading-message">Chargement…</p>;
  }

  if (phase === 'erreur') {
    return (
      <div className="error-message">
        <p>{message}</p>
        <Link href="/">Revenir à l’accueil</Link>
      </div>
    );
  }

  if (phase === 'profil') {
    return <ProfilStep onDemarrer={demarrer} />;
  }

  if (phase === 'reprise' && quiz && enAttente) {
    return (
      <Reprise
        repondues={enAttente.choix.length}
        total={quiz.questions.length}
        onReprendre={reprendrePartie}
        onRecommencer={repartirDeZero}
      />
    );
  }

  const question = quiz?.questions[index];

  return (
    <>
      <div className="game-wrapper">
        {phase === 'recap' && resultat?.verdict && (
          <div className="bracket-message">
            <h2>
              {resultat.verdict.emoji} {resultat.verdict.titre}
            </h2>
            {resultat.verdict.soustitre && (
              <p className="subtitle">{resultat.verdict.soustitre}</p>
            )}
          </div>
        )}

        <ProgressBar
          total={quiz?.questions.length ?? 0}
          repondues={choix.length}
          // `null` pendant la partie : voir l'en-tête de ProgressBar.
          curseur={phase === 'recap' && resultat ? Math.min(100, resultat.score) : null}
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
          {phase === 'recap' && resultat && (
            <Recap resultat={resultat} profil={profil} onRecommencer={recommencer} />
          )}
        </div>

        <div className="question-container">
          {phase === 'jeu' && question && (
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
                    onClick={() => repondre(question, reponse)}
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
 * L'écran de reprise.
 *
 * Il n'apparaît qu'au-delà de trois réponses enregistrées : en deçà, il coûte
 * un écran de plus pour économiser quatre secondes, et le joueur perd au
 * change. « Recommencer » est proposé au même endroit, parce qu'une reprise
 * imposée à quelqu'un qui voulait repartir de zéro est une impasse.
 */
function Reprise({
  repondues, total, onReprendre, onRecommencer,
}: {
  repondues: number;
  total: number;
  onReprendre: () => void;
  onRecommencer: () => void;
}) {
  return (
    <section className="intro-wrapper">
      <h2>Tu avais commencé</h2>
      <div className="intro-form">
        <p className="intro-note">
          Tu en étais à <strong>{repondues} / {total}</strong>. On reprend où tu t’es arrêté ?
        </p>
        <button type="button" className="button-start" onClick={onReprendre}>
          Reprendre
        </button>
        <button type="button" className="button-back" onClick={onRecommencer}>
          Recommencer depuis le début
        </button>
      </div>
    </section>
  );
}

/**
 * La barre, qui a deux vies.
 *
 * PENDANT LA PARTIE c'est une barre de progression : une cellule par question,
 * qui se remplit en rouge. Pas de curseur.
 *
 * AU RÉCAP elle devient une échelle Green Flag → Red Flag, et le curseur
 * triangulaire y glisse jusqu'au score en une seconde et demie. C'est bien la
 * lecture voulue par la feuille de référence : les légendes « Green Flag » et
 * « Red Flag » n'apparaissent que sous `switch-quiz-end`, et la transition de
 * 1 500 ms du curseur est une révélation, pas un suivi en direct.
 *
 * Le curseur avait d'abord été branché sur l'aiguille pendant toute la partie.
 * Il faisait alors doublon avec le mesureur du bas, qui dit déjà exactement
 * cela — et surtout, posé sur une barre qui compte les questions, il se lisait
 * comme un « tu es ici » alors qu'il annonçait un score provisoire.
 */
function ProgressBar({
  total, repondues, curseur,
}: { total: number; repondues: number; curseur: number | null }) {
  return (
    <div className="progress-bar">
      {curseur !== null && <ScoreCursor valeur={curseur} />}
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
 * Le curseur, qui entre par la gauche et rejoint le score en une seconde et
 * demie — la transition que `flac.css` lui donne.
 *
 * Il est monté à zéro puis déplacé à la première image : posé d'emblée à sa
 * valeur finale, il apparaîtrait sur place et la transition n'aurait rien à
 * animer. C'est un composant à part précisément pour cela — il naît avec la
 * phase de fin, donc son état de départ est zéro sans qu'on ait à le remettre à
 * zéro.
 */
function ScoreCursor({ valeur }: { valeur: number }) {
  const [pose, setPose] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPose(valeur));
    return () => cancelAnimationFrame(frame);
  }, [valeur]);

  return <div className="score-cursor" style={{ left: `${pose}%` }} />;
}

/**
 * Le « redflag-o-meter », ancré en bas de l'écran.
 *
 * Il n'affiche jamais de nombre : tout l'effet du récap tient à ce que les
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
