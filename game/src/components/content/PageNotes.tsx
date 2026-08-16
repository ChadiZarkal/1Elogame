/**
 * @module components/content/PageNotes
 * Rendu du contenu éditorial placé sous les écrans de jeu.
 *
 * Composant serveur, sans état et sans animation d'entrée : le texte doit être
 * présent dans le HTML initial et peint immédiatement. Un `opacity: 0` animé
 * après hydratation reviendrait à ne rien servir du tout — c'est le défaut qui
 * avait vidé `/classement` de son contenu.
 *
 * Replié par `<details>` plutôt que déroulé. Le site se consulte au téléphone :
 * déroulé, ce bloc ajoutait près de 3 700 px sous un écran de jeu de 900 px,
 * soit quatre écrans de texte que personne ne fait défiler. `<details>` garde
 * tout dans le DOM — le contenu reste servi et indexable, il n'est pas monté à
 * la demande — et ne demande aucun JavaScript pour s'ouvrir.
 *
 * Le titre de chaque volet est un vrai `h3` à l'intérieur du `summary` : la
 * hiérarchie des titres reste lisible pour les lecteurs d'écran comme pour un
 * robot d'indexation.
 *
 * Le balisage `FAQPage` est émis ici, à partir du même tableau que l'affichage :
 * les questions déclarées à Google sont exactement celles qui sont à l'écran.
 */

import Link from 'next/link';
import type { FaqItem, PageNotes as PageNotesData } from '@/content/page-notes';

export function faqPageJsonLd(faq: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

interface Props {
  notes: PageNotesData;
  /** Passer à false si la route émet déjà un balisage FAQPage par ailleurs. */
  withFaqJsonLd?: boolean;
}

export function PageNotes({ notes, withFaqJsonLd = true }: Props) {
  return (
    <>
      {withFaqJsonLd && notes.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(notes.faq)) }}
        />
      )}

      <section className="page-notes" aria-labelledby="page-notes-title">
        <div className="page-notes__inner">
          <h2 className="page-notes__title" id="page-notes-title">
            {notes.title}
          </h2>

          {notes.lede && <p className="page-notes__lede">{notes.lede}</p>}

          {notes.blocks.map((block, index) => (
            <details
              className="page-notes__item"
              key={block.heading}
              /* Le premier volet est ouvert : sans cela le bloc n'est qu'une
                 pile de titres, et rien n'indique qu'il y a du texte dessous. */
              open={index === 0}
            >
              <summary className="page-notes__summary">
                <h3>{block.heading}</h3>
              </summary>
              {/* Clés par indice : ces listes sont statiques et ne sont jamais
                  réordonnées. Une clé tirée du texte se dupliquerait
                  silencieusement dès que deux paragraphes commenceraient
                  pareil — cas d'autant plus atteignable que certains sont
                  assemblés par concaténation conditionnelle. */}
              <div className="page-notes__body">
                {block.body?.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                {block.bullets && (
                  <ul>
                    {block.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}

          {notes.faq.length > 0 && (
            <>
              <h3 className="page-notes__faq-title">Questions fréquentes</h3>
              {notes.faq.map((item) => (
                <details className="page-notes__item" key={item.question}>
                  <summary className="page-notes__summary">
                    <h4>{item.question}</h4>
                  </summary>
                  <div className="page-notes__body">
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
            </>
          )}

          {notes.related.length > 0 && (
            <nav className="page-notes__related" aria-label="Pages liées">
              {notes.related.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
