/**
 * @module dixmais/report
 * Le rapport de session : ce que toutes les manches jouées disent du joueur.
 *
 * Le verdict de fin de manche ne parle que d'un profil. Sur une soirée on en
 * juge dix, et c'est là que la matière se trouve : la sévérité moyenne, les
 * sujets sur lesquels on ne transige pas, ceux qu'on pardonne alors que tout
 * le monde condamne.
 *
 * TOUT EST CALCULÉ SANS UN SEUL APPEL RÉSEAU
 *   Chaque phrase servie par l'API transporte déjà ses compteurs
 *   (`votes_count`, `avg_delta`, `elimination_rate`). Comparer le joueur aux
 *   autres ne coûte donc rien de plus : il suffit de garder les manches.
 *
 * CE QUI N'EST PAS MESURABLE N'EST PAS AFFICHÉ
 *   Une phrase sous le seuil de votes ne compare rien (voir
 *   `MIN_VOTES_FOR_COMPARISON`), et un échantillon trop court non plus. Les
 *   lignes correspondantes valent `null` et l'écran les saute, plutôt que
 *   d'annoncer au joueur une sévérité déduite d'un seul vote.
 */

import { START_SCORE } from './scale';
import type { Ending, PlayedStatement } from './endings';

/** Une manche terminée, figée au moment du verdict. */
export interface PlayedRound {
  profileNumber: number;
  name: string;
  age: number;
  played: PlayedStatement[];
  /** Note après chaque révélation. */
  ratings: number[];
  /** Variation infligée à chaque révélation. */
  deltas: number[];
  /** Variation moyenne des autres, `null` si la phrase n'est pas mesurable. */
  community: (number | null)[];
  /** Part des autres joueurs qui éliminent sur cette phrase, en %. */
  communityElim: (number | null)[];
  final: number;
  eliminated: boolean;
  /** La fin servie au joueur, décidée une fois pour toutes à la fin de la
   * manche : c'est elle qui alimente la frise du rapport, et c'est son `key`
   * qui évite de resservir le même titre à la manche suivante. */
  ending: Ending;
}

/** Une révélation isolée, tous profils confondus. */
export interface Judgment {
  text: string;
  type: 'positive' | 'negative';
  category: string;
  delta: number;
  community: number | null;
  /** delta − community : négatif = le joueur a puni plus fort que les autres. */
  deviation: number | null;
  /** La note est tombée à zéro sur cette révélation. */
  fatal: boolean;
  profileName: string;
}

export interface CategoryStat {
  category: string;
  count: number;
  /** Variation moyenne infligée par le joueur sur cette catégorie. */
  mine: number;
  /** Variation moyenne des autres, `null` si aucune phrase mesurable. */
  theirs: number | null;
  deviation: number | null;
}

export interface Severity {
  /** Moyenne des variations du joueur sur les phrases mesurables. */
  mine: number;
  /** Moyenne des autres sur ces mêmes phrases. */
  theirs: number;
  /** mine − theirs. Négatif = plus sévère. */
  gap: number;
  /** Nombre de révélations comparables. Sous 4, on ne conclut pas. */
  sample: number;
}

export interface SessionReport {
  profiles: number;
  judgments: number;
  eliminated: number;
  /** Part des profils qui s'en sortent vivants, en %. */
  survivalRate: number;
  avgFinal: number;
  best: { name: string; score: number } | null;
  worst: { name: string; score: number } | null;
  /** `null` tant que moins de quatre révélations sont comparables. */
  severity: Severity | null;
  /** Part des révélations où le joueur met zéro, et celle des autres. */
  elimination: { mine: number; theirs: number | null };
  /** Effet moyen d'un green flag sur la note. `null` si aucun n'est sorti. */
  greenFlagEffect: number | null;
  /** Nombre de green flags qui n'ont strictement rien changé. */
  greenFlagsIgnored: number;
  categories: CategoryStat[];
  /** La révélation où le joueur s'est le plus écarté des autres, vers le bas. */
  harshest: Judgment | null;
  /** Celle où il a le plus pardonné quand les autres condamnaient. */
  blindSpot: Judgment | null;
  /** Écart-type des notes finales : la régularité du juré. */
  spread: number;
  archetype: Archetype;
  /** Les fins obtenues, pour la frise de session. */
  endings: { key: string; title: string; name: string; final: number }[];
}

export interface Archetype {
  key: string;
  title: string;
  tagline: string;
  emoji: string;
}

// ---------------------------------------------------------------------------
// Seuils
// ---------------------------------------------------------------------------

/**
 * Sous quatre révélations comparables, l'écart à la moyenne tient au hasard du
 * tirage bien plus qu'au tempérament du joueur : on n'affiche pas de verdict
 * de sévérité.
 */
export const MIN_SAMPLE_FOR_SEVERITY = 4;

/** Une catégorie n'est citée qu'à partir de deux révélations. */
const MIN_PER_CATEGORY = 2;

// ---------------------------------------------------------------------------
// Agrégation
// ---------------------------------------------------------------------------

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

/** Déplie les manches en révélations individuelles. */
export function flatten(rounds: PlayedRound[]): Judgment[] {
  const out: Judgment[] = [];
  for (const round of rounds) {
    round.played.forEach((stmt, i) => {
      const community = round.community[i] ?? null;
      const delta = round.deltas[i] ?? 0;
      out.push({
        text: stmt.text,
        type: stmt.type,
        category: stmt.category,
        delta,
        community,
        deviation: community === null ? null : delta - community,
        fatal: round.ratings[i] === 0,
        profileName: round.name,
      });
    });
  }
  return out;
}

function categoriesOf(judgments: Judgment[]): CategoryStat[] {
  const groups = new Map<string, Judgment[]>();
  for (const j of judgments) {
    const list = groups.get(j.category) ?? [];
    list.push(j);
    groups.set(j.category, list);
  }

  return [...groups.entries()]
    .filter(([, list]) => list.length >= MIN_PER_CATEGORY)
    .map(([category, list]) => {
      const comparable = list.filter((j) => j.community !== null);
      return {
        category,
        count: list.length,
        mine: mean(list.map((j) => j.delta)),
        theirs: comparable.length ? mean(comparable.map((j) => j.community as number)) : null,
        deviation: comparable.length
          ? mean(comparable.map((j) => j.deviation as number))
          : null,
      };
    })
    .sort((a, b) => a.mine - b.mine);
}

export function buildReport(rounds: PlayedRound[]): SessionReport {
  const judgments = flatten(rounds);
  const comparable = judgments.filter((j) => j.community !== null);
  const finals = rounds.map((r) => r.final);
  const eliminated = rounds.filter((r) => r.eliminated).length;

  const severity: Severity | null =
    comparable.length >= MIN_SAMPLE_FOR_SEVERITY
      ? {
          mine: mean(comparable.map((j) => j.delta)),
          theirs: mean(comparable.map((j) => j.community as number)),
          gap: mean(comparable.map((j) => j.deviation as number)),
          sample: comparable.length,
        }
      : null;

  // Taux d'élimination par révélation, et non par profil : c'est la seule
  // mesure comparable à `elimination_rate`, qui est lui aussi par révélation.
  const elimSamples = rounds.flatMap((r) =>
    r.communityElim.filter((v): v is number => v !== null),
  );
  const elimination = {
    mine: judgments.length ? (judgments.filter((j) => j.fatal).length / judgments.length) * 100 : 0,
    theirs: elimSamples.length ? mean(elimSamples) : null,
  };

  const greens = judgments.filter((j) => j.type === 'positive');

  const sortedByDeviation = comparable
    .slice()
    .sort((a, b) => (a.deviation as number) - (b.deviation as number));

  const best = finals.length
    ? rounds.reduce((acc, r) => (r.final > acc.final ? r : acc))
    : null;
  const worst = finals.length
    ? rounds.reduce((acc, r) => (r.final < acc.final ? r : acc))
    : null;

  const report: Omit<SessionReport, 'archetype'> = {
    profiles: rounds.length,
    judgments: judgments.length,
    eliminated,
    survivalRate: rounds.length ? ((rounds.length - eliminated) / rounds.length) * 100 : 0,
    avgFinal: mean(finals),
    best: best ? { name: best.name, score: best.final } : null,
    worst: worst ? { name: worst.name, score: worst.final } : null,
    severity,
    elimination,
    greenFlagEffect: greens.length ? mean(greens.map((j) => j.delta)) : null,
    greenFlagsIgnored: greens.filter((j) => j.delta <= 0).length,
    categories: categoriesOf(judgments),
    harshest: sortedByDeviation[0] ?? null,
    blindSpot: sortedByDeviation.at(-1) ?? null,
    spread: stdDev(finals),
    endings: rounds.map((r) => ({
      key: r.ending.key,
      title: r.ending.title,
      name: r.name,
      final: r.final,
    })),
  };

  return { ...report, archetype: pickArchetype(report) };
}

// ---------------------------------------------------------------------------
// Archétype du juré
// ---------------------------------------------------------------------------

interface ArchetypeCandidate extends Archetype {
  when: (r: Omit<SessionReport, 'archetype'>) => boolean;
}

/**
 * L'ordre compte : le premier qui s'applique gagne. Les portraits les plus
 * caractérisés sont donc en tête, et les replis — ceux qui ne regardent que la
 * note moyenne — en fin de liste.
 */
const ARCHETYPES: ArchetypeCandidate[] = [
  {
    key: 'bourreau',
    title: 'LE BOURREAU',
    tagline: "Tu ne juges pas, tu exécutes. Personne ne sort vivant de ton salon.",
    emoji: '🪓',
    when: (r) => r.survivalRate <= 20 && r.profiles >= 3,
  },
  {
    key: 'procureur',
    title: 'LE PROCUREUR',
    tagline: "Tu laisses parler, tu prends des notes, et tu descends la note point par point.",
    emoji: '⚖️',
    when: (r) => (r.severity?.gap ?? 0) <= -1.5,
  },
  {
    key: 'avocat',
    title: "L'AVOCAT COMMIS D'OFFICE",
    tagline: 'Tout le monde condamne, tu plaides. Tu leur trouves toujours une circonstance.',
    emoji: '🕊️',
    when: (r) => (r.severity?.gap ?? 0) >= 1.5,
  },
  {
    key: 'inspecteur',
    title: 'INSENSIBLE AU VERT',
    tagline: "Les qualités glissent sur toi. Seuls les défauts comptent dans ta comptabilité.",
    emoji: '🧊',
    when: (r) =>
      r.greenFlagEffect !== null && r.greenFlagEffect <= 0 && r.greenFlagsIgnored >= 3,
  },
  {
    key: 'girouette',
    title: 'LA GIROUETTE',
    tagline: 'Un 9, un 0, un 6. Personne ne peut prévoir ce qui va te faire craquer.',
    emoji: '🌀',
    when: (r) => r.spread >= 3.2 && r.profiles >= 3,
  },
  {
    key: 'romantique',
    title: 'LE ROMANTIQUE INCURABLE',
    tagline: "Tu vois le meilleur en chacun. C'est très beau. C'est aussi comme ça qu'on se fait avoir.",
    emoji: '🌹',
    when: (r) => r.avgFinal >= 6.5,
  },
  {
    key: 'tiede',
    title: 'LE GRAND TIÈDE',
    tagline: 'Jamais de zéro, jamais de dix. Tu ne t’engages sur rien.',
    emoji: '🫤',
    when: (r) => r.eliminated === 0 && r.spread < 2 && r.profiles >= 3,
  },
  {
    key: 'comptable',
    title: 'LE COMPTABLE',
    tagline: "Tu notes exactement comme tout le monde. Statistiquement, tu es la moyenne.",
    emoji: '📊',
    when: (r) => r.severity !== null && Math.abs(r.severity.gap) <= 0.4,
  },
  {
    key: 'exigeant',
    title: "L'EXIGEANT",
    tagline: 'Tu as des critères. Beaucoup de critères. Trop, diraient certains.',
    emoji: '🔍',
    when: (r) => r.avgFinal <= 3,
  },
  {
    key: 'jure',
    title: 'LE JURÉ',
    tagline: "Tu écoutes tout, tu pèses tout, et tu tranches. Sans état d'âme apparent.",
    emoji: '🧑‍⚖️',
    when: () => true,
  },
];

export function pickArchetype(r: Omit<SessionReport, 'archetype'>): Archetype {
  const found = ARCHETYPES.find((a) => a.when(r)) ?? ARCHETYPES[ARCHETYPES.length - 1];
  const { when: _when, ...archetype } = found;
  void _when;
  return archetype;
}

// ---------------------------------------------------------------------------
// Mise en mots
// ---------------------------------------------------------------------------

function fr(n: number, digits = 1): string {
  return Math.abs(n).toFixed(digits).replace('.', ',');
}

/**
 * La phrase de sévérité, en clair.
 *
 * Cinq paliers et non trois : « plus sévère que la moyenne » couvrait aussi
 * bien un dixième de point qu'un abîme, et ne récompensait pas les joueurs
 * extrêmes — qui sont précisément ceux qui ont envie de le montrer.
 */
export function severitySentence(severity: Severity | null): string | null {
  if (!severity) return null;
  const { gap } = severity;

  if (gap <= -2) {
    return `Tu retires ${fr(gap)} point${Math.abs(gap) >= 2 ? 's' : ''} de plus que la moyenne à chaque révélation. C'est énorme. Tu es extrêmement sévère.`;
  }
  if (gap <= -0.8) {
    return `Tu es plus sévère que la moyenne : ${fr(gap)} point de plus retiré à chaque révélation.`;
  }
  if (gap < -0.3) {
    return 'Tu es un peu plus dur que la moyenne, sans excès.';
  }
  if (gap <= 0.3) {
    return 'Tu notes comme la moyenne des joueurs, à un cheveu près.';
  }
  if (gap < 1.5) {
    return `Tu es plus indulgent que la moyenne : ${fr(gap)} point de moins retiré à chaque révélation.`;
  }
  return `Tu pardonnes ${fr(gap)} points de plus que tout le monde à chaque révélation. Personne n'est aussi gentil que toi.`;
}

/** Comparaison des éliminations, quand la communauté est mesurable. */
export function eliminationSentence(elimination: SessionReport['elimination']): string | null {
  const { mine, theirs } = elimination;
  if (theirs === null || theirs < 1) return null;

  const ratio = mine / theirs;
  if (mine === 0) {
    return `Tu n'as éliminé personne. Les autres mettent zéro sur ${Math.round(theirs)} % des révélations que tu as vues.`;
  }
  if (ratio >= 1.8) {
    return `Tu élimines sur ${Math.round(mine)} % des révélations, contre ${Math.round(theirs)} % pour les autres. Tu dégaines deux fois plus vite.`;
  }
  if (ratio <= 0.55) {
    return `Tu élimines sur ${Math.round(mine)} % des révélations, contre ${Math.round(theirs)} % pour les autres. Tu laisses leur chance.`;
  }
  return `Tu élimines sur ${Math.round(mine)} % des révélations. La moyenne est à ${Math.round(theirs)} %.`;
}

/** Ce que les qualités changent — ou pas. */
export function greenFlagSentence(report: SessionReport): string | null {
  const { greenFlagEffect, greenFlagsIgnored } = report;
  if (greenFlagEffect === null) return null;

  if (greenFlagEffect <= 0 && greenFlagsIgnored >= 2) {
    return `Aucune qualité ne lui a jamais fait regagner un point. Chez toi, le bien est la norme et ne se récompense pas.`;
  }
  if (greenFlagEffect > 0.8) {
    return `Un green flag lui rend ${fr(greenFlagEffect)} point en moyenne. Tu récompenses ce qui va bien.`;
  }
  return `Un green flag lui rend ${fr(greenFlagEffect)} point en moyenne. C'est peu, mais c'est déjà ça.`;
}

/** Libellés lisibles des catégories du catalogue. */
const CATEGORY_LABELS: Record<string, string> = {
  general: 'En général',
  politique: 'La politique',
  caractere: 'Le caractère',
  dating: 'Les relations',
  lifestyle: "L'hygiène de vie",
  social: 'Le rapport aux autres',
  argent: "L'argent",
  travail: 'Le travail',
  sante: 'La santé',
  famille: 'La famille',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** La catégorie qui coûte le plus cher, mise en mots. */
export function categorySentence(categories: CategoryStat[]): string | null {
  if (categories.length === 0) return null;
  const worst = categories[0];
  if (worst.mine > -1) return null;
  // « te coûte » plutôt qu'un nombre nu : à l'écran, « La politique : 4,0
  // points en moyenne » se lisait comme un gain.
  return `${categoryLabel(worst.category)} te coûte ${fr(worst.mine)} point${Math.abs(worst.mine) >= 2 ? 's' : ''} par révélation. C'est là que tu ne transiges pas.`;
}

/** Part de la note de départ encore debout à la fin, tous profils confondus. */
export function averageSurvival(report: SessionReport): number {
  return Math.round((report.avgFinal / START_SCORE) * 100);
}
