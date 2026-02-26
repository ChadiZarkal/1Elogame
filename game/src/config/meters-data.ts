/**
 * @module meters-data
 * Données statiques pour les outils de mesure (violentomètre, consentomètre, incestomètre).
 *
 * Sources :
 * - Consentomètre : Université de Poitiers, mission égalité-diversité (CC BY-NC-ND)
 * - Violentomètre : Département de Seine-Saint-Denis / Centre Hubertine Auclert
 * - Incestomètre : Association Face à l'inceste / Mémoire Traumatique
 */

// ─── Types ──────────────────────────────────────────────────
export type SeverityLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface MeterQuestion {
  id: number;
  text: string;
  level: SeverityLevel;
}

export interface MeterLevelInfo {
  label: string;
  title: string;
  message: string;
  advice: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export interface MeterResource {
  name: string;
  number?: string;
  url?: string;
  description: string;
}

export interface Meter {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  intro: string;
  questionPrefix: string;
  questions: MeterQuestion[];
  levels: Record<SeverityLevel, MeterLevelInfo>;
  resources: MeterResource[];
}

// ─── Ressources communes ────────────────────────────────────
const COMMON_RESOURCES: MeterResource[] = [
  {
    name: '3919 — Violences Femmes Info',
    number: '3919',
    description: "Numéro d'écoute national pour les victimes de violences, 24h/24 et 7j/7.",
  },
  {
    name: '114 — Urgence sourds/malentendants',
    number: '114',
    description: "Numéro d'urgence par SMS pour les personnes sourdes ou malentendantes.",
  },
  {
    name: '17 — Police / Gendarmerie',
    number: '17',
    description: 'En cas de danger immédiat, appelle la police ou la gendarmerie.',
  },
  {
    name: '112 — Urgences européennes',
    number: '112',
    description: "Numéro unique européen d'urgence.",
  },
  {
    name: '31 14 — Prévention du suicide',
    number: '3114',
    description: "Numéro d'écoute pour la souffrance psychique, 24h/24 et 7j/7.",
  },
  {
    name: 'Arrêtons les violences',
    url: 'https://arretonslesviolences.gouv.fr',
    description: 'Plateforme gouvernementale de signalement et de ressources.',
  },
];

// ─── CONSENTOMÈTRE ──────────────────────────────────────────
// Source : PDF Consentometre-2024-Web.pdf — Université de Poitiers
const consentometre: Meter = {
  slug: 'consentometre',
  name: 'Consentomètre',
  emoji: '🤝',
  tagline: 'Mesure ton niveau de consentement',
  description:
    'Un outil pour évaluer si ton consentement est respecté dans tes relations — amicales, amoureuses, universitaires ou professionnelles.',
  intro:
    "Réponds par Oui ou Non à chaque situation. Il n'y a pas de bonne ou mauvaise réponse : c'est un outil pour t'aider à identifier ce que tu vis.",
  questionPrefix: 'Est-ce que cette situation te concerne ?',
  questions: [
    // ── GREEN: C'est ok, la situation est saine ──
    { id: 1, text: "J'exprime clairement mes désirs, mes choix et mes limites", level: 'green' },
    { id: 2, text: `On respecte mes décisions, mes désirs et mes goûts`, level: 'green' },
    {
      id: 3,
      text: "Mon tuteur ou ma tutrice de stage s'intéresse à mon bien-être et à mon intégration dans l'équipe",
      level: 'green',
    },
    {
      id: 4,
      text: `Quand je refuse un verre en soirée, on me laisse tranquille`,
      level: 'green',
    },
    {
      id: 5,
      text: `Mon ou ma partenaire accepte mon environnement, mon réseau social et ma famille`,
      level: 'green',
    },
    {
      id: 6,
      text: "La personne s'assure de mon accord pour tout ce que nous faisons ensemble",
      level: 'green',
    },
    { id: 7, text: "L'autre est content·e de mes réussites", level: 'green' },

    // ── YELLOW: Attention c'est limite, je suis vigilant·e ──
    {
      id: 8,
      text: "On s'adresse à moi avec des remarques sexistes comme « arrête de pleurer, c'est pas viril »",
      level: 'yellow',
    },
    {
      id: 9,
      text: `Une personne fait une remarque déplacée sur ma tenue vestimentaire`,
      level: 'yellow',
    },
    {
      id: 10,
      text: "Quelqu'un me dévisage dans la rue au point de me mettre mal à l'aise",
      level: 'yellow',
    },
    {
      id: 11,
      text: "On m'interpelle en me disant « coucou, tu me passes ton numéro ! »",
      level: 'yellow',
    },
    {
      id: 12,
      text: "Quelqu'un dit « tu es plutôt douée en maths pour une fille »",
      level: 'yellow',
    },
    {
      id: 13,
      text: "On dit « pourquoi vous n'avez pas d'hommes dans votre groupe, ça vous rendrait plus crédibles »",
      level: 'yellow',
    },

    // ── ORANGE: Je me protège, j'en parle ──
    {
      id: 14,
      text: `On tient des propos humiliants ou intimidants contre moi en public ou en ligne`,
      level: 'orange',
    },
    {
      id: 15,
      text: "On me dit « en t'habillant comme ça aussi, tu le cherches »",
      level: 'orange',
    },
    {
      id: 16,
      text: "Quelqu'un place son bras autour de ma taille sans mon consentement et ne me lâche pas",
      level: 'orange',
    },
    {
      id: 17,
      text: `Mon ou ma partenaire cherche à contrôler mes relations et mon emploi du temps`,
      level: 'orange',
    },
    {
      id: 18,
      text: "On insiste pour monter chez moi après m'avoir raccompagné·e",
      level: 'orange',
    },
    {
      id: 19,
      text: "Mon professeur·e ou maître de stage me met la pression pour que j'aille boire un verre avec lui ou elle",
      level: 'orange',
    },
    {
      id: 20,
      text: "Un·e inconnu·e me suit jusque chez moi en descendant du bus",
      level: 'orange',
    },

    // ── RED: Je dis STOP, je cherche du soutien ──
    {
      id: 21,
      text: `On me force à me déshabiller lors d'une soirée`,
      level: 'red',
    },
    {
      id: 22,
      text: "On me dit « allez ça va, je sais que tu en as envie »",
      level: 'red',
    },
    {
      id: 23,
      text: "Quelqu'un menace de se suicider à cause de moi",
      level: 'red',
    },
    {
      id: 24,
      text: `On me menace avec des paroles, du chantage ou une arme`,
      level: 'red',
    },
    {
      id: 25,
      text: "On diffuse des photos intimes de moi, qu'elles soient vraies ou fabriquées",
      level: 'red',
    },
    {
      id: 26,
      text: "On me drogue à mon insu ou on me force à m'alcooliser pour me rendre vulnérable",
      level: 'red',
    },
    {
      id: 27,
      text: "Quelqu'un profite que je sois endormi·e pour toucher mes parties intimes",
      level: 'red',
    },
    {
      id: 28,
      text: "On m'oblige à avoir des pratiques sexuelles pour lesquelles je n'ai pas donné mon consentement",
      level: 'red',
    },
    {
      id: 29,
      text: "On m'envoie ou me force à faire des nudes ou des sextos sans mon consentement",
      level: 'red',
    },
  ],
  levels: {
    green: {
      label: 'Sain',
      title: 'Ta situation semble saine ✨',
      message:
        'Les situations que tu vis correspondent à des relations respectueuses. Ton consentement est pris en compte.',
      advice:
        "Continue à exprimer tes limites clairement. Tu peux aussi aider tes proches à identifier les situations où leur consentement n'est pas respecté.",
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Vigilance',
      title: 'Attention, sois vigilant·e ⚠️',
      message:
        "Certaines situations que tu vis sont limites. Ce sont des comportements sexistes ou déplacés qui ne sont pas acceptables, même s'ils sont banalisés.",
      advice:
        "Fais-toi confiance : si tu te sens mal à l'aise, c'est légitime. Tu peux en parler à une personne de confiance ou contacter les ressources ci-dessous.",
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Alerte',
      title: 'Protège-toi, parles-en 🧡',
      message:
        "Les situations que tu vis dépassent la limite. Il s'agit de comportements de contrôle, d'intimidation ou de harcèlement.",
      advice:
        "Ne reste pas seul·e face à cette situation. Parle à une personne de confiance et n'hésite pas à contacter les ressources d'aide ci-dessous.",
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'Dis STOP, cherche du soutien 🔴',
      message:
        `Les situations que tu décris sont graves. Ce sont des violences : tu es en droit de demander de l'aide immédiatement.`,
      advice:
        "Ta sécurité est la priorité. Contacte immédiatement l'un des numéros ci-dessous. Si tu es en danger, appelle le 17 (police) ou le 112.",
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    ...COMMON_RESOURCES,
    {
      name: 'CNAE — Écoute étudiants',
      number: '0 800 737 800',
      url: 'https://etudiant.gouv.fr/fr/cnae',
      description: "Ligne d'écoute nationale pour le bien-être des étudiant·e·s (gratuit).",
    },
  ],
};

// ─── VIOLENTOMÈTRE ──────────────────────────────────────────
// Source : Département de Seine-Saint-Denis / Centre Hubertine Auclert
const violentometre: Meter = {
  slug: 'violentometre',
  name: 'Violentomètre',
  emoji: '🌡️',
  tagline: 'Évalue ta relation de couple',
  description:
    'Un outil pour mesurer si ta relation amoureuse est saine ou si elle comporte des signes de violence.',
  intro:
    "Pense à ta relation actuelle ou passée. Pour chaque situation, réponds si tu l'as vécue. C'est confidentiel et anonyme.",
  questionPrefix: 'Dans ta relation, est-ce que ton ou ta partenaire…',
  questions: [
    // ── GREEN: Profite, ta relation est saine ──
    { id: 1, text: `Respecte tes décisions, tes désirs et tes goûts`, level: 'green' },
    { id: 2, text: `A confiance en toi`, level: 'green' },
    {
      id: 3,
      text: "S'assure de ton accord pour tout ce que vous faites ensemble",
      level: 'green',
    },
    { id: 4, text: `Accepte tes ami·e·s et ta famille`, level: 'green' },
    { id: 5, text: `Est content·e de tes réussites`, level: 'green' },

    // ── YELLOW: Vigilance, dis stop ──
    { id: 6, text: `Se moque de toi en public`, level: 'yellow' },
    { id: 7, text: `Est jaloux·se en permanence`, level: 'yellow' },
    {
      id: 8,
      text: `Contrôle tes sorties, tes vêtements, ton maquillage`,
      level: 'yellow',
    },
    { id: 9, text: "T'isole de ta famille et de tes ami·e·s", level: 'yellow' },
    { id: 10, text: `Fouille dans tes affaires, ton téléphone`, level: 'yellow' },
    { id: 11, text: "T'insulte, te crie dessus", level: 'yellow' },

    // ── ORANGE: C'est de la violence, réagis ──
    { id: 12, text: "Te rabaisse, t'humilie régulièrement", level: 'orange' },
    {
      id: 13,
      text: `Te menace de représailles si tu le/la quittes`,
      level: 'orange',
    },
    {
      id: 14,
      text: `Te harcèle quand vous n'êtes pas ensemble (appels, textos non-stop)`,
      level: 'orange',
    },
    {
      id: 15,
      text: `Menace de diffuser des photos intimes de toi`,
      level: 'orange',
    },
    { id: 16, text: `Te pousse, te secoue, te tire les cheveux`, level: 'orange' },

    // ── RED: Protège-toi, appelle à l'aide ──
    { id: 17, text: `Te gifle`, level: 'red' },
    {
      id: 18,
      text: `Te frappe, te donne des coups de poing ou de pied`,
      level: 'red',
    },
    { id: 19, text: `Te blesse avec un objet`, level: 'red' },
    { id: 20, text: "T'enferme, te séquestre", level: 'red' },
    {
      id: 21,
      text: "T'oblige à avoir des relations sexuelles",
      level: 'red',
    },
    {
      id: 22,
      text: `Menace de se suicider pour te retenir`,
      level: 'red',
    },
    { id: 23, text: `Menace de te tuer`, level: 'red' },
    { id: 24, text: `Utilise une arme contre toi`, level: 'red' },
  ],
  levels: {
    green: {
      label: 'Sain',
      title: 'Ta relation semble saine 💚',
      message:
        'Les situations que tu décris correspondent à une relation respectueuse et équilibrée. Bravo !',
      advice:
        'Continue à communiquer ouvertement avec ton ou ta partenaire. Une relation saine repose sur le respect mutuel.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Vigilance',
      title: 'Dis stop, sois vigilant·e ⚠️',
      message:
        "Certains comportements dans ta relation sont problématiques. Ce sont des signes de violence psychologique, même s'ils semblent « normaux ».",
      advice:
        "Ces comportements ne sont pas acceptables dans une relation. Parle de ce que tu vis à une personne de confiance. Tu peux aussi appeler le 3919 pour en discuter.",
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Violence',
      title: `C'est de la violence, réagis 🧡`,
      message:
        `Ce que tu vis dans ta relation constitue de la violence. Ce n'est pas de ta faute et tu mérites d'être aidé·e.`,
      advice:
        "N'attends pas que la situation s'aggrave. Contacte le 3919 ou les ressources ci-dessous. Parle à une personne de confiance et prépare un plan de sécurité.",
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: `Protège-toi, appelle à l'aide 🔴`,
      message:
        'Tu es en danger. Ce que tu subis est un délit ou un crime puni par la loi. Tu as le droit de porter plainte.',
      advice:
        "Ta vie est en danger. Appelle le 17 (police) ou le 112 immédiatement. Ne reste pas seul·e. Le 3919 peut aussi t'aider à trouver un hébergement d'urgence.",
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: COMMON_RESOURCES,
};

// ─── INCESTOMÈTRE ───────────────────────────────────────────
// Source : Association Face à l'inceste / Mémoire Traumatique
const incestometre: Meter = {
  slug: 'incestometre',
  name: 'Incestomètre',
  emoji: '🛡️',
  tagline: 'Identifie les comportements inappropriés',
  description:
    'Un outil pour reconnaître les comportements normaux et anormaux dans ton entourage familial ou proche.',
  intro:
    "Pour chaque situation, indique si tu l'as vécue avec un membre de ta famille ou un proche. Tes réponses sont anonymes et restent sur ton appareil.",
  questionPrefix: `Est-ce qu'un membre de ta famille ou un proche…`,
  questions: [
    // ── GREEN: La relation est saine ──
    { id: 1, text: `Respecte ton intimité (frappe avant d'entrer, etc.)`, level: 'green' },
    {
      id: 2,
      text: `Te laisse choisir comment tu t'habilles`,
      level: 'green',
    },
    {
      id: 3,
      text: `Ne fait pas de commentaires gênants sur ton corps`,
      level: 'green',
    },
    {
      id: 4,
      text: `Respecte ton espace personnel et tes limites`,
      level: 'green',
    },

    // ── YELLOW: Attention, c'est limite ──
    {
      id: 5,
      text: `Fait des remarques ou des blagues sur ton corps ou ta sexualité`,
      level: 'yellow',
    },
    {
      id: 6,
      text: `Entre dans ta chambre ou la salle de bain sans frapper`,
      level: 'yellow',
    },
    {
      id: 7,
      text: `Te compare physiquement à d'autres personnes de façon gênante`,
      level: 'yellow',
    },
    {
      id: 8,
      text: `Te demande de garder des « petits secrets » entre vous`,
      level: 'yellow',
    },
    {
      id: 9,
      text: `Insiste pour te faire des câlins ou des bisous alors que tu ne veux pas`,
      level: 'yellow',
    },

    // ── ORANGE: Ce n'est pas normal, parles-en ──
    {
      id: 10,
      text: `Te touche d'une façon qui te met mal à l'aise`,
      level: 'orange',
    },
    {
      id: 11,
      text: `Te montre des images ou vidéos à caractère sexuel`,
      level: 'orange',
    },
    {
      id: 12,
      text: `Se montre nu·e devant toi de façon répétitive et inappropriée`,
      level: 'orange',
    },
    {
      id: 13,
      text: `Te fait des bisous sur la bouche`,
      level: 'orange',
    },
    {
      id: 14,
      text: `Te demande de ne pas parler de certains gestes à d'autres`,
      level: 'orange',
    },

    // ── RED: C'est interdit, appelle à l'aide ──
    {
      id: 15,
      text: `Touche tes parties intimes`,
      level: 'red',
    },
    {
      id: 16,
      text: `Te demande de toucher ses parties intimes`,
      level: 'red',
    },
    {
      id: 17,
      text: `T'oblige à regarder ses parties intimes`,
      level: 'red',
    },
    {
      id: 18,
      text: "T'oblige à des actes sexuels",
      level: 'red',
    },
    {
      id: 19,
      text: `Te menace si tu en parles`,
      level: 'red',
    },
    {
      id: 20,
      text: `Te fait croire que c'est normal ou que c'est de ta faute`,
      level: 'red',
    },
  ],
  levels: {
    green: {
      label: 'Sain',
      title: 'Les relations semblent saines ✨',
      message:
        'Les comportements que tu décris sont normaux et respectueux de ton intimité.',
      advice:
        `C'est très bien. Tu as le droit à cette relation respectueuse. Si un jour quelque chose te met mal à l'aise, n'hésite pas à en parler.`,
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Vigilance',
      title: 'Attention, sois vigilant·e ⚠️',
      message:
        'Certains comportements que tu décris ne sont pas normaux, même si la personne les présente comme « sans importance ».',
      advice:
        'Tu as le droit de dire non et de poser des limites. Si ces situations te gênent, parle à un adulte de confiance (prof, infirmier·e scolaire, ami·e).',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Alerte',
      title: `Ce n'est pas normal, parles-en 🧡`,
      message:
        'Les comportements que tu décris dépassent les limites. Ce sont des violences, même si la personne est un membre de ta famille.',
      advice:
        `Ce que tu subis n'est pas de ta faute. Parle à une personne de confiance ou appelle le 119 (Allô enfance en danger). Tu seras écouté·e et aidé·e.`,
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: `C'est interdit, appelle à l'aide 🔴`,
      message:
        `Ce que tu subis est un crime. L'inceste est interdit par la loi, quelle que soit la personne. Ce n'est JAMAIS de ta faute.`,
      advice:
        `Tu es en droit d'être protégé·e. Appelle le 119 (enfance en danger) ou le 0 800 05 95 95 (Viols Femmes Informations). Tu peux aussi envoyer un SMS au 114.`,
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    {
      name: '119 — Allô Enfance en Danger',
      number: '119',
      description: "Numéro d'écoute national pour les enfants et adolescents en danger, 24h/24.",
    },
    {
      name: '0 800 05 95 95 — Viols Femmes Informations',
      number: '0 800 05 95 95',
      description: "Écoute, information et orientation pour les victimes de violences sexuelles (gratuit et anonyme).",
    },
    ...COMMON_RESOURCES,
    {
      name: `Face à l'inceste`,
      url: 'https://facealinceste.fr',
      description: "Association d'aide aux victimes d'inceste.",
    },
    {
      name: 'Mémoire Traumatique',
      url: 'https://www.memoiretraumatique.org',
      description: 'Ressources sur les psychotraumatismes et les violences.',
    },
  ],
};

// ─── HARCÉLOMÈTRE ───────────────────────────────────────────
// Source : Outils de prévention du harcèlement scolaire
const harcelometre: Meter = {
  slug: 'harcelometre',
  name: `Harcélomètre`,
  emoji: '🎯',
  tagline: 'Es-tu victime de harcèlement ?',
  description:
    `Un outil pour évaluer si tu subis du harcèlement à l'école, en ligne ou dans ton quotidien.`,
  intro:
    `Lis chaque situation et réponds par Oui ou Non selon ce que tu vis. Il n'y a pas de mauvaise réponse : c'est un outil pour t'aider à y voir plus clair.`,
  questionPrefix: 'Est-ce que cette situation te concerne ?',
  questions: [
    // ── GREEN: Profite, tout va bien ──
    { id: 1, text: `Tu échanges des messages amicaux`, level: 'green' },
    { id: 2, text: `On te soutient dans les moments difficiles`, level: 'green' },
    { id: 3, text: `Tu fais du sport et tu as des loisirs`, level: 'green' },
    { id: 4, text: `Les amis ou camarades sont des ressources pour toi`, level: 'green' },
    { id: 5, text: `Tu maîtrises internet et tu sais t'en passer`, level: 'green' },

    // ── YELLOW: Fais attention, dis stop ──
    { id: 6, text: `On fait de temps en temps des blagues sur toi`, level: 'yellow' },
    { id: 7, text: `On te choisit en dernier pour les activités de groupe`, level: 'yellow' },
    { id: 8, text: `On se moque de toi (surnom…)`, level: 'yellow' },
    { id: 9, text: `On dégrade tes affaires scolaires`, level: 'yellow' },
    { id: 10, text: `On t'ignore, on t'isole`, level: 'yellow' },

    // ── ORANGE: C'est du harcèlement en ligne ──
    { id: 11, text: `On te photographie à ton insu`, level: 'orange' },
    { id: 12, text: `On t'insulte sur les réseaux sociaux`, level: 'orange' },
    { id: 13, text: `Tu entends des rumeurs sur toi`, level: 'orange' },
    { id: 14, text: `On t'interdit de parler aux autres`, level: 'orange' },

    // ── RED: Alerte, demande de l'aide ──
    { id: 15, text: `On met des photos de toi sur internet sans ton accord`, level: 'red' },
    { id: 16, text: `On t'incite à te faire du mal`, level: 'red' },
    { id: 17, text: `On te pousse à bout, on essaie de te mettre en colère`, level: 'red' },
    { id: 18, text: `On t'humilie sexuellement (surnom, photomontage…)`, level: 'red' },
    { id: 19, text: `On te touche les parties intimes pour se moquer`, level: 'red' },
    { id: 20, text: `On te menace sur internet (Snapchat, Instagram, TikTok…)`, level: 'red' },
    { id: 21, text: `On te pousse à faire des choses que tu ne veux pas`, level: 'red' },
    { id: 22, text: `On te rackette ou on te menace de violences`, level: 'red' },
    { id: 23, text: `On te donne des coups, on te frappe`, level: 'red' },
  ],
  levels: {
    green: {
      label: 'Sain',
      title: `Pas de souci, continue comme ça 💚`,
      message:
        `Tes relations semblent saines. Tu as des amis qui te soutiennent et tu profites de tes activités.`,
      advice:
        `Continue à parler avec tes amis et tes professeurs si tu as un doute. Rester vigilant·e est toujours une bonne idée.`,
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Attention',
      title: `Fais attention, dis stop ⚠️`,
      message:
        `Certaines situations que tu vis ne sont pas normales. Se moquer de toi, t'isoler ou te choisir en dernier, ce n'est pas anodin.`,
      advice:
        `Parles-en à une personne de confiance : un·e ami·e, un·e prof, tes parents, l'infirmier·e scolaire. Tu n'as pas à subir ça.`,
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Cyberharcèlement',
      title: `C'est du harcèlement, réagis 🧡`,
      message:
        `Ce que tu décris relève du harcèlement, notamment en ligne. Être photographié·e à son insu, insulté·e sur les réseaux ou isolé·e volontairement : ce n'est pas acceptable.`,
      advice:
        `Ne reste pas seul·e. Signale les contenus en ligne, bloque les personnes concernées et parles-en à un adulte de confiance. Tu peux aussi appeler le 3020.`,
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: `Tu es harcelé·e, demande de l'aide 🔴`,
      message:
        `Les situations que tu décris sont graves. Tu subis du harcèlement. Ce n'est pas de ta faute et tu as le droit d'être aidé·e.`,
      advice:
        `Demande de l'aide rapidement ! Parle à un professeur, un CPE, un infirmier scolaire, tes parents ou un membre de ta famille. Tu peux aussi contacter un policier ou un gendarme formé sur le tchat du 3018.`,
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    {
      name: '3020 — Non au harcèlement',
      number: '3020',
      description: `Numéro national contre le harcèlement scolaire, gratuit et confidentiel.`,
    },
    {
      name: '3018 — Net Écoute',
      number: '3018',
      url: 'https://www.netecoute.fr',
      description: `Numéro contre le cyberharcèlement. Aussi disponible en tchat sur netecoute.fr.`,
    },
    {
      name: '119 — Allô Enfance en Danger',
      number: '119',
      description: `Numéro d'écoute national pour les enfants et adolescents en danger, 24h/24.`,
    },
    ...COMMON_RESOURCES,
    {
      name: 'e-Enfance',
      url: 'https://e-enfance.org',
      description: `Association de protection des mineurs en ligne.`,
    },
  ],
};

// ─── DISCRIMINOMÈTRE ────────────────────────────────────────
// Source : Outil de prévention des discriminations (image)
const discriminometre: Meter = {
  slug: 'discriminometre',
  name: `Discriminomètre`,
  emoji: '⚖️',
  tagline: 'Mesure les discriminations que tu vis',
  description:
    `Un outil pour identifier les comportements discriminatoires que tu peux vivre au quotidien, de la micro-agression à la violence.`,
  intro:
    `Pour chaque situation, indique si tu l'as déjà vécue. Tes réponses sont anonymes et restent sur ton appareil.`,
  questionPrefix: `Est-ce que cette situation t'est déjà arrivée ?`,
  questions: [
    // ── GREEN: Tout va bien ──
    { id: 1, text: `On respecte ce que je suis`, level: 'green' },
    { id: 2, text: `On respecte ma différence`, level: 'green' },
    { id: 3, text: `On respecte mes choix`, level: 'green' },
    { id: 4, text: `On respecte ma culture`, level: 'green' },

    // ── YELLOW: Vigilance ──
    { id: 5, text: `Mes ami·e·s font des blagues sur mon nom`, level: 'yellow' },
    { id: 6, text: `Un·e passant·e m'a fait une remarque désagréable sur ma jupe`, level: 'yellow' },
    { id: 7, text: `Tête en l'air, on me demande si je suis mongolien·ne`, level: 'yellow' },
    { id: 8, text: `On me dit que je suis un "garçon manqué"`, level: 'yellow' },

    // ── ORANGE: Dis stop ──
    { id: 9, text: `Présentant un projet, on me dit que c'est du "travail d'arabe"`, level: 'orange' },
    { id: 10, text: `Perçu·e comme radin·e, on m'appelle "le/la feuj de service"`, level: 'orange' },
    { id: 11, text: `Énervée, on me dit : "t'as tes règles ou quoi ?!"`, level: 'orange' },
    { id: 12, text: `Maladroit·e, on me dit : "t'es handicapé·e ou quoi ?!"`, level: 'orange' },
    { id: 13, text: `Bénéficiaire de la C.M.U., on m'a refusé un rendez-vous chez le médecin`, level: 'orange' },
    { id: 14, text: `En me voyant, on m'a refusé l'entrée dans un bar`, level: 'orange' },
    { id: 15, text: `Après avoir dit mon nom, on m'a refusé la visite d'un logement`, level: 'orange' },
    { id: 16, text: `On m'a refusé une promotion parce que je suis enceinte`, level: 'orange' },

    // ── RED: Tu es en danger ──
    { id: 17, text: `On m'insulte de : sale PD, pute, arabe, juif·ve, triso…`, level: 'red' },
    { id: 18, text: `Je subis des humiliations, des brimades à l'école ou au travail`, level: 'red' },
    { id: 19, text: `Je subis des bousculades, des coups…`, level: 'red' },
    { id: 20, text: `Je subis des mains aux fesses, des baisers forcés, des rapports non consentis…`, level: 'red' },
  ],
  levels: {
    green: {
      label: 'Sain',
      title: `Tout va bien, continue ✨`,
      message:
        `Les situations que tu décris montrent que tu es respecté·e dans ta différence. C'est la base d'un environnement sain.`,
      advice:
        `Continue à défendre le respect de chacun·e. Si tu es témoin de discriminations autour de toi, n'hésite pas à réagir ou à en parler.`,
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Vigilance',
      title: `Vigilance, ne laisse pas passer ⚠️`,
      message:
        `Les blagues et remarques que tu subis sont des micro-agressions. Même si elles semblent "anodines", elles ne sont pas acceptables.`,
      advice:
        `Tu as le droit de dire que ça te blesse. Parles-en à un·e ami·e, un·e prof ou un·e adulte de confiance. Ces remarques ne sont pas normales.`,
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Discrimination',
      title: `Dis stop, c'est de la discrimination 🧡`,
      message:
        `Ce que tu vis constitue une discrimination. Refuser un service, un logement, un emploi ou se moquer de ton identité : c'est interdit par la loi.`,
      advice:
        `Tu peux saisir le Défenseur des droits (defenseurdesdroits.fr) ou contacter SOS Racisme. Parle de ta situation à une personne de confiance.`,
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: `Tu es en danger, demande de l'aide 🔴`,
      message:
        `Les insultes, humiliations, coups et agressions que tu subis sont des délits ou des crimes. Tu as le droit d'être protégé·e.`,
      advice:
        `Appelle le 17 (police) ou le 112 en cas de danger immédiat. Tu peux aussi contacter SOS Racisme (01 40 35 36 55) ou le Défenseur des droits. Porte plainte : c'est ton droit.`,
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    {
      name: 'Défenseur des droits',
      number: '3928',
      url: 'https://www.defenseurdesdroits.fr',
      description: `Autorité indépendante pour lutter contre les discriminations. Aussi joignable au 09 69 39 00 00.`,
    },
    {
      name: 'SOS Racisme',
      number: '01 40 35 36 55',
      url: 'https://sos-racisme.org',
      description: `Association de lutte contre le racisme et les discriminations.`,
    },
    {
      name: 'LICRA',
      url: 'https://www.licra.org',
      description: `Ligue internationale contre le racisme et l'antisémitisme.`,
    },
    ...COMMON_RESOURCES,
    {
      name: 'SOS Homophobie',
      number: '01 48 06 42 41',
      url: 'https://www.sos-homophobie.org',
      description: `Ligne d'écoute contre les LGBTphobies, anonyme et confidentielle.`,
    },
    {
      name: 'DILCRAH',
      url: 'https://www.dilcrah.fr',
      description: `Délégation interministérielle à la lutte contre le racisme, l'antisémitisme et la haine anti-LGBT.`,
    },
  ],
};

// ─── Export ────────────────────────────────────────────────
export const METERS: Meter[] = [violentometre, consentometre, incestometre, harcelometre, discriminometre];

export function getMeterBySlug(slug: string): Meter | undefined {
  return METERS.find((m) => m.slug === slug);
}

/** Ordre de sévérité pour comparaison */
export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  green: 0,
  yellow: 1,
  orange: 2,
  red: 3,
};

/** Retourne le niveau le plus élevé parmi les réponses problématiques.
 * - Questions jaunes/orange/rouges : "Oui" = problème
 * - Questions vertes (positives) : "Non" = problème (traité comme vigilance/jaune)
 */
export function getHighestSeverity(
  answers: Map<number, boolean>,
  questions: MeterQuestion[],
): SeverityLevel {
  let highest: SeverityLevel = 'green';
  for (const [qId, isYes] of answers) {
    const question = questions.find((q) => q.id === qId);
    if (!question) continue;

    // Green questions are positive: "Non" is the problem
    if (question.level === 'green') {
      if (!isYes && SEVERITY_ORDER['yellow'] > SEVERITY_ORDER[highest]) {
        highest = 'yellow';
      }
      continue;
    }

    // Other levels: "Oui" is the problem
    if (isYes && SEVERITY_ORDER[question.level] > SEVERITY_ORDER[highest]) {
      highest = question.level;
    }
  }
  return highest;
}

/** Retourne les réponses problématiques groupées par niveau.
 * - Questions jaunes/orange/rouges : celles répondues "Oui"
 * - Questions vertes (positives) : celles répondues "Non" (classées en "yellow")
 */
export function getYesAnswersByLevel(
  answers: Map<number, boolean>,
  questions: MeterQuestion[],
): Record<SeverityLevel, MeterQuestion[]> {
  const result: Record<SeverityLevel, MeterQuestion[]> = {
    green: [],
    yellow: [],
    orange: [],
    red: [],
  };
  for (const [qId, isYes] of answers) {
    const question = questions.find((q) => q.id === qId);
    if (!question) continue;

    // Green questions are positive: "Non" is problematic → classify as yellow
    if (question.level === 'green') {
      if (!isYes) result.yellow.push(question);
      continue;
    }

    // Other levels: "Oui" is problematic
    if (isYes) result[question.level].push(question);
  }
  return result;
}
