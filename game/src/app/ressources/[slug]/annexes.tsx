/**
 * @module ressources/[slug]/annexes
 * Ce que le gabarit d'un outil ajoute autour du questionnaire : métadonnées,
 * balisage JSON-LD, notice, liste des situations, FAQ et liens vers les autres
 * outils.
 *
 * Partagé par `/ressources/[slug]` et `/en/ressources/[slug]` (un fichier
 * `layout.tsx` ne peut exporter que ce que Next attend). Composants serveur :
 * la langue est passée en paramètre. Le français est celui qui était écrit
 * dans `layout.tsx`, recopié à l'identique.
 */

import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { meterDe, metersDe } from '@/config/meters-data-en';
import { meterFaq } from '@/content/meter-faq';
import { meterNotes } from '@/content/meter-notes';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';
import { alternances } from '@/lib/i18n/alternances';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

/** Les métadonnées de la page d'un outil. */
export function metadonneesOutil(langue: Langue, slug: string): Metadata {
  return langue === 'en' ? metadonneesEn(slug) : metadonneesFr(slug);
}

function metadonneesFr(slug: string): Metadata {
  const meter = meterDe('fr', slug);

  if (!meter) {
    return {
      title: 'Outil introuvable',
      description: 'Cet outil d\'auto-évaluation n\'existe pas.',
    };
  }

  const titleMap: Record<string, string> = {
    violentometre: 'Violentomètre en ligne gratuit — Évalue ta relation',
    consentometre: 'Consentomètre en ligne gratuit — Teste le consentement',
    incestometre: 'Incestomètre en ligne — Évalue les limites familiales',
    harcelometre: 'Harcèlomètre en ligne gratuit — Identifie le harcèlement',
    discriminometre: 'Discriminomètre en ligne — Identifie les discriminations',
  };

  const title = titleMap[slug] || `${meter.name} — Test en ligne gratuit`;

  const descriptionMap: Record<string, string> = {
    violentometre:
      `Fais le test du violentomètre en ligne gratuitement. ${meter.questions.length} questions pour évaluer si tu vis des violences dans ta relation. Anonyme et confidentiel. Résultats immédiats.`,
    consentometre:
      `Fais le test du consentomètre en ligne. ${meter.questions.length} questions pour évaluer si ton consentement est respecté. 100% anonyme, aucune donnée collectée.`,
    incestometre:
      `Fais le test de l'incestomètre en ligne. ${meter.questions.length} questions pour identifier les comportements incestueux. Anonyme et confidentiel.`,
    harcelometre:
      `Fais le test du harcèlomètre en ligne. ${meter.questions.length} questions pour identifier si tu vis du harcèlement. 100% anonyme et gratuit.`,
    discriminometre:
      `Fais le test du discriminomètre en ligne. ${meter.questions.length} questions pour identifier les discriminations. Anonyme et confidentiel.`,
  };

  const description = descriptionMap[slug] || meter.description;

  const keywordsMap: Record<string, string[]> = {
    violentometre: [
      'violentomètre', 'violentometre en ligne', 'test violentomètre', 'violentomètre gratuit',
      'test violence couple', 'violence conjugale test', 'suis-je victime de violence',
      'évaluer relation toxique', 'red flag relation',
    ],
    consentometre: [
      'consentomètre', 'consentometre en ligne', 'test consentement', 'quiz consentement',
      'consentement couple', 'test consentement gratuit', 'évaluer consentement relation',
    ],
    incestometre: [
      'incestomètre', 'incestometre en ligne', 'test inceste', 'comportement incestueux',
      'limites familiales', 'inceste test en ligne',
    ],
    harcelometre: [
      'harcèlomètre', 'harcelometre en ligne', 'test harcèlement', 'suis-je harcelé',
      'harcèlement moral test', 'harcèlement scolaire test', 'quiz harcèlement',
    ],
    discriminometre: [
      'discriminomètre', 'discriminometre en ligne', 'test discrimination',
      'suis-je discriminé', 'quiz discrimination', 'identifier discrimination',
    ],
  };

  return {
    title,
    description,
    keywords: keywordsMap[slug] || [meter.name, `${meter.slug} en ligne`, 'test gratuit'],
    openGraph: {
      title,
      description,
      url: `/ressources/${slug}`,
    },
    alternates: alternances('fr', `/ressources/${slug}`),
  };
}

function metadonneesEn(slug: string): Metadata {
  const meter = meterDe('en', slug);

  if (!meter) {
    return {
      title: 'Tool not found',
      description: 'This self-assessment tool does not exist.',
    };
  }

  const n = meter.questions.length;

  const titleMap: Record<string, string> = {
    violentometre: 'Free online Violence Meter (Violentomètre) — Assess your relationship',
    consentometre: 'Free online Consent Meter (Consentomètre) — Check consent',
    incestometre: 'Online Incest Meter (Incestomètre) — Assess family boundaries',
    harcelometre: 'Free online Harassment Meter (Harcèlomètre) — Identify harassment',
    discriminometre: 'Online Discrimination Meter (Discriminomètre) — Identify discrimination',
  };

  const title = titleMap[slug] || `${meter.name} — Free online test`;

  const descriptionMap: Record<string, string> = {
    violentometre:
      `Take the Violentomètre (violence meter) online for free. ${n} questions to assess whether you are experiencing violence in your relationship. Anonymous and confidential. Instant results.`,
    consentometre:
      `Take the Consentomètre (consent meter) online. ${n} questions to assess whether your consent is respected. 100% anonymous, no data collected.`,
    incestometre:
      `Take the Incestomètre (incest meter) online. ${n} questions to identify incestuous behavior. Anonymous and confidential.`,
    harcelometre:
      `Take the Harcèlomètre (harassment meter) online. ${n} questions to identify whether you are being harassed. 100% anonymous and free.`,
    discriminometre:
      `Take the Discriminomètre (discrimination meter) online. ${n} questions to identify discrimination. Anonymous and confidential.`,
  };

  const description = descriptionMap[slug] || meter.description;

  const keywordsMap: Record<string, string[]> = {
    violentometre: ['violentometre', 'violence meter', 'relationship violence test', 'domestic violence test', 'toxic relationship test'],
    consentometre: ['consentometre', 'consent meter', 'consent test', 'consent quiz'],
    incestometre: ['incestometre', 'incest meter', 'family boundaries', 'incest test'],
    harcelometre: ['harcelometre', 'harassment meter', 'harassment test', 'bullying test', 'cyberbullying test'],
    discriminometre: ['discriminometre', 'discrimination meter', 'discrimination test', 'discrimination quiz'],
  };

  return {
    title,
    description,
    keywords: keywordsMap[slug] || [meter.name, 'free online test'],
    openGraph: {
      title,
      description,
      url: `/en/ressources/${slug}`,
      locale: 'en_US',
    },
    alternates: alternances('en', `/ressources/${slug}`),
  };
}

export function MeterJsonLd({ slug, langue }: { slug: string; langue: Langue }) {
  const meter = meterDe(langue, slug);
  if (!meter) return null;
  const en = langue === 'en';
  const racine = en ? `${SITE_URL}/en` : SITE_URL;

  // Même source que la FAQ affichée plus bas : les questions déclarées ici sont
  // exactement celles que le visiteur voit.
  const faqs = meterFaq(slug, meter.questions.length, langue);

  const jsonLdItems: Record<string, unknown>[] = [
    {
      '@type': 'Quiz',
      name: meter.name,
      description: meter.description,
      url: `${racine}/ressources/${meter.slug}`,
      educationalLevel: 'beginner',
      numberOfQuestions: meter.questions.length,
      inLanguage: en ? 'en-US' : 'fr-FR',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: racine },
        { '@type': 'ListItem', position: 2, name: en ? 'Resources' : 'Ressources', item: `${racine}/ressources` },
        { '@type': 'ListItem', position: 3, name: meter.name, item: `${racine}/ressources/${meter.slug}` },
      ],
    },
  ];

  if (faqs.length > 0) {
    jsonLdItems.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': jsonLdItems,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export function MeterFaqAndLinks({ slug, langue }: { slug: string; langue: Langue }) {
  const meter = meterDe(langue, slug);
  if (!meter) return null;
  const en = langue === 'en';

  const faqs = meterFaq(slug, meter.questions.length, langue);
  const notes = meterNotes(slug, langue);

  const otherMeters = metersDe(langue).filter((m) => m.slug !== slug);

  return (
    <section
      aria-label={en ? `Information about the ${meter.name}` : `Informations sur le ${meter.name}`}
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '8px 16px 56px',
      }}
    >
      {/* Notice propre à l'outil. Les cinq pages partageaient sinon le même
          châssis d'écran d'accueil, pour un texte utile trop court : à contenu
          comparable, les consignes de qualité demandent de développer chaque
          page plutôt que de laisser cinq quasi-doublons. */}
      {notes.map((note) => (
        <div key={note.heading} style={{ marginBottom: 22 }}>
          <h2 style={{
            color: '#E5E7EB', fontSize: 15, fontWeight: 800, margin: '0 0 7px',
          }}>
            {note.heading}
          </h2>
          {note.body.map((paragraph, i) => (
            <p key={i} style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      {/* Les questions sont chargées à la demande par l'outil : elles
          n'existaient dans aucun HTML, alors même que le balisage `Quiz`
          annonce leur nombre. Les publier ici rend ce balisage exact, et
          permet de lire la grille sans dérouler le questionnaire. */}
      <h2 style={{
        color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
        textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
      }}>
        {en ? (
          <>The {meter.questions.length} situations reviewed</>
        ) : (
          <>Les {meter.questions.length} situations passées en revue</>
        )}
      </h2>
      <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.65, margin: '0 0 12px' }}>
        {en
          ? `Each situation is introduced by “${meter.questionPrefix}” The test presents them one by one; here they are in the order they appear.`
          : `Chaque situation est introduite par « ${meter.questionPrefix} ». Le test les présente une par une ; les voici dans leur ordre de passage.`}
      </p>
      <ol style={{
        color: '#9CA3AF', fontSize: 13, lineHeight: 1.7,
        margin: '0 0 28px 1.1rem', padding: 0, listStyle: 'decimal',
      }}>
        {meter.questions.map((question) => (
          <li key={question.id} style={{ marginBottom: 4 }}>
            {question.text}
          </li>
        ))}
      </ol>

      {faqs.length > 0 && (
        <>
          <h2 style={{
            color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
          }}>
            {en ? 'Frequently asked questions' : 'Questions fréquentes'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {faqs.map((faq) => (
              <div
                key={faq.question}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '14px 18px',
                }}
              >
                <h3 style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>
                  {faq.question}
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, lineHeight: 1.65 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{
        color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
        textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
      }}>
        {en ? 'Other self-assessment tools' : 'Autres outils d\'auto-évaluation'}
      </h2>
      <nav aria-label={en ? 'Other tools' : 'Autres outils'} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {otherMeters.map((m) => (
          <Link
            key={m.slug}
            href={cheminLocalise(langue, `/ressources/${m.slug}`)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              padding: '9px 14px',
              color: '#D1D5DB',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {m.emoji} {m.name}
          </Link>
        ))}
        <Link
          href={cheminLocalise(langue, '/ressources')}
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10,
            padding: '9px 14px',
            color: '#10B981',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {en ? 'All tools' : 'Tous les outils'}
        </Link>
      </nav>
    </section>
  );
}
