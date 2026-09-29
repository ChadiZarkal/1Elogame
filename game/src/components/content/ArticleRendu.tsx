/**
 * @module components/content/ArticleRendu
 * La mise en page unique des articles (voir `content/articles/types.ts`).
 *
 * Composant serveur : tout le texte est dans le HTML initial.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Bloc } from '@/content/articles';

/** `[libellé](/adresse)` et `**gras**`, rien d'autre. */
export function Enrichi({ texte }: { texte: string }): ReactNode {
  const morceaux = texte.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return morceaux.map((m, i) => {
    const lien = m.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (lien) {
      const [, libelle, href] = lien;
      return href.startsWith('/') ? (
        <Link key={i} href={href}>
          {libelle}
        </Link>
      ) : (
        <a key={i} href={href} rel="noopener noreferrer" target="_blank">
          {libelle}
        </a>
      );
    }
    const gras = m.match(/^\*\*([^*]+)\*\*$/);
    if (gras) return <strong key={i}>{gras[1]}</strong>;
    return m;
  });
}

function RenduBloc({ bloc }: { bloc: Bloc }) {
  switch (bloc.type) {
    case 'p':
      return (
        <p>
          <Enrichi texte={bloc.texte} />
        </p>
      );
    case 'h2':
      return <h2><Enrichi texte={bloc.texte} /></h2>;
    case 'h3':
      return <h3><Enrichi texte={bloc.texte} /></h3>;
    case 'liste':
      return (
        <ul>
          {bloc.items.map((item) => (
            <li key={item}>
              <Enrichi texte={item} />
            </li>
          ))}
        </ul>
      );
    case 'tableau':
      return (
        <div className="legal-page__table-wrap">
          <table className="legal-page__table article-tableau">
            <caption className="sr-only">{bloc.legende}</caption>
            <thead>
              <tr>
                {bloc.entetes.map((e, i) => (
                  <th key={i} scope="col">{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloc.lignes.map((ligne) => (
                <tr key={ligne[0]}>
                  {ligne.map((cellule, i) =>
                    i === 0 ? <th key={i} scope="row">{cellule}</th> : <td key={i}>{cellule}</td>,
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'encadre':
      return (
        <aside className="article-encadre">
          <p className="article-encadre__titre">{bloc.titre}</p>
          {bloc.paragraphes.map((p) => (
            <p key={p}>
              <Enrichi texte={p} />
            </p>
          ))}
        </aside>
      );
  }
}

export function ArticleRendu({ blocs }: { blocs: Bloc[] }) {
  return (
    <div className="legal-page__section article-corps">
      {blocs.map((bloc, i) => (
        <RenduBloc key={i} bloc={bloc} />
      ))}
    </div>
  );
}
