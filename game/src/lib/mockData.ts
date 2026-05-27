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
  
  // QUOTIDIEN (🤷) — includes former lifestyle items
  createElement('11', "Être un go muscu", 'quotidien', 2, 1040),
  createElement('12', "Poster ses workouts sur Instagram", 'quotidien', 2, 960),
  createElement('13', "Jouer aux jeux vidéo 10h par jour", 'quotidien', 3, 920),
  createElement('14', "Être cryptobro", 'quotidien', 3, 1000),
  createElement('15', "Être fan d'animés", 'quotidien', 2, 1070),
  createElement('16', "Collectionner des figurines", 'quotidien', 2, 1010),
  createElement('17', "Écouter de la country", 'quotidien', 2, 1060),
  createElement('18', "Aller en boîte tous les weekends", 'quotidien', 2, 1090),
  createElement('19', "Être vegan militant", 'quotidien', 3, 950),
  createElement('20', "Vivre en van", 'quotidien', 3, 985),
  
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
  
  // MÉTIERS (💼) — Bureau behaviors + professions
  createElement('31', "Travailler le dimanche", 'metiers', 2, 1130),
  createElement('32', "Répondre aux emails à 23h", 'metiers', 2, 1065),
  createElement('33', "Ne jamais prendre de congés", 'metiers', 3, 1035),
  createElement('34', "Adorer les afterworks", 'metiers', 2, 1140),
  createElement('35', "Éviter tous les afterworks", 'metiers', 2, 1105),
  createElement('36', "Draguer les collègues", 'metiers', 3, 1200),
  createElement('37', "Voler la bouffe des autres au frigo", 'metiers', 4, 1125),
  createElement('38', "Chauffer du poisson au micro-ondes", 'metiers', 4, 1045),
  createElement('39', "Être influenceur LinkedIn", 'metiers', 3, 1175),
  createElement('40', "Être politicien", 'metiers', 4, 1155),

  // Bureau: culture d'entreprise
  createElement('95', "Être en télétravail 100%", 'metiers', 2, 1050),
  createElement('96', "Venir au bureau en pyjama", 'metiers', 2, 1040),
  createElement('97', "Poser un RTT le lundi", 'metiers', 2, 1055),
  createElement('98', "Être en burnout permanent", 'metiers', 3, 1060),
  createElement('99', "Faire semblant de travailler", 'metiers', 2, 1045),
  createElement('100', "Arriver en retard tous les jours", 'metiers', 3, 1070),
  createElement('101', "Partir à 17h pile", 'metiers', 2, 1035),

  // Bureau: relations professionnelles
  createElement('102', "Coucher avec son boss", 'metiers', 4, 1180),
  createElement('103', "Balancer ses collègues", 'metiers', 4, 1160),
  createElement('104', "Ne jamais faire le café", 'metiers', 2, 1030),
  createElement('105', "Organiser des pots toutes les semaines", 'metiers', 2, 1025),
  createElement('106', "Critiquer son boss sur Slack", 'metiers', 3, 1120),
  createElement('107', "Ghoster les réunions Teams", 'metiers', 2, 1055),

  // Bureau: ambiance & productivité
  createElement('108', "Mettre de la musique sans casque au bureau", 'metiers', 3, 1100),
  createElement('109', "Manger des trucs qui puent au bureau", 'metiers', 3, 1095),
  createElement('110', "Parler fort au téléphone en open space", 'metiers', 3, 1090),
  createElement('111', "Organiser des réunions inutiles", 'metiers', 3, 1080),
  createElement('112', "Envoyer 50 messages Slack par jour", 'metiers', 2, 1040),
  createElement('113', "Ne jamais lire ses emails", 'metiers', 3, 1075),
  createElement('114', "Mettre 'CC' à toute la boîte", 'metiers', 3, 1070),
  createElement('115', "Procrastiner sur LinkedIn", 'metiers', 2, 1035),
  createElement('116', "Scroller TikTok en réunion", 'metiers', 2, 1050),

  // Bureau: carrière & ambition
  createElement('117', "Être en reconversion à 40 ans", 'metiers', 2, 1045),
  createElement('118', "Lancer sa startup", 'metiers', 2, 1060),
  createElement('119', "Être freelance galérien", 'metiers', 2, 1055),
  createElement('120', "Faire semblant d'être entrepreneur", 'metiers', 3, 1110),
  createElement('121', "Poster des citations motivantes", 'metiers', 2, 1040),
  createElement('122', "Être coach en développement personnel", 'metiers', 3, 1115),
  createElement('123', "Vendre des formations bidons", 'metiers', 4, 1150),
  createElement('124', "Faire du MLM", 'metiers', 4, 1145),
  createElement('125', "Être dans la crypto H24", 'metiers', 2, 1055),

  // Bureau: types de jobs (supplémentaires)
  createElement('126', "Être policier", 'metiers', 2, 1085),
  createElement('127', "Être influenceur", 'metiers', 3, 1140),
  createElement('128', "Être avocat fiscaliste", 'metiers', 2, 1080),
  createElement('129', "Être télévendeur", 'metiers', 3, 1100),
  createElement('130', "Être serveur dans un fast-food", 'metiers', 2, 1050),
  createElement('131', "Être agent immobilier", 'metiers', 3, 1095),
  createElement('132', "Être DJ de mariage", 'metiers', 2, 1060),
  createElement('133', "Être community manager", 'metiers', 2, 1055),
  createElement('134', "Être recruteur IT", 'metiers', 2, 1065),

  // 💸 La "Hustle Culture" & L'Argent
  createElement('41', "Être trader / Banquier d'affaires", 'metiers', 3, 1165),
  createElement('42', "Être investisseur en cryptomonnaies (Crypto-bro)", 'metiers', 3, 1155),
  createElement('43', "Être entrepreneur en dropshipping", 'metiers', 3, 1145),
  createElement('44', "Être marchand de biens", 'metiers', 3, 1150),
  createElement('45', "Être lobbyiste", 'metiers', 3, 1155),
  createElement('46', "Être chasseur de têtes", 'metiers', 2, 1085),
  createElement('47', "Être conseiller en gestion de patrimoine", 'metiers', 2, 1080),
  createElement('48', "Être Business Angel (Investisseur)", 'metiers', 2, 1075),

  // 📱 Le Numérique & L'Influence
  createElement('49', "Être TikTokeur", 'metiers', 3, 1140),
  createElement('50', "Être streamer / Gamer professionnel", 'metiers', 3, 1135),
  createElement('51', "Être créateur de contenu sur MYM / OnlyFans", 'metiers', 4, 1160),
  createElement('52', "Être développeur en Intelligence Artificielle", 'metiers', 2, 1090),
  createElement('53', "Être expert en cybersécurité (Hacker éthique)", 'metiers', 2, 1095),
  createElement('54', "Être monteur vidéo pour Youtubeurs", 'metiers', 2, 1070),
  createElement('55', "Être concepteur de mondes virtuels / Métavers", 'metiers', 2, 1065),
  createElement('56', "Être testeur de jeux vidéo", 'metiers', 2, 1060),

  // 🌙 La Nuit, les Arts & La Bohème
  createElement('57', "Être DJ en boîte de nuit (horaires impossible pour fonder une famille)", 'metiers', 2, 1105),
  createElement('58', "Être musicien indépendant (galérien avec un rêve)", 'metiers', 2, 1100),
  createElement('59', "Être tatoueur / Perceur (carrière créative mais précaire)", 'metiers', 2, 1095),
  createElement('60', "Être barman / Mixologue (salaire de misère + mains baladeuses)", 'metiers', 2, 1090),
  createElement('61', "Être videur / Agent de sécurité (violence gratuite, bas salaire)", 'metiers', 2, 1085),
  createElement('62', "Être photographe de mode (carrière basée sur le réseau, pas stable)", 'metiers', 2, 1080),
  createElement('63', "Être mannequin (beauté éphémère, consommation émotionnelle)", 'metiers', 2, 1110),
  createElement('64', "Être comédien de stand-up (rejet constant, trac permanent)", 'metiers', 2, 1075),
  createElement('65', "Être intermittent du spectacle (sans assurance maladie, zéro stabilité)", 'metiers', 2, 1070),
  createElement('66', "Être écrivain / Romancier à son compte (endettement garanti)", 'metiers', 2, 1065),

  // 🛡️ L'Uniforme, le Danger & Le Physique
  createElement('67', "Être militaire", 'metiers', 2, 1120),
  createElement('68', "Être pompier", 'metiers', 2, 1115),
  createElement('69', "Être gardien de prison", 'metiers', 2, 1100),
  createElement('70', "Être marin pêcheur", 'metiers', 2, 1095),
  createElement('71', "Être chauffeur de poids lourd", 'metiers', 2, 1090),
  createElement('72', "Être mécanicien automobile", 'metiers', 2, 1085),
  createElement('73', "Être ouvrier dans le BTP", 'metiers', 2, 1080),
  createElement('74', "Être moniteur de ski / de surf", 'metiers', 2, 1075),
  createElement('75', "Être agriculteur / Éleveur", 'metiers', 2, 1070),

  // 🧘 Croyances, Bien-être "Alternatif" & Lifestyle
  createElement('76', "Être astrologue / Tarologue", 'metiers', 3, 1140),
  createElement('77', "Être naturopathe", 'metiers', 2, 1085),
  createElement('78', "Être magnétiseur / Guérisseur", 'metiers', 3, 1130),
  createElement('79', "Être professeur de yoga", 'metiers', 2, 1080),
  createElement('80', "Être coach sportif / Personal Trainer", 'metiers', 2, 1090),
  createElement('81', "Être chiropracteur", 'metiers', 2, 1075),
  createElement('82', "Être conseiller en image / Relookeur", 'metiers', 2, 1070),
  createElement('83', "Être guide spirituel", 'metiers', 3, 1125),
  createElement('84', "Être décorateur d'intérieur", 'metiers', 2, 1065),
  createElement('85', "Être organisateur d'événements (Wedding planner, etc.)", 'metiers', 2, 1060),

  // ⚖️ Prestige, Pouvoir & Contraintes horaires
  createElement('86', "Être chirurgien", 'metiers', 2, 1110),
  createElement('87', "Être avocat pénaliste", 'metiers', 2, 1105),
  createElement('88', "Être pilote de ligne", 'metiers', 2, 1100),
  createElement('89', "Être hôtesse de l'air / Steward", 'metiers', 2, 1095),
  createElement('90', "Être diplomate", 'metiers', 2, 1090),
  createElement('91', "Être professeur d'université", 'metiers', 2, 1085),
  createElement('92', "Être huissier de justice (Commissaire de justice)", 'metiers', 2, 1075),
  createElement('93', "Être inspecteur des impôts", 'metiers', 2, 1065),
  createElement('94', "Être journaliste d'investigation", 'metiers', 2, 1080),
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


