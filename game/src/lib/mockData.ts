/**
 * Mock data for local development without Supabase.
 * This data mirrors the production database schema.
 */

import { Element, Categorie } from '@/types';

// Use globalThis to share mock state across Turbopack route modules
declare global {
  // eslint-disable-next-line no-var
  var __mockElements: Element[] | undefined;
  // eslint-disable-next-line no-var
  var __mockVotes: Map<string, Set<string>> | undefined;
}

const now = new Date().toISOString();

// Helper to create an element with default values
function createElement(
  id: string,
  texte: string,
  categorie: Categorie = 'quotidien',
  niveau_provocation: 1 | 2 | 3 | 4 = 2,
  elo: number = 1000
): Element {
  return {
    id,
    texte,
    categorie,
    niveau_provocation,
    actif: true,
    elo_global: elo,
    elo_homme: elo,
    elo_femme: elo,
    elo_nonbinaire: elo,
    elo_autre: elo,
    elo_16_18: elo,
    elo_19_22: elo,
    elo_23_26: elo,
    elo_27plus: elo,
    nb_participations: 0,
    nb_participations_homme: 0,
    nb_participations_femme: 0,
    nb_participations_autre: 0,
    nb_participations_16_18: 0,
    nb_participations_19_22: 0,
    nb_participations_23_26: 0,
    nb_participations_27plus: 0,
    created_at: now,
    updated_at: now,
  };
}

// Sample elements for testing (matching the production SQL seed data)
const _initialMockElements: Element[] = [
  // SEXE & KINKS (🔥)
  createElement('1', "Ghoster après le premier date", 'sexe', 3, 1000),
  createElement('2', "Stalker les ex sur Instagram", 'sexe', 2, 1050),
  createElement('3', "Ramener quelqu'un chez soi le premier soir", 'sexe', 2, 980),
  createElement('4', "Checker le téléphone de son/sa partenaire", 'sexe', 3, 1020),
  createElement('5', "Appeler son ex quand on est bourré", 'sexe', 3, 1100),
  createElement('6', "Aimer les pieds", 'sexe', 4, 1030),
  createElement('7', "Faire du sexting avec des inconnus", 'sexe', 4, 1080),
  createElement('8', "Avoir un compte OnlyFans", 'sexe', 4, 970),
  createElement('9', "Mater du porno en couple", 'sexe', 3, 990),
  createElement('10', "Faire l'amour avec les chaussettes", 'sexe', 2, 1150),
  
  // LIFESTYLE (🎯)
  createElement('11', "Être un go muscu", 'lifestyle', 2, 1040),
  createElement('12', "Poster ses workouts sur Instagram", 'lifestyle', 2, 960),
  createElement('13', "Jouer aux jeux vidéo 10h par jour", 'lifestyle', 3, 920),
  createElement('14', "Être cryptobro", 'lifestyle', 3, 1000),
  createElement('15', "Être fan d'animés", 'lifestyle', 2, 1070),
  createElement('16', "Collectionner des figurines", 'lifestyle', 2, 1010),
  createElement('17', "Écouter de la country", 'lifestyle', 2, 1060),
  createElement('18', "Aller en boîte tous les weekends", 'lifestyle', 2, 1090),
  createElement('19', "Être vegan militant", 'lifestyle', 3, 950),
  createElement('20', "Vivre en van", 'lifestyle', 3, 985),
  
  // QUOTIDIEN (🤷)
  createElement('21', "Avoir les ongles longs", 'quotidien', 2, 1110),
  createElement('22', "Porter des Crocs", 'quotidien', 2, 1025),
  createElement('23', "Parler fort dans les transports", 'quotidien', 3, 1075),
  createElement('24', "Applaudir à l'atterrissage", 'quotidien', 2, 1120),
  createElement('25', "Ne jamais dire merci", 'quotidien', 3, 1005),
  createElement('26', "Manger ses crottes de nez", 'quotidien', 4, 1055),
  createElement('27', "Roter à table", 'quotidien', 3, 1095),
  createElement('28', "Ne jamais tirer la chasse", 'quotidien', 4, 1085),
  createElement('29', "Être radin", 'quotidien', 3, 1015),
  createElement('30', "Diviser l'addition au centime près", 'quotidien', 2, 995),
  
  // BUREAU (💼)
  createElement('31', "Travailler le dimanche", 'bureau', 2, 1130),
  createElement('32', "Répondre aux emails à 23h", 'bureau', 2, 1065),
  createElement('33', "Ne jamais prendre de congés", 'bureau', 3, 1035),
  createElement('34', "Adorer les afterworks", 'bureau', 2, 1140),
  createElement('35', "Éviter tous les afterworks", 'bureau', 2, 1105),
  createElement('36', "Draguer les collègues", 'bureau', 3, 1200),
  createElement('37', "Voler la bouffe des autres au frigo", 'bureau', 4, 1125),
  createElement('38', "Chauffer du poisson au micro-ondes", 'bureau', 4, 1045),
  createElement('39', "Être influenceur LinkedIn", 'bureau', 3, 1175),
  createElement('40', "Être politicien", 'bureau', 4, 1155),
];

// Shared state via globalThis (persists across Turbopack module instances)
if (!globalThis.__mockElements) {
  globalThis.__mockElements = _initialMockElements;
}
if (!globalThis.__mockVotes) {
  globalThis.__mockVotes = new Map();
}

export const mockElements = globalThis.__mockElements;
const mockVotes = globalThis.__mockVotes;

export function getMockElements(): Element[] {
  return mockElements.filter(e => e.actif);
}

export function getMockElement(id: string): Element | undefined {
  return mockElements.find(e => e.id === id && e.actif);
}

/** Maximum number of session entries in mockVotes to prevent memory leak */
const MAX_MOCK_SESSIONS = 100;

export function getSeenPairs(sessionId: string): Set<string> {
  if (!mockVotes.has(sessionId)) {
    // Evict oldest sessions if at capacity
    if (mockVotes.size >= MAX_MOCK_SESSIONS) {
      const firstKey = mockVotes.keys().next().value;
      if (firstKey !== undefined) mockVotes.delete(firstKey);
    }
    mockVotes.set(sessionId, new Set());
  }
  return mockVotes.get(sessionId)!;
}

export function recordMockVote(sessionId: string, element1Id: string, element2Id: string): void {
  const pairKey = [element1Id, element2Id].sort().join('-');
  const seen = getSeenPairs(sessionId);
  seen.add(pairKey);
}

export function updateMockElo(winnerId: string, loserId: string, newWinnerElo: number, newLoserElo: number): void {
  const winner = mockElements.find(e => e.id === winnerId);
  const loser = mockElements.find(e => e.id === loserId);
  if (winner) winner.elo_global = newWinnerElo;
  if (loser) loser.elo_global = newLoserElo;
}


