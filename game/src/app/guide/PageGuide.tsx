'use client';

/**
 * @module app/guide/PageGuide
 * Le guide des flags, dans les deux langues : `/guide` et `/en/guide` rendent
 * ce composant (traduction du 2026-11-14). Le texte français est celui qui
 * était écrit dans la page, déplacé tel quel dans `FLAGS_FR` et `TEXTES.fr`.
 */

import { useState } from 'react';
import Link from '@/components/ui/LienIntention';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { NativeAd } from '@/components/ads/NativeAd';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';
import { GUIDE_FAQ, GUIDE_FAQ_EN } from './faq';

interface FlagDef {
  id: string;
  emoji: string;
  label: string;
  tagline: string;
  badge: string;
  definition: string;
  colorPrimary: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  examples: string[];
  context: string;
  tip: string;
  tipIsAlert?: boolean;
}

const FLAGS_FR: FlagDef[] = [
  {
    id: 'green',
    emoji: '💚',
    label: 'Green Flag',
    tagline: 'Signal positif — comportement sain',
    badge: '✓ Encourageant',
    definition:
      "Un Green Flag indique un comportement sain, mature et respectueux. C'est un signe que la personne respecte tes limites, communique bien et contribue à une relation équilibrée. Les Green Flags se repèrent aux actes, pas aux mots.",
    colorPrimary: '#10B981',
    colorBg: 'rgba(16,185,129,0.07)',
    colorBorder: 'rgba(16,185,129,0.3)',
    colorText: '#10B981',
    examples: [
      'Respecte tes limites sans se plaindre',
      'Communique ouvertement sur ses émotions',
      "S'excuse sincèrement quand il/elle a tort",
      'Encourage tes projets sans jalousie',
      'Est cohérent(e) : ses actes correspondent à ses paroles',
      "Parle de ses ex sans haine ni obsession",
    ],
    context:
      "Les Green Flags ne garantissent pas une relation parfaite, mais ils indiquent une base saine. Plus tu en identifies, plus tu peux avoir confiance en la relation.",
    tip: "Note les Green Flags que tu observes — ça t'aide à reconnaître ce qui te fait vraiment du bien.",
  },
  {
    id: 'white',
    emoji: '🏳️',
    label: 'White Flag',
    tagline: 'Signal neutre — à observer',
    badge: '○ Neutre',
    definition:
      "Un White Flag est un comportement neutre, explicable et sans charge négative. Il n'y a pas de jugement particulier à poser : ce n'est pas un mauvais indicateur.",
    colorPrimary: '#9CA3AF',
    colorBg: 'rgba(156,163,175,0.07)',
    colorBorder: 'rgba(156,163,175,0.28)',
    colorText: '#D1D5DB',
    examples: [
      "Aime regarder des films (sans préférence particulière)",
      "N'a pas encore d'opinion claire sur certains sujets",
      'Répond aux messages de manière variable',
      "N'est ni très expressif(ve) ni froid(e)",
      'Fait les choses correctement, sans plus',
      "N'est ni très sociable ni asocial(e)",
    ],
    context:
      "Dans un couple, un White Flag n'est généralement pas un sujet en soi. Tu peux le noter, puis passer à autre chose sans te prendre la tête.",
    tip: "Ne suranalyse pas un White Flag isolé : concentre-toi surtout sur la dynamique globale de la relation.",
  },
  {
    id: 'orange',
    emoji: '🟠',
    label: 'Orange Flag',
    tagline: "Signal d'attention — mérite une conversation",
    badge: '⚠ À surveiller',
    definition:
      "Un Orange Flag est un comportement qui mérite ton attention et une conversation franche. Pas forcément rédhibitoire — il peut s'expliquer par le contexte ou le passé — mais il ne doit pas être ignoré ou minimisé.",
    colorPrimary: '#F97316',
    colorBg: 'rgba(249,115,22,0.07)',
    colorBorder: 'rgba(249,115,22,0.3)',
    colorText: '#F97316',
    examples: [
      'Parle de ses ex de manière très négative ou obsessionnelle',
      'Envoie des messages très tardifs sans prévenir',
      'Évite systématiquement les sujets sérieux',
      'A des réactions parfois disproportionnées',
      "Met du temps à définir la relation ou à s'engager",
      "Ses comportements changent selon l'audience présente",
    ],
    context:
      "Un Orange Flag seul mérite une conversation, pas une rupture. Plusieurs qui s'accumulent sans explication commencent à ressembler à un Red Flag.",
    tip: "Aborde-le avec curiosité : \"J'ai remarqué que... tu peux m'en dire plus ?\"",
  },
  {
    id: 'red',
    emoji: '🚩',
    label: 'Red Flag',
    tagline: "Signal d'alarme — action requise",
    badge: '❌ Ne pas ignorer',
    definition:
      "Un Red Flag est un comportement réellement problématique : contrôle, manque de respect, manipulation ou schéma toxique. C'est sérieux, mais cela peut parfois se travailler si la personne reconnaît le problème et change concrètement.",
    colorPrimary: '#EF4444',
    colorBg: 'rgba(239,68,68,0.07)',
    colorBorder: 'rgba(239,68,68,0.3)',
    colorText: '#EF4444',
    examples: [
      'Contrôle avec qui tu passes du temps',
      'Te fait sentir coupable régulièrement',
      "Minimise tes sentiments (\"tu exagères\", \"tu es trop sensible\")",
      "Te critique fréquemment devant d'autres",
      "Devient agressif(ve) ou punitif(ve) lors de désaccords",
      "Les règles de la relation ne s'appliquent pas pareil pour les deux",
    ],
    context:
      "Un Red Flag isolé mérite une discussion claire et des limites nettes. Ce qui devient vraiment nocif, c'est l'accumulation des Red Flags et leur intensification dans le temps.",
    tip: "Tu n'as pas besoin de justifier pourquoi un comportement te dérange. Ton ressenti compte.",
  },
  {
    id: 'black',
    emoji: '⛔',
    label: 'Black Flag',
    tagline: 'Limite absolue — sécurité prioritaire',
    badge: '🚫 Rédhibitoire',
    definition:
      "Un Black Flag est un comportement totalement inacceptable et potentiellement dangereux. Il n'y a rien à explorer, comprendre ou justifier : c'est une limite absolue. Ta sécurité passe avant tout le reste.",
    colorPrimary: '#F87171',
    colorBg: 'rgba(20,4,4,0.97)',
    colorBorder: 'rgba(220,38,38,0.4)',
    colorText: '#F87171',
    tipIsAlert: true,
    examples: [
      'Violence physique ou menaces de violence',
      'Manipulation psychologique délibérée (gaslighting)',
      'Contrôle total : finances, contacts, liberté de mouvement',
      'Comportements sexuels non-consentis',
      'Harcèlement ou intimidation systématique',
      "Isolement délibéré de ta famille et de tes amis",
    ],
    context:
      "Si tu identifies un Black Flag dans ta relation, tu n'as pas besoin de justifier ta décision de partir ou de chercher de l'aide. Des ressources existent.",
    tip: '3919 (violences conjugales — gratuit, 24h/24) · 119 (enfants en danger) · 17 (urgences)',
  },
];

/** Le texte anglais de chaque carte ; les couleurs restent celles de `FLAGS_FR`. */
const TEXTES_FLAGS_EN: Record<string, Pick<FlagDef, 'label' | 'tagline' | 'badge' | 'definition' | 'examples' | 'context' | 'tip'>> = {
  green: {
    label: 'Green Flag',
    tagline: 'Positive sign — healthy behavior',
    badge: '✓ Encouraging',
    definition:
      'A Green Flag points to healthy, mature, respectful behavior. It’s a sign the person respects your boundaries, communicates well and helps build a balanced relationship. You spot Green Flags in what people do, not what they say.',
    examples: [
      'Respects your boundaries without complaining',
      'Talks openly about their feelings',
      'Apologizes sincerely when they’re wrong',
      'Supports your plans without jealousy',
      'Is consistent: their actions match their words',
      'Talks about their exes without hatred or obsession',
    ],
    context:
      'Green Flags don’t guarantee a perfect relationship, but they point to a healthy foundation. The more of them you notice, the more you can trust the relationship.',
    tip: 'Keep track of the Green Flags you notice — it helps you recognize what’s actually good for you.',
  },
  white: {
    label: 'White Flag',
    tagline: 'Neutral sign — just observe',
    badge: '○ Neutral',
    definition:
      'A White Flag is neutral behavior, explainable and with no negative charge. There’s nothing in particular to judge: it isn’t a bad sign.',
    examples: [
      'Likes watching movies (no particular taste)',
      'Doesn’t have a clear opinion on some topics yet',
      'Replies to messages at an uneven pace',
      'Is neither very expressive nor cold',
      'Does things properly, nothing more',
      'Is neither very social nor antisocial',
    ],
    context:
      'In a relationship, a White Flag usually isn’t an issue in itself. You can notice it, then move on without overthinking it.',
    tip: 'Don’t overanalyze a single White Flag: focus on the overall dynamic of the relationship.',
  },
  orange: {
    label: 'Orange Flag',
    tagline: 'Caution sign — worth a conversation',
    badge: '⚠ Keep an eye on it',
    definition:
      'An Orange Flag is behavior that deserves your attention and an honest conversation. Not necessarily a dealbreaker — context or the past can explain it — but it shouldn’t be ignored or brushed off.',
    examples: [
      'Talks about their exes in a very negative or obsessive way',
      'Sends messages very late at night without warning',
      'Always avoids serious topics',
      'Sometimes reacts out of proportion',
      'Takes a long time to define the relationship or commit',
      'Behaves differently depending on who’s around',
    ],
    context:
      'A single Orange Flag calls for a conversation, not a breakup. Several piling up with no explanation start to look like a Red Flag.',
    tip: 'Bring it up with curiosity: “I noticed that… can you tell me more?”',
  },
  red: {
    label: 'Red Flag',
    tagline: 'Warning sign — action needed',
    badge: '❌ Don’t ignore it',
    definition:
      'A Red Flag is genuinely problematic behavior: control, disrespect, manipulation or a toxic pattern. It’s serious, but it can sometimes be worked on if the person acknowledges the problem and actually changes.',
    examples: [
      'Controls who you spend time with',
      'Regularly makes you feel guilty',
      'Dismisses your feelings (“you’re overreacting,” “you’re too sensitive”)',
      'Often criticizes you in front of others',
      'Gets aggressive or punishing during disagreements',
      'The rules of the relationship don’t apply equally to both of you',
    ],
    context:
      'A single Red Flag calls for a clear conversation and firm boundaries. What becomes truly harmful is Red Flags piling up and getting worse over time.',
    tip: 'You don’t have to justify why a behavior bothers you. How you feel matters.',
  },
  black: {
    label: 'Black Flag',
    tagline: 'Absolute limit — safety first',
    badge: '🚫 Dealbreaker',
    definition:
      'A Black Flag is completely unacceptable and potentially dangerous behavior. There’s nothing to explore, understand or excuse: it’s an absolute line. Your safety comes before everything else.',
    examples: [
      'Physical violence or threats of violence',
      'Deliberate psychological manipulation (gaslighting)',
      'Total control: money, contacts, freedom of movement',
      'Non-consensual sexual behavior',
      'Systematic harassment or intimidation',
      'Deliberately cutting you off from your family and friends',
    ],
    context:
      'If you spot a Black Flag in your relationship, you don’t need to justify your decision to leave or to seek help. Support exists.',
    tip: 'In France: 3919 (domestic violence — free, 24/7) · 119 (children at risk) · 17 (police emergency) · 112 (EU emergency number)',
  },
};

const FLAGS_EN: FlagDef[] = FLAGS_FR.map((flag) => ({ ...flag, ...TEXTES_FLAGS_EN[flag.id] }));

/**
 * Le reste de la page. Le français est recopié tel qu'il était écrit en JSX,
 * espaces comprises : le HTML servi à `/guide` ne change pas.
 */
const TEXTES = {
  fr: {
    flags: FLAGS_FR,
    faq: GUIDE_FAQ,
    masquer: 'Masquer les exemples',
    voir: (n: number) => `Voir ${n} exemples concrets`,
    surtitre: 'Guide · Espace de sécurité',
    titre: 'Red flag : définition et exemples',
    definition: (
      <>
        Un <strong>red flag</strong> — « drapeau rouge », parfois écrit
        « redflag » — est un comportement qui doit alerter sur quelqu&apos;un :
        contrôle, manque de respect, manipulation. Le terme vient des drapeaux
        rouges qui signalent un danger, sur une plage ou un circuit.
      </>
    ),
    intro: (
      <>
        Tout n&apos;est pas un red flag. Du green flag au black flag, voici les
        cinq signaux, avec des exemples concrets pour les reconnaître dans une
        relation.
      </>
    ),
    revision: 'Dernière révision : 29 septembre 2026 ·',
    sources: 'Sources',
    methode: 'Méthode du classement',
    spectre: 'Spectre des signaux de positif à rédhibitoire',
    echelle: ['💚 Positif', '🏳️ Neutre', '🟠 Attention', '🚩 Alarme', '⛔ Limite'],
    definitions: 'Définitions des types de flags',
    nuanceTitre: 'La nuance est essentielle',
    nuance: (
      <>
        Un drapeau isolé ne définit pas une personne. Ces catégories sont des repères pour réfléchir,
        pas des verdicts définitifs. Ce qui pèse le plus dans une relation, c&apos;est l&apos;accumulation,
        la fréquence et l&apos;évolution des comportements dans le temps.
      </>
    ),
    plusLoin: 'Aller plus loin',
    liens: [
      <>🚩 Les pires red flags, d&apos;après les votes</>,
      <>🧪 Faire le Red Flag Test : es-tu un red flag ?</>,
      <>🔮 Soumettre une situation à l&apos;Oracle IA</>,
      <>🔥 Tester avec le duel Red or Green</>,
      <>📊 Évaluer ma situation avec nos outils</>,
    ],
    questions: 'Questions fréquentes',
  },
  en: {
    flags: FLAGS_EN,
    faq: GUIDE_FAQ_EN,
    masquer: 'Hide examples',
    voir: (n: number) => `See ${n} real-life examples`,
    surtitre: 'Guide · Safe space',
    titre: 'Red flag: meaning and examples',
    definition: (
      <>
        A <strong>red flag</strong> — sometimes written “redflag” — is a behavior
        that should make you wary of someone: control, disrespect, manipulation.
        The term comes from the red flags that signal danger, on a beach or a
        racetrack.
      </>
    ),
    intro: (
      <>
        Not everything is a red flag. From green flag to black flag, here are the
        five signals, with real-life examples to help you spot them in a
        relationship.
      </>
    ),
    revision: 'Last revised: September 29, 2026 ·',
    sources: 'Sources',
    methode: 'How the ranking works',
    spectre: 'Spectrum of signals, from positive to dealbreaker',
    echelle: ['💚 Positive', '🏳️ Neutral', '🟠 Caution', '🚩 Warning', '⛔ Limit'],
    definitions: 'Definitions of the flag types',
    nuanceTitre: 'Nuance matters',
    nuance: (
      <>
        One flag on its own doesn’t define a person. These categories are guideposts
        for thinking things through, not final verdicts. What matters most in a
        relationship is how behaviors pile up, how often they happen and how they
        change over time.
      </>
    ),
    plusLoin: 'Go further',
    liens: [
      <>🚩 The worst red flags, according to the votes</>,
      <>🧪 Take the Red Flag Test: are you a red flag?</>,
      <>🔮 Submit a situation to the AI Oracle</>,
      <>🔥 Try the Red or Green duel</>,
      <>📊 Assess my situation with our tools</>,
    ],
    questions: 'Frequently asked questions',
  },
};

function FlagCard({ flag, index, langue }: { flag: FlagDef; index: number; langue: Langue }) {
  const t = TEXTES[langue];
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      // Glissement seul, sans fondu : ces cartes sont le contenu principal de
      // la page et un `opacity: 0` initial les rendrait invisibles jusqu'à
      // l'hydratation, retardant d'autant le LCP.
      initial={{ y: 14 }}
      animate={{ y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      style={{
        background: flag.colorBg,
        border: `1px solid ${flag.colorBorder}`,
        borderLeft: `4px solid ${flag.colorPrimary}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{flag.emoji}</span>
          <div>
            <h2 style={{ color: flag.colorText, fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              {flag.label}
            </h2>
            <p style={{ color: '#6B7280', fontSize: 12, margin: '3px 0 0' }}>
              {flag.tagline}
            </p>
          </div>
        </div>
        <span
          style={{
            background: `${flag.colorPrimary}18`,
            color: flag.colorText,
            border: `1px solid ${flag.colorBorder}`,
            borderRadius: 8,
            padding: '4px 9px',
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {flag.badge}
        </span>
      </div>

      {/* Definition */}
      <p style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 1.65, margin: '0 0 16px' }}>
        {flag.definition}
      </p>

      {/* Accordion toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`examples-${flag.id}`}
        style={{
          width: '100%',
          background: `${flag.colorPrimary}10`,
          border: `1px solid ${flag.colorBorder}`,
          borderRadius: 10,
          padding: '10px 16px',
          color: flag.colorText,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{open ? t.masquer : t.voir(flag.examples.length)}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ lineHeight: 1, display: 'flex' }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      {/* Accordion content — toujours rendu dans le HTML (le crawler doit le
          voir), simplement replié en CSS tant que l'utilisateur ne l'ouvre pas. */}
      <motion.div
        id={`examples-${flag.id}`}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ paddingTop: 14 }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {flag.examples.map((ex, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '7px 0',
                  borderBottom: i < flag.examples.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span style={{ color: flag.colorText, flexShrink: 0, marginTop: 1, fontSize: 12 }}>›</span>
                <span style={{ color: '#E5E7EB', fontSize: 13, lineHeight: 1.5 }}>{ex}</span>
              </li>
            ))}
          </ul>

          {/* Context note */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '11px 14px',
            marginTop: 14,
          }}>
            <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              ℹ️ {flag.context}
            </p>
          </div>

          {/* Tip */}
          <div style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            marginTop: 12,
            padding: flag.tipIsAlert ? '10px 12px' : '8px 0',
            background: flag.tipIsAlert ? 'rgba(239,68,68,0.08)' : 'transparent',
            border: flag.tipIsAlert ? '1px solid rgba(239,68,68,0.2)' : 'none',
            borderRadius: flag.tipIsAlert ? 8 : 0,
          }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{flag.tipIsAlert ? '🆘' : '💡'}</span>
            <p style={{
              color: flag.tipIsAlert ? '#F87171' : '#9CA3AF',
              fontSize: 12,
              margin: 0,
              lineHeight: 1.5,
              fontWeight: flag.tipIsAlert ? 600 : 400,
            }}>
              {flag.tip}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

/** Les liens de fin de guide : adresse et couleurs ; le libellé est dans `TEXTES`. */
const LIENS = [
  { href: '/red-flags', background: 'rgba(255,107,94,0.06)', border: '1px solid rgba(255,107,94,0.22)', color: '#FF6B5E' },
  { href: '/redflagtest', background: 'rgba(255,180,170,0.06)', border: '1px solid rgba(255,180,170,0.22)', color: '#FFB4AA' },
  { href: '/flagornot', background: 'rgba(136,206,255,0.06)', border: '1px solid rgba(136,206,255,0.2)', color: '#88CEFF' },
  { href: '/jeu', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' },
  { href: '/ressources', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)', color: '#10B981' },
];

/** Les couleurs de l'échelle, dans l'ordre de `TEXTES.*.echelle`. */
const COULEURS_ECHELLE = ['#10B981', '#9CA3AF', '#F97316', '#EF4444', '#F87171'];

export function PageGuide({ langue }: { langue: Langue }) {
  const t = TEXTES[langue];
  return (
    <main id="main-content" style={{ minHeight: '100dvh', background: '#0D0D0D', padding: '20px 16px 64px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Hero */}
        <header style={{ marginBottom: 40 }}>
          <p style={{
            color: '#10B981', fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 800, margin: '0 0 10px',
          }}>
            {t.surtitre}
          </p>
          {/* Le titre ne contenait pas « red flag », sur la page qui définit
              le terme. */}
          <h1 style={{ color: '#F5F5F5', fontSize: 28, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
            {t.titre}
          </h1>
          {/* La définition tient dans le premier paragraphe, en une phrase
              autonome : c'est ce que Google reprend en tête de résultats. */}
          <p style={{ color: '#E5E7EB', fontSize: 16, margin: '0 0 12px', lineHeight: 1.6 }}>
            {t.definition}
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 15, margin: '0 0 12px', lineHeight: 1.65 }}>
            {t.intro}
          </p>
          {/* Date réelle de la dernière révision du texte — à changer quand le
              texte change, pas à chaque déploiement. La source des outils et la
              méthode du classement sont publiées : le guide y renvoie. */}
          <p style={{ color: '#6B7280', fontSize: 12, margin: '0 0 28px', lineHeight: 1.6 }}>
            {t.revision}{' '}
            <Link href={cheminLocalise(langue, '/sources')} style={{ color: '#9CA3AF', textDecoration: 'underline' }}>{t.sources}</Link>{' '}
            ·{' '}
            <Link href={cheminLocalise(langue, '/methodologie')} style={{ color: '#9CA3AF', textDecoration: 'underline' }}>{t.methode}</Link>
          </p>

          {/* Spectrum bar */}
          <div role="img" aria-label={t.spectre}>
            <div style={{
              background: 'linear-gradient(to right, #10B981 0%, #9CA3AF 28%, #F97316 52%, #EF4444 76%, #3D0000 100%)',
              borderRadius: 12,
              height: 10,
              marginBottom: 10,
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              fontWeight: 700,
              userSelect: 'none',
            }}>
              {t.echelle.map((libelle, i) => (
                <span key={libelle} style={{ color: COULEURS_ECHELLE[i] }}>{libelle}</span>
              ))}
            </div>
          </div>
        </header>

        {/* Flag cards */}
        <section aria-label={t.definitions}>
          {t.flags.map((flag, i) => (
            <FlagCard key={flag.id} flag={flag} index={i} langue={langue} />
          ))}
        </section>

        {/* Nuance section */}
        <aside style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '20px 22px',
          margin: '16px 0 28px',
        }}>
          <h2 style={{ color: '#F5F5F5', fontSize: 15, fontWeight: 800, margin: '0 0 8px' }}>
            {t.nuanceTitre}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, lineHeight: 1.65 }}>
            {t.nuance}
          </p>
        </aside>

        {/* CTA to games */}
        <section aria-label={t.plusLoin}>
          <p style={{
            color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
          }}>
            {t.plusLoin}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIENS.map((lien, i) => (
              <Link
                key={lien.href}
                href={cheminLocalise(langue, lien.href)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: lien.background, border: lien.border,
                  borderRadius: 12, padding: '13px 18px',
                  color: lien.color, textDecoration: 'none', fontSize: 13, fontWeight: 700,
                }}
              >
                <span>{t.liens[i]}</span>
                <ArrowRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ visible — remplace un bloc `sr-only` (texte caché) et adosse le
            balisage FAQPage du layout à un contenu réellement affiché. */}
        <section aria-label={t.questions} style={{ marginTop: 34 }}>
          <p style={{
            color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
          }}>
            {t.questions}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {t.faq.map(({ question, answer }) => (
              <div
                key={question}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '14px 18px',
                }}
              >
                <h2 style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>
                  {question}
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, lineHeight: 1.65 }}>
                  {answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fin du guide : la page est longue et se lit d'un bout à l'autre,
            c'est donc le seul endroit où l'encart tombe après la lecture et non
            au milieu. Un seul par page, comme le recommande la régie. */}
        <NativeAd />

      </div>
    </main>
  );
}
