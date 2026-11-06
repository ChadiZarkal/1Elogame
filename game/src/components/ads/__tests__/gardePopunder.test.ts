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

  it('muselle aussi l’écouteur `click` que la régie pose après sa première ouverture', () => {
    const regie = vi.fn();
    document.addEventListener('click', regie, { capture: true });
    document.dispatchEvent(new Event('click'));
    document.dispatchEvent(new Event('pointerup'));
    expect(regie).not.toHaveBeenCalled();
    document.removeEventListener('click', regie, { capture: true });
  });

  it('compte une ouverture faite sans `window.open` : l’onglet perdu juste après le tap', () => {
    // La régie ouvre sa page par un autre moyen ; seul signe visible : la
    // fenêtre du site perd le focus dans la foulée.
    const regie = vi.fn(() => window.dispatchEvent(new Event('blur')));
    document.addEventListener('click', regie, true);

    armerPopunder();
    document.dispatchEvent(new Event('click'));
    document.dispatchEvent(new Event('click'));
    document.dispatchEvent(new Event('click'));
    expect(regie).toHaveBeenCalledTimes(1);

    document.removeEventListener('click', regie, true);
  });

  it('ne consomme pas l’armement sur une perte de focus sans tap', () => {
    const regie = vi.fn();
    document.addEventListener('click', regie, true);

    armerPopunder();
    window.dispatchEvent(new Event('blur')); // l'encart natif, une autre appli…
    document.dispatchEvent(new Event('click'));
    expect(regie).toHaveBeenCalledTimes(1);

    document.removeEventListener('click', regie, true);
    desarmerPopunder();
  });

  describe('le voile de la régie', () => {
    function poserVoile() {
      const voile = document.createElement('div');
      voile.setAttribute('style', 'position: fixed; inset: 0; z-index: 2147483647; opacity: 0.01');
      const lien = document.createElement('a');
      lien.href = 'https://pub.test/voile';
      lien.target = '_blank';
      voile.appendChild(lien);
      document.body.appendChild(voile);
      return { voile, lien };
    }
    const microtache = () => new Promise((r) => setTimeout(r, 0));

    it('le retire de l’affichage hors armement, le rend pour un tap une fois armé', async () => {
      installerGardePopunder();
      desarmerPopunder();
      const { voile } = poserVoile();
      await microtache();
      expect(voile.style.display).toBe('none');

      armerPopunder();
      expect(voile.style.display).toBe('');

      desarmerPopunder();
      expect(voile.style.display).toBe('none');
      voile.remove();
    });

    it('le remet hors de l’affichage quand la régie réécrit son style', async () => {
      const { voile } = poserVoile();
      await microtache();
      voile.setAttribute('style', 'position: fixed; z-index: 2147483647');
      await microtache();
      expect(voile.style.display).toBe('none');
      voile.remove();
    });

    it('refuse le tap sur son lien hors armement, le laisse passer une fois armé', async () => {
      const { voile, lien } = poserVoile();
      await microtache();

      const refuse = new MouseEvent('click', { bubbles: true, cancelable: true });
      lien.dispatchEvent(refuse);
      expect(refuse.defaultPrevented).toBe(true);

      armerPopunder();
      const permis = new MouseEvent('click', { bubbles: true, cancelable: true });
      lien.dispatchEvent(permis);
      expect(permis.defaultPrevented).toBe(false);

      await microtache();
      // Une ouverture, puis plus rien : le voile repart.
      expect(voile.style.display).toBe('none');
      voile.remove();
    });

    it('laisse tranquilles les éléments fixes du site', async () => {
      const barre = document.createElement('nav');
      barre.setAttribute('style', 'position: fixed; z-index: 50');
      document.body.appendChild(barre);
      await microtache();
      expect(barre.style.display).toBe('');
      barre.remove();
    });
  });
});
