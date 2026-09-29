/**
 * Violentomètre, consentomètre, harcèlomètre… : à quoi servent ces outils.
 *
 * Tout ce qui décrit un outil — nombre de questions, paliers, origine,
 * numéros d'aide — est tiré de `config/meters-data.ts` et
 * `config/sources-outils.ts`, les mêmes données que les outils eux-mêmes et
 * que la page `/sources`. Si un outil change, l'article change avec lui.
 */

import { METERS, type Meter } from '@/config/meters-data';
import { EMERGENCY_LINES, SOURCES } from '@/config/sources-outils';
import type { Article, Bloc } from './types';

const PALIERS = ['green', 'yellow', 'orange', 'red'] as const;

/** Les numéros communs à tous les outils : listés une fois, en fin d'article. */
const COMMUNES = new Set(
  METERS[0].resources
    .map((r) => r.name)
    .filter((nom) => METERS.every((m) => m.resources.some((r) => r.name === nom))),
);

function blocsOutil(m: Meter): Bloc[] {
  const source = SOURCES.find((s) => s.slug === m.slug);
  const paliers = PALIERS.map((p) => `**${m.levels[p].label}** — ${m.levels[p].title.replace(/\s*\p{Extended_Pictographic}️?$/u, '')}`);
  const propres = m.resources.filter((r) => !COMMUNES.has(r.name));

  const blocs: Bloc[] = [
    { type: 'h2', texte: `${m.emoji} ${m.name} : ${m.tagline.charAt(0).toLowerCase()}${m.tagline.slice(1)}` },
    { type: 'p', texte: m.description },
    {
      type: 'p',
      texte: `Il compte **${m.questions.length} situations**, à cocher si on les a vécues. Chacune appartient à l'un des quatre paliers, du plus sain au plus grave ; le résultat indique le palier le plus haut atteint :`,
    },
    { type: 'liste', items: paliers },
  ];
  if (source) {
    blocs.push({ type: 'p', texte: `**D'où il vient.** ${source.detail}` });
  } else {
    blocs.push({
      type: 'p',
      texte:
        "**D'où il vient.** C'est une adaptation rédigée par Red or Green, sur le même principe de gradation. Elle ne reprend pas de barème institutionnel et doit se lire comme un outil de sensibilisation, sans valeur officielle.",
    });
  }
  if (propres.length > 0) {
    blocs.push({
      type: 'p',
      texte: `**Vers qui se tourner, en plus des numéros d'urgence :** ${propres.map((r) => (r.number ? `${r.name}` : r.name)).join(' ; ')}.`,
    });
  }
  blocs.push({ type: 'p', texte: `[Faire le ${m.name.toLowerCase()}](/ressources/${m.slug})` });
  return blocs;
}

export const outilsAutoEvaluation: Article = {
  slug: 'violentometre-consentometre-outils-auto-evaluation',
  titre: 'Violentomètre, consentomètre, harcèlomètre : à quoi servent ces tests, et comment les lire',
  chapo:
    "Ils ressemblent à des tests de magazine, mais la plupart viennent d'institutions et d'associations spécialisées. Ce qu'ils mesurent, d'où ils viennent, comment lire un résultat — et pourquoi ils n'ont rien à voir avec un classement de red flags.",
  description:
    "Violentomètre, consentomètre, incestomètre, harcèlomètre, discriminomètre : ce que mesure chaque outil, son origine, comment lire le résultat et vers qui se tourner.",
  emoji: '🧭',
  auteur: 'Équipe Red or Green',
  publie: '2026-09-29',
  misAJour: '2026-09-29',
  blocs: [
    { type: 'h2', texte: 'Le principe : une règle graduée' },
    {
      type: 'p',
      texte:
        "Tous ces outils reposent sur la même idée, celle du violentomètre : une liste de situations concrètes, rangées de la plus saine à la plus dangereuse, comme les graduations d'une règle. On coche ce qu'on a vécu. Ce n'est pas un score qui s'additionne : c'est le palier le plus haut atteint qui compte, parce qu'une seule situation grave suffit à changer la nature d'une relation.",
    },
    {
      type: 'p',
      texte:
        "La force de l'outil est de mettre des mots sur ce qu'on n'ose pas nommer. Beaucoup de personnes qui vivent une relation violente ne se disent pas victimes : elles se disent qu'il « est jaloux », qu'elle « a du caractère ». Voir la situation écrite noir sur blanc, au palier rouge, peut suffire à déclencher une prise de conscience.",
    },
    {
      type: 'encadre',
      titre: "Un outil n'est pas un diagnostic",
      paragraphes: [
        "Un questionnaire ne connaît ni le contexte, ni l'histoire, ni les rapports de force propres à une situation. Il aide à y voir plus clair ; il ne remplace ni un professionnel, ni une association, ni la parole d'une personne de confiance.",
        "Les réponses restent sur votre appareil : rien n'est transmis au site.",
      ],
    },
    ...METERS.flatMap(blocsOutil),

    { type: 'h2', texte: 'Red flag et violentomètre : ne pas confondre' },
    {
      type: 'p',
      texte:
        "Les jeux du site parlent de red flags, et le mot sert aujourd'hui pour tout, d'une manie agaçante à un comportement dangereux. Les outils d'auto-évaluation sont faits pour l'autre bout de l'échelle. Un classement de red flags mesure l'opinion des joueurs, souvent sur le ton de la blague ; un violentomètre repère des violences. Le [guide des flags](/guide) explique la différence entre un red flag et un black flag — la limite au-delà de laquelle on ne débat plus.",
    },

    { type: 'h2', texte: 'En cas de danger' },
    { type: 'liste', items: EMERGENCY_LINES.map((l) => `**${l.number}** — ${l.label}`) },
    {
      type: 'p',
      texte:
        "Les sources de chaque outil, et leurs limites, sont détaillées sur la page [Sources](/sources).",
    },
  ],
  suite: [
    { href: '/ressources', label: "Tous les outils d'auto-évaluation" },
    { href: '/guide', label: 'Red flag, green flag, black flag : les définitions' },
    { href: '/sources', label: 'Les sources des outils' },
  ],
  sources: [
    {
      titre: 'Le Violentomètre',
      editeur: 'Centre Hubertine Auclert',
      date: '2018',
      url: 'https://www.centre-hubertine-auclert.fr/egalitheque/publication/le-violentometre',
    },
  ],
};
