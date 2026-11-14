/**
 * @module meters-data-en
 * Les outils d'auto-évaluation en anglais (traduction du 2026-11-14).
 *
 * Même type, même ordre, mêmes identifiants de question et mêmes niveaux que
 * `meters-data.ts`, qui reste la source française et n'est pas touché : seuls
 * les textes changent. Le calcul du résultat (`getHighestSeverity`,
 * `getYesAnswersByLevel`) ne lit que `id` et `level`, il vaut pour les deux.
 *
 * LES BARÈMES ET LES NUMÉROS SONT FRANÇAIS
 *   Les grilles viennent d'institutions françaises et les numéros d'aide sont
 *   ceux de la France (3919, 17, 112, 119, 114, 3020, 3018…). On les garde tels
 *   quels, noms d'organismes compris, et les textes le disent ; les pages
 *   anglaises ajoutent une ligne pour qui n'est pas en France. Aucun numéro
 *   étranger n'est ajouté : on n'en invente pas.
 */

import type { Langue } from '@/lib/i18n/langue';
import { METERS, type Meter, type MeterResource } from './meters-data';

/**
 * Le nom français de chaque outil, cité à côté du nom anglais pour qu'on
 * reconnaisse l'outil (« Violence Meter (Violentomètre) »). Écrit ici plutôt
 * que lu dans `meters-data.ts` : le nom du harcèlomètre y porte un accent aigu.
 */
export const NOM_FRANCAIS: Record<string, string> = {
  violentometre: 'Violentomètre',
  consentometre: 'Consentomètre',
  incestometre: 'Incestomètre',
  harcelometre: 'Harcèlomètre',
  discriminometre: 'Discriminomètre',
};

// ─── Ressources communes ────────────────────────────────────
const COMMON_RESOURCES: MeterResource[] = [
  {
    name: '3919 — Violences Femmes Info',
    number: '3919',
    description: 'French national helpline for victims of violence, 24/7.',
  },
  {
    name: '114 — Emergency number for deaf and hard-of-hearing people',
    number: '114',
    description: 'French emergency number by text message (SMS) for deaf or hard-of-hearing people.',
  },
  {
    name: '17 — Police / Gendarmerie',
    number: '17',
    description: 'If you are in immediate danger, call the police or the gendarmerie (France).',
  },
  {
    name: '112 — European emergency number',
    number: '112',
    description: 'The single emergency number across Europe.',
  },
  {
    name: '31 14 — Suicide prevention',
    number: '3114',
    description: 'French helpline for psychological distress, 24/7.',
  },
  {
    name: 'Arrêtons les violences',
    url: 'https://arretonslesviolences.gouv.fr',
    description: 'French government platform for reporting and resources.',
  },
];

const ALLO_ENFANCE: MeterResource = {
  name: '119 — Allô Enfance en Danger',
  number: '119',
  description: 'French national helpline for children and teenagers in danger, 24/7.',
};

// ─── CONSENTOMÈTRE ──────────────────────────────────────────
const consentometre: Meter = {
  slug: 'consentometre',
  name: 'Consent Meter',
  emoji: '🤝',
  tagline: 'Check whether your consent is respected',
  description:
    'A tool to assess whether your consent is respected in your relationships — friendships, romantic relationships, university or work.',
  intro:
    'Answer Yes or No to each situation. There is no right or wrong answer: this tool is here to help you identify what you are going through.',
  questionPrefix: 'Does this situation apply to you?',
  questions: [
    { id: 1, text: 'I clearly express my wishes, my choices and my limits', level: 'green', negatedText: 'I don’t clearly express my wishes, my choices and my limits' },
    { id: 2, text: 'People respect my decisions, my wishes and my tastes', level: 'green', negatedText: 'People don’t respect my decisions, my wishes or my tastes' },
    {
      id: 3,
      text: 'My internship supervisor cares about my well-being and about how I fit into the team',
      level: 'green',
      negatedText: 'My internship supervisor doesn’t care about my well-being or about how I fit in',
    },
    {
      id: 4,
      text: 'When I turn down a drink at a party, people leave me alone',
      level: 'green',
      negatedText: 'When I turn down a drink at a party, people don’t leave me alone',
    },
    {
      id: 5,
      text: 'My partner accepts my surroundings, my social circle and my family',
      level: 'green',
      negatedText: 'My partner doesn’t accept my surroundings, my social circle or my family',
    },
    {
      id: 6,
      text: 'The other person makes sure I agree to everything we do together',
      level: 'green',
      negatedText: 'The other person doesn’t make sure I agree to everything we do together',
    },
    { id: 7, text: 'The other person is happy about my successes', level: 'green', negatedText: 'The other person isn’t happy about my successes' },

    { id: 8, text: 'People make sexist remarks to me, like “stop crying, it’s not manly”', level: 'yellow' },
    { id: 9, text: 'Someone makes an inappropriate comment about what I’m wearing', level: 'yellow' },
    { id: 10, text: 'Someone stares at me in the street to the point of making me uncomfortable', level: 'yellow' },
    { id: 11, text: 'Someone calls out to me: “hey, give me your number!”', level: 'yellow' },
    { id: 12, text: 'Someone says “you’re pretty good at math for a girl”', level: 'yellow' },
    { id: 13, text: 'Someone says “why don’t you have any men in your group? It would make you more credible”', level: 'yellow' },

    { id: 14, text: 'People say humiliating or intimidating things against me in public or online', level: 'orange' },
    { id: 15, text: 'Someone tells me “dressed like that, you’re asking for it”', level: 'orange' },
    { id: 16, text: 'Someone puts their arm around my waist without my consent and won’t let go', level: 'orange' },
    { id: 17, text: 'My partner tries to control my relationships and my schedule', level: 'orange' },
    { id: 18, text: 'Someone insists on coming up to my place after walking me home', level: 'orange' },
    { id: 19, text: 'My teacher or internship supervisor pressures me to go for a drink with them', level: 'orange' },
    { id: 20, text: 'A stranger follows me home after I get off the bus', level: 'orange' },

    { id: 21, text: 'Someone forces me to undress at a party', level: 'red' },
    { id: 22, text: 'Someone tells me “come on, I know you want to”', level: 'red' },
    { id: 23, text: 'Someone threatens to kill themselves because of me', level: 'red' },
    { id: 24, text: 'Someone threatens me with words, blackmail or a weapon', level: 'red' },
    { id: 25, text: 'Someone shares intimate photos of me, whether real or fabricated', level: 'red' },
    { id: 26, text: 'Someone drugs me without my knowledge or forces me to drink alcohol to make me vulnerable', level: 'red' },
    { id: 27, text: 'Someone takes advantage of me being asleep to touch my private parts', level: 'red' },
    { id: 28, text: 'Someone forces me into sexual practices I did not consent to', level: 'red' },
    { id: 29, text: 'Someone sends me nudes or sexts, or forces me to make them, without my consent', level: 'red' },
  ],
  levels: {
    green: {
      label: 'Healthy',
      title: 'Your situation seems healthy ✨',
      message:
        'The situations you are experiencing match respectful relationships. Your consent is taken into account.',
      advice:
        'Keep expressing your limits clearly. You can also help the people close to you recognize situations where their consent is not respected.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Caution',
      title: 'Careful, stay alert ⚠️',
      message:
        'Some of the situations you are experiencing are borderline. These are sexist or inappropriate behaviors that are not acceptable, even if they are often treated as normal.',
      advice:
        'Trust yourself: if you feel uncomfortable, that feeling is legitimate. You can talk to someone you trust or contact the resources below.',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Warning',
      title: 'Protect yourself, talk about it 🧡',
      message:
        'The situations you are experiencing cross the line. These are controlling, intimidating or harassing behaviors.',
      advice:
        'Don’t face this alone. Talk to someone you trust and don’t hesitate to contact the support resources below.',
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'Say STOP, seek support 🔴',
      message:
        'The situations you describe are serious. This is violence: you have the right to ask for help right away.',
      advice:
        'Your safety comes first. Contact one of the numbers below right away. If you are in danger in France, call 17 (police) or 112.',
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    ...COMMON_RESOURCES,
    {
      name: 'CNAE — Student helpline',
      number: '0 800 737 800',
      url: 'https://etudiant.gouv.fr/fr/cnae',
      description: 'French national helpline for students’ well-being (free).',
    },
  ],
};

// ─── VIOLENTOMÈTRE ──────────────────────────────────────────
const violentometre: Meter = {
  slug: 'violentometre',
  name: 'Violence Meter',
  emoji: '🌡️',
  tagline: 'Assess your relationship',
  description:
    'A tool to measure whether your romantic relationship is healthy or shows signs of violence.',
  intro:
    'Think about your current or past relationship. For each situation, answer whether you have experienced it. It is confidential and anonymous.',
  questionPrefix: 'In your relationship, does your partner…',
  questions: [
    { id: 1, text: 'Respect your decisions, your wishes and your tastes', level: 'green', negatedText: 'Doesn’t respect your decisions, your wishes or your tastes' },
    { id: 2, text: 'Trust you', level: 'green', negatedText: 'Doesn’t trust you' },
    {
      id: 3,
      text: 'Make sure you agree to everything you do together',
      level: 'green',
      negatedText: 'Doesn’t make sure you agree to everything you do together',
    },
    { id: 4, text: 'Accept your friends and your family', level: 'green', negatedText: 'Doesn’t accept your friends or your family' },
    { id: 5, text: 'Feel happy about your successes', level: 'green', negatedText: 'Isn’t happy about your successes' },

    { id: 6, text: 'Make fun of you in public', level: 'yellow' },
    { id: 7, text: 'Act jealous all the time', level: 'yellow' },
    { id: 8, text: 'Control where you go, what you wear, your makeup', level: 'yellow' },
    { id: 9, text: 'Cut you off from your family and friends', level: 'yellow' },
    { id: 10, text: 'Go through your things, your phone', level: 'yellow' },
    { id: 11, text: 'Insult you, yell at you', level: 'yellow' },

    { id: 12, text: 'Put you down, humiliate you regularly', level: 'orange' },
    { id: 13, text: 'Threaten to retaliate if you leave them', level: 'orange' },
    { id: 14, text: 'Harass you when you are not together (nonstop calls and texts)', level: 'orange' },
    { id: 15, text: 'Threaten to share intimate photos of you', level: 'orange' },
    { id: 16, text: 'Push you, shake you, pull your hair', level: 'orange' },

    { id: 17, text: 'Slap you', level: 'red' },
    { id: 18, text: 'Hit you, punch you or kick you', level: 'red' },
    { id: 19, text: 'Injure you with an object', level: 'red' },
    { id: 20, text: 'Lock you in, hold you against your will', level: 'red' },
    { id: 21, text: 'Force you to have sex', level: 'red' },
    { id: 22, text: 'Threaten to kill themselves to keep you', level: 'red' },
    { id: 23, text: 'Threaten to kill you', level: 'red' },
    { id: 24, text: 'Use a weapon against you', level: 'red' },
  ],
  levels: {
    green: {
      label: 'Healthy',
      title: 'Your relationship seems healthy 💚',
      message:
        'The situations you describe match a respectful, balanced relationship. Well done!',
      advice:
        'Keep communicating openly with your partner. A healthy relationship is built on mutual respect.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Caution',
      title: 'Say stop, stay alert ⚠️',
      message:
        'Some behaviors in your relationship are a problem. They are signs of psychological violence, even if they seem “normal”.',
      advice:
        'These behaviors are not acceptable in a relationship. Talk about what you are going through with someone you trust. In France, you can also call 3919 to talk it over.',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Violence',
      title: 'This is violence, take action 🧡',
      message:
        'What you are experiencing in your relationship is violence. It is not your fault and you deserve help.',
      advice:
        'Don’t wait for things to get worse. Contact 3919 or the resources below. Talk to someone you trust and prepare a safety plan.',
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'Protect yourself, call for help 🔴',
      message:
        'You are in danger. What you are going through is an offense or a crime punishable by law. You have the right to file a complaint.',
      advice:
        'Your life is in danger. In France, call 17 (police) or 112 right away. Don’t stay alone. 3919 can also help you find emergency housing.',
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: COMMON_RESOURCES,
};

// ─── INCESTOMÈTRE ───────────────────────────────────────────
const incestometre: Meter = {
  slug: 'incestometre',
  name: 'Incest Meter',
  emoji: '🛡️',
  tagline: 'Identify inappropriate behavior',
  description:
    'A tool to recognize normal and abnormal behavior within your family or among the people close to you.',
  intro:
    'For each situation, say whether you have experienced it with a family member or someone close to you. Your answers are anonymous and stay on your device.',
  questionPrefix: 'Does a family member or someone close to you…',
  questions: [
    { id: 1, text: 'Respect your privacy (knock before coming in, etc.)', level: 'green', negatedText: 'Doesn’t respect your privacy' },
    {
      id: 2,
      text: 'Let you choose how you dress',
      level: 'green',
      negatedText: 'Doesn’t let you choose how you dress',
    },
    {
      id: 3,
      text: 'Avoid making uncomfortable comments about your body',
      level: 'green',
      negatedText: 'Makes uncomfortable comments about your body',
    },
    {
      id: 4,
      text: 'Respect your personal space and your limits',
      level: 'green',
      negatedText: 'Doesn’t respect your personal space or your limits',
    },

    { id: 5, text: 'Make remarks or jokes about your body or your sexuality', level: 'yellow' },
    { id: 6, text: 'Come into your bedroom or the bathroom without knocking', level: 'yellow' },
    { id: 7, text: 'Compare your body to other people’s in an uncomfortable way', level: 'yellow' },
    { id: 8, text: 'Ask you to keep “little secrets” between the two of you', level: 'yellow' },
    { id: 9, text: 'Insist on hugging or kissing you when you don’t want to', level: 'yellow' },

    { id: 10, text: 'Touch you in a way that makes you uncomfortable', level: 'orange' },
    { id: 11, text: 'Show you sexual images or videos', level: 'orange' },
    { id: 12, text: 'Appear naked in front of you repeatedly and inappropriately', level: 'orange' },
    { id: 13, text: 'Kiss you on the mouth', level: 'orange' },
    { id: 14, text: 'Ask you not to tell others about certain things they do', level: 'orange' },

    { id: 15, text: 'Touch your private parts', level: 'red' },
    { id: 16, text: 'Ask you to touch their private parts', level: 'red' },
    { id: 17, text: 'Force you to look at their private parts', level: 'red' },
    { id: 18, text: 'Force you into sexual acts', level: 'red' },
    { id: 19, text: 'Threaten you if you tell anyone', level: 'red' },
    { id: 20, text: 'Make you believe it is normal or that it is your fault', level: 'red' },
  ],
  levels: {
    green: {
      label: 'Healthy',
      title: 'These relationships seem healthy ✨',
      message:
        'The behaviors you describe are normal and respect your privacy.',
      advice:
        'That is good. You have the right to this kind of respectful relationship. If something ever makes you uncomfortable, don’t hesitate to talk about it.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Caution',
      title: 'Careful, stay alert ⚠️',
      message:
        'Some of the behaviors you describe are not normal, even if the person presents them as “no big deal”.',
      advice:
        'You have the right to say no and to set limits. If these situations bother you, talk to an adult you trust (a teacher, the school nurse, a friend).',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Warning',
      title: 'This is not normal, talk about it 🧡',
      message:
        'The behaviors you describe cross the line. This is violence, even if the person is a member of your family.',
      advice:
        'What you are going through is not your fault. Talk to someone you trust or, in France, call 119 (Allô Enfance en Danger, the helpline for children in danger). You will be listened to and helped.',
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'This is prohibited, call for help 🔴',
      message:
        'What you are going through is a crime. Incest is prohibited by law, whoever the person is. It is NEVER your fault.',
      advice:
        'You have the right to be protected. In France, call 119 (children in danger) or 0 800 05 95 95 (Viols Femmes Informations). You can also send a text message to 114.',
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    ALLO_ENFANCE,
    {
      name: '0 800 05 95 95 — Viols Femmes Informations',
      number: '0 800 05 95 95',
      description: 'Listening, information and referrals for victims of sexual violence (free and anonymous).',
    },
    ...COMMON_RESOURCES,
    {
      name: 'Face à l’inceste',
      url: 'https://facealinceste.fr',
      description: 'Association supporting victims of incest.',
    },
    {
      name: 'Mémoire Traumatique',
      url: 'https://www.memoiretraumatique.org',
      description: 'Resources on psychological trauma and violence.',
    },
  ],
};

// ─── HARCÉLOMÈTRE ───────────────────────────────────────────
const harcelometre: Meter = {
  slug: 'harcelometre',
  name: 'Harassment Meter',
  emoji: '🎯',
  tagline: 'Are you being harassed?',
  description:
    'A tool to assess whether you are being harassed at school, online or in your daily life.',
  intro:
    'Read each situation and answer Yes or No based on what you are going through. There is no wrong answer: this tool is here to help you see more clearly.',
  questionPrefix: 'Does this situation apply to you?',
  questions: [
    { id: 1, text: 'You exchange friendly messages', level: 'green', negatedText: 'You don’t exchange friendly messages' },
    { id: 2, text: 'People support you through hard times', level: 'green', negatedText: 'People don’t support you through hard times' },
    { id: 3, text: 'You play sports and have hobbies', level: 'green', negatedText: 'You don’t play sports and don’t have hobbies' },
    { id: 4, text: 'Your friends or classmates are people you can rely on', level: 'green', negatedText: 'Your friends or classmates are not people you can rely on' },
    { id: 5, text: 'You know your way around the internet and can do without it', level: 'green', negatedText: 'You don’t know your way around the internet and can’t do without it' },

    { id: 6, text: 'People sometimes make jokes about you', level: 'yellow' },
    { id: 7, text: 'You get picked last for group activities', level: 'yellow' },
    { id: 8, text: 'People make fun of you (nicknames…)', level: 'yellow' },
    { id: 9, text: 'People damage your school things', level: 'yellow' },
    { id: 10, text: 'People ignore you, leave you out', level: 'yellow' },

    { id: 11, text: 'People take photos of you without your knowledge', level: 'orange' },
    { id: 12, text: 'People insult you on social media', level: 'orange' },
    { id: 13, text: 'You hear rumors about yourself', level: 'orange' },
    { id: 14, text: 'People forbid you from talking to others', level: 'orange' },

    { id: 15, text: 'People post photos of you online without your consent', level: 'red' },
    { id: 16, text: 'People encourage you to hurt yourself', level: 'red' },
    { id: 17, text: 'People push you to your limits, try to make you angry', level: 'red' },
    { id: 18, text: 'People humiliate you sexually (nicknames, edited photos…)', level: 'red' },
    { id: 19, text: 'People touch your private parts to make fun of you', level: 'red' },
    { id: 20, text: 'People threaten you online (Snapchat, Instagram, TikTok…)', level: 'red' },
    { id: 21, text: 'People push you to do things you don’t want to do', level: 'red' },
    { id: 22, text: 'People extort money from you or threaten you with violence', level: 'red' },
    { id: 23, text: 'People hit you, beat you', level: 'red' },
  ],
  levels: {
    green: {
      label: 'Healthy',
      title: 'No worries, keep it up 💚',
      message:
        'Your relationships seem healthy. You have friends who support you and you enjoy your activities.',
      advice:
        'Keep talking with your friends and your teachers if you have any doubt. Staying alert is always a good idea.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Watch out',
      title: 'Watch out, say stop ⚠️',
      message:
        'Some of the situations you are going through are not normal. Being made fun of, left out or picked last is not trivial.',
      advice:
        'Talk about it with someone you trust: a friend, a teacher, your parents, the school nurse. You don’t have to put up with this.',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Cyberbullying',
      title: 'This is harassment, take action 🧡',
      message:
        'What you describe is harassment, especially online. Being photographed without your knowledge, insulted on social media or deliberately isolated is not acceptable.',
      advice:
        'Don’t stay alone with this. Report the content online, block the people involved and talk to an adult you trust. In France, you can also call 3020.',
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'You are being harassed, ask for help 🔴',
      message:
        'The situations you describe are serious. You are being harassed. It is not your fault and you have the right to get help.',
      advice:
        'Ask for help quickly! Talk to a teacher, a school counselor, the school nurse, your parents or a family member. In France, you can also reach a trained police officer or gendarme through the 3018 chat.',
      color: '#EF4444',
      bgColor: '#EF4444',
      emoji: '❤️',
    },
  },
  resources: [
    {
      name: '3020 — Non au harcèlement',
      number: '3020',
      description: 'French national helpline against school bullying, free and confidential.',
    },
    {
      name: '3018 — Net Écoute',
      number: '3018',
      url: 'https://www.netecoute.fr',
      description: 'French helpline against cyberbullying. Also available by chat on netecoute.fr.',
    },
    ALLO_ENFANCE,
    ...COMMON_RESOURCES,
    {
      name: 'e-Enfance',
      url: 'https://e-enfance.org',
      description: 'Association protecting minors online.',
    },
  ],
};

// ─── DISCRIMINOMÈTRE ────────────────────────────────────────
const discriminometre: Meter = {
  slug: 'discriminometre',
  name: 'Discrimination Meter',
  emoji: '⚖️',
  tagline: 'Measure the discrimination you face',
  description:
    'A tool to identify the discriminatory behavior you may face in everyday life, from microaggressions to violence.',
  intro:
    'For each situation, say whether you have ever experienced it. Your answers are anonymous and stay on your device.',
  questionPrefix: 'Has this situation ever happened to you?',
  questions: [
    { id: 1, text: 'People respect who I am', level: 'green' },
    { id: 2, text: 'People respect my differences', level: 'green' },
    { id: 3, text: 'People respect my choices', level: 'green' },
    { id: 4, text: 'People respect my culture', level: 'green' },

    { id: 5, text: 'My friends make jokes about my name', level: 'yellow' },
    { id: 6, text: 'A passerby made an unpleasant remark about my skirt', level: 'yellow' },
    { id: 7, text: 'Because I’m absent-minded, people ask me if I’m a “mongoloid”', level: 'yellow' },
    { id: 8, text: 'People tell me I’m a “tomboy”', level: 'yellow' },

    { id: 9, text: 'When I present a project, I’m told it’s “Arab work” (a racist way of saying sloppy work)', level: 'orange' },
    { id: 10, text: 'Seen as stingy, I get called “the token Jew”', level: 'orange' },
    { id: 11, text: 'When I’m upset, I’m told: “are you on your period or what?!”', level: 'orange' },
    { id: 12, text: 'When I’m clumsy, I’m told: “what are you, disabled?!”', level: 'orange' },
    { id: 13, text: 'Because I’m covered by the C.M.U. (French public health coverage for people on low incomes), I was refused a doctor’s appointment', level: 'orange' },
    { id: 14, text: 'After seeing me, a bar refused to let me in', level: 'orange' },
    { id: 15, text: 'After I gave my name, I was refused a viewing of an apartment', level: 'orange' },
    { id: 16, text: 'I was refused a promotion because I’m pregnant', level: 'orange' },

    { id: 17, text: 'I get called slurs like “dirty fag”, “whore”, “Arab”, “Jew”, “retard”…', level: 'red' },
    { id: 18, text: 'I am humiliated and bullied at school or at work', level: 'red' },
    { id: 19, text: 'I get shoved, hit…', level: 'red' },
    { id: 20, text: 'I am groped, kissed against my will, subjected to sex I did not consent to…', level: 'red' },
  ],
  levels: {
    green: {
      label: 'Healthy',
      title: 'All good, keep going ✨',
      message:
        'The situations you describe show that you are respected for who you are. That is the foundation of a healthy environment.',
      advice:
        'Keep standing up for respect for everyone. If you witness discrimination around you, don’t hesitate to react or to talk about it.',
      color: '#10B981',
      bgColor: '#10B981',
      emoji: '💚',
    },
    yellow: {
      label: 'Caution',
      title: 'Stay alert, don’t let it slide ⚠️',
      message:
        'The jokes and remarks you face are microaggressions. Even if they seem “harmless”, they are not acceptable.',
      advice:
        'You have the right to say that it hurts you. Talk about it with a friend, a teacher or an adult you trust. These remarks are not normal.',
      color: '#F59E0B',
      bgColor: '#F59E0B',
      emoji: '💛',
    },
    orange: {
      label: 'Discrimination',
      title: 'Say stop, this is discrimination 🧡',
      message:
        'What you are experiencing is discrimination. Refusing you a service, housing or a job, or mocking your identity, is prohibited by law.',
      advice:
        'In France, you can refer the matter to the Défenseur des droits (defenseurdesdroits.fr), the independent rights authority, or contact SOS Racisme. Talk about your situation with someone you trust.',
      color: '#F97316',
      bgColor: '#F97316',
      emoji: '🧡',
    },
    red: {
      label: 'Danger',
      title: 'You are in danger, ask for help 🔴',
      message:
        'The insults, humiliation, blows and assaults you are subjected to are offenses or crimes. You have the right to be protected.',
      advice:
        'In France, call 17 (police) or 112 if you are in immediate danger. You can also contact SOS Racisme (01 40 35 36 55) or the Défenseur des droits. File a complaint: it is your right.',
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
      description: 'Independent French authority fighting discrimination. Also reachable at 09 69 39 00 00.',
    },
    {
      name: 'SOS Racisme',
      number: '01 40 35 36 55',
      url: 'https://sos-racisme.org',
      description: 'Association fighting racism and discrimination.',
    },
    {
      name: 'LICRA',
      url: 'https://www.licra.org',
      description: 'International League against Racism and Antisemitism.',
    },
    ...COMMON_RESOURCES,
    {
      name: 'SOS Homophobie',
      number: '01 48 06 42 41',
      url: 'https://www.sos-homophobie.org',
      description: 'Anonymous and confidential helpline against LGBTphobia.',
    },
    {
      name: 'DILCRAH',
      url: 'https://www.dilcrah.fr',
      description: 'French interministerial delegation for the fight against racism, antisemitism and anti-LGBT hatred.',
    },
  ],
};

// ─── Export ────────────────────────────────────────────────
/** Même ordre que `METERS`. */
export const METERS_EN: Meter[] = [violentometre, consentometre, incestometre, harcelometre, discriminometre];

/** Les outils dans la langue de la page. */
export function metersDe(langue: Langue): Meter[] {
  return langue === 'en' ? METERS_EN : METERS;
}

/** Un outil dans la langue de la page ; `undefined` si le slug est inconnu. */
export function meterDe(langue: Langue, slug: string): Meter | undefined {
  return metersDe(langue).find((m) => m.slug === slug);
}
