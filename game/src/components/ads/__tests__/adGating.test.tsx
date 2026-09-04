/**
 * @file adGating.test.tsx
 * @description Ce que garantit ce fichier : où la régie a le droit d'entrer, et
 * où elle ne l'a pas.
 *
 * Les encarts se chargent sans rien demander. Les seules barrières qui restent
 * sont donc l'interrupteur de chaque emplacement et la liste des routes
 * exclues — écrans de jeu en cours, récapitulatif, sessions Flash Flag,
 * administration. Ce sont exactement les endroits où un encart casserait
 * l'écran ou n'aurait aucun contenu d'éditeur autour de lui, et rien dans le
 * code ne les protège à part cette liste. D'où ces tests.
 *
 * La configuration réelle est remplacée par un jeu d'essai : ces tests doivent
 * continuer à décrire le mécanisme même le jour où l'un des interrupteurs de
 * `config/ads.ts` sera basculé.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

let pathname = '/guide';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const NATIVE_SRC = 'https://regie.test/native.js';
const SOCIAL_SRC = 'https://regie.test/social.js';
const POPUNDER_SRC = 'https://regie.test/popunder.js';

vi.mock('@/config/ads', () => ({
  NATIVE_BANNER: {
    enabled: true,
    src: 'https://regie.test/native.js',
    containerId: 'container-essai',
  },
  SOCIAL_BAR: { enabled: false, src: 'https://regie.test/social.js' },
  POPUNDER: { enabled: false, src: 'https://regie.test/popunder.js' },
  /* Une seule route exclue suffit à éprouver le branchement. */
  isAdFreePath: (path: string) => /^\/jeu\/jouer(\/|$)/.test(path),
}));

import { NativeAd } from '../NativeAd';
import { AdOverlays } from '../AdOverlays';

/** Scripts de régie réellement présents dans le document. */
function regieScripts() {
  return Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[src^="https://regie.test"]'),
  ).map((s) => s.src);
}

describe("chargement de la régie", () => {
  beforeEach(() => {
    pathname = '/guide';
  });

  afterEach(() => {
    document.querySelectorAll('script[src^="https://regie.test"]').forEach((s) => s.remove());
  });

  it('insère le script dès l’affichage de l’encart', () => {
    render(<NativeAd />);
    expect(regieScripts()).toEqual([NATIVE_SRC]);
  });

  it('n’insère qu’un seul script par emplacement', () => {
    render(<NativeAd />);
    // Deux exemplaires se disputeraient le même conteneur, que la régie
    // retrouve par un identifiant unique.
    expect(regieScripts()).toHaveLength(1);
  });

  it('retire le script quand l’encart quitte la page', () => {
    const view = render(<NativeAd />);
    expect(regieScripts()).toHaveLength(1);

    view.unmount();

    // Sans ce retrait, une navigation côté client empilerait un script par
    // page visitée.
    expect(regieScripts()).toEqual([]);
  });

  it('reste muet sur un écran de jeu', () => {
    pathname = '/jeu/jouer';
    const { container } = render(<NativeAd />);

    // Ni script, ni emplacement : un encart n'a pas sa place au milieu d'une
    // partie, et l'écran y est dimensionné à la fenêtre pile.
    expect(regieScripts()).toEqual([]);
    expect(container.querySelector('.native-ad')).toBeNull();
  });

  it('laisse éteints les formats en recouvrement', () => {
    render(<AdOverlays />);
    // La barre sociale recouvrirait les boutons d'action, le pop-under
    // détournerait le premier geste de jeu : les deux sont livrés éteints.
    expect(regieScripts()).not.toContain(SOCIAL_SRC);
    expect(regieScripts()).not.toContain(POPUNDER_SRC);
  });

  it('signale l’encart comme publicitaire et expose le conteneur attendu', () => {
    const { container } = render(<NativeAd />);

    // Un encart natif imite le contenu qui l'entoure : sans étiquette, il se
    // lit comme un article du site.
    expect(screen.getByText('Publicité')).toBeInTheDocument();
    // L'identifiant est imposé par la régie, qui retrouve son conteneur ainsi.
    expect(container.querySelector('#container-essai')).not.toBeNull();
  });

  it('ne recouvre rien : l’encart vit dans le flux', () => {
    const { container } = render(<NativeAd />);
    const slot = container.querySelector('.native-ad');
    // Le format natif a été retenu précisément pour ça : il prend la place d'un
    // bloc de contenu au lieu de passer devant les boutons d'action.
    expect(slot).not.toBeNull();
    expect(slot!.className).not.toContain('fixed');
  });
});
