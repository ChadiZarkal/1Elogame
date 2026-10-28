'use client';

/**
 * @module dixmais/PausePub
 * La pause publicitaire de « C'est un 10 mais… », tous les cinq profils.
 *
 * Un écran à part, entre le verdict (ou le bilan) et le profil suivant :
 * l'encart natif au milieu, étiqueté « Publicité », et le bouton qui se
 * débloque au bout de quelques secondes. Pendant la notation, rien ne
 * s'affiche jamais. Réglages dans `config/ads.ts` (DIXMAIS_PAUSE).
 *
 * Un bloqueur de publicité laisse l'encart vide : l'écran reste le même, avec
 * son compte à rebours.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DIXMAIS_PAUSE, DIXMAIS_PAUSE_DUREE_S } from '@/config/ads';
import { CadreRegie } from '@/components/ads/CadreRegie';
import { Pied, TEINTES } from './ui';

export function PausePub({ profilsJuges, onContinuer }: { profilsJuges: number; onContinuer: () => void }) {
  const [reste, setReste] = useState(DIXMAIS_PAUSE_DUREE_S);

  // Recalculé depuis l'heure de départ : un onglet en arrière-plan ralentit
  // les minuteurs, un décompte seconde par seconde durerait bien plus.
  useEffect(() => {
    const depart = Date.now();
    const minuteur = setInterval(() => {
      const r = Math.max(0, DIXMAIS_PAUSE_DUREE_S - Math.floor((Date.now() - depart) / 1000));
      setReste(r);
      if (r === 0) clearInterval(minuteur);
    }, 250);
    return () => clearInterval(minuteur);
  }, []);

  const pret = reste <= 0;

  return (
    <motion.div
      key="pause-pub"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto overscroll-contain px-5"
    >
      <div className="pt-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: TEINTES.discret }}>
          {profilsJuges} profils jugés
        </p>
        <p className="mt-2 text-[22px] font-black leading-tight text-white">Petite pause</p>
        <p className="mt-1 text-[13px]" style={{ color: TEINTES.secondaire }}>
          Le prochain profil arrive juste après.
        </p>
      </div>

      <aside aria-label="Publicité" className="mx-auto mt-6 w-full max-w-sm flex-1">
        <p
          aria-hidden
          className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: TEINTES.discret }}
        >
          Publicité
        </p>
        {DIXMAIS_PAUSE.enabled && <CadreRegie unit={DIXMAIS_PAUSE} />}
      </aside>

      <Pied>
        <button
          type="button"
          onClick={onContinuer}
          disabled={!pret}
          aria-live="polite"
          className="w-full rounded-2xl py-4 text-[15px] font-black uppercase tracking-wider transition-colors enabled:cursor-pointer"
          style={pret ? { background: TEINTES.or, color: '#000' } : { background: 'rgba(255,255,255,0.08)', color: TEINTES.discret }}
        >
          {pret ? 'Profil suivant →' : `Profil suivant dans ${reste}…`}
        </button>
      </Pied>
    </motion.div>
  );
}
