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
function detectPronoun(texts: string[]): 'il' | 'elle' {
  let feminine = 0;
  for (const t of texts) {
    if (/^\s*elle\b/i.test(t)) feminine += 1;
  }
  return feminine > texts.length / 2 ? 'elle' : 'il';
}

export function generateIdentity(texts: string[]): ProfileIdentity {
  const pronoun = detectPronoun(texts);
  const name = pick(pronoun === 'elle' ? FEMININE : MASCULINE);
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
