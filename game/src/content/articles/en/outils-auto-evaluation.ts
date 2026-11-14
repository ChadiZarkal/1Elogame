/**
 * Version anglaise de `../outils-auto-evaluation.ts` (2026-11-14).
 *
 * Même construction : le nombre de questions, les paliers et les ressources
 * suivent `config/meters-data.ts`. Le texte anglais de chaque outil vient de
 * `content/outils-en.ts` ; un outil ajouté sans y être traduit garderait ses
 * textes français (le test `contenus-en` le signale).
 */

import { METERS, type Meter } from '@/config/meters-data';
import { EMERGENCY_LINES } from '@/config/sources-outils';
import { LIGNES_URGENCE_EN, OUTILS_EN, RESSOURCES_EN, SOURCES_EN } from '@/content/outils-en';
import type { Article, Bloc } from '../types';
import { outilsAutoEvaluation } from '../outils-auto-evaluation';

const PALIERS = ['green', 'yellow', 'orange', 'red'] as const;

/** Les numéros communs à tous les outils : listés une fois, en fin d'article. */
const COMMUNES = new Set(
  METERS[0].resources
    .map((r) => r.name)
    .filter((nom) => METERS.every((m) => m.resources.some((r) => r.name === nom))),
);

function blocsOutil(m: Meter): Bloc[] {
  const t = OUTILS_EN[m.slug];
  const source = SOURCES_EN[m.slug];
  const nom = t?.nom ?? m.name;
  const paliers = PALIERS.map((p) =>
    t
      ? `**${t.paliers[p].label}** — ${t.paliers[p].titre}`
      : `**${m.levels[p].label}** — ${m.levels[p].title.replace(/\s*\p{Extended_Pictographic}️?$/u, '')}`,
  );
  const propres = m.resources.filter((r) => !COMMUNES.has(r.name));

  const blocs: Bloc[] = [
    {
      type: 'h2',
      texte: `${m.emoji} ${nom} (${m.name}): ${t ? t.accroche.charAt(0).toLowerCase() + t.accroche.slice(1) : m.tagline}`,
    },
    { type: 'p', texte: t?.description ?? m.description },
    {
      type: 'p',
      texte: `It lists **${m.questions.length} situations** to check if you’ve experienced them. Each belongs to one of four levels, from healthiest to most serious; the result shows the highest level reached:`,
    },
    { type: 'liste', items: paliers },
  ];
  if (source) {
    blocs.push({ type: 'p', texte: `**Where it comes from.** ${source.detail}` });
  } else {
    blocs.push({
      type: 'p',
      texte:
        '**Where it comes from.** It’s an adaptation written by Red or Green, based on the same graded principle. It doesn’t reproduce any official scale and should be read as an awareness tool, with no official standing.',
    });
  }
  if (propres.length > 0) {
    blocs.push({
      type: 'p',
      texte: `**Who to turn to, in addition to the emergency numbers (in France):** ${propres.map((r) => RESSOURCES_EN[r.name] ?? r.name).join('; ')}.`,
    });
  }
  blocs.push({ type: 'p', texte: `[Take the ${nom.toLowerCase()}](/ressources/${m.slug})` });
  return blocs;
}

export const outilsAutoEvaluationEn: Article = {
  slug: outilsAutoEvaluation.slug,
  titre: 'Violence meter, consent meter, harassment meter: what these tests are for, and how to read them',
  chapo:
    'They look like magazine quizzes, but most of them come from French public institutions and specialized nonprofits. What they measure, where they come from, how to read a result — and why they have nothing to do with a red flag ranking.',
  description:
    'Violence meter, consent meter, incest meter, harassment meter, discrimination meter: what each tool measures, where it comes from, how to read the result and who to turn to.',
  emoji: outilsAutoEvaluation.emoji,
  auteur: 'The Red or Green team',
  publie: outilsAutoEvaluation.publie,
  misAJour: outilsAutoEvaluation.misAJour,
  blocs: [
    { type: 'h2', texte: 'The idea: a graded ruler' },
    {
      type: 'p',
      texte:
        'All these tools rest on the same idea, borrowed from the violentomètre (violence meter): a list of concrete situations, ordered from the healthiest to the most dangerous, like the marks on a ruler. You check what you’ve experienced. It isn’t a score that adds up: what counts is the highest level reached, because a single serious situation is enough to change the nature of a relationship.',
    },
    {
      type: 'p',
      texte:
        'The tool’s strength is putting words to what people don’t dare name. Many people in a violent relationship don’t see themselves as victims: they tell themselves he’s “just jealous,” or she “has a temper.” Seeing the situation written out in black and white, at the red level, can be enough to make it click.',
    },
    {
      type: 'encadre',
      titre: 'A tool is not a diagnosis',
      paragraphes: [
        'A questionnaire knows nothing about the context, the history or the power dynamics of a situation. It helps you see more clearly; it doesn’t replace a professional, a support organization, or talking to someone you trust.',
        'Your answers stay on your device: nothing is sent to the site.',
      ],
    },
    ...METERS.flatMap(blocsOutil),

    { type: 'h2', texte: 'Red flag vs. violence meter: don’t mix them up' },
    {
      type: 'p',
      texte:
        'The site’s games are about red flags, and the term now gets used for everything from an annoying habit to dangerous behavior. The self-assessment tools are built for the far end of that scale. A red flag ranking measures players’ opinions, often tongue-in-cheek; a violence meter identifies violence. The [flag guide](/guide) explains the difference between a red flag and a black flag — the line past which there’s nothing left to debate.',
    },

    { type: 'h2', texte: 'If you are in danger (numbers for France)' },
    { type: 'liste', items: EMERGENCY_LINES.map((l) => `**${l.number}** — ${LIGNES_URGENCE_EN[l.number] ?? l.label}`) },
    {
      type: 'p',
      texte:
        'Each tool’s sources, and their limits, are detailed on the [Sources](/sources) page.',
    },
  ],
  suite: [
    { href: '/ressources', label: 'All the self-assessment tools' },
    { href: '/guide', label: 'Red flag, green flag, black flag: the definitions' },
    { href: '/sources', label: 'Where the tools come from' },
  ],
  sources: [
    {
      titre: 'Le Violentomètre',
      editeur: 'Centre Hubertine Auclert (in French)',
      date: '2018',
      url: 'https://www.centre-hubertine-auclert.fr/egalitheque/publication/le-violentometre',
    },
  ],
};
