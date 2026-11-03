import { carteOg, TAILLE_OG } from '@/lib/carteOg';

/**
 * « C'est un 10 mais… » n'avait aucune image de partage : un lien collé dans
 * une conversation ne montrait que son titre (constaté le 2026-11-03).
 */

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'C’est un 10 mais… — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '⭐',
    titre: 'C’est un 10 mais…',
    sous: 'Red flags et green flags, notés un par un jusqu’à 15/10. Sa note finale, c’est ta moyenne.',
    chemin: '/dixmais',
    teinte: '#F59E0B',
  });
}
