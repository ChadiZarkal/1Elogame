import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red or Green — the Red Flag Test and red flag games';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🚩',
    titre: 'Red or Green',
    sous: '“Red flag” gets used for anything and everything. Here, the players decide. Free, anonymous, no account.',
    chemin: '/en',
    teinte: '#FF6B5E',
  });
}
