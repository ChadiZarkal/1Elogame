import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red flag : définition et exemples — Red or Green';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '📖',
    titre: 'Red flag : définition et exemples',
    sous: 'Du green flag au black flag : les cinq signaux, avec des exemples concrets.',
    chemin: '/guide',
    teinte: '#10B981',
  });
}
