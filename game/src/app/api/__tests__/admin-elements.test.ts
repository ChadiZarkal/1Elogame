/**
 * @file admin-elements.test.ts
 * @description Tests for GET/POST /api/admin/elements
 * Covers: authentication, listing elements, creating elements, Zod validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

const mockElementsArray = [
  { id: '1', texte: 'Alpha', categorie: 'love', actif: true, elo_global: 1200, nb_participations: 50 },
  { id: '2', texte: 'Beta', categorie: 'social', actif: true, elo_global: 1100, nb_participations: 30 },
  { id: '3', texte: 'Inactif', categorie: 'love', actif: false, elo_global: 900, nb_participations: 20 },
];

vi.mock('@/lib/mockData', () => ({
  getMockElements: vi.fn(() => [...mockElementsArray]),
}));

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(),
  typedInsert: vi.fn(),
}));

describe('/api/admin/elements', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  const makeGetRequest = () =>
    new NextRequest('http://localhost/api/admin/elements', {
      headers: { Authorization: 'Bearer mock-admin-token' },
    });

  const makePostRequest = (body: Record<string, unknown>) =>
    new NextRequest('http://localhost/api/admin/elements', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-admin-token',
      },
    });

  describe('GET', () => {
    it('retourne la liste des éléments en mock mode', async () => {
      const { GET } = await import('@/app/api/admin/elements/route');
      const response = await GET(makeGetRequest());
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.elements).toBeDefined();
      expect(Array.isArray(json.data.elements)).toBe(true);
    });

    it('rejette sans authentification', async () => {
      const { authenticateAdmin } = await import('@/lib/adminAuth');
      (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const { GET } = await import('@/app/api/admin/elements/route');
      const response = await GET(makeGetRequest());

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('crée un nouvel élément en mock mode', async () => {
      const { POST } = await import('@/app/api/admin/elements/route');
      const response = await POST(makePostRequest({
        texte: 'Nouveau comportement test',
        categorie: 'lifestyle',
        niveau_provocation: 3,
      }));
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.element.texte).toBe('Nouveau comportement test');
      expect(json.data.element.elo_global).toBe(1000);
      expect(json.data.element.actif).toBe(true);
    });

    it('rejette un body sans texte', async () => {
      const { POST } = await import('@/app/api/admin/elements/route');
      const response = await POST(makePostRequest({
        categorie: 'quotidien',
        niveau_provocation: 3,
      }));

      expect(response.status).toBe(400);
    });

    it('rejette un body sans catégorie', async () => {
      const { POST } = await import('@/app/api/admin/elements/route');
      const response = await POST(makePostRequest({
        texte: 'Test texte assez long',
        niveau_provocation: 3,
      }));

      expect(response.status).toBe(400);
    });

    it('rejette sans authentification', async () => {
      const { authenticateAdmin } = await import('@/lib/adminAuth');
      (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const { POST } = await import('@/app/api/admin/elements/route');
      const response = await POST(makePostRequest({
        texte: 'Test element',
        categorie: 'bureau',
        niveau_provocation: 3,
      }));

      expect(response.status).toBe(401);
    });
  });
});
