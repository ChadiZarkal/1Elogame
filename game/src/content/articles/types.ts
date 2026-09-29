/**
 * @module content/articles/types
 * Le format d'un article.
 *
 * Un article est une donnée typée, pas du JSX : on l'écrit comme un texte,
 * bloc après bloc, et une seule mise en page le rend (`ArticleRendu`). Même
 * principe que `content/page-notes.ts`.
 *
 * Dans les textes, deux marques seulement :
 *   [libellé](/adresse)  — un lien
 *   **mots**             — du gras
 */

export type Bloc =
  | { type: 'p'; texte: string }
  | { type: 'h2'; texte: string }
  | { type: 'h3'; texte: string }
  | { type: 'liste'; items: string[] }
  | {
      type: 'tableau';
      /** Ce que le tableau montre, en une phrase : lue par les lecteurs d'écran. */
      legende: string;
      entetes: string[];
      lignes: string[][];
    }
  | { type: 'encadre'; titre: string; paragraphes: string[] };

export interface SourceArticle {
  titre: string;
  editeur: string;
  date: string;
  url: string;
}

export interface Article {
  slug: string;
  titre: string;
  /** Le chapeau : ce que l'article établit, en deux ou trois phrases. */
  chapo: string;
  /** Pour Google et les aperçus de lien. */
  description: string;
  emoji: string;
  auteur: string;
  /** Dates ISO (AAAA-MM-JJ). `misAJour` change quand le texte change. */
  publie: string;
  misAJour: string;
  /** Date à laquelle les chiffres cités ont été arrêtés, s'il y en a. */
  chiffresAu?: string;
  blocs: Bloc[];
  /** Pages du site vers lesquelles l'article renvoie en fin de lecture. */
  suite: { href: string; label: string }[];
  sources: SourceArticle[];
}
