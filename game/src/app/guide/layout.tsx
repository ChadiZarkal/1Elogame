import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

export const metadata: Metadata = {
  title: 'Guide des Flags — Définitions Red Flag, Green Flag, Black Flag...',
  description:
    'Comprends la différence entre Green Flag, Orange Flag, Red Flag, Black Flag et White Flag. Définitions claires avec exemples concrets pour reconnaître les signaux relationnels.',
  keywords: [
    'red flag définition', 'green flag définition', 'black flag signification',
    'orange flag relation', 'white flag couple', 'guide flags relation',
    'signaux relation toxique', 'reconnaître red flag couple',
    'green flag comportement', 'différence red flag green flag',
    'flags relationnels', 'signaux comportements', 'red flag examples',
  ],
  openGraph: {
    title: 'Guide des Flags — Red, Green, Black, Orange & White Flag',
    description: 'Comprends les 5 types de signaux relationnels avec définitions et exemples concrets.',
    url: '/guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guide des Flags — Définitions et exemples concrets',
    description: 'Red, Green, Black, Orange, White Flag : tous les signaux relationnels expliqués avec exemples.',
  },
  alternates: { canonical: '/guide' },
};

function GuideJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Guide des Flags : Red Flag, Green Flag, Black Flag, Orange Flag et White Flag',
        description:
          'Comprendre les 5 types de signaux relationnels avec définitions complètes et exemples concrets.',
        url: `${SITE_URL}/guide`,
        author: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'Red or Green',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-rog-new.svg` },
        },
        inLanguage: 'fr-FR',
        isPartOf: { '@type': 'WebSite', name: 'Red or Green', url: SITE_URL },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: "Qu'est-ce qu'un Red Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un Red Flag est un comportement réellement problématique : contrôle, manque de respect, manipulation ou schéma toxique. Pris isolément, il peut parfois se travailler avec une vraie remise en question, mais l'accumulation de Red Flags est nocive.",
            },
          },
          {
            '@type': 'Question',
            name: "Qu'est-ce qu'un Green Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un Green Flag est un comportement sain et mature, signe d'une personne respectueuse, communicative et cohérente. Il indique que la relation repose sur des bases équilibrées.",
            },
          },
          {
            '@type': 'Question',
            name: "Qu'est-ce qu'un Black Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un Black Flag est un comportement totalement rédhibitoire et potentiellement dangereux. C'est une limite absolue : violence, manipulation grave, contrôle total. La sécurité passe avant tout.",
            },
          },
          {
            '@type': 'Question',
            name: "Qu'est-ce qu'un Orange Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un Orange Flag est un comportement à surveiller qui mérite une conversation. Pas forcément rédhibitoire, il peut s'expliquer par le contexte, mais il ne doit pas être ignoré.",
            },
          },
          {
            '@type': 'Question',
            name: "Qu'est-ce qu'un White Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un White Flag est un comportement neutre, explicable et sans charge négative. Ce n'est pas un mauvais indicateur : dans une relation, ce n'est généralement pas un sujet en soi.",
            },
          },
          {
            '@type': 'Question',
            name: "Quelle est la différence entre Red Flag et Black Flag ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Le Red Flag signale un problème sérieux qui nécessite une réponse et une conversation. Le Black Flag est une limite absolue et rédhibitoire — un comportement immédiatement inacceptable comme la violence ou la manipulation grave.",
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Guide des Flags', item: `${SITE_URL}/guide` },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd />
      {children}
    </>
  );
}
