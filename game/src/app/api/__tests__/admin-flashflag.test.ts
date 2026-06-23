import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/repositories', () => ({
  listAdminFlashFlagTests: vi.fn().mockResolvedValue([
    { id: 't1', name: 'Radar Date Express', description: 'desc', is_active: true, question_count: 15, updated_at: '2026-06-23T00:00:00Z' },
  ]),
  createAdminFlashFlagTest: vi.fn().mockResolvedValue({ id: 't2' }),
}));

describe('/api/admin/flashflag', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('liste les tests standards admin', async () => {
    const { GET } = await import('@/app/api/admin/flashflag/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.tests).toHaveLength(1);
  });

  it('retourne 401 quand non authentifie', async () => {
    const { authenticateAdmin } = await import('@/lib/adminAuth');
    (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const { GET } = await import('@/app/api/admin/flashflag/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
  });
});
