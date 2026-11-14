'use client';

/**
 * @module lib/i18n/LangueContexte
 * La langue de la page, pour les composants clients.
 *
 * Sans fournisseur, c'est le français : toutes les pages existantes le restent
 * sans rien changer. Les pages sous `/en` posent `<LangueFournie langue="en">`.
 */

import { createContext, useContext, useEffect } from 'react';
import { LANGUE_PAR_DEFAUT, type Langue } from './langue';

const Contexte = createContext<Langue>(LANGUE_PAR_DEFAUT);

export function useLangue(): Langue {
  return useContext(Contexte);
}

export function LangueFournie({ langue, children }: { langue: Langue; children: React.ReactNode }) {
  /* Le gabarit racine déclare `<html lang="fr">` pour tout le site. Une page
     anglaise le corrige à l'affichage — lecteurs d'écran, traduction
     automatique du navigateur, césure — et le rend en partant. */
  useEffect(() => {
    const avant = document.documentElement.lang;
    document.documentElement.lang = langue;
    return () => {
      document.documentElement.lang = avant;
    };
  }, [langue]);

  return <Contexte.Provider value={langue}>{children}</Contexte.Provider>;
}
