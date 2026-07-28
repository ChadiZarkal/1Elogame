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
