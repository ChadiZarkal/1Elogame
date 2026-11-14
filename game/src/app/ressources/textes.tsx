/**
 * @module ressources/textes
 * Les textes de l'interface des outils d'auto-évaluation, en français et en
 * anglais.
 *
 * Le français est celui qui était écrit dans les composants, recopié à
 * l'identique — y compris les sauts de ligne JSX, qui décident des espaces :
 * la version française ne doit pas bouger d'une virgule. L'anglais a le même
 * type, donc la même liste de clés.
 *
 * Les barèmes eux-mêmes (questions, niveaux, numéros) sont dans
 * `config/meters-data.ts` et `config/meters-data-en.ts`.
 *
 * Les clés à `null` en français n'existent que dans la version anglaise : elles
 * disent que les numéros et les organismes cités sont français.
 */

import type { ReactNode } from 'react';
import type { Langue } from '@/lib/i18n/langue';
import { useLangue } from '@/lib/i18n/LangueContexte';
import type { SeverityLevel } from '@/config/meters-data';

interface TextesRessources {
  // Page d'accueil des ressources
  titre: string;
  sousTitre: string;
  /** Mention propre à l'anglais : les outils et les numéros sont français. */
  noteFrance: string | null;
  faireLe: (nom: string) => string;
  urgence: ReactNode;
  lienArticle: string;
  avertissementIndex: string;

  // Cadre d'un outil
  chargement: string;
  retour: string;
  ressources: string;
  quitterRapidement: string;
  quitter: string;
  lienArticleOutil: string;

  // Écran d'accueil d'un outil
  /** « French name: Violentomètre » en anglais ; rien en français. */
  nomFrancais: ((nom: string) => string) | null;
  dejaFait: string;
  legende: Record<'sain' | 'vigilance' | 'alerte' | 'danger', string>;
  commencer: string;
  questionsDuree: string;
  dureeAnonyme: string;
  avertissementIntro: ReactNode;
  age: ReactNode;

  // Questionnaire
  niveauQuiz: Record<SeverityLevel, string>;
  quitterIndice: string;
  question: string;
  sur: string;
  oui: string;
  non: string;

  // Résultat
  situationsIdentifieesN: (n: number) => ReactNode;
  conseil: string;
  situationsIdentifiees: string;
  ressourcesContacts: string;
  /** Mention propre à l'anglais, sous les numéros d'aide. */
  horsFrance: string | null;
  appeler: string;
  sitesUtiles: string;
  sauvegarder: string;
  recommencer: string;
  essayerAutre: string;
  rienEnvoye: string;
  avertissementResultat: ReactNode;
  fichierResultat: string;
}

const fr: TextesRessources = {
  titre: 'Ressources & Auto-évaluation',
  sousTitre: 'Des outils pour t\'aider à identifier ce que tu vis. 100 % anonyme et sur ton appareil.',
  noteFrance: null,
  faireLe: (nom) => `Faire le ${nom}`,
  urgence: (
    <>
              🚨 <strong className="text-[#EF4444]">Urgence</strong> — Appelle le <strong className="text-[#FAFAFA]">17</strong> (police),
              le <strong className="text-[#FAFAFA]">112</strong> (urgences) ou
              le <strong className="text-[#FAFAFA]">3919</strong> (violences, 24h/24).
    </>
  ),
  lienArticle: '🧭 À quoi servent ces outils, et comment lire un résultat',
  avertissementIndex:
    'Ces outils ne remplacent pas un accompagnement professionnel. Aucune donnée n\'est collectée — tout reste sur ton appareil.',

  chargement: 'Chargement…',
  retour: 'Retour',
  ressources: 'Ressources',
  quitterRapidement: 'Quitter rapidement',
  quitter: '✕ Quitter',
  lienArticleOutil: 'D\'où vient cet outil, et comment lire son résultat',

  nomFrancais: null,
  dejaFait: 'Déjà fait par des milliers de personnes',
  legende: { sain: 'Sain', vigilance: 'Vigilance', alerte: 'Alerte', danger: 'Danger' },
  commencer: 'Commencer le test',
  questionsDuree: ' questions · ~',
  dureeAnonyme: ' min · 100% anonyme',
  avertissementIntro: (
    <>
          ⚠️ Cet outil est fourni à <strong className="text-[#6B7280]">titre informatif uniquement</strong>.
          Il ne constitue en aucun cas un diagnostic médical, psychologique ou juridique et ne remplace pas l&apos;avis d&apos;un professionnel.
    </>
  ),
  age: (
    <>
          🔞 Réservé aux personnes de <strong className="text-[#6B7280]">16 ans et plus</strong>.
    </>
  ),

  niveauQuiz: { green: 'Zone saine', yellow: 'Vigilance', orange: 'Alerte', red: 'Danger' },
  quitterIndice: 'Tu peux quitter à tout moment avec le bouton ✕ en haut',
  question: 'Question ',
  sur: ' sur ',
  oui: ' Oui',
  non: ' Non',

  situationsIdentifieesN: (problemCount) => (
    <>
              {problemCount} situation{problemCount > 1 ? 's' : ''} identifiée{problemCount > 1 ? 's' : ''}
    </>
  ),
  conseil: '💡 Conseil',
  situationsIdentifiees: 'Situations identifiées',
  ressourcesContacts: '📞 Ressources & contacts',
  horsFrance: null,
  appeler: ' Appeler',
  sitesUtiles: 'Sites utiles',
  sauvegarder: ' Sauvegarder mon résultat',
  recommencer: ' Recommencer',
  essayerAutre: 'Essayer un autre test ',
  rienEnvoye: 'Tes réponses restent sur ton appareil. Rien n\'a été envoyé.',
  avertissementResultat: (
    <>
        ⚠️ Ce test est à titre informatif uniquement. Il ne remplace pas un diagnostic professionnel.
        Si tu es en danger, appelle le <strong className="text-[#6B7280]">17</strong> ou le <strong className="text-[#6B7280]">3919</strong>.
    </>
  ),
  fichierResultat: '-résultat.png',
};

const en: TextesRessources = {
  titre: 'Resources & Self-assessment',
  sousTitre: 'Tools to help you identify what you are going through. 100% anonymous and on your device.',
  noteFrance:
    'These tools come from French organizations, and the helplines they list are in France. Each tool keeps its original French name.',
  faireLe: (nom) => `Take the ${nom}`,
  urgence: (
    <>
      🚨 <strong className="text-[#EF4444]">Emergency</strong> — In France, call <strong className="text-[#FAFAFA]">17</strong> (police),{' '}
      <strong className="text-[#FAFAFA]">112</strong> (emergencies) or{' '}
      <strong className="text-[#FAFAFA]">3919</strong> (violence, 24/7). Outside France, call your local emergency number.
    </>
  ),
  lienArticle: '🧭 What these tools are for, and how to read a result',
  avertissementIndex:
    'These tools do not replace professional support. No data is collected — everything stays on your device.',

  chargement: 'Loading…',
  retour: 'Back',
  ressources: 'Resources',
  quitterRapidement: 'Quick exit',
  quitter: '✕ Exit',
  lienArticleOutil: 'Where this tool comes from, and how to read its result',

  nomFrancais: (nom) => `French name: ${nom}`,
  dejaFait: 'Already taken by thousands of people',
  legende: { sain: 'Healthy', vigilance: 'Caution', alerte: 'Warning', danger: 'Danger' },
  commencer: 'Start the test',
  questionsDuree: ' questions · ~',
  dureeAnonyme: ' min · 100% anonymous',
  avertissementIntro: (
    <>
      ⚠️ This tool is provided <strong className="text-[#6B7280]">for information only</strong>.
      It is in no way a medical, psychological or legal diagnosis and does not replace the advice of a professional.
    </>
  ),
  age: (
    <>
      🔞 For people aged <strong className="text-[#6B7280]">16 and over</strong>.
    </>
  ),

  niveauQuiz: { green: 'Healthy zone', yellow: 'Caution', orange: 'Warning', red: 'Danger' },
  quitterIndice: 'You can leave at any time with the ✕ button at the top',
  question: 'Question ',
  sur: ' of ',
  oui: ' Yes',
  non: ' No',

  situationsIdentifieesN: (n) => `${n} situation${n > 1 ? 's' : ''} identified`,
  conseil: '💡 Advice',
  situationsIdentifiees: 'Situations identified',
  ressourcesContacts: '📞 Resources & contacts',
  horsFrance:
    'These numbers and organizations are in France. If you are outside France, call your local emergency number.',
  appeler: ' Call',
  sitesUtiles: 'Useful websites',
  sauvegarder: ' Save my result',
  recommencer: ' Start over',
  essayerAutre: 'Try another test ',
  rienEnvoye: 'Your answers stay on your device. Nothing was sent.',
  avertissementResultat: (
    <>
      ⚠️ This test is for information only. It does not replace a professional diagnosis.
      If you are in danger in France, call <strong className="text-[#6B7280]">17</strong> or <strong className="text-[#6B7280]">3919</strong>; outside France, call your local emergency number.
    </>
  ),
  fichierResultat: '-result.png',
};

export const TEXTES_RESSOURCES: Record<Langue, TextesRessources> = { fr, en };

/** Les textes de la langue de la page. */
export function useTextesRessources(): TextesRessources {
  return TEXTES_RESSOURCES[useLangue()];
}
