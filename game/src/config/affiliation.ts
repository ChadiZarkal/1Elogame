/**
 * @module config/affiliation
 * Liens affiliés du site — source unique.
 *
 * Le programme Partenaires Amazon rémunère un achat fait dans les 24 heures
 * qui suivent un clic sur un lien portant notre identifiant (`tag`). Le site
 * ne vend rien, ne stocke rien et n'expédie rien : Amazon encaisse, livre et
 * gère les retours.
 *
 * Deux règles du programme dictent la forme des encarts :
 * - aucun prix, aucune note ni aucune image tirés d'Amazon, sauf par leur API
 *   (un prix affiché doit être à jour à 24 heures près) ;
 * - la mention « En tant que Partenaire Amazon… » doit être visible.
 */

/** Notre identifiant de Partenaire Amazon. */
export const AMAZON_TAG = 'redorgreen-21';

/**
 * Le lien affilié vers le pisse-debout : le lien court d'Amazon fourni par
 * Chadi le 2026-11-03. Il mène au Sunany en silicone (ASIN B088R55BX6) avec
 * notre `tag`, et ouvre l'application Amazon sur Android, la page web
 * ailleurs. Il remplace le modèle B0C8B2KZF6.
 */
export const PISSE_DEBOUT_URL = 'https://link.amazon/B0g4zcQ9W';

/** L'encart « Spécial festival » de l'accueil. `false` le retire sans rien supprimer. */
export const AFFICHER_PISSE_DEBOUT = true;
