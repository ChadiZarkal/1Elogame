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

/** FAQ affichée *et* balisée pour un outil. Retourne un tableau vide si inconnu. */
export function meterFaq(slug: string, questionCount: number): FaqItem[] {
  const factory = FAQ_BY_SLUG[slug];
  return factory ? factory(questionCount) : [];
}
