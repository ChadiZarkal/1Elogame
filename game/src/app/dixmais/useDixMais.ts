'use client';

/**
 * @module dixmais/useDixMais
 * Machine à états de la manche.
 *
 * La règle tient en deux lignes : chaque révélation se note **seule**, de 0 à
 * 15, en repartant de 10 — un red flag fait descendre, un green flag peut
 * faire dépasser 10 ; et à la cinquième, la personne reçoit la moyenne des
 * cinq. Le calcul est dans `moyenne.ts`, l'affichage dans les écrans — ce
 * fichier ne fait qu'enchaîner.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DixMaisStatement } from '@/types/database';
import { useHaptics } from '@/lib/hooks';
import { START_SCORE, clampScore } from './scale';
import { generateIdentity, type ProfileIdentity } from './profile';
import {
  GREEN_FLAGS_PAR_PROFIL,
  PROPOSITIONS_PAR_PROFIL,
  choisirFin,
  moyenneDe,
  moyenneDesAutres,
  noteDesAutres,
  type ProfilJuge,
} from './moyenne';
import { getProfile, saveProfile } from '@/lib/session';
import type { PlayerProfile } from '@/types/game';

/**
 * Chaque note part au serveur, qui l'enregistre dans sa propre table
 * (`dixmais_notes`, migration 030) — jamais avec les votes de l'ancienne
 * mécanique, qui mesuraient autre chose.
 *
 * Tant que la migration n'est pas jouée, le serveur répond sans rien écrire :
 * le jeu n'en sait rien et n'a pas à le savoir.
 */
export const ENREGISTRER_NOTES = true;

const COMMIT_MS = 560;
const COACH_KEY = 'dixmais.coached.moyenne';
/** Borne la liste d'exclusion, qui part en paramètre d'URL (voir l'API). */
const MAX_SEEN = 150;
/** Fins récentes écartées au moment d'en choisir une nouvelle. */
const RECENT_ENDINGS = 2;

export type Phase = 'intro' | 'profile' | 'loading' | 'error' | 'reveal' | 'verdict' | 'report';

export interface Round {
  statements: DixMaisStatement[];
  identity: ProfileIdentity;
  /** La note de chaque révélation déjà jugée. */
  notes: number[];
  index: number;
}

/** Bilan d'un coup : la note posée, et la moyenne qu'elle donne. */
export interface Flash {
  note: number;
  moyenne: number;
}

async function fetchStatements(count: number, excludeIds: string[]): Promise<DixMaisStatement[]> {
  // Trois red flags, deux green flags : la jauge va jusqu'à 15, une qualité
  // peut donc rapporter plus que le 10 de départ.
  const params = new URLSearchParams({ count: String(count), verts: String(GREEN_FLAGS_PAR_PROFIL) });
  if (excludeIds.length) params.set('exclude', excludeIds.join(','));
  const res = await fetch(`/api/dixmais/statements?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('fetch failed');
  return ((await res.json()).data ?? []) as DixMaisStatement[];
}

/** Tir et oubli : une note perdue ne doit jamais interrompre une partie. */
function sendNote(statementId: string, sessionId: string, note: number, profile: PlayerProfile | null) {
  if (!ENREGISTRER_NOTES) return;
  fetch('/api/dixmais/note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // `keepalive` : la dernière note d'un profil part juste avant l'écran de
    // verdict, parfois juste avant que le joueur ne quitte la page.
    keepalive: true,
    body: JSON.stringify({
      statement_id: statementId,
      session_id: sessionId,
      note,
      // Le profil vient de l'enregistrement partagé avec les autres jeux.
      sex: profile?.sex ?? null,
      age: profile?.age ?? null,
    }),
  }).catch(() => null);
}

/** Fige un profil jugé : ses cinq notes, sa moyenne, ce qu'en pensent les
 * autres, et la fin retenue. */
export function closeRound(
  round: Round,
  notes: number[],
  numero: number,
  recentEndings: string[],
): ProfilJuge {
  const jouees = round.statements.slice(0, notes.length);
  const propositions = jouees.map((s) => ({
    id: s.id,
    text: s.text,
    type: s.type,
    category: s.category,
  }));
  const communaute = jouees.map(noteDesAutres);
  const moyenne = moyenneDe(notes);
  const moyenneCommunaute = moyenneDesAutres(communaute);

  return {
    numero,
    nom: round.identity.name,
    age: round.identity.age,
    initiale: round.identity.initial,
    teinte: round.identity.hue,
    propositions,
    notes,
    communaute,
    moyenne,
    moyenneCommunaute,
    fin: choisirFin(
      { propositions, notes, moyenne, moyenneCommunaute, pronom: round.identity.pronoun },
      recentEndings,
    ),
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
  /** Tous les profils jugés de la session, dans l'ordre. */
  const [history, setHistory] = useState<ProfilJuge[]>([]);
  /** Sexe et tranche d'âge du joueur, partagés avec les autres jeux du site. */
  const [playerProfile, setPlayerProfileState] = useState<PlayerProfile | null>(null);
  /** L'enregistrement local a été consulté — évite de montrer le
   * questionnaire le temps d'une image à qui a déjà répondu. */
  const [profileChecked, setProfileChecked] = useState(false);

  const sessionId = useRef('');
  const seenIds = useRef<string[]>([]);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Jeton de chargement : un fetch périmé par un redémarrage n'écrit plus rien. */
  const runId = useRef(0);
  const draftRef = useRef(START_SCORE);
  const phaseRef = useRef<Phase>('intro');
  const recentEndings = useRef<string[]>([]);
  const profileNumberRef = useRef(0);
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
    setProfileChecked(true);

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

  const applyDraft = useCallback((value: number) => {
    draftRef.current = value;
    setDraftState(value);
  }, []);

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
    const fromVerdict = phaseRef.current === 'verdict' || phaseRef.current === 'report';

    if (timer.current) clearTimeout(timer.current);
    locked.current = false;
    setLoadFailed(false);
    setPhase('loading');
    setFlash(null);

    const begin = (statements: DixMaisStatement[]) => {
      setRound({
        statements,
        identity: generateIdentity(statements.map((s) => s.text)),
        notes: [],
        index: 0,
      });
      applyDraft(START_SCORE);
      profileNumberRef.current += 1;
      setProfileNumber(profileNumberRef.current);
      setPhase('reveal');
    };

    try {
      let statements = await fetchStatements(PROPOSITIONS_PAR_PROFIL, seenIds.current);
      if (runId.current !== myRun) return;

      // Catalogue épuisé : un tour complet, pas une panne. On repart du début.
      if (!statements.length && seenIds.current.length) {
        seenIds.current = [];
        statements = await fetchStatements(PROPOSITIONS_PAR_PROFIL, []);
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

    const note = draftRef.current;
    const statement = round.statements[round.index];
    const notes = [...round.notes, note];
    const moyenne = moyenneDe(notes);

    seenIds.current = [...seenIds.current, statement.id].slice(-MAX_SEEN);
    sendNote(statement.id, sessionId.current, note, profileRef.current);

    if (note === 0) haptics.error();
    else if (note <= 3) haptics.success();
    else haptics.tap();

    setFlash({ note, moyenne });
    if (note <= 2) setShock((n) => n + 1);

    const isLast = round.index >= round.statements.length - 1;

    timer.current = setTimeout(() => {
      setFlash(null);
      locked.current = false;

      if (isLast) {
        // Calculé hors d'une fonction de mise à jour : choisir la fin met à
        // jour `recentEndings`, et le mode strict rejoue ces fonctions.
        const juge = closeRound(round, notes, profileNumberRef.current, recentEndings.current);
        recentEndings.current = [...recentEndings.current, juge.fin.key].slice(-RECENT_ENDINGS);

        setRound((r) => (r ? { ...r, notes } : r));
        setHistory((h) => [...h, juge]);
        setPhase('verdict');
      } else {
        setRound((r) => (r ? { ...r, notes, index: r.index + 1 } : r));
        // Chaque révélation se juge seule : la jauge repart de 10.
        applyDraft(START_SCORE);
      }
    }, COMMIT_MS);
  }, [round, haptics, dismissCoach, applyDraft]);

  const restart = useCallback(() => {
    runId.current += 1;
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

  const openReport = useCallback(() => setPhase('report'), []);
  /** Identifiant de la session, lu à la demande : le bilan l'envoie pour que
   * ses propres notes ne comptent pas dans sa cohorte. */
  const getSessionId = useCallback(() => sessionId.current, []);
  const closeReport = useCallback(() => setPhase('verdict'), []);

  const setPlayerProfile = useCallback((profile: PlayerProfile) => {
    profileRef.current = profile;
    setPlayerProfileState(profile);
    saveProfile(profile);
  }, []);

  /** « Jouer » : l'étape de profil seulement si on ne le connaît pas. */
  const start = useCallback(() => {
    if (profileRef.current) {
      void loadProfile();
      return;
    }
    setPhase('profile');
  }, [loadProfile]);

  const submitProfile = useCallback((profile: PlayerProfile) => {
    setPlayerProfile(profile);
    void loadProfile();
  }, [setPlayerProfile, loadProfile]);

  const lastJudged = history.at(-1) ?? null;

  /** Teinte du fond : suit le doigt pendant la notation, puis la moyenne. */
  const ambientScore =
    (phase === 'verdict' || phase === 'report') && lastJudged ? lastJudged.moyenne
    : phase === 'reveal' ? draft
    : START_SCORE;

  /** Moyenne en cours du profil, `null` avant la première note. */
  const runningAverage = round && round.notes.length ? moyenneDe(round.notes) : null;

  return {
    phase,
    round,
    draft,
    setDraft,
    commit,
    flash,
    shock,
    ambientScore,
    runningAverage,
    profileNumber,
    showCoach,
    loadFailed,
    history,
    playerProfile,
    profileChecked,
    setPlayerProfile,
    submitProfile,
    start,
    nextProfile: loadProfile,
    restart,
    openReport,
    closeReport,
    getSessionId,
    /** Verrouille la jauge pendant l'animation de validation. */
    locked: flash !== null,
  };
}
