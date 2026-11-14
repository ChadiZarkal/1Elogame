/**
 * @module flagornot/textes
 * Les textes de l'interface de l'Oracle, en français et en anglais.
 *
 * Le français est celui qui était écrit dans les composants, recopié à
 * l'identique : la version française ne doit pas bouger d'une virgule. L'anglais
 * a le même type, donc la même liste de clés — en oublier une ne compile pas.
 *
 * Le verdict lui-même (la justification) est écrit par l'IA dans la langue de
 * la page : la route `/api/flagornot/judge` reçoit `langue` et le dit au modèle.
 */

import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';
import type { FlagOrNotGender } from './constants';

export interface TextesOracle {
  locale: string;
  /** Le titre de la barre et de l'écran de profil. */
  titre: string;
  voirStats: string;

  // Profil
  profilAccroche: string;
  sexe: string;
  age: string;
  sexes: Record<FlagOrNotGender, string>;
  consulter: string;
  selectionne: string;
  donneesAnonymes: string;
  /** Lien vers les notes éditoriales sous le jeu ; `null` quand la page n'en a
   *  pas (l'anglais, pour l'instant) : un lien vers une ancre absente ne mène
   *  nulle part. */
  commentCaMarche: string | null;

  // Saisie
  dicteeInterrompue: string;
  soumetsTonCas: string;
  saisieAccroche: string;
  monHisto: (n: number) => string;
  communaute: (n: number) => string;
  monHistorique: string;
  dAutresOntTeste: string;
  jeTEcoute: string;
  saisieAria: string;
  prive: string;
  arreterDictee: string;
  autorisationMicro: string;
  dicter: string;
  envoyer: string;
  placeholders: string[];
  phrasesChargement: string[];

  // Verdict
  aucun: string;
  injoignableBandeau: string;
  analyse: string;
  partager: string;
  partagerVerdict: string;
  cafe: string;
  surToutLeSite: string;
  reessayer: string;
  encore: string;

  // Erreurs et partage
  refus: string;
  injoignable: string;
  partageTexte: (verdict: string, texte: string) => string;
  partageUrl: string;

  // Statistiques
  stats: {
    genres: Record<string, string>;
    chargement: string;
    pasEncore: string;
    pasEncoreTexte: string;
    retourOracle: string;
    titre: string;
    jugements: (n: string) => string;
    observe: string;
    parGenre: string;
    reponses: (n: number) => string;
    tester: string;
  };
}

const fr: TextesOracle = {
  locale: 'fr-FR',
  titre: 'L\'ORACLE',
  voirStats: 'Voir les statistiques',

  profilAccroche: 'Décris un comportement — obtiens le verdict.',
  sexe: 'Sexe',
  age: 'Âge',
  sexes: { homme: 'Homme', femme: 'Femme', autre: 'Autre' },
  consulter: '✨ Consulter l\'Oracle',
  selectionne: 'Sélectionne sexe + âge',
  donneesAnonymes: 'Données anonymes — uniquement pour les stats',
  commentCaMarche: 'Comment ça marche ↓',

  dicteeInterrompue: '🎙️ Dictée interrompue',
  soumetsTonCas: 'Soumets ton cas',
  saisieAccroche: 'Décris un comportement — l\'Oracle rend son verdict.',
  monHisto: (n) => `📋 Mon histo (${n})`,
  communaute: (n) => `👥 Communauté (${n})`,
  monHistorique: '📋 Mon historique',
  dAutresOntTeste: '👥 D\'autres ont testé',
  jeTEcoute: 'Je t’écoute…',
  saisieAria: 'Écris un comportement à analyser',
  prive: '🔒 Privé',
  arreterDictee: 'Arrêter la dictée',
  autorisationMicro: 'Autorisation du micro en cours',
  dicter: 'Dicter à la voix',
  envoyer: 'Envoyer',
  placeholders: [
    '"Il regarde ton téléphone…"',
    '"Elle te dit je t\'aime en premier…"',
    '"Il met 3 jours à répondre…"',
    '"Elle se souvient de ton plat préféré…"',
    '"Il parle de son ex au 1er date…"',
    '"Elle te prépare des surprises…"',
    '"Il te follow/unfollow sur Insta…"',
    '"Elle rit à toutes tes blagues…"',
  ],
  phrasesChargement: [
    'Analyse en cours… 🔍',
    'Hmm, laisse-moi réfléchir… 🤔',
    'Consultation du tribunal des flags… ⚖️',
    "C'est chaud là, je calcule… 🔥",
    'Le verdict arrive… 🧠',
    "L'Oracle délibère… ⏳",
    'Ça sent le flag… 👃',
    'Analyse comportementale en cours… 🔮',
  ],

  aucun: 'AUCUN',
  injoignableBandeau: 'L\'Oracle est injoignable — aucun verdict n\'a pu être rendu.',
  analyse: 'Analyse de l\'Oracle',
  partager: 'Partager',
  partagerVerdict: 'Partager le verdict',
  cafe: '☕ Offrir un café à l\'Oracle',
  surToutLeSite: 'sur tout le site',
  reessayer: 'Réessayer 🔮',
  encore: 'Encore 🔮',

  refus: "Doucement : l'Oracle a besoin de souffler. Réessaie dans une minute.",
  injoignable: "L'Oracle est injoignable. Rien n'a été analysé — réessaie dans un instant.",
  partageTexte: (verdict, texte) => `${verdict}: "${texte}" — Teste toi aussi sur Red or Green !`,
  partageUrl: 'https://redorgreen.fr/flagornot?ref=share',

  stats: {
    genres: { homme: 'Hommes', femme: 'Femmes', autre: 'Autre' },
    chargement: 'Chargement des stats...',
    pasEncore: 'Pas encore de stats',
    pasEncoreTexte: 'Les statistiques apparaîtront quand plus de personnes auront utilisé l\'Oracle.',
    retourOracle: '← Retour à l\'Oracle',
    titre: '📊 Stats Oracle',
    jugements: (n) => `${n} jugements rendus`,
    observe: '💡 Ce qu\'on observe',
    parGenre: '📈 Par genre',
    reponses: (n) => `${n} réponses`,
    tester: '🔮 Tester l\'Oracle',
  },
};

const en: TextesOracle = {
  locale: 'en-US',
  titre: 'THE ORACLE',
  voirStats: 'See the stats',

  profilAccroche: 'Describe a behavior — get the verdict.',
  sexe: 'Gender',
  age: 'Age',
  sexes: { homme: 'Man', femme: 'Woman', autre: 'Other' },
  consulter: '✨ Consult the Oracle',
  selectionne: 'Pick gender + age',
  donneesAnonymes: 'Anonymous data — only used for stats',
  commentCaMarche: 'How it works ↓',

  dicteeInterrompue: '🎙️ Dictation stopped',
  soumetsTonCas: 'Submit your case',
  saisieAccroche: 'Describe a behavior — the Oracle hands down its verdict.',
  monHisto: (n) => `📋 My history (${n})`,
  communaute: (n) => `👥 Community (${n})`,
  monHistorique: '📋 My history',
  dAutresOntTeste: '👥 Others tried',
  jeTEcoute: 'I’m listening…',
  saisieAria: 'Type a behavior to judge',
  prive: '🔒 Private',
  arreterDictee: 'Stop dictation',
  autorisationMicro: 'Waiting for mic permission',
  dicter: 'Dictate by voice',
  envoyer: 'Send',
  placeholders: [
    '"They go through your phone…"',
    '"They say I love you first…"',
    '"They take 3 days to text back…"',
    '"They remember your favorite food…"',
    '"They bring up their ex on the first date…"',
    '"They plan surprises for you…"',
    '"They follow/unfollow you on Insta…"',
    '"They laugh at all your jokes…"',
  ],
  phrasesChargement: [
    'Analyzing… 🔍',
    'Hmm, let me think… 🤔',
    'Consulting the flag tribunal… ⚖️',
    'Oof, this one’s spicy, calculating… 🔥',
    'Verdict incoming… 🧠',
    'The Oracle is deliberating… ⏳',
    'Smells like a flag… 👃',
    'Running behavioral analysis… 🔮',
  ],

  aucun: 'NO',
  injoignableBandeau: 'The Oracle can’t be reached — no verdict this time.',
  analyse: 'The Oracle’s take',
  partager: 'Share',
  partagerVerdict: 'Share the verdict',
  cafe: '☕ Buy the Oracle a coffee',
  surToutLeSite: 'across the site',
  reessayer: 'Try again 🔮',
  encore: 'Again 🔮',

  refus: 'Easy there: the Oracle needs a breather. Try again in a minute.',
  injoignable: 'The Oracle can’t be reached. Nothing got analyzed — try again in a sec.',
  partageTexte: (verdict, texte) => `${verdict}: "${texte}" — Try it yourself on Red or Green!`,
  partageUrl: 'https://redorgreen.fr/en/flagornot?ref=share',

  stats: {
    genres: { homme: 'Men', femme: 'Women', autre: 'Other' },
    chargement: 'Loading stats...',
    pasEncore: 'No stats yet',
    pasEncoreTexte: 'Stats will show up once more people have consulted the Oracle.',
    retourOracle: '← Back to the Oracle',
    titre: '📊 Oracle stats',
    jugements: (n) => `${n} verdicts handed down`,
    observe: '💡 What we’re seeing',
    parGenre: '📈 By gender',
    reponses: (n) => `${n} submissions`,
    tester: '🔮 Try the Oracle',
  },
};

export const TEXTES_ORACLE: Record<Langue, TextesOracle> = { fr, en };

/** Les textes de la langue de la page. */
export function useTextesOracle(): TextesOracle {
  return TEXTES_ORACLE[useLangue()];
}
