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
 * Le lien affilié vers le pisse-debout, tel que généré par SiteStripe, sans
 * les paramètres de la recherche qui l'avait précédé (`crid`, `dib`,
 * `keywords`…) ni le préfixe `/-/en/`, qui forçait la page en anglais.
 */
export const PISSE_DEBOUT_URL = `https://www.amazon.fr/dp/B0C8B2KZF6?th=1&linkCode=ll2&tag=${AMAZON_TAG}&linkId=1f7f48e77781d2c38802c2d84240cf80&ref_=as_li_ss_tl`;

/** L'encart « Spécial festival » de l'accueil. `false` le retire sans rien supprimer. */
export const AFFICHER_PISSE_DEBOUT = true;
