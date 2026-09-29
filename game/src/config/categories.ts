/**
 * Configuration des catégories et des tags
 *
 * 2 catégories principales (jeu + classement)
 * N tags sémantiques (filtrage classement uniquement — pas de gameplay)
 */

export interface CategoryConfig {
  id: string;
  label: string;
  labelFr: string;
  color: string;
  textColor: string;
  emoji?: string;
}

export interface TagConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

/** Deux catégories principales du jeu */
export const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  sexe: {
    id: 'sexe',
    label: 'Amour & Sexe',
    labelFr: 'Amour & Sexe',
    color: 'bg-[#DC2626]/20',
    textColor: 'text-[#FCA5A5]',
    emoji: '❤️‍🔥'
  },
  quotidien: {
    id: 'quotidien',
    label: 'Quotidien',
    labelFr: 'Quotidien',
    color: 'bg-[#059669]/20',
    textColor: 'text-[#6EE7B7]',
    emoji: '🤷'
  },
};

/**
 * Catégories jouées, mais jamais exposées sur les pages publiques — classement,
 * Observatoire, accueil, baromètre, API publique.
 *
 * « Amour & Sexe » mêle des propositions sexuellement explicites (nudes,
 * sextapes, pratiques) et des orientations sexuelles soumises au vote comme
 * des « red flags ». Dans le jeu, entre adultes, c'est une question posée ;
 * publié en classement indexable, c'est une liste qui range l'homosexualité
 * parmi les comportements problématiques, sur un site qui demande à porter de
 * la publicité Google. Le jeu les garde : le serveur les écarte déjà pour la
 * tranche 16-18 (voir `ADSENSE-CHANGELOG.md` § 7).
 */
export const CATEGORIES_HORS_VITRINE: readonly string[] = ['sexe'];

/** Tags sémantiques — sous-catégorisation, filtre classement uniquement */
export const TAGS_CONFIG: Record<string, TagConfig> = {
  metier: {
    id: 'metier',
    label: 'Travail',
    emoji: '💼',
    description: 'Professions et comportements au travail',
  },
  couple: {
    id: 'couple',
    label: 'Couple',
    emoji: '❤️',
    description: 'Relations romantiques et intimité',
  },
  hygiene: {
    id: 'hygiene',
    label: 'Hygiène',
    emoji: '🚿',
    description: 'Hygiène et propreté corporelle',
  },
  argent: {
    id: 'argent',
    label: 'Argent',
    emoji: '💰',
    description: 'Finance, économie et comportements liés à l\'argent',
  },
  numerique: {
    id: 'numerique',
    label: 'Numérique',
    emoji: '📱',
    description: 'Technologie, réseaux sociaux et internet',
  },
  social: {
    id: 'social',
    label: 'Social',
    emoji: '🌍',
    description: 'Comportements en public et interactions sociales',
  },
  sport: {
    id: 'sport',
    label: 'Sport',
    emoji: '🏋️',
    description: 'Sport, fitness et bien-être physique',
  },
  nourriture: {
    id: 'nourriture',
    label: 'Nourriture',
    emoji: '🍽️',
    description: 'Alimentation et comportements à table',
  },
  emotionnel: {
    id: 'emotionnel',
    label: 'Émotionnel',
    emoji: '💔',
    description: 'Maturité émotionnelle et comportements relationnels',
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    emoji: '🚗',
    description: 'Comportements dans les transports et sur la route',
  },
  politique: {
    id: 'politique',
    label: 'Politique',
    emoji: '🏛️',
    description: 'Politique et engagement civique',
  },
};

export const CATEGORIES_LIST = Object.values(CATEGORIES_CONFIG);
export const TAGS_LIST = Object.values(TAGS_CONFIG);
export const CATEGORY_IDS = Object.keys(CATEGORIES_CONFIG);
export const TAG_IDS = Object.keys(TAGS_CONFIG);


// Fonction pour obtenir une catégorie
export function getCategory(id: string): CategoryConfig | undefined {
  return CATEGORIES_CONFIG[id];
}

// Fonction pour obtenir les classes CSS d'une catégorie
export function getCategoryClasses(id: string): string {
  const category = CATEGORIES_CONFIG[id];
  if (!category) return 'bg-gray-500/20 text-gray-400';
  return `${category.color} ${category.textColor}`;
}
