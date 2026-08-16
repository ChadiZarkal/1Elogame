import type { Metadata } from 'next';
import Link from 'next/link';
import { METERS } from '@/config/meters-data';
import { meterFaq } from '@/content/meter-faq';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  return METERS.map((meter) => ({ slug: meter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meter = METERS.find((m) => m.slug === slug);

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
    alternates: { canonical: `/ressources/${slug}` },
  };
}

function MeterJsonLd({ slug }: { slug: string }) {
  const meter = METERS.find((m) => m.slug === slug);
  if (!meter) return null;

  // Même source que la FAQ affichée plus bas : les questions déclarées ici sont
  // exactement celles que le visiteur voit.
  const faqs = meterFaq(slug, meter.questions.length);

  const jsonLdItems: Record<string, unknown>[] = [
    {
      '@type': 'Quiz',
      name: meter.name,
      description: meter.description,
      url: `${SITE_URL}/ressources/${meter.slug}`,
      educationalLevel: 'beginner',
      numberOfQuestions: meter.questions.length,
      inLanguage: 'fr-FR',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Ressources', item: `${SITE_URL}/ressources` },
        { '@type': 'ListItem', position: 3, name: meter.name, item: `${SITE_URL}/ressources/${meter.slug}` },
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

function MeterFaqAndLinks({ slug }: { slug: string }) {
  const meter = METERS.find((m) => m.slug === slug);
  if (!meter) return null;

  const faqs = meterFaq(slug, meter.questions.length);

  const otherMeters = METERS.filter((m) => m.slug !== slug);

  return (
    <section
      aria-label={`Informations sur le ${meter.name}`}
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '8px 16px 56px',
      }}
    >
      {faqs.length > 0 && (
        <>
          <h2 style={{
            color: '#4B5563', fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px',
          }}>
            Questions fréquentes
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
        Autres outils d&apos;auto-évaluation
      </h2>
      <nav aria-label="Autres outils" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {otherMeters.map((m) => (
          <Link
            key={m.slug}
            href={`/ressources/${m.slug}`}
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
          href="/ressources"
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
          Tous les outils
        </Link>
      </nav>
    </section>
  );
}

export default async function MeterLayout({ params, children }: Props) {
  const { slug } = await params;
  return (
    <>
      <MeterJsonLd slug={slug} />
      {children}
      {/* Placé sous l'outil : le contenu éditorial ne doit pas s'intercaler
          avant l'usage, mais il doit être présent et visible dans le HTML. */}
      <MeterFaqAndLinks slug={slug} />
    </>
  );
}
