/**
 * @module content/page-notes
 * Contenu éditorial servi sous les écrans de jeu.
 *
 * Pourquoi un module de données et non du JSX dans chaque page : la FAQ nourrit
 * à la fois l'affichage et le balisage `FAQPage`. Les tenir séparés les fait
 * diverger — c'est exactement le défaut relevé sur `/ressources/[slug]`, où le
 * balisage déclarait des questions absentes de l'écran. Ici les deux lisent le
 * même tableau, la divergence n'est plus représentable.
 *
 * Les écrans de jeu sont des composants client dont l'essentiel du contenu est
 * conditionné par un état : le crawler ne reçoit qu'un châssis. Ces notes sont
 * rendues par les `layout.tsx`, qui sont des composants serveur, et placées
 * *sous* le jeu — l'expérience de jeu est inchangée, le HTML cesse d'être vide.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NoteBlock {
  heading: string;
  /** Un élément par paragraphe. */
  body?: string[];
  bullets?: string[];
}

export interface RelatedLink {
  href: string;
  label: string;
}

export interface PageNotes {
  /** Titre du bloc éditorial, rendu en `h2`. */
  title: string;
  lede?: string;
  blocks: NoteBlock[];
  faq: FaqItem[];
  related: RelatedLink[];
}

const EMERGENCY =
  'En cas de danger immédiat : 17 (police secours), 3919 (violences faites aux femmes, gratuit et anonyme), 119 (enfance en danger).';

// ---------------------------------------------------------------------------
// Accueil
// ---------------------------------------------------------------------------

export const HOME_NOTES: PageNotes = {
  title: 'À quoi sert ce site',
  lede:
    "« Red flag » sert aujourd'hui à désigner aussi bien une manie agaçante qu'un comportement dangereux. Red or Green essaie de remettre de l'ordre dans cette échelle, en faisant voter les gens plutôt qu'en tranchant à leur place.",
  blocks: [
    {
      heading: 'Le problème que le site adresse',
      body: [
        "Le mot a été vidé de son sens à force d'être appliqué à tout. Quand « il met des points-virgules dans ses messages » et « il lit mes conversations » relèvent du même vocabulaire, deux choses arrivent en même temps : les comportements graves se banalisent, et les désaccords ordinaires prennent des allures d'alerte.",
        "Aucune rédaction ne peut décider seule où passe la limite : c'est précisément un sujet sur lequel les gens ne sont pas d'accord. D'où le parti pris du site — mesurer le désaccord plutôt que le nier, en demandant à des milliers de personnes d'arbitrer entre deux comportements, puis en publiant les écarts.",
      ],
    },
    {
      heading: 'Quel jeu pour quoi',
      bullets: [
        'Le pire des deux — deux comportements, tu désignes le plus grave. C\'est ce jeu qui alimente le classement.',
        "C'est un 10 mais… — un profil part de 10 sur 10 et cinq révélations tombent. La note se réajuste à chaque fois : le jeu montre où tu décroches.",
        "L'Oracle — tu écris une situation, un modèle génératif rend un verdict tranché. À prendre pour ce que c'est : une amorce de discussion, pas un avis autorisé.",
        'Flash Flag — un test court et chronométré, à faire côte à côte ou à envoyer par lien.',
      ],
    },
    {
      heading: 'Ce que les votes ont produit',
      body: [
        "Les arbitrages alimentent un classement par score Elo, tenu séparément pour chaque groupe déclaré : hommes, femmes, et quatre tranches d'âge. C'est ce découpage qui rend le site utile au-delà du jeu — sur certains comportements, l'écart de jugement entre deux groupes dépasse 200 points, soit davantage que l'écart entre un comportement anodin et un comportement sérieux.",
        "L'Observatoire détaille ces fractures : ce sur quoi hommes et femmes divergent le plus, ce qui sépare les générations, et à l'inverse les comportements sur lesquels tout le monde tombe d'accord. La méthodologie expose le calcul et les biais assumés.",
      ],
    },
    {
      heading: 'Le vocabulaire des flags',
      bullets: [
        'Green flag — un signal rassurant, qui indique que la personne sait faire quelque chose de difficile.',
        "White flag — une singularité sans conséquence, qu'on remarque sans qu'elle engage quoi que ce soit.",
        'Orange flag — un point de friction. Il appelle une conversation, pas une décision.',
        "Red flag — un comportement qui abîme, généralement répété. Il appelle une décision.",
        'Black flag — une limite non négociable : violence, contrainte, mise en danger.',
      ],
    },
    {
      heading: 'Ce que le site ne fait pas',
      body: [
        "Rien ici ne constitue un diagnostic, un avis psychologique ou un conseil juridique. Les classements décrivent l'opinion des personnes qui jouent — un échantillon auto-sélectionné, pas la population française — et un comportement bien classé ne dit rien d'une relation particulière.",
        "Pour faire le point sur une situation réelle, les outils d'auto-évaluation reprennent des grilles publiées par des institutions et des associations. " +
          EMERGENCY,
      ],
    },
    {
      heading: 'Confidentialité',
      body: [
        "Le site fonctionne sans compte et sans adresse e-mail. La tranche d'âge et le sexe demandés avant une partie servent uniquement aux classements par groupe et ne sont rattachés à aucune identité. Les questionnaires d'auto-évaluation s'exécutent entièrement dans le navigateur, sans transmission des réponses.",
      ],
    },
  ],
  faq: [
    {
      question: 'Le site est-il gratuit ?',
      answer:
        "Oui, entièrement, et sans compte. Aucun jeu ni aucun outil n'est réservé, et aucune adresse e-mail n'est demandée.",
    },
    {
      question: 'Qui décide de ce qui est un red flag ?',
      answer:
        "Personne, et c'est le principe. Le classement est produit par les arbitrages des joueurs : chaque duel gagné ou perdu déplace le score d'un comportement. La rédaction choisit les propositions soumises au vote, pas leur position.",
    },
    {
      question: "D'où viennent les outils d'auto-évaluation ?",
      answer:
        "Le violentomètre, le consentomètre et l'incestomètre reprennent des grilles publiées par des institutions et des associations, créditées sur la page sources. Le harcèlomètre et le discriminomètre sont des adaptations que nous avons rédigées.",
    },
    {
      question: 'Le contenu convient-il aux mineurs ?',
      answer:
        "La catégorie « Amour & Sexe » n'est pas servie aux joueurs déclarant la tranche 16-18 ans. Le reste du site est tout public, mais il aborde des sujets sérieux — violences, emprise, consentement — sur un ton parfois léger.",
    },
    {
      question: 'Comment vous contacter ?',
      answer:
        "Par courriel à contact@redorgreen.fr, pour toute question, correction, suggestion de comportement ou demande de retrait.",
    },
  ],
  related: [
    { href: '/guide', label: 'Guide des flags' },
    { href: '/classement', label: 'Classement des red flags' },
    { href: '/observatoire', label: "L'Observatoire" },
    { href: '/methodologie', label: 'Méthodologie' },
    { href: '/ressources', label: "Outils d'auto-évaluation" },
    { href: '/a-propos', label: 'À propos' },
  ],
};

// ---------------------------------------------------------------------------
// Red or Green — le duel
// ---------------------------------------------------------------------------

export const JEU_NOTES: PageNotes = {
  title: 'Comprendre ce jeu',
  lede:
    'Red or Green oppose deux comportements et te demande de désigner le pire. Voici ce que le jeu mesure réellement, comment les votes construisent le classement, et ce que ces chiffres ne disent pas.',
  blocks: [
    {
      heading: 'Ce que le jeu te demande',
      body: [
        "Deux comportements s'affichent. Tu choisis celui qui te paraît le plus problématique. Il n'y a pas de bonne réponse : la question porte sur ton jugement, pas sur une vérité établie.",
        "Une fois ton choix fait, le jeu affiche la part des joueurs qui a tranché comme toi sur ce duel précis. C'est une mesure d'accord avec la communauté, pas une note de justesse.",
      ],
    },
    {
      heading: 'Pourquoi comparer plutôt que noter',
      body: [
        "Demander « note ce comportement de 1 à 10 » produit des réponses difficiles à exploiter. Chacun place son curseur où il veut, deux personnes qui répondent 7 ne veulent pas nécessairement dire la même chose, et les notes ont tendance à se tasser au milieu de l'échelle.",
        "Une comparaison ne souffre pas de ce défaut. Choisir entre deux propositions oblige à trancher, et le résultat se lit de la même façon d'un joueur à l'autre. C'est le principe qui sert à classer les joueurs d'échecs : on ne mesure pas un niveau dans l'absolu, on regarde qui l'emporte sur qui.",
      ],
    },
    {
      heading: "Comment un vote devient un classement",
      body: [
        "Chaque comportement porte un score qui démarre à 1000 points. À l'issue d'un duel, le gagnant prend des points au perdant. Le montant dépend de l'écart entre les deux : l'emporter sur un comportement déjà jugé très problématique rapporte beaucoup, l'emporter sur un comportement anodin rapporte peu.",
        "Un comportement récemment ajouté bouge vite, puis se stabilise à mesure que les votes s'accumulent — au-delà d'une centaine de participations, il ne se déplace plus qu'avec des votes nombreux et cohérents. Le détail du calcul est décrit sur la page méthodologie.",
      ],
    },
    {
      heading: "Ce que ce jeu ne mesure pas",
      bullets: [
        "Ce n'est pas une enquête représentative. Les votants sont les personnes qui ont choisi de jouer, pas un panel construit : les résultats décrivent cette communauté, pas la population française.",
        "Ce n'est pas un diagnostic. Un comportement haut placé signale un jugement largement partagé, pas un verdict sur une personne ou sur une relation réelle.",
        "Le contexte est absent. Une phrase isolée ne dit ni la fréquence, ni l'intention, ni l'effet réel sur la personne concernée — trois éléments qui changent tout.",
        "Le ton du jeu pèse sur les réponses. Certaines propositions sont volontairement légères, et toutes sont votées dans un cadre ludique.",
      ],
    },
    {
      heading: "Si un comportement décrit ce que tu vis",
      body: [
        "Le classement est un objet de discussion, pas un outil d'évaluation personnelle. Pour faire le point sur une situation concrète, les outils d'auto-évaluation rassemblés dans nos ressources — violentomètre, consentomètre — sont conçus pour cela et reposent sur des barèmes publiés par des institutions.",
        EMERGENCY,
      ],
    },
  ],
  faq: [
    {
      question: 'Faut-il créer un compte pour jouer ?',
      answer:
        "Non. Aucun compte n'est nécessaire et aucune adresse e-mail n'est demandée. La partie se déroule dans le navigateur.",
    },
    {
      question: "Pourquoi le jeu demande-t-il mon âge et mon sexe ?",
      answer:
        "Uniquement pour alimenter les classements par groupe, qui permettent de mesurer les écarts de jugement entre hommes et femmes ou entre tranches d'âge. Ces deux informations ne sont rattachées à aucune identité et ne servent à rien d'autre.",
    },
    {
      question: 'Les duels sont-ils les mêmes pour tout le monde ?',
      answer:
        "Non. Les paires sont tirées à chaque tour selon plusieurs stratégies : rapprocher deux comportements de score voisin pour produire un duel serré, croiser deux catégories, ou piocher au hasard afin de faire remonter les propositions peu vues. Un duel déjà joué dans la session n'est pas resservi.",
    },
    {
      question: 'Puis-je proposer un comportement ?',
      answer:
        "Les propositions sont rédigées et validées avant d'entrer au jeu : elles ne sont pas générées automatiquement. Les suggestions peuvent être envoyées à contact@redorgreen.fr.",
    },
    {
      question: 'Le jeu convient-il aux mineurs ?',
      answer:
        "La catégorie « Amour & Sexe » n'est pas servie aux joueurs déclarant la tranche 16-18 ans, et elle ne leur est pas proposée à la sélection. Le reste du corpus est tout public.",
    },
  ],
  related: [
    { href: '/classement', label: 'Le classement complet' },
    { href: '/methodologie', label: 'Méthodologie du score' },
    { href: '/guide', label: 'Guide des flags' },
    { href: '/observatoire', label: "L'Observatoire des désaccords" },
  ],
};

// ---------------------------------------------------------------------------
// C'est un 10 mais…
// ---------------------------------------------------------------------------

export const DIXMAIS_NOTES: PageNotes = {
  title: 'Comprendre ce jeu',
  lede:
    "Un profil démarre à 10 sur 10. Cinq révélations s'enchaînent, et tu réajustes la note après chacune. Le jeu ne demande pas si un comportement est grave dans l'absolu, mais ce qu'il te coûte.",
  blocks: [
    {
      heading: 'La règle',
      body: [
        "Chaque profil commence parfait : 10 sur 10. Une révélation tombe, tu déplaces la note. Une deuxième tombe, tu la déplaces encore — en partant de là où tu l'avais laissée, jamais de zéro. Cinq révélations plus tard, la note finale est ton verdict.",
        "Zéro est éliminatoire : c'est le point de non-retour, celui où plus aucune qualité ne rattrape le reste. Tu peux aussi remonter la note, puisque certaines révélations sont des qualités.",
      ],
    },
    {
      heading: 'Pourquoi une note qui se cumule',
      body: [
        "Personne ne se résume à un défaut. Dans la vie, on n'arbitre presque jamais un comportement isolé : on arbitre un empilement, où chaque élément nouveau se lit à la lumière des précédents. Un même détail ne pèse pas pareil selon ce qu'on sait déjà.",
        "Le format cumulatif reproduit cette mécanique. Il rend visible quelque chose qu'une note unique masque : le moment précis où tu décroches, et ce qu'il a fallu pour t'y amener.",
      ],
    },
    {
      heading: 'Ce que dit ta note finale',
      body: [
        "Deux joueurs peuvent terminer sur le même chiffre par des chemins opposés : l'un a tout encaissé puis s'est effondré d'un coup, l'autre a retiré un point à chaque fois. Le score final ne les distingue pas — la trajectoire, oui.",
        "C'est pour cela que le jeu affiche l'enchaînement plutôt que le seul résultat. La question intéressante n'est pas « combien », c'est « à partir de quoi ».",
      ],
    },
    {
      heading: "Ce que ce jeu n'est pas",
      bullets: [
        "Ce n'est pas un test de compatibilité : les profils sont fictifs et assemblés au hasard à partir du catalogue d'énoncés.",
        "Ce n'est pas un avis sur une personne réelle. Les révélations sont volontairement caricaturales, c'est ce qui rend l'arbitrage jouable.",
        "Les notes agrégées décrivent les joueurs de ce site, pas une opinion générale. L'échantillon est auto-sélectionné.",
      ],
    },
    {
      heading: 'Quand le jeu touche à des sujets sérieux',
      body: [
        "Certaines révélations décrivent des comportements qui, hors du jeu, relèvent de la violence ou de l'emprise. Le format ludique ne change rien à leur gravité. Si l'un d'eux fait écho à ce que tu vis, les outils d'auto-évaluation de la section ressources sont conçus pour aider à y voir clair.",
        EMERGENCY,
      ],
    },
  ],
  faq: [
    {
      question: 'Combien de révélations par profil ?',
      answer:
        'Cinq. Le nombre est fixe pour que la carte de profil puisse toutes les afficher à l’écran sans en repousser aucune hors du cadre.',
    },
    {
      question: 'Est-ce que je peux remonter la note ?',
      answer:
        "Oui. Le catalogue contient des qualités autant que des défauts, et la note se déplace dans les deux sens. Seul le zéro est définitif.",
    },
    {
      question: 'Les profils sont-ils de vraies personnes ?',
      answer:
        "Non. Le prénom, l'âge et les révélations sont assemblés au hasard à partir d'un catalogue d'énoncés écrits à l'avance. Aucun profil ne correspond à quelqu'un.",
    },
    {
      question: 'Est-ce que je reverrai les mêmes énoncés ?',
      answer:
        "Non, pas au cours d'une même session : les énoncés déjà notés sont exclus des tirages suivants tant que le catalogue n'est pas épuisé.",
    },
    {
      question: 'Faut-il un compte ?',
      answer:
        "Non. Le jeu ne demande ni compte, ni adresse e-mail. Les notes sont envoyées de façon anonyme pour alimenter le classement des énoncés.",
    },
  ],
  related: [
    { href: '/dixmais/leaderboard', label: 'Classement des énoncés' },
    { href: '/guide', label: 'Guide des flags' },
    { href: '/jeu', label: 'Red or Green — le duel' },
    { href: '/ressources', label: "Outils d'auto-évaluation" },
  ],
};

// ---------------------------------------------------------------------------
// Oracle
// ---------------------------------------------------------------------------

export const ORACLE_NOTES: PageNotes = {
  title: "À propos de l'Oracle",
  lede:
    "Tu écris un comportement, une situation ou un objet, et l'Oracle rend un verdict : red flag ou green flag. Voici comment ce verdict est produit, et le crédit qu'il mérite.",
  blocks: [
    {
      heading: 'Comment le verdict est produit',
      body: [
        "L'Oracle repose sur un modèle de langage génératif. Le texte soumis lui est transmis avec une consigne de ton, et le modèle renvoie un verdict accompagné d'une justification courte. Aucune règle écrite à la main ne décide du résultat, et aucune personne ne relit avant affichage.",
        "Le ton est volontairement tranché et sarcastique : c'est un parti pris de jeu, pas une posture d'expertise. Deux soumissions très proches peuvent recevoir des verdicts différents, et le même texte peut ne pas produire deux fois la même réponse.",
      ],
    },
    {
      heading: "Pourquoi « est-ce un red flag ? » est une question mal posée",
      body: [
        "Presque aucun comportement n'est problématique en soi. Ce qui le rend problématique, c'est un ensemble que la question évacue : à quelle fréquence il se produit, dans quel rapport de force, ce qu'il produit chez la personne qui le subit, et si elle a pu le dire sans que cela se retourne contre elle.",
        "Un même geste peut être anodin entre deux personnes et faire partie d'un dispositif de contrôle entre deux autres. C'est la raison pour laquelle un verdict d'une ligne — le nôtre comme un autre — ne peut pas trancher une situation réelle.",
      ],
    },
    {
      heading: 'Comment lire un verdict',
      bullets: [
        "Comme une prise de position amusante, faite pour lancer une discussion — pas comme un avis autorisé.",
        "Un verdict « red » ne veut pas dire que la situation est grave, et un verdict « green » ne veut pas dire qu'elle est saine.",
        "Le modèle a des angles morts et des partis pris. Il ne connaît ni ton contexte, ni ton histoire.",
        "Rien de ce que produit l'Oracle ne constitue un avis psychologique, juridique ou médical.",
      ],
    },
    {
      heading: 'Pour aller au-delà du verdict',
      body: [
        "Le guide des flags propose une grille plus utile qu'un verdict binaire : cinq niveaux, du green flag au black flag, avec ce qui distingue un désaccord d'un signal d'alerte. Pour une situation personnelle, les outils d'auto-évaluation reposent sur des barèmes publiés par des institutions et posent les bonnes questions dans le bon ordre.",
        EMERGENCY,
      ],
    },
  ],
  faq: [
    {
      question: "Le verdict de l'Oracle est-il généré par une intelligence artificielle ?",
      answer:
        "Oui. Le verdict et sa justification sont produits par un modèle de langage génératif, sans relecture humaine avant affichage. Le ton sarcastique fait partie du parti pris du jeu.",
    },
    {
      question: 'Pourquoi le même texte ne donne-t-il pas toujours la même réponse ?',
      answer:
        "Parce qu'un modèle génératif n'est pas déterministe : il produit une réponse plausible, pas une réponse unique. C'est une raison de plus de ne pas traiter le verdict comme une autorité.",
    },
    {
      question: 'Mes soumissions sont-elles publiques ?',
      answer:
        "Les soumissions peuvent alimenter le fil de la communauté affiché sur la page. Un mode privé permet de soumettre un texte sans qu'il y apparaisse.",
    },
    {
      question: "L'Oracle peut-il se tromper ?",
      answer:
        "Constamment, et par construction. Il ne connaît ni le contexte, ni la fréquence, ni les rapports de force — les trois éléments qui déterminent réellement si un comportement pose problème.",
    },
  ],
  related: [
    { href: '/guide', label: 'Guide des flags' },
    { href: '/classement', label: 'Classement des red flags' },
    { href: '/ressources', label: "Outils d'auto-évaluation" },
    { href: '/a-propos', label: 'À propos du site' },
  ],
};

// ---------------------------------------------------------------------------
// Flash Flag
// ---------------------------------------------------------------------------

export const FLASHFLAG_NOTES: PageNotes = {
  title: 'Comprendre Flash Flag',
  lede:
    "Flash Flag est un test court et chronométré : une série de questions, quelques secondes pour répondre à chacune, un score à la fin. Il s'envoie à quelqu'un ou se fait côte à côte.",
  blocks: [
    {
      heading: 'Ce que mesure le chronomètre',
      body: [
        "Chaque question est limitée dans le temps. La contrainte n'est pas là pour mettre la pression : elle sert à récupérer une première réaction plutôt qu'une réponse construite. Sans limite, on répond ce qu'on estime devoir répondre ; avec, on répond ce qui vient.",
        "Une question sans réponse dans le temps imparti est comptée comme telle. L'absence de choix est une information, elle n'est pas neutralisée.",
      ],
    },
    {
      heading: 'Comment lire le score',
      body: [
        "Chaque option porte une valeur, et le score final additionne les réponses. Un score élevé signale que les réponses vont majoritairement dans le sens des comportements considérés comme sains par le barème du test ; un score bas signale l'inverse.",
        "Ce chiffre n'a pas de valeur diagnostique. Il dépend entièrement des questions posées, et un test personnalisé écrit par un joueur ne repose sur aucun barème validé.",
      ],
    },
    {
      heading: 'Les deux façons de jouer',
      bullets: [
        "Sur un seul téléphone, en passant l'appareil : le résultat s'affiche à la fin de la série.",
        "Par lien : le test est envoyé, la personne répond de son côté, et le résultat revient une fois la série terminée.",
        "Un test peut reprendre une série standard, ou être écrit entièrement par le joueur qui l'envoie.",
      ],
    },
    {
      heading: "Ce que ce test n'est pas",
      body: [
        "Flash Flag est un jeu. Ce n'est ni un test de personnalité, ni un test de compatibilité, ni un outil d'évaluation d'une relation. Les questions ne sont pas validées cliniquement et le score ne prédit rien.",
        "Si l'objectif est de faire le point sur une situation réelle, les outils d'auto-évaluation de la section ressources — construits à partir de barèmes institutionnels — sont conçus pour cela. " +
          EMERGENCY,
      ],
    },
  ],
  faq: [
    {
      question: 'Faut-il installer une application ?',
      answer: "Non. Tout se passe dans le navigateur, sans compte ni installation.",
    },
    {
      question: 'Combien de temps dure un test ?',
      answer:
        "Quelques minutes. Chaque question dispose de sa propre limite de temps, généralement de l'ordre de quelques secondes.",
    },
    {
      question: 'Puis-je écrire mes propres questions ?',
      answer:
        "Oui. Un test personnalisé accepte tes propres questions et leurs réponses, chacune associée à une valeur qui entre dans le score final.",
    },
    {
      question: 'La personne qui répond voit-elle mes réponses ?',
      answer:
        "Le test envoyé par lien recueille les réponses de la personne à qui tu l'envoies, et te renvoie son résultat une fois la série terminée.",
    },
    {
      question: 'Le résultat a-t-il une valeur scientifique ?',
      answer:
        "Aucune. Les séries de questions ne sont pas des instruments validés, et le score ne constitue pas une évaluation psychologique.",
    },
  ],
  related: [
    { href: '/guide', label: 'Guide des flags' },
    { href: '/ressources', label: "Outils d'auto-évaluation" },
    { href: '/jeu', label: 'Red or Green — le duel' },
    { href: '/a-propos', label: 'À propos du site' },
  ],
};

// ---------------------------------------------------------------------------
// Ressources
// ---------------------------------------------------------------------------

export const RESSOURCES_NOTES: PageNotes = {
  title: 'Comment utiliser ces outils',
  lede:
    "Ces cinq questionnaires ne sont pas des jeux. Ils reprennent, ou adaptent, des grilles publiées par des institutions et des associations pour aider à nommer une situation qu'on a du mal à qualifier.",
  blocks: [
    {
      heading: "Pourquoi un « -mètre »",
      body: [
        "Le format vient du violentomètre, une réglette diffusée par des collectivités et des associations de lutte contre les violences. Son intérêt tient à une idée simple : les comportements se placent sur un continuum, pas dans deux cases. Entre la relation saine et la violence caractérisée, il existe une zone intermédiaire où beaucoup de personnes se trouvent sans savoir la nommer.",
        "Répondre à une liste de situations concrètes fonctionne mieux que se demander « est-ce que ça va ? ». La question globale appelle une réponse globale, souvent rassurante ; la liste oblige à regarder les faits un par un.",
      ],
    },
    {
      heading: 'Choisir le bon outil',
      bullets: [
        "Le violentomètre porte sur la relation de couple : contrôle, pressions, isolement, violences.",
        "Le consentomètre porte sur le respect du consentement, dans les relations amoureuses comme amicales, scolaires ou professionnelles.",
        "L'incestomètre porte sur les transgressions de limites dans le cadre familial.",
        "Le harcèlomètre porte sur les situations de harcèlement, en ligne, à l'école ou au travail.",
        "Le discriminomètre porte sur les discriminations vécues au quotidien.",
      ],
    },
    {
      heading: 'Comment lire un résultat',
      body: [
        "Le résultat situe un niveau, il ne prononce pas de verdict. Un score bas ne prouve pas que tout va bien : ces grilles ne couvrent pas toutes les formes que peut prendre une situation difficile, et une seule réponse peut suffire à justifier d'en parler à quelqu'un.",
        "À l'inverse, un score élevé n'établit pas une qualification juridique. Il indique qu'un ensemble de signaux est présent, et que la situation mérite d'être exposée à une personne formée.",
      ],
    },
    {
      heading: 'Anonymat',
      body: [
        "Les questionnaires s'exécutent entièrement dans le navigateur. Les réponses ne sont ni transmises, ni enregistrées, ni associées à une quelconque identité : rien ne quitte l'appareil, et fermer la page suffit à tout effacer.",
      ],
    },
    {
      heading: 'Ces outils ne remplacent pas un accompagnement',
      body: [
        "Aucun questionnaire ne pose de diagnostic et aucun ne remplace un professionnel — médecin, psychologue, travailleur social, juriste, association spécialisée. Ils servent à mettre des mots, ce qui est souvent l'étape qui manque avant d'aller chercher de l'aide.",
        EMERGENCY,
      ],
    },
  ],
  faq: [
    {
      question: 'Mes réponses sont-elles enregistrées ?',
      answer:
        "Non. Les questionnaires fonctionnent entièrement dans ton navigateur : aucune réponse n'est envoyée à un serveur, ni conservée, ni rattachée à une identité.",
    },
    {
      question: "D'où viennent ces questionnaires ?",
      answer:
        "Le violentomètre, le consentomètre et l'incestomètre reprennent des grilles publiées par des institutions et des associations, créditées sur notre page sources. Le harcèlomètre et le discriminomètre sont des adaptations que nous avons rédigées, et ne s'appuient sur aucun barème institutionnel.",
    },
    {
      question: 'Un résultat rassurant signifie-t-il que tout va bien ?',
      answer:
        "Non. Ces grilles ne couvrent pas toutes les situations possibles. Si quelque chose te préoccupe sans apparaître dans les questions, cela mérite quand même d'en parler.",
    },
    {
      question: 'Ces tests posent-ils un diagnostic ?',
      answer:
        "Non, et aucun ne le prétend. Ils aident à nommer une situation ; l'évaluation relève de professionnels formés.",
    },
  ],
  related: [
    { href: '/sources', label: 'Sources et crédits' },
    { href: '/guide', label: 'Guide des flags' },
    { href: '/a-propos', label: 'À propos du site' },
    { href: '/methodologie', label: 'Méthodologie' },
  ],
};
