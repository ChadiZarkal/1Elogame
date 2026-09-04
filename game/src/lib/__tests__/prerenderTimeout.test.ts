/**
 * @file prerenderTimeout.test.ts
 * @description Ce que garantit ce fichier : une requête de pré-rendu ne peut
 * pas suspendre le build indéfiniment.
 *
 * Le cas qui compte n'est pas l'échec — les quatre pages concernées ont déjà
 * leur `try/catch` — mais l'attente sans fin, qui ne déclenche aucun `catch`.
 * Ces tests décrivent la conversion de l'une en l'autre.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';

describe('withPrerenderTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('laisse passer une réponse rapide sans y toucher', async () => {
    const resultat = await withPrerenderTimeout(Promise.resolve({ lignes: 12 }));
    // Cas normal : la valeur arrive intacte, le plafond ne se voit pas.
    expect(resultat).toEqual({ lignes: 12 });
  });

  it('abandonne une requête qui ne répond jamais', async () => {
    /* Une promesse qui ne se résout pas : c'est exactement le comportement
       d'une base qui sort de veille, et ce qu'aucun `catch` ne rattrape. */
    const jamais = new Promise<string>(() => {});
    const course = withPrerenderTimeout(jamais, 10_000);
    /* L'attente est déclarée avant d'avancer les minuteurs : un rejet auquel
       aucun gestionnaire n'est encore attaché remonte en « unhandled
       rejection » et fait échouer le fichier entier. */
    const attente = expect(course).rejects.toThrow(/abandonnée après 10000 ms/);

    await vi.advanceTimersByTimeAsync(10_000);

    await attente;
  });

  it('attend jusqu’au délai avant d’abandonner', async () => {
    const jamais = new Promise<string>(() => {});
    const course = withPrerenderTimeout(jamais, 10_000);
    const etat = vi.fn();
    course.then(etat, etat);

    await vi.advanceTimersByTimeAsync(9_000);
    // Le plafond ne doit pas écourter une requête simplement lente.
    expect(etat).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(etat).toHaveBeenCalled();
  });

  it('propage une vraie erreur telle quelle', async () => {
    const panne = Promise.reject(new Error('connexion refusée'));
    // Le plafond ne doit pas masquer la cause réelle d'un échec.
    await expect(withPrerenderTimeout(panne)).rejects.toThrow('connexion refusée');
  });

  it('annule son minuteur quand la requête gagne la course', async () => {
    const clear = vi.spyOn(globalThis, 'clearTimeout');

    await withPrerenderTimeout(Promise.resolve('ok'));

    // Un minuteur laissé armé garderait le processus de build en vie après la
    // fin du pré-rendu.
    expect(clear).toHaveBeenCalled();
  });
});
