/**
 * @file langue.test.ts
 * @description Où mène le bouton de langue, d'une page à l'autre.
 *
 * Ce qu'il faut tenir : une page traduite mène à sa traduction, une page qui
 * n'existe qu'en français mène à l'accueil anglais (jamais à une adresse
 * `/en/…` qui n'existe pas), et l'anglais revient toujours à la même page en
 * français.
 */

import { describe, it, expect } from 'vitest';
import { cheminAutreLangue, cheminFrancais, cheminLocalise, langueDuChemin } from '../langue';

describe('langues — adresses', () => {
  it('reconnaît la langue d’une adresse', () => {
    expect(langueDuChemin('/en')).toBe('en');
    expect(langueDuChemin('/en/redflagtest/r/abc')).toBe('en');
    expect(langueDuChemin('/')).toBe('fr');
    expect(langueDuChemin('/entreprise')).toBe('fr');
    expect(langueDuChemin(null)).toBe('fr');
  });

  it('traduit les pages qui existent en anglais, et elles seules', () => {
    expect(cheminLocalise('en', '/')).toBe('/en');
    expect(cheminLocalise('en', '/redflagtest')).toBe('/en/redflagtest');
    expect(cheminLocalise('en', '/redflagtest/stats')).toBe('/en/redflagtest/stats');
    expect(cheminLocalise('en', '/guide')).toBe('/guide');
    expect(cheminLocalise('fr', '/redflagtest')).toBe('/redflagtest');
  });

  it('mène le bouton de langue à la bonne page', () => {
    expect(cheminAutreLangue('/')).toBe('/en');
    expect(cheminAutreLangue('/redflagtest/r/abc')).toBe('/en/redflagtest/r/abc');
    // Une page sans traduction : l'accueil anglais, pas un /en/jeu introuvable.
    expect(cheminAutreLangue('/jeu')).toBe('/en');
    expect(cheminAutreLangue('/en')).toBe('/');
    expect(cheminAutreLangue('/en/redflagtest/stats')).toBe('/redflagtest/stats');
  });

  it('retrouve l’adresse française d’une page anglaise', () => {
    expect(cheminFrancais('/en/redflagtest')).toBe('/redflagtest');
    expect(cheminFrancais('/en')).toBe('/');
    expect(cheminFrancais('/guide')).toBe('/guide');
  });
});
