/**
 * Configuration des catégories
 * 
 * Ce fichier permet d'ajouter facilement de nouvelles catégories.
 * Pour ajouter une catégorie :
 * 1. Ajouter une entrée dans CATEGORIES_CONFIG
 * 2. Ajouter la valeur dans le type Categorie (types/database.ts)
 * 3. Ajouter dans la base de données si nécessaire
 */

export interface CategoryConfig {
  id: string;
  label: string;
  labelFr: string;
  color: string; // Tailwind bg color
  textColor: string; // Tailwind text color
  emoji?: string;
}

/**
 * CATÉGORIES DISPONIBLES
 * 
 * Les 3 catégories principales du jeu :
 * - Sexe & Kinks : relations, dating, intimité, flirt
 * - Quotidien : comportements et habitudes du quotidien
 * - Métiers : comportements et attitudes au travail, professions
 */
export const CATEGORIES_CONFIG: Record<string, CategoryConfig> = {
  sexe: {
    id: 'sexe',
    label: 'Sexe & Kinks',
    labelFr: 'Sexe & Kinks',
    color: 'bg-[#DC2626]/20',
    textColor: 'text-[#FCA5A5]',
    emoji: '🔥'
  },
  quotidien: {
    id: 'quotidien',
    label: 'Quotidien',
    labelFr: 'Quotidien',
    color: 'bg-[#059669]/20',
    textColor: 'text-[#6EE7B7]',
    emoji: '🤷'
  },
  metiers: {
    id: 'metiers',
    label: 'Métiers',
    labelFr: 'Métiers',
    color: 'bg-[#1E3A5F]/50',
    textColor: 'text-[#60A5FA]',
    emoji: '💼'
  },
};

// Liste des catégories pour les dropdowns
export const CATEGORIES_LIST = Object.values(CATEGORIES_CONFIG);

// IDs de catégories pour le type
export const CATEGORY_IDS = Object.keys(CATEGORIES_CONFIG);

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
