import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/adminAuth', () => ({
  authenticateAdmin: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/repositories', () => ({
  getFlashFlagTestById: vi.fn().mockResolvedValue({ id: 't1', name: 'Radar Date Express', description: 'desc', questions: [] }),
  updateAdminFlashFlagTest: vi.fn().mockResolvedValue(true),
  disableAdminFlashFlagTest: vi.fn().mockResolvedValue(true),
}));

describe('/api/admin/flashflag/[id]', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('GET retourne le test', async () => {
    const { GET } = await import('@/app/api/admin/flashflag/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag/t1', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(req, { params: Promise.resolve({ id: 't1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.test.id).toBe('t1');
  });

  it('PATCH met a jour le test', async () => {
    const { PATCH } = await import('@/app/api/admin/flashflag/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag/t1', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Nouveau nom' }),
    });

    const response = await PATCH(req, { params: Promise.resolve({ id: 't1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.updated).toBe(true);
  });

  it('DELETE desactive le test', async () => {
    const { DELETE } = await import('@/app/api/admin/flashflag/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag/t1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    const response = await DELETE(req, { params: Promise.resolve({ id: 't1' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deleted).toBe(true);
  });

  it('retourne 401 sans auth', async () => {
    const { authenticateAdmin } = await import('@/lib/adminAuth');
    (authenticateAdmin as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const { GET } = await import('@/app/api/admin/flashflag/[id]/route');
    const req = new NextRequest('http://localhost/api/admin/flashflag/t1', {
      headers: { Authorization: 'Bearer token' },
    });

    const response = await GET(req, { params: Promise.resolve({ id: 't1' }) });
    expect(response.status).toBe(401);
  });
});
