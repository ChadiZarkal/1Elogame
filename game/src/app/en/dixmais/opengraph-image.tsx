import { carteOg, TAILLE_OG } from '@/lib/carteOg';

/** L'image de partage de `/en/dixmais`, comme `app/dixmais/opengraph-image.tsx`. */

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'It’s a 10 but… — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '⭐',
    titre: 'It’s a 10 but…',
    sous: 'Red flags and green flags, rated one by one up to 15/10. Their final score is your average.',
    chemin: '/en/dixmais',
    teinte: '#F59E0B',
  });
}
