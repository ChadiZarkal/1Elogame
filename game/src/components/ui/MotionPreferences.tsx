'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Soumet toutes les animations Framer Motion du site au réglage système
 * « réduire les animations ».
 *
 * Le bloc `prefers-reduced-motion` de `globals.css` ne neutralise que les
 * propriétés `animation` et `transition` du CSS. Framer Motion, lui, anime en
 * JavaScript image par image : il passait entièrement au travers, et les
 * quelque cinquante animations du site — dont plusieurs en boucle infinie —
 * continuaient de tourner chez les personnes qui avaient justement demandé
 * qu'elles s'arrêtent.
 *
 * `reducedMotion="user"` conserve les transformations d'opacité, qui portent
 * l'information sans provoquer de gêne, et supprime les déplacements.
 */
export function MotionPreferences({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
