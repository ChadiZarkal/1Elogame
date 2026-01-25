/**
 * Mock data for local development without Supabase.
 * This data mirrors the production database schema.
 */

import { Element, Categorie } from '@/types';

const now = new Date().toISOString();

// Helper to create an element with default values
function createElement(
  id: string,
  texte: string,
  categorie: Categorie = 'comportement',
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
    created_at: now,
    updated_at: now,
  };
}

// Sample elements for testing (matching the production SQL seed data)
export const mockElements: Element[] = [
  // Original 20 elements
  createElement('1', "Il te dit qu'il t'aime après le premier date", 'comportement', 3, 1000),
  createElement('2', "Elle regarde ton téléphone quand tu as le dos tourné", 'comportement', 3, 1050),
  createElement('3', "Il ne te présente jamais à ses amis", 'comportement', 2, 980),
  createElement('4', "Elle compare tout ce que tu fais à son ex", 'comportement', 2, 1020),
  createElement('5', "Il veut connaître tous tes mots de passe", 'comportement', 3, 1100),
  createElement('6', "Elle critique systématiquement ta famille", 'comportement', 3, 1030),
  createElement('7', "Il dit que toutes ses ex étaient 'folles'", 'trait', 3, 1080),
  createElement('8', "Elle te fait la tête pendant 3 jours sans explication", 'comportement', 2, 970),
  createElement('9', "Il refuse catégoriquement de rencontrer tes parents", 'comportement', 2, 990),
  createElement('10', "Elle te track avec une app de localisation", 'comportement', 4, 1150),
  createElement('11', "Il commente les photos de ses ex sur Insta", 'comportement', 2, 1040),
  createElement('12', "Elle a encore des affaires chez son ex 'par hasard'", 'comportement', 2, 960),
  createElement('13', "Il ne se souvient jamais de tes anniversaires", 'comportement', 2, 920),
  createElement('14', "Elle se plaint de toi à ses potes devant toi", 'comportement', 3, 1000),
  createElement('15', "Il te fait culpabiliser quand tu sors avec tes amis", 'comportement', 3, 1070),
  createElement('16', "Elle répond jamais à tes messages mais est toujours en ligne", 'comportement', 2, 1010),
  createElement('17', "Il refuse de définir la relation après 6 mois", 'comportement', 2, 1060),
  createElement('18', "Elle t'interdit de parler à d'autres filles", 'comportement', 3, 1090),
  createElement('19', "Il te reproche de ne pas lire dans ses pensées", 'comportement', 2, 950),
  createElement('20', "Elle annule vos plans au dernier moment tout le temps", 'comportement', 2, 985),
  
  // 20 more elements
  createElement('21', "Il fait semblant de ne pas te connaître en public", 'comportement', 3, 1110),
  createElement('22', "Elle te compare à ses 'standards' impossibles", 'comportement', 2, 1025),
  createElement('23', "Il a une 'meilleure amie' qu'il cache", 'comportement', 3, 1075),
  createElement('24', "Elle refuse de supprimer Tinder même après 3 mois ensemble", 'comportement', 3, 1120),
  createElement('25', "Il ne te soutient jamais devant sa famille", 'comportement', 2, 1005),
  createElement('26', "Elle utilise les larmes pour gagner chaque dispute", 'comportement', 3, 1055),
  createElement('27', "Il t'envoie 50 messages quand tu ne réponds pas en 5 minutes", 'comportement', 3, 1095),
  createElement('28', "Elle menace de te quitter à chaque petit conflit", 'comportement', 3, 1085),
  createElement('29', "Il parle encore de son ex tous les jours", 'comportement', 2, 1015),
  createElement('30', "Elle te demande de payer TOUT le temps", 'preference', 2, 995),
  createElement('31', "Il disparaît pendant des jours sans prévenir", 'comportement', 3, 1130),
  createElement('32', "Elle lit tous tes messages supprimés", 'comportement', 3, 1065),
  createElement('33', "Il suit ses ex sur tous leurs réseaux", 'comportement', 2, 1035),
  createElement('34', "Elle te ghoster après 3 mois de relation", 'comportement', 4, 1140),
  createElement('35', "Il te manipule en disant 'si tu m'aimais vraiment...'", 'comportement', 4, 1105),
  createElement('36', "Elle partage vos photos intimes sans permission", 'comportement', 4, 1200),
  createElement('37', "Il fait des commentaires sur ton poids constamment", 'comportement', 3, 1125),
  createElement('38', "Elle te rabaisse devant tes amis 'pour rigoler'", 'comportement', 3, 1045),
  createElement('39', "Il nie tout ce qu'il a dit ou fait (gaslighting)", 'comportement', 4, 1175),
  createElement('40', "Elle te donne un ultimatum dès le premier mois", 'comportement', 3, 1155),
];

// Simulate votes storage (in memory for mock mode)
const mockVotes: Map<string, Set<string>> = new Map();

export function getMockElements(): Element[] {
  return mockElements.filter(e => e.actif);
}

export function getMockElement(id: string): Element | undefined {
  return mockElements.find(e => e.id === id && e.actif);
}

export function getSeenPairs(sessionId: string): Set<string> {
  if (!mockVotes.has(sessionId)) {
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

export function getMockDuelPair(sessionId: string): { element1: Element; element2: Element } | null {
  const elements = getMockElements();
  const seenPairs = getSeenPairs(sessionId);
  
  // Find an unseen pair with similar ELO scores
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const pairKey = [elements[i].id, elements[j].id].sort().join('-');
      if (!seenPairs.has(pairKey)) {
        // Check ELO difference (within 200 points preferred)
        const eloDiff = Math.abs(elements[i].elo_global - elements[j].elo_global);
        if (eloDiff <= 200) {
          return { element1: elements[i], element2: elements[j] };
        }
      }
    }
  }
  
  // If no close ELO pairs found, find any unseen pair
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const pairKey = [elements[i].id, elements[j].id].sort().join('-');
      if (!seenPairs.has(pairKey)) {
        return { element1: elements[i], element2: elements[j] };
      }
    }
  }
  
  return null; // All pairs exhausted
}

// Count remaining duels for a session
export function countRemainingDuels(sessionId: string): number {
  const elements = getMockElements();
  const seenPairs = getSeenPairs(sessionId);
  const totalPairs = (elements.length * (elements.length - 1)) / 2;
  return totalPairs - seenPairs.size;
}
