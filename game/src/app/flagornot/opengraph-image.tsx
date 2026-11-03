import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'L’Oracle — red flag ou green flag ? — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🔮',
    titre: 'L’Oracle',
    sous: 'Tu racontes ta situation, l’Oracle tranche : red flag ou green flag ?',
    chemin: '/flagornot',
    teinte: '#88CEFF',
  });
}
