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

/**
 * La même FAQ en anglais, pour `/en/guide` (2026-11-14), dans le même ordre.
 * Rendue par `PageGuide` et balisée par `app/en/guide/layout.tsx`.
 */
export const GUIDE_FAQ_EN: FaqEntry[] = [
  {
    question: 'What is a Red Flag?',
    answer:
      'A Red Flag is genuinely problematic behavior: control, disrespect, manipulation or a toxic pattern. On its own, it can sometimes be worked on if the person truly questions themselves, but red flags that pile up do real damage.',
  },
  {
    question: 'Red flag or redflag: how do you spell it?',
    answer:
      'Both show up. The standard English spelling is two words, red flag; the run-together form, redflag, is common on social media. The meaning is the same: a warning sign about someone’s behavior.',
  },
  {
    question: 'Where does the expression “red flag” come from?',
    answer:
      'From the red flags that signal danger: no swimming at the beach, a race stopped on a track. Social media made it popular as a word for behavior that should worry you, most often early in a relationship.',
  },
  {
    question: 'How do I know if I’m a red flag?',
    answer:
      'Red or Green’s Red Flag Test walks you through concrete situations and gives you a red flag score as a percentage, along with where you rank among other players. Free, anonymous, no sign-up.',
  },
  {
    question: 'What are some examples of red flags?',
    answer:
      'In a relationship: controlling who the other person spends time with, making them feel guilty, dismissing their feelings (“you’re overreacting”), criticizing them in front of others, getting aggressive during a disagreement. Day to day, Red or Green players put more ordinary behaviors at the top — hygiene, stinginess, disrespecting others — and their ranking, kept up to date by the votes, is published on the worst red flags page.',
  },
  {
    question: 'What’s a red flag in a man, or in a woman?',
    answer:
      'The definition doesn’t change with gender: a red flag is behavior that should worry you, whoever is doing it. What changes is how people see it. In the site’s votes, women and men don’t put the same behaviors at the top, and the gap sometimes reaches several hundred points on a single behavior — the Observatory breaks them down.',
  },
  {
    question: 'What is a red flag in love?',
    answer:
      'It’s a warning sign in a romantic relationship: jealousy that sets in early, checking the other person’s phone, cutting them off from friends, repeated lies, outsized anger. One sign on its own calls for a conversation; several that pile up describe a relationship that does damage. The violence meter helps you place a real situation.',
  },
  {
    question: 'What is a Green Flag?',
    answer:
      'A Green Flag is healthy, mature behavior, the sign of someone who is respectful, communicates well and is consistent. It shows the relationship rests on a balanced foundation.',
  },
  {
    question: 'What is a Black Flag?',
    answer:
      'A Black Flag is completely unacceptable and potentially dangerous behavior. It’s an absolute line: violence, serious manipulation, total control. Safety comes first.',
  },
  {
    question: 'What is an Orange Flag?',
    answer:
      'An Orange Flag is behavior to keep an eye on that deserves a conversation. Not necessarily a dealbreaker — context can explain it — but it shouldn’t be ignored.',
  },
  {
    question: 'What is a White Flag?',
    answer:
      'A White Flag is neutral behavior, explainable and with no negative charge. It isn’t a bad sign: in a relationship, it usually isn’t an issue in itself.',
  },
  {
    question: 'What’s the difference between a Red Flag and a Black Flag?',
    answer:
      'A Red Flag signals a serious problem that calls for a response and a conversation. A Black Flag is an absolute, non-negotiable line — behavior that is unacceptable right away, like violence or serious manipulation.',
  },
];
