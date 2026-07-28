'use client';

/**
 * @module dixmais/Ambient
 * Fond réactif à la note.
 *
 * La pièce entière change de couleur pendant que le joueur déplace la jauge :
 * la note en cours devient perceptible en vision périphérique, sans qu'il ait à
 * quitter des yeux la phrase qu'il est en train de lire.
 *
 * Aucun `filter: blur()` — un dégradé radial masqué produit le même flou pour
 * une fraction du coût de composition, ce qui compte sur un téléphone d'entrée
 * de gamme.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { scoreColor } from './scale';

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E";

export function Ambient({ score, shock }: { score: number; shock: number }) {
  const tint = scoreColor(score);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#07070A' }} />

      {/* Halo haut : suit la note en direct. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.3,
          maskImage: 'radial-gradient(130% 70% at 50% -10%, #000 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(130% 70% at 50% -10%, #000 0%, transparent 62%)',
          transition: 'background-color 650ms ease',
        }}
      />

      {/* Halo bas : ancre la zone de notation. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: tint,
          opacity: 0.16,
          maskImage: 'radial-gradient(100% 45% at 50% 108%, #000 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(100% 45% at 50% 108%, #000 0%, transparent 70%)',
          transition: 'background-color 650ms ease',
        }}
      />

      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")`, opacity: 0.045 }}
      />

      {/* Coup de rouge sur une chute brutale. */}
      <AnimatePresence>
        {shock > 0 && (
          <motion.div
            key={shock}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 60%, #DC262655 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
