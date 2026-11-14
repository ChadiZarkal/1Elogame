/**
 * @module content/meter-notes
 * Contenu éditorial propre à chaque outil d'auto-évaluation.
 *
 * Les cinq pages partageaient jusqu'à 20 % de leur texte : le châssis de
 * l'écran d'accueil — durée, mention d'anonymat, avertissement, échelle — est
 * identique d'un outil à l'autre, et pesait lourd sur des pages de 430 à
 * 640 mots. Les consignes de qualité demandent, dans ce cas précis, de
 * *développer* chaque page plutôt que de rogner le tronc commun.
 *
 * Chaque notice dit donc ce que l'outil couvre, d'où vient le barème, à qui il
 * s'adresse et vers qui se tourner ensuite — informations qui diffèrent
 * réellement d'un outil à l'autre.
 */

import type { Langue } from '@/lib/i18n/langue';

export interface MeterNote {
  /** Une intertitre par bloc, deux à quatre blocs par outil. */
  heading: string;
  body: string[];
}

const NOTES: Record<string, MeterNote[]> = {
  violentometre: [
    {
      heading: "D'où vient cet outil",
      body: [
        "Le violentomètre a été conçu et diffusé par le Département de Seine-Saint-Denis avec le Centre Hubertine Auclert, l'observatoire régional francilien des violences faites aux femmes. Il circule depuis sous forme de réglette imprimée, distribuée en lycée, en université et en centre de santé.",
        "Son intérêt tient à une idée : les comportements d'une relation se placent sur un continuum, pas dans deux cases. Entre « tout va bien » et « c'est de la violence », il existe une zone intermédiaire — contrôle, pression, isolement — où beaucoup de personnes se trouvent sans disposer des mots pour la nommer.",
      ],
    },
    {
      heading: 'Ce que le test couvre',
      body: [
        "Les situations portent sur la relation amoureuse : le respect des décisions et des goûts, la liberté de voir ses proches, la gestion de la jalousie, le contrôle du téléphone et des fréquentations, les pressions financières, les insultes et le chantage, puis les violences physiques et sexuelles.",
        "Ce sont des faits, pas des ressentis. C'est délibéré : la question « est-ce que ça va ? » appelle une réponse globale, souvent rassurante ; une liste de situations concrètes oblige à regarder les choses une par une.",
      ],
    },
    {
      heading: 'Après le test',
      body: [
        "Le résultat situe un niveau, il ne qualifie rien juridiquement. Une seule situation qui pèse suffit à justifier d'en parler. Le 3919, gratuit et anonyme, est joignable 7 jours sur 7 : il oriente, écoute, et n'oblige à rien — ni plainte, ni départ, ni décision immédiate.",
      ],
    },
  ],

  consentometre: [
    {
      heading: "D'où vient cet outil",
      body: [
        "Le consentomètre a été publié par la mission égalité-diversité de l'Université de Poitiers, sous licence Creative Commons. Il a été pensé pour le milieu étudiant, où les rapports de force sont souvent moins visibles que dans un couple : promiscuité, alcool, hiérarchies informelles, effet de groupe.",
      ],
    },
    {
      heading: 'Un périmètre plus large que le couple',
      body: [
        "C'est la différence principale avec le violentomètre. Les situations couvrent les relations amoureuses, mais aussi amicales, universitaires et professionnelles — parce que le consentement ne se limite pas à la sexualité : il porte sur ce qu'on accepte de faire, de dire, de partager et de subir.",
        "Le test s'intéresse à trois choses : as-tu pu dire non, l'as-tu dit librement, et qu'est-ce qui s'est passé ensuite. Un « oui » obtenu par insistance, par crainte des conséquences ou parce qu'il était plus simple de céder n'est pas un consentement.",
      ],
    },
    {
      heading: 'Ce que le résultat ne dit pas',
      body: [
        "Il ne désigne personne. Il peut arriver de reconnaître, dans certaines situations, sa propre attitude plutôt que celle d'un autre — c'est un usage légitime de l'outil, et sans doute le plus utile.",
      ],
    },
  ],

  incestometre: [
    {
      heading: "D'où vient cet outil",
      body: [
        "L'incestomètre s'appuie sur les travaux de l'association Face à l'inceste et de Mémoire Traumatique et Victimologie, qui documentent depuis des années la fréquence des violences sexuelles intrafamiliales et le silence qui les entoure.",
      ],
    },
    {
      heading: 'Pourquoi une grille spécifique au cadre familial',
      body: [
        "Parce que les repères y sont brouillés d'une manière qu'on ne rencontre pas ailleurs. Ce qui serait immédiatement identifié comme une transgression entre inconnus se présente en famille comme de l'affection, une habitude, une plaisanterie ou une tradition. L'entourage participe souvent à cette requalification, sans mauvaise intention.",
        "Les situations portent donc sur les limites du corps, l'intimité, les remarques à caractère sexuel, les secrets imposés et la mise à l'écart de celui ou celle qui s'en plaint.",
      ],
    },
    {
      heading: "Il n'est jamais trop tard pour en parler",
      body: [
        "Le 119 (enfance en danger) est gratuit, anonyme et joignable 24 heures sur 24 — y compris pour un adulte inquiet pour un enfant. Pour les faits anciens, les associations créditées sur notre page sources accompagnent aussi les personnes majeures, quel que soit le temps écoulé.",
      ],
    },
  ],

  harcelometre: [
    {
      heading: 'Une adaptation, pas un barème officiel',
      body: [
        "Contrairement au violentomètre et au consentomètre, cet outil n'est pas la reprise d'une grille publiée par une institution : nous l'avons rédigé à partir des critères communément retenus pour caractériser le harcèlement. Il n'a donc aucune valeur officielle, et nous préférons le dire ici plutôt que de le laisser croire.",
      ],
    },
    {
      heading: 'La répétition comme critère',
      body: [
        "Un fait isolé, même blessant, n'est pas du harcèlement. Ce qui le constitue, c'est la répétition, et l'effet qu'elle produit : l'anticipation, l'évitement, la dégradation des conditions de vie, de travail ou de scolarité. C'est ce que les situations cherchent à faire apparaître, parce que c'est précisément ce qu'on minimise lorsqu'on regarde chaque épisode séparément.",
        "Trois cadres sont couverts : scolaire, professionnel et en ligne. Le dernier a une particularité — il ne s'arrête pas à la porte de chez soi, et laisse des traces qui peuvent servir de preuves.",
      ],
    },
    {
      heading: 'Vers qui se tourner',
      body: [
        "Le 3020 pour le harcèlement scolaire, le 3018 pour les violences numériques : les deux sont gratuits et confidentiels. Au travail, l'inspection du travail, le médecin du travail et les représentants du personnel peuvent être saisis sans passer par la hiérarchie.",
      ],
    },
  ],

  discriminometre: [
    {
      heading: 'Une adaptation, pas un barème officiel',
      body: [
        "Comme le harcèlomètre, cet outil a été rédigé par nos soins et ne reprend aucune grille institutionnelle. Il vise à aider à nommer une situation, pas à établir une qualification juridique.",
      ],
    },
    {
      heading: 'Vexation ou discrimination',
      body: [
        "La distinction est la difficulté principale, et c'est ce que le test essaie d'éclairer. Une remarque désagréable est une vexation. Elle devient une discrimination lorsqu'un traitement défavorable — un refus, une mise à l'écart, une différence de traitement — repose sur un critère personnel : origine, sexe, âge, handicap, état de santé, orientation sexuelle, religion, apparence, situation de famille, entre autres. Le droit français en reconnaît plus d'une vingtaine.",
        "La discrimination n'a pas besoin d'être intentionnelle pour exister. Une règle appliquée à tous peut désavantager systématiquement un groupe : c'est une discrimination indirecte, et elle est tout aussi illégale.",
      ],
    },
    {
      heading: 'Faire valoir ses droits',
      body: [
        "Le Défenseur des droits est une autorité indépendante que l'on peut saisir gratuitement, sans avocat, y compris pour un simple conseil. Un délégué est présent dans chaque département.",
      ],
    },
  ],
};

/**
 * Les mêmes notices en anglais (traduction du 2026-11-14). Les organismes et
 * les numéros restent ceux de la France : le texte le dit, et renvoie qui
 * n'est pas en France vers son numéro d'urgence local.
 */
const NOTES_EN: Record<string, MeterNote[]> = {
  violentometre: [
    {
      heading: 'Where this tool comes from',
      body: [
        'The Violentomètre (violence meter) was designed and distributed by the Seine-Saint-Denis department in France, together with the Centre Hubertine Auclert, the Paris-region observatory on violence against women. It has since circulated as a printed ruler, handed out in high schools, universities and health centers.',
        'Its value lies in one idea: the behaviors in a relationship sit on a continuum, not in two boxes. Between “everything is fine” and “this is violence”, there is an in-between zone — control, pressure, isolation — where many people find themselves without the words to name it.',
      ],
    },
    {
      heading: 'What the test covers',
      body: [
        'The situations concern the romantic relationship: respect for your decisions and tastes, the freedom to see the people close to you, how jealousy is handled, control of your phone and of who you see, financial pressure, insults and blackmail, then physical and sexual violence.',
        'These are facts, not feelings. That is deliberate: the question “is everything okay?” invites an overall answer, often a reassuring one; a list of concrete situations makes you look at things one at a time.',
      ],
    },
    {
      heading: 'After the test',
      body: [
        'The result indicates a level; it does not establish anything legally. A single situation that weighs on you is enough reason to talk about it. In France, 3919 is free, anonymous and available 7 days a week: it offers guidance and a listening ear, and asks nothing of you — no complaint, no leaving, no immediate decision. Outside France, call your local emergency number if you are in danger.',
      ],
    },
  ],

  consentometre: [
    {
      heading: 'Where this tool comes from',
      body: [
        'The Consentomètre (consent meter) was published by the equality and diversity office of the University of Poitiers, in France, under a Creative Commons license. It was designed for students, where power imbalances are often less visible than in a couple: close quarters, alcohol, informal hierarchies, group pressure.',
      ],
    },
    {
      heading: 'A broader scope than the couple',
      body: [
        'This is the main difference from the Violentomètre. The situations cover romantic relationships, but also friendships, university and work — because consent is not limited to sexuality: it covers what you agree to do, say, share and put up with.',
        'The test looks at three things: were you able to say no, did you say it freely, and what happened next. A “yes” obtained through insistence, out of fear of the consequences or because giving in was easier is not consent.',
      ],
    },
    {
      heading: 'What the result does not say',
      body: [
        'It does not point to anyone. You may recognize, in some situations, your own behavior rather than someone else’s — that is a legitimate use of the tool, and probably the most useful one.',
      ],
    },
  ],

  incestometre: [
    {
      heading: 'Where this tool comes from',
      body: [
        'The Incestomètre (incest meter) draws on the work of the French associations Face à l’inceste and Mémoire Traumatique et Victimologie, which have documented for years how frequent sexual violence within families is, and the silence that surrounds it.',
      ],
    },
    {
      heading: 'Why a grid specific to the family',
      body: [
        'Because the usual reference points are blurred there in a way you do not find elsewhere. What would immediately be recognized as a transgression between strangers is presented, within a family, as affection, a habit, a joke or a tradition. The people around often take part in this reframing, without bad intentions.',
        'The situations therefore concern the limits of the body, privacy, sexual remarks, imposed secrets and the sidelining of whoever complains.',
      ],
    },
    {
      heading: 'It is never too late to talk about it',
      body: [
        'In France, 119 (children in danger) is free, anonymous and available 24 hours a day — including for an adult worried about a child. For past events, the associations credited on our sources page also support adults, however much time has passed. Outside France, call your local emergency number if you are in danger.',
      ],
    },
  ],

  harcelometre: [
    {
      heading: 'An adaptation, not an official scale',
      body: [
        'Unlike the Violentomètre and the Consentomètre, this tool — the Harcèlomètre (harassment meter) — is not a grid published by an institution: we wrote it based on the criteria commonly used to characterize harassment. It therefore has no official value, and we would rather say so here than let you believe otherwise.',
      ],
    },
    {
      heading: 'Repetition as the criterion',
      body: [
        'A one-off incident, even a hurtful one, is not harassment. What makes it harassment is repetition, and the effect it has: anticipation, avoidance, deteriorating living, working or school conditions. That is what the situations try to bring out, because it is precisely what gets minimized when each episode is looked at separately.',
        'Three settings are covered: school, work and online. The last one has a particularity — it does not stop at your front door, and it leaves traces that can serve as evidence.',
      ],
    },
    {
      heading: 'Who to turn to',
      body: [
        'In France, 3020 for school bullying and 3018 for online violence: both are free and confidential. At work, the labor inspectorate, the occupational physician and staff representatives can be contacted without going through management. Outside France, call your local emergency number if you are in danger.',
      ],
    },
  ],

  discriminometre: [
    {
      heading: 'An adaptation, not an official scale',
      body: [
        'Like the Harcèlomètre, this tool — the Discriminomètre (discrimination meter) — was written by us and does not reproduce any institutional grid. It aims to help name a situation, not to establish a legal classification.',
      ],
    },
    {
      heading: 'Hurtful remark or discrimination',
      body: [
        'Telling them apart is the main difficulty, and it is what the test tries to shed light on. An unpleasant remark is hurtful. It becomes discrimination when unfavorable treatment — a refusal, being sidelined, a difference in treatment — is based on a personal characteristic: origin, sex, age, disability, state of health, sexual orientation, religion, appearance, family situation, among others. French law recognizes more than twenty of them.',
        'Discrimination does not need to be intentional to exist. A rule applied to everyone can systematically disadvantage one group: that is indirect discrimination, and it is just as illegal.',
      ],
    },
    {
      heading: 'Asserting your rights',
      body: [
        'In France, the Défenseur des droits is an independent authority you can contact for free, without a lawyer, including just for advice. A delegate is present in every département.',
      ],
    },
  ],
};

export function meterNotes(slug: string, langue: Langue = 'fr'): MeterNote[] {
  return (langue === 'en' ? NOTES_EN : NOTES)[slug] ?? [];
}
