'use client';

/**
 * @module lib/adConsent
 * Choix de l'utilisateur sur la publicité, et sa persistance.
 *
 * Pourquoi ce module existe : les CGU et la politique de confidentialité du
 * site affirment noir sur blanc qu'« un message de consentement serait présenté
 * au préalable » avant toute diffusion d'annonces. Charger la régie sans lui
 * rendrait ces deux pages fausses, en plus de l'exposition réglementaire — le
 * site est français et s'adresse à un public de l'Espace économique européen,
 * où le dépôt de traceurs publicitaires réclame un accord *préalable*.
 *
 * D'où l'ordre imposé par ce module : aucun script tiers n'est inséré avant que
 * `granted` ne soit stocké. Un refus est définitif et vaut pour toute la
 * navigation suivante.
 *
 * Le patron est celui de `lib/hooks.ts` : `useSyncExternalStore` plutôt qu'un
 * `useState` initialisé dans un effet. Lire `localStorage` au premier rendu
 * casserait le rendu serveur, et l'écrire depuis un effet déclenche la règle
 * `react-hooks/set-state-in-effect`.
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'rog:ad-consent';

/**
 * `pending` est l'état du rendu serveur et du premier rendu client, avant
 * lecture du stockage. Il est distinct de `unknown` — « la personne n'a pas
 * encore répondu » — et c'est cette distinction qui évite deux défauts : un
 * écart d'hydratation, et le clignotement du bandeau chez quelqu'un qui a déjà
 * répondu. Ni le bandeau ni les encarts ne s'affichent tant qu'on est `pending`.
 */
export type AdConsent = 'pending' | 'unknown' | 'granted' | 'denied';

type Answer = Extract<AdConsent, 'granted' | 'denied'>;

const listeners = new Set<() => void>();

/**
 * Mémoïsation obligatoire, pas une optimisation : `getSnapshot` est appelé
 * plusieurs fois par rendu et React exige une valeur stable entre deux appels.
 */
let cached: AdConsent | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  /* Un autre onglet a pu répondre entre-temps : `storage` ne se déclenche que
     dans les *autres* onglets, ce qui est précisément le cas à couvrir. */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    cached = null;
    listener();
  };
  window.addEventListener('storage', onStorage);

  /* Rien à signaler ici : après l'hydratation, React relit `getSnapshot` de
     lui-même et rejoue le rendu si la valeur diffère de l'instantané serveur.
     C'est ce qui fait sortir de `pending` sans qu'on s'en occupe — vérifié dans
     le navigateur, la demande d'accord apparaît bien après l'hydratation. */
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): AdConsent {
  if (cached !== null) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    cached = stored === 'granted' || stored === 'denied' ? stored : 'unknown';
  } catch {
    /* Navigation privée, stockage refusé : on ne peut pas garder la trace d'un
       accord, donc on ne peut pas le considérer comme donné. */
    cached = 'unknown';
  }
  return cached;
}

function getServerSnapshot(): AdConsent {
  return 'pending';
}

/** Enregistre la réponse et réveille tous les abonnés. */
export function setAdConsent(answer: Answer) {
  cached = answer;
  try {
    localStorage.setItem(STORAGE_KEY, answer);
  } catch {
    /* Sans stockage la réponse ne vaut que pour cette page. C'est le maximum
       possible, et le sens du refus est préservé. */
  }
  notify();
}

/**
 * Ramène à `unknown` pour que le bandeau soit reposé. Sert au lien « gérer mes
 * préférences » de la politique de confidentialité : un accord qu'on ne peut
 * pas retirer n'est pas un accord.
 */
export function resetAdConsent() {
  cached = 'unknown';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Rien à retirer si rien n'a pu être écrit. */
  }
  notify();
}

export function useAdConsent(): AdConsent {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
