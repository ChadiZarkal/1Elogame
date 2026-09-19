/**
 * @module lib/rft/params
 * Lecture de l'identifiant d'une route dynamique.
 *
 * POURQUOI UNE FONCTION POUR SI PEU
 *   Depuis Next 15, `params` est une PROMESSE. Lue comme un objet ordinaire,
 *   elle ne lève pas : elle donne `undefined`, et la route répond alors
 *   « identifiant manquant » pour absolument toutes les ressources. Le symptôme
 *   n'a rien à voir avec la cause, et c'est exactement la panne qui avait rendu
 *   muette l'administration de « C'est un 10 mais… » — modifier, supprimer et
 *   créer échouaient en silence, sans une ligne dans les journaux.
 *
 *   Trois routes en ont besoin ici. Une seule fonction, écrite une fois, vaut
 *   mieux que trois occasions de refaire la même erreur.
 */

export async function lireIdRft(ctx?: Record<string, unknown>): Promise<string | null> {
  const params = await (ctx as { params?: Promise<{ id?: string }> } | undefined)?.params;
  return params?.id ?? null;
}
