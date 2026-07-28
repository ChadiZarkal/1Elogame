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

/** Fixé, et non plus aléatoire entre 5 et 9 : la carte de profil doit pouvoir
 * afficher **toutes** les révélations sans jamais en repousser une hors écran. */
export const REVEALS_PER_PROFILE = 5;

const COMMIT_MS = 900;
const COACH_KEY = 'dixmais.coached';

export type Phase = 'intro' | 'loading' | 'error' | 'reveal' | 'verdict';

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
function sendVote(statementId: string, sessionId: string, previous: number, next: number) {
  fetch('/api/dixmais/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      statement_id: statementId,
      session_id: sessionId,
      previous_score: previous,
      new_score: next,
    }),
  }).catch(() => null);
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

  const sessionId = useRef('');
  const seenIds = useRef<Set<string>>(new Set());
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /** La première note posée vaut apprentissage : l'aide ne réapparaît plus,
   * y compris aux prochaines visites. */
  const dismissCoach = useCallback(() => {
    setShowCoach(false);
    try { localStorage.setItem(COACH_KEY, '1'); } catch { /* stockage indisponible */ }
  }, []);

  const setDraft = useCallback((value: number) => {
    const next = clampScore(value);
    setDraftState((current) => {
      if (current !== next) haptics.select();
      return next;
    });
    dismissCoach();
  }, [haptics, dismissCoach]);

  const loadProfile = useCallback(async () => {
    setPhase('loading');
    setFlash(null);
    try {
      const statements = await fetchStatements(
        REVEALS_PER_PROFILE,
        Array.from(seenIds.current),
      );
      if (!statements.length) throw new Error('empty');

      statements.forEach((s) => seenIds.current.add(s.id));

      setRound({
        statements,
        identity: generateIdentity(statements.map((s) => s.text)),
        ratings: [],
        index: 0,
      });
      setDraftState(START_SCORE);
      setProfileNumber((n) => n + 1);
      setPhase('reveal');
    } catch {
      setPhase('error');
    }
  }, []);

  const commit = useCallback(() => {
    if (locked.current || !round) return;
    locked.current = true;
    dismissCoach();

    const value = draft;
    const from = previousScore;
    const delta = value - from;
    const statement = round.statements[round.index];

    sendVote(statement.id, sessionId.current, from, value);

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
        setRound({ ...round, ratings });
        setPhase('verdict');
      } else {
        setRound({ ...round, ratings, index: round.index + 1 });
        // Le curseur reste sur la note qui vient d'être posée : la note suivante
        // part de là, pas de 10.
        setDraftState(value);
      }
    }, COMMIT_MS);
  }, [round, draft, previousScore, haptics, dismissCoach]);

  const restart = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    seenIds.current = new Set();
    setRound(null);
    setProfileNumber(0);
    setFlash(null);
    setDraftState(START_SCORE);
    setPhase('intro');
  }, []);

  /** Teinte du fond : suit le doigt pendant la notation, se fige sur la note
   * finale au verdict. */
  const ambientScore =
    phase === 'verdict' ? (round?.ratings.at(-1) ?? START_SCORE)
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
    start: loadProfile,
    nextProfile: loadProfile,
    restart,
    /** Verrouille la jauge pendant l'animation de validation. Dérivé de `flash`,
     * qui est un état : la ref `locked` ne provoquerait aucun rendu. */
    locked: flash !== null,
  };
}
