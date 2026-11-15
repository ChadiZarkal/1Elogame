/**
 * @file traductionsBase.test.ts
 * @description Les traductions saisies dans l'admin (2026-11-15), en mode maquette.
 *
 * Ce qu'il faut tenir : une saisie passe avant le dictionnaire du code, une
 * saisie retirée rend la main au dictionnaire, et rien de tout cela ne touche
 * le français. La route d'admin dit, pour chaque texte, ce que voit le site
 * anglais et d'où ça vient.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({ authenticateAdmin: () => null }));

import { chargerTraductions, cleTraduction, enregistrerTraduction } from '../traductionsBase';
import { traduireElement } from '@/lib/jeu/traduction';
import { traduire } from '@/lib/rft/traduction';
import { traduireEnonce } from '@/lib/dixmais/traduction';
import { POST, PUT } from '@/app/api/admin/traductions/route';

let avant: string | undefined;
beforeAll(() => {
  avant = process.env.NEXT_PUBLIC_MOCK_MODE;
  process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
});
afterAll(() => {
  process.env.NEXT_PUBLIC_MOCK_MODE = avant;
});

function requete(methode: 'POST' | 'PUT', corps: unknown) {
  return new NextRequest('http://localhost/api/admin/traductions', {
    method: methode,
    body: JSON.stringify(corps),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('traductions saisies dans l’admin', () => {
  it('confond apostrophes et espaces dans la clé', () => {
    expect(cleTraduction('  L’alcool  ')).toBe("L'alcool");
  });

  it('passent avant le dictionnaire, et se retirent', async () => {
    const fr = 'Es-tu un homme ?';
    expect(traduire(fr, 'en')).toBe('Are you a man?');

    await enregistrerTraduction('rft', fr, 'Are you a guy?');
    await chargerTraductions('rft');
    expect(traduire(fr, 'en')).toBe('Are you a guy?');
    expect(traduire(fr, 'fr')).toBe(fr);

    await enregistrerTraduction('rft', fr, '   ');
    await chargerTraductions('rft');
    expect(traduire(fr, 'en')).toBe('Are you a man?');
  });

  it('traduisent un texte que le code ne connaît pas, dans son seul jeu', async () => {
    const fr = 'Un comportement ajouté hier dans l’admin';
    expect(traduireElement(fr, 'en')).toBe(fr);
    await enregistrerTraduction('jeu', fr, 'A behavior added yesterday');
    await chargerTraductions('jeu');
    await chargerTraductions('dixmais');
    expect(traduireElement('Un comportement ajouté hier dans l\'admin', 'en')).toBe('A behavior added yesterday');
    expect(traduireEnonce(fr, 'en')).toBe(fr);
  });

  it('la route dit ce que voit le site anglais, et d’où ça vient', async () => {
    const nouveau = 'Il ne rend jamais les Tupperware';
    const connu = 'Il porte des crocs';
    await PUT(requete('PUT', { source: 'dixmais', texteFr: nouveau, texteEn: 'He never returns the Tupperware' }));

    const reponse = await POST(requete('POST', { source: 'dixmais', textes: [nouveau, connu, 'Texte inconnu', connu] }));
    const json = await reponse.json();
    expect(json.success).toBe(true);
    const parFr = Object.fromEntries(json.data.etats.map((e: { fr: string }) => [e.fr, e]));
    expect(json.data.etats).toHaveLength(3);
    expect(parFr[nouveau]).toMatchObject({ en: 'He never returns the Tupperware', origine: 'admin', code: null });
    expect(parFr['Texte inconnu']).toMatchObject({ en: null, origine: null });
    expect(json.data.tableAbsente).toBe(false);
  });

  it('refuse une source inconnue', async () => {
    const reponse = await PUT(requete('PUT', { source: 'oracle', texteFr: 'x', texteEn: 'y' }));
    expect(reponse.status).toBe(400);
  });
});
