/**
 * @module redflagtest/PageTest
 * La page du Red Flag Test, partagée par `/redflagtest` et `/en/redflagtest`.
 * Voir `page.tsx` pour le pourquoi de sa composition.
 */

import { Quiz } from './Quiz';
import { BadgeModeTest } from './BadgeModeTest';
import { FAQ_RFT_EN, Presentation } from './Presentation';
import type { Langue } from '@/lib/i18n/langue';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

/**
 * Le balisage `Quiz` que les autres jeux portent déjà. Il ne décrit que ce que
 * la page affiche : `Presentation` est rendu dans le même HTML.
 */
function RedflagtestJsonLd({ langue }: { langue: Langue }) {
  const en = langue === 'en';
  const url = `${SITE_URL}${en ? '/en' : ''}/redflagtest`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Quiz',
        name: 'Red Flag Test',
        about: { '@type': 'Thing', name: 'Red flag' },
        description: en
          ? 'Am I a red flag? A free, anonymous red flag quiz: your score as a percentage, your profile and your ranking among other players.'
          : 'Test gratuit et anonyme pour savoir à quel point tu es un red flag : score en pourcentage, profil et classement parmi les autres joueurs.',
        url,
        inLanguage: en ? 'en-US' : 'fr-FR',
        isAccessibleForFree: true,
        publisher: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
      },
      // En anglais, les questions-réponses que `Presentation` affiche (2026-11-20).
      ...(en
        ? [{
            '@type': 'FAQPage',
            inLanguage: 'en-US',
            mainEntity: FAQ_RFT_EN.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.reponse },
            })),
          }]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Red Flag Test', item: url },
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

/** La page du test, dans les deux langues (`/redflagtest`, `/en/redflagtest`). */
export function PageTest({ langue }: { langue: Langue }) {
  return (
    <main className="main-container redflagtest" id="main-content">
      <div className="client-container">
        <header className="site-header">
          {/* Plus de logo ici : la barre du site, au-dessus, porte déjà celui
              de la marque et le lien vers l'accueil. Les deux empilés se
              lisaient comme une barre en double — et le second coûtait jusqu'à
              8,5 rem de hauteur à chaque question. */}
          {/* L'accroche de la référence restait affichée du début à la fin de
              la partie, juste sous le logo. Elle n'apporte rien après le premier
              écran et mange de la hauteur à chaque question. Le titre reste dans
              le document — une page a besoin d'un h1, et un lecteur d'écran
              aussi — mais il quitte l'écran. */}
          <h1 className="visually-hidden">
            {langue === 'en' ? 'Red Flag Test: am I a red flag?' : 'Red Flag Test'}
          </h1>
        </header>
        <Quiz presentation={<Presentation langue={langue} />} />
        <BadgeModeTest />
        <RedflagtestJsonLd langue={langue} />
      </div>
    </main>
  );
}
