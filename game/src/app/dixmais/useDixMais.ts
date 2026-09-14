'use client';

/**
 * @module dixmais/useDixMais
 * Machine à états de la manche.
 *
 * Séparé de l'affichage pour que la règle du jeu — la note *persiste* d'une
 * révélation à l'autre et n'est jamais ressaisie de zéro — soit lisible en un
 * seul endroit.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DixMaisStatement } from '@/types/database';
import { useHaptics } from '@/lib/hooks';
import { START_SCORE, clampScore } from './scale';
import { generateIdentity, type ProfileIdentity } from './profile';
import { computeEnding, readCommunityStat, readTrajectory } from './endings';
import { getProfile, saveProfile } from '@/lib/session';
import type { PlayerProfile } from '@/types/game';
import type { PlayedRound } from './report';

/** Fixé, et non plus aléatoire entre 5 et 9 : la carte de profil doit pouvoir
 * afficher **toutes** les révélations sans jamais en repousser une hors écran. */
export const REVEALS_PER_PROFILE = 5;

const COMMIT_MS = 620;
const COACH_KEY = 'dixmais.coached';
/**
 * Borne la liste d'exclusion. La contrainte réelle est la longueur de l'URL :
 * la liste part en paramètre de requête, à 37 caractères par UUID, et au-delà
 * d'environ 8 000 caractères la requête est rejetée — le joueur ne recevrait
 * plus aucun profil.
 *
 * Fixé au-dessus du nombre d'énoncés distincts du catalogue pour qu'une session
 * entière tienne dans la fenêtre : tant que le catalogue n'est pas réellement
 * parcouru, aucun énoncé déjà vu ne peut ressortir par éviction.
 */
const MAX_SEEN = 150;

/**
 * Nombre de fins récentes écartées au moment d'en choisir une nouvelle.
 *
 * Deux, et pas davantage : le plus petit groupe de fins interchangeables en
 * compte trois (les replis d'élimination). En écarter deux force la rotation
 * sans jamais vider le tirage ; en écarter trois le viderait, et la fin
 * repartirait au hasard — exactement ce qu'on cherche à éviter.
 */
const RECENT_ENDINGS = 2;

export type Phase = 'intro' | 'loading' | 'error' | 'reveal' | 'verdict' | 'report';

export interface Round {
  statements: DixMaisStatement[];
  identity: ProfileIdentity;
  ratings: number[];
  index: number;
}

export interface Flash {
  from: number;
  to: number;
  delta: number;
}

async function fetchStatements(count: number, excludeIds: string[]): Promise<DixMaisStatement[]> {
  const params = new URLSearchParams({ count: String(count) });
  if (excludeIds.length) params.set('exclude', excludeIds.join(','));
  const res = await fetch(`/api/dixmais/statements?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  return ((await res.json()).data ?? []) as DixMaisStatement[];
}

/** Tir et oubli : un vote perdu ne doit jamais interrompre une partie. */
function sendVote(
  statementId: string,
  sessionId: string,
  previous: number,
  next: number,
  profile: PlayerProfile | null,
) {
  fetch('/api/dixmais/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      statement_id: statementId,
      session_id: sessionId,
      previous_score: previous,
      new_score: next,
      // Le profil vient de l'enregistrement partagé avec les autres jeux : qui
      // a déjà joué au Pire des deux contribue à sa cohorte sans qu'on lui
      // redemande quoi que ce soit.
      sex: profile?.sex ?? null,
      age: profile?.age ?? null,
    }),
  }).catch(() => null);
}

/**
 * Fige une manche terminée : les phrases réellement lues, ce qu'elles ont
 * coûté, ce qu'elles coûtent aux autres, et la fin retenue.
 *
 * La fin est décidée ici plutôt que dans l'écran de verdict, pour deux
 * raisons : le rapport de session a besoin de la connaître, et le choix doit
 * tenir compte des fins déjà servies — ce que l'écran de verdict, qui ne voit
 * qu'une manche, ne peut pas faire.
 */
function closeRound(
  round: Round,
  ratings: number[],
  profileNumber: number,
  recentEndings: string[],
): PlayedRound {
  // L'élimination interrompt la manche : les phrases suivantes n'ont jamais
  // été montrées et ne doivent entrer dans aucune statistique.
  const played = round.statements.slice(0, ratings.length);
  const deltas = ratings.map((r, i) => r - (i === 0 ? START_SCORE : ratings[i - 1]));
  const stats = played.map(readCommunityStat);

  const summary = played.map((s) => ({
    id: s.id,
    text: s.text,
    type: s.type,
    category: s.category,
  }));

  const ending = computeEnding(
    {
      traj: readTrajectory(ratings),
      played: summary,
      deltas,
      community: stats.map((s) => s.avgDelta),
    },
    recentEndings,
  );

  return {
    profileNumber,
    name: round.identity.name,
    age: round.identity.age,
    played: summary,
    ratings,
    deltas,
    community: stats.map((s) => s.avgDelta),
    communityElim: stats.map((s) => s.eliminationRate),
    final: ratings.at(-1) ?? START_SCORE,
    eliminated: (ratings.at(-1) ?? START_SCORE) === 0,
    ending,
  };
}

export function useDixMais() {
  const haptics = useHaptics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState<Round | null>(null);
  const [draft, setDraftState] = useState(START_SCORE);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [shock, setShock] = useState(0);
  const [profileNumber, setProfileNumber] = useState(0);
  const [showCoach, setShowCoach] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  /** Toutes les manches terminées de la session, dans l'ordre. La dernière est
   * celle qu'affiche le verdict ; l'ensemble alimente le rapport. */
  const [history, setHistory] = useState<PlayedRound[]>([]);
  /** Sexe et tranche d'âge du joueur, partagés avec les autres jeux du site.
   * `null` tant qu'il ne les a pas donnés — le jeu se joue sans. */
  const [playerProfile, setPlayerProfileState] = useState<PlayerProfile | null>(null);

  const sessionId = useRef('');
  const seenIds = useRef<string[]>([]);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Jeton de chargement : un fetch dont le jeton a été périmé par un
   * redémarrage ne doit plus rien écrire. */
  const runId = useRef(0);
  /** Valeur courante de la jauge, lisible sans re-mémoïser les callbacks. */
  const draftRef = useRef(START_SCORE);
  const phaseRef = useRef<Phase>('intro');
  /** Clés des dernières fins servies, passées à `computeEnding` pour qu'il ne
   * les resserve pas tant qu'une autre est éligible. */
  const recentEndings = useRef<string[]>([]);
  /** Même valeur que `profileNumber`, lisible depuis `commit` sans l'ajouter à
   * ses dépendances — le rappeler à chaque changement de numéro recréerait le
   * callback au milieu d'une manche. */
  const profileNumberRef = useRef(0);
  /** Même valeur que `playerProfile`, lisible depuis `commit`. */
  const profileRef = useRef<PlayerProfile | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    sessionId.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      setShowCoach(localStorage.getItem(COACH_KEY) !== '1');
    } catch {
      setShowCoach(true);
    }

    const known = getProfile();
    if (known) {
      profileRef.current = known;
      setPlayerProfileState(known);
    }

    // Les confettis ne servent qu'à l'écran de fin : on les charge pendant un
    // temps mort plutôt que de figer l'animation au moment du verdict.
    const preload = () => { import('canvas-confetti').catch(() => {}); };
    const idle = typeof requestIdleCallback === 'function'
      ? requestIdleCallback(preload)
      : window.setTimeout(preload, 2000);

    return () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
      else clearTimeout(idle);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /** Note en vigueur avant la révélation en cours. C'est le point de départ du
   * curseur : le joueur ajuste une note existante, il n'en saisit pas une neuve. */
  const previousScore = round?.ratings.at(-1) ?? START_SCORE;

  const applyDraft = useCallback((value: number) => {
    draftRef.current = value;
    setDraftState(value);
  }, []);

  /** Une fois une note posée, l'aide ne réapparaît plus, y compris aux visites
   * suivantes. Volontairement appelée depuis `commit` et non depuis `setDraft` :
   * la faire disparaître au premier contact du doigt escamoterait le texte au
   * moment précis où le joueur exécute le geste qu'il décrit, et décalerait la
   * jauge sous son pouce. */
  const dismissCoach = useCallback(() => {
    setShowCoach((visible) => {
      if (visible) {
        try { localStorage.setItem(COACH_KEY, '1'); } catch { /* stockage indisponible */ }
      }
      return false;
    });
  }, []);

  const setDraft = useCallback((value: number) => {
    const next = clampScore(value);
    if (next === draftRef.current) return;
    draftRef.current = next;
    setDraftState(next);
    haptics.select();
  }, [haptics]);

  const loadProfile = useCallback(async () => {
    const myRun = ++runId.current;
    // Un échec au moment d'enchaîner ne doit pas détruire le verdict affiché.
    const fromVerdict = phaseRef.current === 'verdict';

    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    setLoadFailed(false);
    setPhase('loading');
    setFlash(null);

    const begin = (statements: DixMaisStatement[]) => {
      setRound({
        statements,
        identity: generateIdentity(statements.map((s) => s.text)),
        ratings: [],
        index: 0,
      });
      applyDraft(START_SCORE);
      profileNumberRef.current += 1;
      setProfileNumber(profileNumberRef.current);
      setPhase('reveal');
    };

    try {
      let statements = await fetchStatements(REVEALS_PER_PROFILE, seenIds.current);
      if (runId.current !== myRun) return;

      // Catalogue épuisé : ce n'est pas une panne, c'est un tour complet. On
      // repart de zéro plutôt que d'enfermer le joueur dans une fausse erreur
      // réseau que « Réessayer » ne pourrait jamais résoudre.
      if (!statements.length && seenIds.current.length) {
        seenIds.current = [];
        statements = await fetchStatements(REVEALS_PER_PROFILE, []);
        if (runId.current !== myRun) return;
      }

      if (!statements.length) throw new Error('empty');
      begin(statements);
    } catch {
      if (runId.current !== myRun) return;
      setLoadFailed(true);
      setPhase(fromVerdict ? 'verdict' : 'error');
    }
  }, [applyDraft]);

  const commit = useCallback(() => {
    if (locked.current || !round) return;
    locked.current = true;
    dismissCoach();

    const value = draftRef.current;
    const from = previousScore;
    const delta = value - from;
    const statement = round.statements[round.index];

    // Consigné ici, à la validation, et non au chargement du profil : une note
    // de 0 met fin à la manche sur le champ, et les énoncés suivants n'ont
    // jamais été montrés. Les marquer d'avance revenait à en condamner deux ou
    // trois par profil sans que le joueur les ait lus — le catalogue s'épuisait
    // deux fois plus vite qu'il n'était réellement parcouru, et le
    // redémarrage qui suit ramenait tout depuis le début.
    seenIds.current = [...seenIds.current, statement.id].slice(-MAX_SEEN);

    sendVote(statement.id, sessionId.current, from, value, profileRef.current);

    if (value === 0) haptics.error();
    else if (delta <= -3) haptics.success();
    else haptics.tap();

    setFlash({ from, to: value, delta });
    if (delta <= -3) setShock((n) => n + 1);

    const ratings = [...round.ratings, value];
    const isLast = round.index >= round.statements.length - 1;

    timer.current = setTimeout(() => {
      setFlash(null);
      locked.current = false;

      if (value === 0 || isLast) {
        // Calculé ici et non dans une fonction de mise à jour d'état : choisir
        // la fin met à jour `recentEndings`, et React réexécute ces fonctions
        // en mode strict — la clé y serait empilée deux fois.
        const finished = closeRound(round, ratings, profileNumberRef.current, recentEndings.current);
        recentEndings.current = [...recentEndings.current, finished.ending.key].slice(-RECENT_ENDINGS);

        setRound((r) => (r ? { ...r, ratings } : r));
        setHistory((h) => [...h, finished]);
        setPhase('verdict');
      } else {
        setRound((r) => (r ? { ...r, ratings, index: r.index + 1 } : r));
        // Le curseur reste sur la note qui vient d'être posée : la note suivante
        // part de là, pas de 10.
        applyDraft(value);
      }
    }, COMMIT_MS);
  }, [round, previousScore, haptics, dismissCoach, applyDraft]);

  const restart = useCallback(() => {
    runId.current += 1; // périme tout chargement encore en vol
    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    seenIds.current = [];
    recentEndings.current = [];
    profileNumberRef.current = 0;
    setRound(null);
    setProfileNumber(0);
    setHistory([]);
    setFlash(null);
    setLoadFailed(false);
    applyDraft(START_SCORE);
    setPhase('intro');
  }, [applyDraft]);

  /** Le rapport n'est atteignable que depuis le verdict : on y revient. */
  const openReport = useCallback(() => setPhase('report'), []);
  const closeReport = useCallback(() => setPhase('verdict'), []);

  /**
   * Le profil vaut pour les votes **suivants** seulement : ceux déjà envoyés
   * sont partis anonymes, et les renvoyer créerait des doublons. Sur une
   * soirée, la cohorte se remplit donc à partir du moment où le joueur répond.
   */
  const setPlayerProfile = useCallback((profile: PlayerProfile) => {
    profileRef.current = profile;
    setPlayerProfileState(profile);
    saveProfile(profile);
  }, []);

  /** Teinte du fond : suit le doigt pendant la notation, se fige sur la note
   * finale au verdict. Le rapport garde la teinte du dernier verdict plutôt
   * que de repasser au vert de départ le temps d'un aller-retour. */
  const ambientScore =
    phase === 'verdict' || phase === 'report' ? (round?.ratings.at(-1) ?? START_SCORE)
    : phase === 'reveal' ? draft
    : START_SCORE;

  return {
    phase,
    round,
    draft,
    setDraft,
    previousScore,
    commit,
    flash,
    shock,
    ambientScore,
    profileNumber,
    showCoach,
    loadFailed,
    history,
    playerProfile,
    setPlayerProfile,
    start: loadProfile,
    nextProfile: loadProfile,
    restart,
    openReport,
    closeReport,
    /** Verrouille la jauge pendant l'animation de validation. Dérivé de `flash`,
     * qui est un état : la ref `locked` ne provoquerait aucun rendu. */
    locked: flash !== null,
  };
}
