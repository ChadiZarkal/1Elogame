'use client';

/**
 * @module components/game/PausePubDuel
 * « Le pire des deux » : la pause publicitaire, tous les cinq duels.
 *
 * Elle prend la place du résultat qu'on vient de quitter, sur la même hauteur
 * d'écran : la barre du haut (rafraîchir, progression) reste en place, et le
 * joueur repart d'un geste, sans compte à rebours. L'encart vit dans son propre
 * cadre (voir `CadreRegie`) : la page des duels ne se recharge jamais, et la
 * régie ne remplit qu'un conteneur par document.
 */

import { motion } from 'framer-motion';
import { JEU_PAUSE } from '@/config/ads';
import { CadreRegie } from '@/components/ads/CadreRegie';

export function PausePubDuel({ duelsJoues, onContinuer }: { duelsJoues: number; onContinuer: () => void }) {
  return (
    <motion.div
      key="pause-pub-duel"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5"
      /* La barre du haut est posée en absolu à 12 px, sur 44 px de haut. */
      style={{ paddingTop: '4.5rem' }}
    >
      <div className="text-center">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#737373]">
          {duelsJoues} duels joués
        </p>
        <p className="mt-1.5 text-[22px] font-black leading-tight text-[#F5F5F5]">Petite pause</p>
        <p className="mt-1 text-[14px] text-[#A3A3A3]">Le duel suivant arrive juste après.</p>
      </div>

      <aside aria-label="Publicité" className="mx-auto mt-5 w-full max-w-sm">
        <p
          aria-hidden
          className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#5C5C5F]"
        >
          Publicité
        </p>
        <CadreRegie unit={JEU_PAUSE} />
      </aside>

      {/* `mt-auto` : le bouton descend en bas de l'écran quand l'annonce est
          courte ou absente, et suit l'annonce quand elle est longue. */}
      <div
        className="mx-auto mt-auto w-full max-w-sm pt-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        <button
          type="button"
          onClick={onContinuer}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 text-[16px] font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_34px_rgba(220,38,38,0.35)] transition-colors hover:bg-[#EF4444] active:scale-[0.98]"
        >
          Duel suivant
          <span aria-hidden>→</span>
        </button>
      </div>
    </motion.div>
  );
}
