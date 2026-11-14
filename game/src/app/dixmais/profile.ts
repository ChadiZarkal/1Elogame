/**
 * @module dixmais/profile
 * Identité du profil noté.
 *
 * Le jeu échouait à faire comprendre que les révélations décrivent **une seule
 * personne** : sans nom ni visage, chaque phrase passait pour une question
 * indépendante. Donner un prénom, un âge et un monogramme au profil ancre le
 * fait qu'on note quelqu'un, pas une phrase.
 *
 * Purement client, généré une fois par manche.
 */

import type { Langue } from '@/lib/i18n/langue';

const MASCULINE = [
  'Lucas', 'Enzo', 'Nathan', 'Théo', 'Hugo', 'Raphaël', 'Mattéo', 'Gabriel',
  'Noah', 'Ethan', 'Adam', 'Jules', 'Liam', 'Sacha', 'Yanis', 'Ilyes',
  'Maxime', 'Antoine', 'Clément', 'Baptiste',
];

const FEMININE = [
  'Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Léa', 'Manon', 'Inès',
  'Camille', 'Sarah', 'Zoé', 'Lina', 'Anaïs', 'Maëlys', 'Romane', 'Clara',
  'Juliette', 'Lou', 'Nina', 'Eva',
];

/** Les prénoms de la page anglaise : des prénoms courants aux États-Unis, pour
 * qu'un « Maëlys, 23 » ne signale pas un jeu traduit. */
const MASCULINE_EN = [
  'Jake', 'Ethan', 'Noah', 'Liam', 'Mason', 'Logan', 'Lucas', 'Owen',
  'Ryan', 'Tyler', 'Dylan', 'Nathan', 'Caleb', 'Jack', 'Max', 'Luke',
  'Evan', 'Austin', 'Connor', 'Brandon',
];

const FEMININE_EN = [
  'Emma', 'Olivia', 'Ava', 'Mia', 'Chloe', 'Zoe', 'Lily', 'Grace',
  'Ella', 'Sophie', 'Madison', 'Harper', 'Riley', 'Hannah', 'Abby', 'Nora',
  'Lucy', 'Ruby', 'Maya', 'Sarah',
];

/** Teintes du monogramme — volontairement froides, pour ne pas concurrencer
 * l'or du titre ni le rouge de l'élimination. */
const HUES = [212, 258, 288, 322, 190, 168];

export interface ProfileIdentity {
  name: string;
  age: number;
  initial: string;
  hue: number;
  /** `il` / `elle` — accorde les libellés d'interface aux phrases tirées. */
  pronoun: 'il' | 'elle';
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Déduit le genre des phrases elles-mêmes plutôt que de le supposer : la base
 * est majoritairement au masculin, mais rien ne le garantit.
 */
function detectPronoun(texts: string[], langue: Langue): 'il' | 'elle' {
  // En anglais, les phrases arrivent traduites (« She… ») ; une phrase restée
  // en français faute de traduction compte encore.
  const feminin = langue === 'en' ? /^\s*(?:she|elle)\b/i : /^\s*elle\b/i;
  let feminine = 0;
  for (const t of texts) {
    if (feminin.test(t)) feminine += 1;
  }
  return feminine > texts.length / 2 ? 'elle' : 'il';
}

export function generateIdentity(texts: string[], langue: Langue = 'fr'): ProfileIdentity {
  const pronoun = detectPronoun(texts, langue);
  const name = langue === 'en'
    ? pick(pronoun === 'elle' ? FEMININE_EN : MASCULINE_EN)
    : pick(pronoun === 'elle' ? FEMININE : MASCULINE);
  return {
    name,
    age: 19 + Math.floor(Math.random() * 9), // 19-27
    initial: name.charAt(0).toUpperCase(),
    hue: pick(HUES),
    pronoun,
  };
}

/**
 * Connecteur entre deux révélations.
 * Même polarité → « ET » (l'accusation s'empile). Polarité opposée → « MAIS »
 * (le contraste). La suite des cartes se lit alors comme une seule phrase.
 */
export function connectorFor(
  previousType: 'positive' | 'negative',
  currentType: 'positive' | 'negative',
): 'ET' | 'MAIS' {
  return previousType === currentType ? 'ET' : 'MAIS';
}
