import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red Flag Test — are you a red flag?';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🧪',
    titre: 'Red Flag Test',
    sous: 'Are you a red flag? The free, anonymous test: your score as a percentage, and where you rank among other players.',
    chemin: '/en/redflagtest',
    teinte: '#FFB4AA',
  });
}
