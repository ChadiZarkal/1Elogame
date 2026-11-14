/**
 * @module content/meter-faq
 * FAQ des outils d'auto-évaluation — source unique.
 *
 * Ce module existe pour empêcher une divergence constatée : le balisage
 * `FAQPage` et la FAQ affichée étaient deux objets distincts, écrits à la main
 * dans le même fichier, avec des libellés différents et un nombre de questions
 * différent (trois déclarées à Google pour le violentomètre, deux à l'écran).
 * Déclarer à un moteur des questions absentes de la page est précisément ce que
 * les consignes qualité interdisent. Les deux rendus lisent désormais d'ici.
 */

import type { FaqItem } from '@/content/page-notes';
import type { Langue } from '@/lib/i18n/langue';

type FaqFactory = (questionCount: number) => FaqItem[];

const FAQ_BY_SLUG: Record<string, FaqFactory> = {
  violentometre: (n) => [
    {
      question: "Qu'est-ce que le violentomètre ?",
      answer:
        "Le violentomètre est une réglette d'auto-évaluation qui situe les comportements d'une relation sur un continuum, de la relation saine à la violence caractérisée. Il aide à repérer la zone intermédiaire — contrôle, pressions, isolement — que l'on qualifie souvent mal.",
    },
    {
      question: 'Le violentomètre en ligne est-il gratuit et anonyme ?',
      answer: `Oui. Les ${n} questions s'exécutent dans ton navigateur : aucune réponse n'est envoyée, enregistrée ni rattachée à une identité. Le résultat est immédiat et disparaît en fermant la page.`,
    },
    {
      question: 'Comment fonctionne le test ?',
      answer:
        "Tu réponds par oui ou par non à une série de situations concrètes. À la fin, un niveau coloré situe l'ensemble de tes réponses et renvoie vers les ressources correspondantes.",
    },
    {
      question: 'Un résultat rassurant signifie-t-il que tout va bien ?',
      answer:
        "Non. Cette grille ne couvre pas toutes les formes que peut prendre une situation difficile. Une seule situation qui te pèse suffit à justifier d'en parler à une personne de confiance ou à un professionnel.",
    },
  ],
  consentometre: (n) => [
    {
      question: "Qu'est-ce que le consentomètre ?",
      answer:
        "Le consentomètre aide à évaluer si ton consentement est respecté — dans les relations amoureuses, mais aussi amicales, universitaires ou professionnelles.",
    },
    {
      question: 'Le test est-il anonyme ?',
      answer: `Oui. Les ${n} questions sont traitées directement sur ton appareil. Aucune donnée n'est collectée ni transmise.`,
    },
    {
      question: 'À qui ce test s’adresse-t-il ?',
      answer:
        "À toute personne qui s'interroge sur une situation où elle n'a pas pu dire non librement, ou sur le comportement d'un proche. Il ne suppose aucune connaissance préalable du sujet.",
    },
  ],
  incestometre: (n) => [
    {
      question: "Qu'est-ce que l'incestomètre ?",
      answer:
        "L'incestomètre aide à identifier les transgressions de limites dans le cadre familial, y compris celles qui ne sont pas nommées comme telles par l'entourage.",
    },
    {
      question: 'Le test est-il confidentiel ?',
      answer: `Oui. Les ${n} questions s'exécutent dans ton navigateur, sans aucune transmission ni conservation des réponses.`,
    },
    {
      question: 'Que faire si le résultat est préoccupant ?',
      answer:
        "En parler à une personne formée. Le 119 (enfance en danger) est joignable gratuitement et anonymement, 24 h sur 24. Les associations créditées sur notre page sources accompagnent aussi les adultes.",
    },
  ],
  harcelometre: (n) => [
    {
      question: "Qu'est-ce que le harcèlomètre ?",
      answer:
        "Le harcèlomètre aide à identifier les situations de harcèlement — moral, physique ou en ligne — dans le cadre scolaire, professionnel ou personnel.",
    },
    {
      question: 'Comment savoir si je suis victime de harcèlement ?',
      answer: `Les ${n} questions décrivent des situations concrètes plutôt que d'appeler un jugement global. C'est ce qui permet de reconnaître une répétition que l'on minimise souvent prise épisode par épisode.`,
    },
    {
      question: 'Ce test repose-t-il sur un barème officiel ?',
      answer:
        "Non. Contrairement au violentomètre ou au consentomètre, le harcèlomètre est une adaptation que nous avons rédigée. Il ne s'appuie sur aucun barème institutionnel publié.",
    },
  ],
  discriminometre: (n) => [
    {
      question: "Qu'est-ce que le discriminomètre ?",
      answer:
        "Le discriminomètre aide à identifier les situations de discrimination vécues au quotidien, dans le cadre scolaire, professionnel ou social.",
    },
    {
      question: 'Le test est-il gratuit et anonyme ?',
      answer: `Oui. Les ${n} questions restent sur ton appareil, aucune donnée n'est collectée.`,
    },
    {
      question: 'Ce test repose-t-il sur un barème officiel ?',
      answer:
        "Non. Comme le harcèlomètre, il s'agit d'une adaptation rédigée par nos soins et non d'un instrument validé.",
    },
  ],
};

/**
 * La même FAQ en anglais (traduction du 2026-11-14). Le nom français de chaque
 * outil est cité dans la première question, pour qu'on le reconnaisse.
 */
const FAQ_BY_SLUG_EN: Record<string, FaqFactory> = {
  violentometre: (n) => [
    {
      question: 'What is the Violentomètre (violence meter)?',
      answer:
        'The Violentomètre is a self-assessment ruler that places the behaviors in a relationship on a continuum, from a healthy relationship to outright violence. It helps spot the in-between zone — control, pressure, isolation — that is often misjudged.',
    },
    {
      question: 'Is the online Violentomètre free and anonymous?',
      answer: `Yes. The ${n} questions run in your browser: no answer is sent, stored or linked to an identity. The result is immediate and disappears when you close the page.`,
    },
    {
      question: 'How does the test work?',
      answer:
        'You answer yes or no to a series of concrete situations. At the end, a colored level sums up all your answers and points you to the matching resources.',
    },
    {
      question: 'Does a reassuring result mean everything is fine?',
      answer:
        'No. This grid does not cover every form a difficult situation can take. A single situation that weighs on you is enough reason to talk about it with someone you trust or with a professional.',
    },
  ],
  consentometre: (n) => [
    {
      question: 'What is the Consentomètre (consent meter)?',
      answer:
        'The Consentomètre helps you assess whether your consent is respected — in romantic relationships, but also in friendships, at university or at work.',
    },
    {
      question: 'Is the test anonymous?',
      answer: `Yes. The ${n} questions are processed directly on your device. No data is collected or transmitted.`,
    },
    {
      question: 'Who is this test for?',
      answer:
        'Anyone wondering about a situation where they could not freely say no, or about the behavior of someone close to them. It requires no prior knowledge of the subject.',
    },
  ],
  incestometre: (n) => [
    {
      question: 'What is the Incestomètre (incest meter)?',
      answer:
        'The Incestomètre helps identify boundary violations within the family, including those that the people around do not name as such.',
    },
    {
      question: 'Is the test confidential?',
      answer: `Yes. The ${n} questions run in your browser, with no transmission or storage of your answers.`,
    },
    {
      question: 'What should I do if the result is worrying?',
      answer:
        'Talk about it with a trained person. In France, 119 (children in danger) can be reached free of charge and anonymously, 24 hours a day. The associations credited on our sources page also support adults. Outside France, call your local emergency number if you are in danger.',
    },
  ],
  harcelometre: (n) => [
    {
      question: 'What is the Harcèlomètre (harassment meter)?',
      answer:
        'The Harcèlomètre helps identify situations of harassment — psychological, physical or online — at school, at work or in your personal life.',
    },
    {
      question: 'How do I know if I am being harassed?',
      answer: `The ${n} questions describe concrete situations rather than asking for an overall judgment. That is what makes it possible to recognize a repetition that is often minimized when taken episode by episode.`,
    },
    {
      question: 'Is this test based on an official scale?',
      answer:
        'No. Unlike the Violentomètre or the Consentomètre, the Harcèlomètre is an adaptation we wrote. It is not based on any published institutional scale.',
    },
  ],
  discriminometre: (n) => [
    {
      question: 'What is the Discriminomètre (discrimination meter)?',
      answer:
        'The Discriminomètre helps identify situations of discrimination experienced in everyday life, at school, at work or socially.',
    },
    {
      question: 'Is the test free and anonymous?',
      answer: `Yes. The ${n} questions stay on your device; no data is collected.`,
    },
    {
      question: 'Is this test based on an official scale?',
      answer:
        'No. Like the Harcèlomètre, it is an adaptation written by us, not a validated instrument.',
    },
  ],
};

/** FAQ affichée *et* balisée pour un outil. Retourne un tableau vide si inconnu. */
export function meterFaq(slug: string, questionCount: number, langue: Langue = 'fr'): FaqItem[] {
  const factory = (langue === 'en' ? FAQ_BY_SLUG_EN : FAQ_BY_SLUG)[slug];
  return factory ? factory(questionCount) : [];
}
