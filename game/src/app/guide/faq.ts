/**
 * @module guide/faq
 * Source unique de la FAQ du guide des flags.
 *
 * Importée à la fois par `layout.tsx` (balisage JSON-LD `FAQPage`) et par
 * `page.tsx` (rendu visible). Les données structurées doivent refléter un
 * contenu réellement affiché : garder les deux au même endroit évite qu'elles
 * divergent.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export const GUIDE_FAQ: FaqEntry[] = [
  {
    question: "Qu'est-ce qu'un Red Flag ?",
    answer:
      "Un Red Flag est un comportement réellement problématique : contrôle, manque de respect, manipulation ou schéma toxique. Pris isolément, il peut parfois se travailler avec une vraie remise en question, mais l'accumulation de Red Flags est nocive.",
  },
  {
    question: 'Red flag ou redflag : comment ça s’écrit ?',
    answer:
      "Les deux se rencontrent. L'expression anglaise s'écrit en deux mots, red flag, littéralement « drapeau rouge » ; la forme collée, redflag, est courante sur les réseaux sociaux. Le sens est le même : un signal d'alarme sur le comportement de quelqu'un.",
  },
  {
    question: "D'où vient l'expression red flag ?",
    answer:
      "Des drapeaux rouges qui signalent un danger : baignade interdite sur une plage, course interrompue sur un circuit. Les réseaux sociaux l'ont popularisée pour désigner un comportement qui doit alerter, le plus souvent au début d'une relation.",
  },
  {
    question: 'Comment savoir si je suis un red flag ?',
    answer:
      "Le Red Flag Test de Red or Green pose des situations concrètes et donne un score de red flag en pourcentage, avec ta place parmi les autres joueurs. Gratuit, anonyme et sans inscription.",
  },
  {
    question: 'Quels sont des exemples de red flags ?',
    answer:
      "Dans une relation : contrôler avec qui l'autre passe du temps, le faire se sentir coupable, minimiser ce qu'il ressent (« tu exagères »), le critiquer devant les autres, devenir agressif lors d'un désaccord. Au quotidien, les joueurs de Red or Green placent en tête des comportements plus ordinaires — hygiène, radinerie, manque de respect des autres — : leur classement, tenu à jour par les votes, est publié sur la page des pires red flags.",
  },
  {
    question: "C'est quoi un red flag chez un homme, ou chez une femme ?",
    answer:
      "La définition ne change pas selon le sexe : un red flag est un comportement qui doit alerter, quelle que soit la personne. Ce qui change, c'est le regard. Dans les votes du site, femmes et hommes ne placent pas les mêmes comportements en tête, et l'écart atteint parfois plusieurs centaines de points sur un même comportement — l'Observatoire les détaille.",
  },
  {
    question: "Qu'est-ce qu'un red flag en amour ?",
    answer:
      "C'est un signal d'alarme dans une relation amoureuse : jalousie qui s'installe tôt, surveillance du téléphone, isolement des amis, mensonges répétés, colère disproportionnée. Pris isolément, un signe appelle une conversation ; plusieurs qui s'accumulent décrivent une relation qui abîme. Le violentomètre aide à situer une situation réelle.",
  },
  {
    question: "Qu'est-ce qu'un Green Flag ?",
    answer:
      "Un Green Flag est un comportement sain et mature, signe d'une personne respectueuse, communicative et cohérente. Il indique que la relation repose sur des bases équilibrées.",
  },
  {
    question: "Qu'est-ce qu'un Black Flag ?",
    answer:
      "Un Black Flag est un comportement totalement rédhibitoire et potentiellement dangereux. C'est une limite absolue : violence, manipulation grave, contrôle total. La sécurité passe avant tout.",
  },
  {
    question: "Qu'est-ce qu'un Orange Flag ?",
    answer:
      "Un Orange Flag est un comportement à surveiller qui mérite une conversation. Pas forcément rédhibitoire, il peut s'expliquer par le contexte, mais il ne doit pas être ignoré.",
  },
  {
    question: "Qu'est-ce qu'un White Flag ?",
    answer:
      "Un White Flag est un comportement neutre, explicable et sans charge négative. Ce n'est pas un mauvais indicateur : dans une relation, ce n'est généralement pas un sujet en soi.",
  },
  {
    question: 'Quelle est la différence entre Red Flag et Black Flag ?',
    answer:
      "Le Red Flag signale un problème sérieux qui nécessite une réponse et une conversation. Le Black Flag est une limite absolue et rédhibitoire — un comportement immédiatement inacceptable comme la violence ou la manipulation grave.",
  },
];
