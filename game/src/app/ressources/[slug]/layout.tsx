import type { Metadata } from 'next';
import { METERS } from '@/config/meters-data';

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

  const faqMap: Record<string, Array<{ question: string; answer: string }>> = {
    violentometre: [
      { question: 'Qu\'est-ce que le violentomètre ?', answer: 'Le violentomètre est un outil d\'auto-évaluation qui permet d\'identifier les signes de violence dans une relation. Il aide à repérer les comportements qui se situent sur un spectre allant de la relation saine à la violence grave.' },
      { question: 'Le violentomètre en ligne est-il gratuit ?', answer: `Oui, notre violentomètre en ligne est 100% gratuit, anonyme, et ne collecte aucune donnée. Il comporte ${meter.questions.length} questions et les résultats sont immédiats.` },
      { question: 'Comment fonctionne le test du violentomètre ?', answer: 'Tu réponds par Oui ou Non à chaque situation. À la fin, tu obtiens un résultat coloré (vert, jaune, orange, rouge) qui indique le niveau de gravité de ta situation, avec des conseils et des ressources d\'aide.' },
    ],
    consentometre: [
      { question: 'Qu\'est-ce que le consentomètre ?', answer: 'Le consentomètre est un outil qui aide à évaluer si ton consentement est respecté dans tes relations amicales, amoureuses, universitaires ou professionnelles.' },
      { question: 'Le test du consentomètre est-il anonyme ?', answer: `Oui, le consentomètre est 100% anonyme et gratuit. Aucune donnée n'est collectée. Les ${meter.questions.length} questions sont traitées directement sur ton appareil.` },
    ],
    harcelometre: [
      { question: 'Qu\'est-ce que le harcèlomètre ?', answer: 'Le harcèlomètre est un outil permettant d\'identifier les situations de harcèlement moral, physique ou en ligne dans tes relations personnelles ou professionnelles.' },
      { question: 'Comment savoir si je suis victime de harcèlement ?', answer: `Notre harcèlomètre te pose ${meter.questions.length} questions simples pour t'aider à identifier les signes de harcèlement. L'outil est gratuit et anonyme.` },
    ],
    incestometre: [
      { question: 'Qu\'est-ce que l\'incestomètre ?', answer: 'L\'incestomètre est un outil d\'évaluation qui aide à identifier les comportements incestueux ou les transgressions de limites dans le cadre familial.' },
    ],
    discriminometre: [
      { question: 'Qu\'est-ce que le discriminomètre ?', answer: 'Le discriminomètre est un outil pour identifier les situations de discrimination que tu pourrais vivre au quotidien, que ce soit dans le milieu scolaire, professionnel ou social.' },
    ],
  };

  const faqs = faqMap[slug] || [];

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

function MeterSeoContent({ slug }: { slug: string }) {
  const meter = METERS.find((m) => m.slug === slug);
  if (!meter) return null;

  const faqMap: Record<string, Array<{ question: string; answer: string }>> = {
    violentometre: [
      { question: 'Qu\'est-ce que le violentomètre ?', answer: `Le violentomètre est un outil d'auto-évaluation qui permet d'identifier les signes de violence dans une relation. Notre test comprend ${meter.questions.length} questions pour repérer les comportements entre relation saine et violence grave.` },
      { question: 'Le violentomètre en ligne est-il gratuit ?', answer: 'Oui, notre violentomètre en ligne est 100% gratuit, anonyme, et ne collecte aucune donnée. Les résultats sont immédiats.' },
    ],
    consentometre: [
      { question: 'Qu\'est-ce que le consentomètre ?', answer: `Le consentomètre aide à évaluer si ton consentement est respecté dans tes relations. ${meter.questions.length} questions, 100% anonyme.` },
    ],
    harcelometre: [
      { question: 'Qu\'est-ce que le harcèlomètre ?', answer: `Le harcèlomètre permet d'identifier les situations de harcèlement. ${meter.questions.length} questions pour t'aider à y voir clair.` },
    ],
    incestometre: [
      { question: 'Qu\'est-ce que l\'incestomètre ?', answer: `L'incestomètre aide à identifier les comportements incestueux. ${meter.questions.length} questions, gratuit et anonyme.` },
    ],
    discriminometre: [
      { question: 'Qu\'est-ce que le discriminomètre ?', answer: `Le discriminomètre identifie les situations de discrimination. ${meter.questions.length} questions, 100% confidentiel.` },
    ],
  };

  const faqs = faqMap[slug] || [];

  return (
    <section className="sr-only" aria-label={`Informations sur le ${meter.name}`}>
      <h2>{meter.name} en ligne — Test gratuit et anonyme</h2>
      <p>{meter.description}</p>
      <p>{meter.intro}</p>
      <p>Ce test comprend {meter.questions.length} questions. Résultats immédiats, 100% anonyme, aucune donnée collectée.</p>
      {faqs.length > 0 && (
        <div>
          <h3>Questions fréquentes</h3>
          {faqs.map((faq, i) => (
            <div key={i}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
      <nav aria-label="Autres outils">
        <a href="/ressources">Tous les outils d&apos;auto-évaluation</a>
        {METERS.filter(m => m.slug !== slug).map(m => (
          <a key={m.slug} href={`/ressources/${m.slug}`}>{m.name}</a>
        ))}
        <a href="/">Red or Green — Accueil</a>
        <a href="/jeu">Jouer à Red or Green</a>
      </nav>
    </section>
  );
}

export default async function MeterLayout({ params, children }: Props) {
  const { slug } = await params;
  return (
    <>
      <MeterJsonLd slug={slug} />
      <MeterSeoContent slug={slug} />
      {children}
    </>
  );
}
