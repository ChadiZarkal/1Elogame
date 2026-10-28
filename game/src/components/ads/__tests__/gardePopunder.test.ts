/**
 * @file gardePopunder.test.ts
 * @description Le pop-under ne s'ouvre qu'une fois par armement : les
 * écouteurs de la régie sont muets hors armement, et une deuxième ouverture
 * est refusée. Les écouteurs du site, eux, ne sont jamais touchés.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

const ouvrirReel = vi.fn(() => null);

beforeAll(() => {
  // jsdom n'implémente pas `window.open` : la vraie ouverture est simulée.
  window.open = ouvrirReel as unknown as typeof window.open;
});

import { armerPopunder, desarmerPopunder, installerGardePopunder } from '../gardePopunder';

function tap() {
  document.dispatchEvent(new Event('mousedown'));
}

describe('gardePopunder', () => {
  it('laisse passer la régie une fois après l’armement, puis plus rien', () => {
    installerGardePopunder();
    // Ce que fait la régie : un écouteur en capture qui ouvre sa page.
    const regie = vi.fn(() => window.open('https://pub.test/'));
    document.addEventListener('mousedown', regie, true);

    tap();
    expect(regie).not.toHaveBeenCalled(); // pas encore armé

    armerPopunder();
    tap();
    expect(regie).toHaveBeenCalledTimes(1);
    expect(ouvrirReel).toHaveBeenCalledTimes(1);

    tap();
    tap();
    // Les « Continuer » du récap : plus de pub.
    expect(regie).toHaveBeenCalledTimes(1);
    expect(ouvrirReel).toHaveBeenCalledTimes(1);

    document.removeEventListener('mousedown', regie, true);
  });

  it('refuse une deuxième ouverture, même demandée directement', () => {
    armerPopunder();
    window.open('https://pub.test/1');
    window.open('https://pub.test/2');
    expect(ouvrirReel).toHaveBeenCalledTimes(2); // 1 du test précédent + 1 ici
  });

  it('se laisse désarmer avant d’avoir servi', () => {
    armerPopunder();
    desarmerPopunder();
    expect(window.open('https://pub.test/3')).toBeNull();
    expect(ouvrirReel).toHaveBeenCalledTimes(2);
  });

  it('ne touche pas aux écouteurs du site (hors capture)', () => {
    const site = vi.fn();
    document.addEventListener('mousedown', site);
    tap();
    expect(site).toHaveBeenCalledTimes(1);
    document.removeEventListener('mousedown', site);
    tap();
    expect(site).toHaveBeenCalledTimes(1);
  });

  it('retire bien un écouteur enveloppé', () => {
    const regie = vi.fn();
    document.addEventListener('touchstart', regie, true);
    document.removeEventListener('touchstart', regie, true);
    armerPopunder();
    document.dispatchEvent(new Event('touchstart'));
    expect(regie).not.toHaveBeenCalled();
    desarmerPopunder();
  });
});
