/**
 * @file ZoneTraduction.test.tsx
 * @description La zone « Traduction » des panneaux d'admin (2026-11-15).
 *
 * Ce qu'il faut tenir : ce qui reste en français sur le site anglais est
 * montré d'abord, dit comme tel, et l'anglais saisi part au serveur.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ZoneTraduction } from '../ZoneTraduction';

const appels: Array<{ method: string; body: Record<string, unknown> }> = [];

beforeEach(() => {
  appels.length = 0;
  sessionStorage.setItem('adminToken', 'jeton');
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    appels.push({ method: String(init.method), body });
    const data = init.method === 'POST'
      ? {
          tableAbsente: false,
          etats: [
            { fr: 'Il porte des crocs', en: 'He wears Crocs', origine: 'code', code: 'He wears Crocs' },
            { fr: 'Il parle à sa plante', en: null, origine: null, code: null },
          ],
        }
      : { ok: true };
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  }));
});

describe('ZoneTraduction', () => {
  it('montre d’abord ce qui manque, et enregistre l’anglais saisi', async () => {
    render(
      <ZoneTraduction
        source="dixmais"
        entrees={[
          { fr: 'Il porte des crocs', type: 'Red' },
          { fr: 'Il parle à sa plante', type: 'Red' },
          { fr: 'Il porte des crocs', type: 'Red' },
        ]}
      />,
    );

    expect(await screen.findByText('1 à traduire sur 2')).toBeDefined();
    // Un seul texte demandé une fois, même cité deux fois par le panneau.
    expect(appels[0].body).toEqual({ source: 'dixmais', textes: ['Il porte des crocs', 'Il parle à sa plante'] });
    // Filtre « À traduire » par défaut : la ligne déjà traduite n'est pas là.
    expect(screen.queryByText('Il porte des crocs')).toBeNull();
    expect(screen.getByText(/Manquante : le site anglais affiche le français/)).toBeDefined();

    fireEvent.change(screen.getByLabelText('Anglais de : Il parle à sa plante'), { target: { value: 'He talks to his plant' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(screen.getByText('Enregistré')).toBeDefined());
    expect(appels[1]).toEqual({
      method: 'PUT',
      body: { source: 'dixmais', texteFr: 'Il parle à sa plante', texteEn: 'He talks to his plant' },
    });
    expect(screen.getByText('Tout est traduit (2)')).toBeDefined();
  });

  it('dit quand la table manque, et bloque la saisie', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      success: true,
      data: { tableAbsente: true, etats: [{ fr: 'Oui', en: 'Yes', origine: 'code', code: 'Yes' }] },
    }))));
    render(<ZoneTraduction source="rft" entrees={[{ fr: 'Oui', type: 'Réponse' }]} />);
    expect(await screen.findByText(/033_traductions\.sql/)).toBeDefined();
    expect((screen.getByLabelText('Anglais de : Oui') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
