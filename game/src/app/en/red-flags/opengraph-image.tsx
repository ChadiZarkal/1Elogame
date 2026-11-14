import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'The worst red flags, according to the votes — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🚩',
    titre: 'The worst red flags, according to the votes',
    sous: 'The list ranked by thousands of duels, updated every hour.',
    chemin: '/en/red-flags',
    teinte: '#FF6B5E',
  });
}
