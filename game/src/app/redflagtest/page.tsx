/**
 * @module redflagtest/page
 * Le Red Flag Test.
 *
 * Le front-end vient de `ChadiZarkal/redorgreenorigin`, repris tel quel. Le
 * contenu — questions, réponses, points, tags, verdicts — se saisit dans
 * `/admin/redflagtest` et vit en base. Rien n'est écrit en dur ici.
 *
 * Le cadre reproduit le markup d'origine : `main.main-container` >
 * `div.client-container` > `header.site-header`. Ces noms sont ce que
 * `flac.css` stylise ; les renommer supprimerait le design en silence.
 */

import { Quiz } from './Quiz';
import { Presentation } from './Presentation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

/**
 * Le balisage `Quiz` que les autres jeux portent déjà. Il ne décrit que ce que
 * la page affiche : `Presentation` est rendu dans le même HTML.
 */
function RedflagtestJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Quiz',
        name: 'Red Flag Test',
        about: { '@type': 'Thing', name: 'Red flag' },
        description:
          'Test gratuit et anonyme pour savoir à quel point tu es un red flag : score en pourcentage, profil et classement parmi les autres joueurs.',
        url: `${SITE_URL}/redflagtest`,
        inLanguage: 'fr-FR',
        isAccessibleForFree: true,
        publisher: { '@type': 'Organization', name: 'Red or Green', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Red Flag Test', item: `${SITE_URL}/redflagtest` },
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

export default function RedflagtestPage() {
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
          <h1 className="visually-hidden">Red Flag Test</h1>
        </header>
        <Quiz presentation={<Presentation />} />
        <RedflagtestJsonLd />
      </div>
    </main>
  );
}
