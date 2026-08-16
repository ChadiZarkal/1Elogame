/**
 * @module components/content/PageNotes
 * Rendu du contenu éditorial placé sous les écrans de jeu.
 *
 * Composant serveur, sans état et sans animation d'entrée : le texte doit être
 * présent dans le HTML initial et peint immédiatement. Un `opacity: 0` animé
 * après hydratation reviendrait à ne rien servir du tout — c'est le défaut qui
 * avait vidé `/classement` de son contenu.
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

          {notes.blocks.map((block) => (
            <div className="page-notes__block" key={block.heading}>
              <h3>{block.heading}</h3>
              {block.body?.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              {block.bullets && (
                <ul>
                  {block.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 40)}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {notes.faq.length > 0 && (
            <div className="page-notes__block">
              <h3>Questions fréquentes</h3>
              {notes.faq.map((item) => (
                <div className="page-notes__faq" key={item.question}>
                  <h4>{item.question}</h4>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
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
