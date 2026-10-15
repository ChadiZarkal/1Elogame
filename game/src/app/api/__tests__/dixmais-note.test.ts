import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/repositories/dixmais', () => ({
  recordDixMaisNote: vi.fn().mockResolvedValue(true),
}));

function requete(body: unknown) {
  return new NextRequest('http://localhost/api/dixmais/note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/dixmais/note — une note de la mécanique actuelle', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { resetRateLimitStore } = await import('@/lib/rateLimit');
    resetRateLimitStore();
  });

  it('enregistre une note au-delà de 10, profil compris', async () => {
    const { POST } = await import('@/app/api/dixmais/note/route');
    const { recordDixMaisNote } = await import('@/lib/repositories/dixmais');

    const res = await POST(requete({ statement_id: 's1', session_id: 'abc', note: 14, sex: 'femme', age: '19-22' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({ recorded: true });
    expect(recordDixMaisNote).toHaveBeenCalledWith({ statement_id: 's1', session_id: 'abc', note: 14, sex: 'femme', age: '19-22' });
  });

  it('accepte une note sans profil', async () => {
    const { POST } = await import('@/app/api/dixmais/note/route');
    const res = await POST(requete({ statement_id: 's1', session_id: 'abc', note: 0, sex: null, age: null }));
    expect(res.status).toBe(200);
  });

  it.each([
    ['au-dessus de 15', { note: 16 }],
    ['négative', { note: -1 }],
    ['décimale', { note: 7.5 }],
    ['sexe inconnu', { note: 7, sex: 'robot' }],
    ['sans énoncé', { note: 7, statement_id: '' }],
  ])('refuse une note %s', async (_cas, surcharge) => {
    const { POST } = await import('@/app/api/dixmais/note/route');
    const { recordDixMaisNote } = await import('@/lib/repositories/dixmais');

    const res = await POST(requete({ statement_id: 's1', session_id: 'abc', note: 7, ...surcharge }));
    expect(res.status).toBe(400);
    expect(recordDixMaisNote).not.toHaveBeenCalled();
  });
});
