import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const { createDixmaisServerClientMock } = vi.hoisted(() => ({
  createDixmaisServerClientMock: vi.fn(),
}));

vi.mock('@/lib/supabaseDixmais', () => ({
  createDixmaisServerClient: createDixmaisServerClientMock,
}));

/**
 * Faux client Supabase : toutes les etapes de la chaine se renvoient
 * elles-memes, et l'objet est « thenable » pour que `await` sur n'importe quel
 * maillon rende le resultat configure.
 */
function fakeClient(result: { data: unknown; error: { message: string } | null }) {
  const chain: Record<string, unknown> = {
    then: (resolve: (r: unknown) => void) => resolve(result),
  };
  for (const method of ['from', 'insert', 'update', 'delete', 'eq', 'select', 'maybeSingle', 'single']) {
    chain[method] = () => chain;
  }
  return { from: () => chain };
}

const ORIGINAL_SERVICE_ROLE = process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY;

describe("repositories/dixmais — ecritures du backoffice", () => {
  beforeEach(() => {
    vi.resetModules();
    createDixmaisServerClientMock.mockReset();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
    process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY = 'service-role-de-test';
  });

  afterEach(() => {
    if (ORIGINAL_SERVICE_ROLE === undefined) delete process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY = ORIGINAL_SERVICE_ROLE;
  });

  // Une mise à jour qui ne touche aucune ligne n'est pas une erreur PostgREST :
  // elle renvoie une liste vide. Sans ce garde-fou, l'API répondait 200 et le
  // backoffice affichait la modification alors que rien n'avait bougé en base.
  it('signale une mise a jour qui ne touche aucune ligne', async () => {
    createDixmaisServerClientMock.mockReturnValue(fakeClient({ data: [], error: null }));
    const { updateDixMaisStatement } = await import('@/lib/repositories/dixmais');

    await expect(updateDixMaisStatement('s1', { text: 'Nouveau texte' }))
      .rejects.toThrow(/aucune ligne modifiée/);
  });

  it('signale une suppression qui ne touche aucune ligne', async () => {
    createDixmaisServerClientMock.mockReturnValue(fakeClient({ data: [], error: null }));
    const { deleteDixMaisStatement } = await import('@/lib/repositories/dixmais');

    await expect(deleteDixMaisStatement('s1')).rejects.toThrow(/aucune ligne supprimée/);
  });

  it('renvoie la ligne mise a jour quand l ecriture passe', async () => {
    createDixmaisServerClientMock.mockReturnValue(
      fakeClient({ data: [{ id: 's1', text: 'Nouveau texte' }], error: null }),
    );
    const { updateDixMaisStatement } = await import('@/lib/repositories/dixmais');

    await expect(updateDixMaisStatement('s1', { text: 'Nouveau texte' }))
      .resolves.toMatchObject({ id: 's1', text: 'Nouveau texte' });
  });

  // Sans clé service role le serveur écrit avec la clé anon, que la RLS refuse :
  // le message doit nommer la variable à définir, sinon l'opérateur n'a aucun
  // moyen de deviner pourquoi l'ajout échoue alors que le jeu fonctionne.
  it('nomme la variable manquante quand la cle service role est absente', async () => {
    delete process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY;
    createDixmaisServerClientMock.mockReturnValue(
      fakeClient({ data: null, error: { message: 'new row violates row-level security policy' } }),
    );
    const { createDixMaisStatement } = await import('@/lib/repositories/dixmais');

    await expect(createDixMaisStatement({ text: 'Il ronfle', type: 'negative', category: 'lifestyle' }))
      .rejects.toThrow(/SUPABASE_DIXMAIS_SERVICE_ROLE_KEY/);
  });
});
