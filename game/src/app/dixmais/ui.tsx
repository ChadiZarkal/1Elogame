'use client';

/**
 * @module dixmais/ui
 * Les briques visuelles communes aux écrans du jeu.
 *
 * L'interface en faisait trop : chaque bloc avait son cadre, son titre en
 * capitales espacées et sa couleur. Ici, une règle simple :
 *  - la **couleur** est réservée aux notes (la rampe de `scale`) ;
 *  - l'**or** au seul bouton principal ;
 *  - tout le reste est en gris, séparé par l'espace et des filets fins plutôt
 *    que par des encadrés.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const TEINTES = {
  fond: '#07070A',
  filet: 'rgba(255,255,255,0.08)',
  texte: 'rgba(255,255,255,0.9)',
  secondaire: 'rgba(255,255,255,0.55)',
  discret: 'rgba(255,255,255,0.32)',
  or: '#FFD700',
  /** Le « mais… » d'un red flag, et le « et en plus… » d'un green flag. */
  ambre: '#F59E0B',
  vert: '#4ADE80',
} as const;

/** Petit titre de section : une seule taille, une seule couleur. */
export function Titre({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: TEINTES.discret }}>
      {children}
    </h3>
  );
}

/** Une section : un titre, un contenu, un filet au-dessus. Pas de cadre. */
export function Section({ titre, children }: { titre?: string; children: ReactNode }) {
  return (
    <section className="border-t py-5" style={{ borderColor: TEINTES.filet }}>
      {titre && <Titre>{titre}</Titre>}
      {children}
    </section>
  );
}

/** Le seul bouton doré de l'écran. */
export function BoutonPrincipal({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full cursor-pointer rounded-2xl py-4 text-[15px] font-black uppercase tracking-wider text-black"
      style={{ background: TEINTES.or }}
    >
      {children}
    </motion.button>
  );
}

/** Action secondaire : du texte, une icône, aucun fond. */
export function BoutonDiscret({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const classes =
    'flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-white/5';
  if (href) {
    return (
      <Link href={href} className={classes} style={{ color: TEINTES.secondaire }}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} style={{ color: TEINTES.secondaire }}>
      {children}
    </button>
  );
}

/**
 * Pied d'écran épinglé en bas du conteneur défilant : le bouton principal
 * reste à portée de pouce, le dégradé signale qu'il reste à lire dessous.
 */
export function Pied({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-5 mt-2 space-y-1 px-5 pt-6"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
        background: `linear-gradient(to top, ${TEINTES.fond} 70%, rgba(7,7,10,0))`,
      }}
    >
      {children}
    </div>
  );
}

/** Pastille de note : le chiffre dans sa couleur, sur un fond à peine teinté. */
export function Pastille({ note, couleur, taille = 'md' }: { note: number; couleur: string; taille?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-black tabular-nums ${
        taille === 'sm' ? 'h-6 min-w-6 px-1 text-[12px]' : 'h-8 min-w-8 px-1.5 text-[14px]'
      }`}
      style={{ color: couleur, background: `${couleur}1F` }}
    >
      {note}
    </span>
  );
}
