import { carteOg, TAILLE_OG } from '@/lib/carteOg';

// Node et non edge : le gabarit lit le logo et la police sur le disque.
export const runtime = 'nodejs';

export const alt = 'Red Flag Test — es-tu un red flag ?';
export const size = TAILLE_OG;
export const contentType = 'image/png';

export default function Image() {
  return carteOg({
    emoji: '🧪',
    titre: 'Red Flag Test',
    sous: 'Es-tu un red flag ? Le test gratuit et anonyme : ton score en pourcentage, et ta place parmi les autres joueurs.',
    chemin: '/redflagtest',
    teinte: '#FFB4AA',
  });
}
