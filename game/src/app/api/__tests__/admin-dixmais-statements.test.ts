import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/repositories/dixmais', () => ({
  getAllDixMaisStatements: vi.fn().mockResolvedValue([]),
  createDixMaisStatement: vi.fn().mockResolvedValue({ id: 's1', text: 'Il ronfle tres fort', type: 'negative', category: 'lifestyle' }),
  updateDixMaisStatement: vi.fn().mockResolvedValue({ id: 's1', text: 'Il ronfle un peu', type: 'negative', category: 'lifestyle' }),
  deleteDixMaisStatement: vi.fn().mockResolvedValue(undefined),
}));

describe("/api/admin/dixmais/statements — backoffice « C'est un 10 mais... »", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('POST cree une affirmation', async () => {
    const { POST } = await import('@/app/api/admin/dixmais/statements/route');
    const req = new NextRequest('http://localhost/api/admin/dixmais/statements', {
      method: 'POST',
      headers: { Authorization: 'Bearer open', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Il ronfle tres fort', type: 'negative', category: 'lifestyle' }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe('s1');
  });

  // Régression : le contexte d'une route dynamique expose `params` sous forme de
  // promesse depuis Next 15. Lu comme un objet simple, l'id valait `undefined` et
  // ces deux routes répondaient 400 « ID manquant » sans jamais toucher la base —
  // modifier et supprimer étaient inopérants dans le backoffice.
  it('PATCH lit l id depuis la promesse params et met a jour', async () => {
    const { updateDixMaisStatement } = await import('@/lib/repositories/dixmais');
    const { PATCH } = await import('@/app/api/admin/dixmais/statements/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/dixmais/statements/s1', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer open', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Il ronfle un peu' }),
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: 's1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateDixMaisStatement).toHaveBeenCalledWith('s1', { text: 'Il ronfle un peu' });
  });

  it('PATCH transmet aussi les bascules actif / approuve', async () => {
    const { updateDixMaisStatement } = await import('@/lib/repositories/dixmais');
    const { PATCH } = await import('@/app/api/admin/dixmais/statements/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/dixmais/statements/s1', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer open', 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: 's1' }) });

    expect(response.status).toBe(200);
    expect(updateDixMaisStatement).toHaveBeenCalledWith('s1', { is_active: false });
  });

  it('DELETE lit l id depuis la promesse params et supprime', async () => {
    const { deleteDixMaisStatement } = await import('@/lib/repositories/dixmais');
    const { DELETE } = await import('@/app/api/admin/dixmais/statements/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/dixmais/statements/s1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer open' },
    });

    const response = await DELETE(req, { params: Promise.resolve({ id: 's1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deleted).toBe(true);
    expect(deleteDixMaisStatement).toHaveBeenCalledWith('s1');
  });

  it('remonte le message reel quand l ecriture echoue', async () => {
    const { updateDixMaisStatement } = await import('@/lib/repositories/dixmais');
    (updateDixMaisStatement as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Impossible de modifier l'affirmation : aucune ligne modifiee"),
    );

    const { PATCH } = await import('@/app/api/admin/dixmais/statements/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/dixmais/statements/s1', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer open', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Il ronfle un peu' }),
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: 's1' }) });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.message).toContain('aucune ligne modifiee');
  });
});
