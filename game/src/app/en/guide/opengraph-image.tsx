import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red flag: meaning and examples — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '📖',
    titre: 'Red flag: meaning and examples',
    sous: 'From green flag to black flag: the five signals, with real-life examples.',
    chemin: '/en/guide',
    teinte: '#10B981',
  });
}
