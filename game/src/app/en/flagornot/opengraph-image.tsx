import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'The Oracle — red flag or green flag? — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🔮',
    titre: 'The Oracle',
    sous: 'You describe the situation, the Oracle makes the call: red flag or green flag?',
    chemin: '/en/flagornot',
    teinte: '#88CEFF',
  });
}
