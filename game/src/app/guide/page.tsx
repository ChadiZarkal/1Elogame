'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

const FLAGS: FlagDef[] = [
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

function FlagCard({ flag, index }: { flag: FlagDef; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
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
        <span>{open ? 'Masquer les exemples' : `Voir ${flag.examples.length} exemples concrets`}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ lineHeight: 1, display: 'flex' }}
        >
          <ChevronDown size={15} />
        </motion.span>
      </button>

      {/* Accordion content */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={`examples-${flag.id}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
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
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function GuidePage() {
  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#0D0D0D', padding: '20px 16px 64px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back nav */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#6B7280', textDecoration: 'none', fontSize: 13,
            marginBottom: 32, padding: '6px 0',
          }}
        >
          <ArrowLeft size={15} />
          <span>← Retour accueil</span>
        </Link>

        {/* Hero */}
        <header style={{ marginBottom: 40 }}>
          <p style={{
            color: '#10B981', fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 800, margin: '0 0 10px',
          }}>
            Guide · Espace de sécurité
          </p>
          <h1 style={{ color: '#F5F5F5', fontSize: 28, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
            Les 5 types de signaux
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 15, margin: '0 0 28px', lineHeight: 1.65 }}>
            Du Green Flag au Black Flag — comprendre ce que les comportements signalent dans une relation,
            avec des exemples concrets.
          </p>

          {/* Spectrum bar */}
          <div role="img" aria-label="Spectre des signaux de positif à rédhibitoire">
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
              <span style={{ color: '#10B981' }}>💚 Positif</span>
              <span style={{ color: '#9CA3AF' }}>🏳️ Neutre</span>
              <span style={{ color: '#F97316' }}>🟠 Attention</span>
              <span style={{ color: '#EF4444' }}>🚩 Alarme</span>
              <span style={{ color: '#F87171' }}>⛔ Limite</span>
            </div>
          </div>
        </header>

        {/* Flag cards */}
        <section aria-label="Définitions des types de flags">
          {FLAGS.map((flag, i) => (
            <FlagCard key={flag.id} flag={flag} index={i} />
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
            La nuance est essentielle
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, lineHeight: 1.65 }}>
            Un drapeau isolé ne définit pas une personne. Ces catégories sont des repères pour réfléchir,
            pas des verdicts définitifs. Ce qui pèse le plus dans une relation, c&apos;est l&apos;accumulation,
            la fréquence et l&apos;évolution des comportements dans le temps.
          </p>
        </aside>

        {/* CTA to games */}
        <section aria-label="Aller plus loin">
          <p style={{
            color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
          }}>
            Aller plus loin
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              href="/flagornot"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(136,206,255,0.06)', border: '1px solid rgba(136,206,255,0.2)',
                borderRadius: 12, padding: '13px 18px',
                color: '#88CEFF', textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}
            >
              <span>🔮 Soumettre une situation à l&apos;Oracle IA</span>
              <ArrowRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
            </Link>
            <Link
              href="/jeu"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12, padding: '13px 18px',
                color: '#EF4444', textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}
            >
              <span>🔥 Tester avec le duel Red or Green</span>
              <ArrowRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
            </Link>
            <Link
              href="/ressources"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)',
                borderRadius: 12, padding: '13px 18px',
                color: '#10B981', textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}
            >
              <span>📊 Évaluer ma situation avec nos outils</span>
              <ArrowRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
            </Link>
          </div>
        </section>

        {/* Hidden SEO content for search engines */}
        <section className="sr-only" aria-label="Informations complémentaires">
          <h2>Red Flag définition</h2>
          <p>Un red flag est un comportement problématique dans une relation. Pris isolément, il peut parfois se travailler avec une vraie remise en question. Ce qui devient réellement nocif, c&apos;est l&apos;accumulation de red flags.</p>
          <h2>Green Flag définition</h2>
          <p>Un green flag est un signal positif dans une relation. Il indique un comportement sain, mature et respectueux. Parmi les green flags courants : communication ouverte, respect des limites, cohérence entre paroles et actes.</p>
          <h2>Black Flag signification</h2>
          <p>Un black flag est un comportement totalement rédhibitoire et potentiellement dangereux dans une relation. Il s&apos;agit d&apos;une limite absolue comme la violence physique, le contrôle total ou la manipulation grave.</p>
          <h2>Orange Flag relation</h2>
          <p>Un orange flag est un signal d&apos;attention qui mérite une conversation. Moins grave qu&apos;un red flag, il indique quelque chose à surveiller et à éclaircir dans la relation.</p>
          <h2>White Flag couple</h2>
          <p>Un white flag désigne un comportement neutre, explicable et sans gravité. Ce n&apos;est pas un mauvais indicateur : dans une relation, ce n&apos;est généralement pas un sujet en soi.</p>
        </section>

      </div>
    </main>
  );
}
