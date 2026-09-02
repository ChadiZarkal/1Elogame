/**
 * @file adGating.test.tsx
 * @description Ce que garantit ce fichier : aucun script de régie n'entre dans
 * la page avant un accord explicite.
 *
 * C'est l'invariant qui rend la publicité diffusable ici. Les CGU et la
 * politique de confidentialité du site s'engagent sur cet ordre — accord
 * d'abord, chargement ensuite — et le dépôt de traceurs publicitaires sans
 * accord préalable est une infraction, pas un défaut d'ergonomie. Un test le
 * tient donc, plutôt que la vigilance du prochain à passer.
 *
 * La configuration réelle est remplacée par un jeu d'essai : ces tests doivent
 * continuer à décrire le mécanisme même le jour où l'un des interrupteurs de
 * `config/ads.ts` sera basculé.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

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
import { resetAdConsent, setAdConsent } from '@/lib/adConsent';

/** Scripts de régie réellement présents dans le document. */
function regieScripts() {
  return Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[src^="https://regie.test"]'),
  ).map((s) => s.src);
}

describe('chargement des régies et consentement', () => {
  beforeEach(() => {
    pathname = '/guide';
    act(() => resetAdConsent());
  });

  afterEach(() => {
    act(() => resetAdConsent());
    document.querySelectorAll('script[src^="https://regie.test"]').forEach((s) => s.remove());
  });

  it("n'insère aucun script tant que la question n'a pas été posée", () => {
    render(<NativeAd />);
    expect(regieScripts()).toEqual([]);
  });

  it("n'insère aucun script après un refus", () => {
    render(<NativeAd />);
    act(() => setAdConsent('denied'));
    expect(regieScripts()).toEqual([]);
  });

  it('insère le script de la régie une fois l’accord donné', () => {
    render(<NativeAd />);
    act(() => setAdConsent('granted'));
    expect(regieScripts()).toEqual([NATIVE_SRC]);
  });

  it('retire le script quand l’encart quitte la page', () => {
    const view = render(<NativeAd />);
    act(() => setAdConsent('granted'));
    expect(regieScripts()).toHaveLength(1);

    view.unmount();

    // Sans ce retrait, une navigation côté client empilerait un script par
    // page visitée.
    expect(regieScripts()).toEqual([]);
  });

  it('reste muet sur un écran de jeu, accord ou pas', () => {
    pathname = '/jeu/jouer';
    render(<NativeAd />);
    act(() => setAdConsent('granted'));
    expect(regieScripts()).toEqual([]);
  });

  it('laisse éteints les formats en recouvrement même avec un accord', () => {
    render(<AdOverlays />);
    act(() => setAdConsent('granted'));
    // La barre sociale recouvrirait les boutons d'action, le pop-under
    // détournerait le premier geste de jeu : les deux sont livrés éteints.
    expect(regieScripts()).not.toContain(SOCIAL_SRC);
    expect(regieScripts()).not.toContain(POPUNDER_SRC);
  });

  it('signale l’encart comme publicitaire et expose le conteneur attendu', () => {
    act(() => setAdConsent('granted'));
    const { container } = render(<NativeAd />);

    // Un encart natif imite le contenu qui l'entoure : sans étiquette, il se
    // lit comme un article du site.
    expect(screen.getByText('Publicité')).toBeInTheDocument();
    // L'identifiant est imposé par la régie, qui retrouve son conteneur ainsi.
    expect(container.querySelector('#container-essai')).not.toBeNull();
  });
});

describe("demande d'accord, posée à l'emplacement de l'encart", () => {
  beforeEach(() => {
    pathname = '/guide';
    act(() => resetAdConsent());
  });

  afterEach(() => {
    act(() => resetAdConsent());
  });

  it('propose refuser et accepter au même niveau', () => {
    render(<NativeAd />);
    // Un refus plus coûteux que l'accord ne serait pas un accord libre : les
    // deux réponses sont deux boutons frères.
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accepter' })).toBeInTheDocument();
  });

  it("ne recouvre rien : le bloc est dans le flux, jamais en position fixe", () => {
    const { container } = render(<NativeAd />);
    const block = container.querySelector('.ad-consent');
    // C'est la correction du défaut mesuré sur l'Oracle : en `fixed`, ce bloc
    // recouvrait de 15 px le bouton d'action de l'écran.
    expect(block).not.toBeNull();
    expect(block!.className).not.toContain('fixed');
  });

  it('cède la place à l’encart après un accord', () => {
    const { container } = render(<NativeAd />);
    act(() => setAdConsent('granted'));

    expect(screen.queryByRole('button', { name: 'Accepter' })).toBeNull();
    expect(container.querySelector('#container-essai')).not.toBeNull();
  });

  it('laisse la place vide après un refus', () => {
    const { container } = render(<NativeAd />);
    act(() => setAdConsent('denied'));

    expect(screen.queryByRole('button', { name: 'Accepter' })).toBeNull();
    expect(container.querySelector('#container-essai')).toBeNull();
    // Ni encart, ni question qui reviendrait à chaque page.
    expect(container.querySelector('.ad-consent')).toBeNull();
  });

  it('ne demande rien sur un écran de jeu', () => {
    pathname = '/jeu/jouer';
    const { container } = render(<NativeAd />);
    expect(container.querySelector('.ad-consent')).toBeNull();
  });

  it('repose la question après une remise à zéro du choix', () => {
    render(<NativeAd />);
    act(() => setAdConsent('granted'));
    expect(screen.queryByRole('button', { name: 'Accepter' })).toBeNull();

    // Un accord qu'on ne peut pas retirer n'est pas un accord.
    act(() => resetAdConsent());
    expect(screen.getByRole('button', { name: 'Accepter' })).toBeInTheDocument();
  });

  it('retient la réponse d’une visite à l’autre', () => {
    render(<NativeAd />);
    act(() => setAdConsent('granted'));
    expect(localStorage.getItem('rog:ad-consent')).toBe('granted');
  });
});
