import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/repositories', () => ({
  listFlashFlagStandardTests: vi.fn().mockResolvedValue([
    { id: 't1', name: 'Radar Date Express', description: 'desc', questionCount: 15 },
  ]),
}));

describe('GET /api/flashflag/tests', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('retourne les tests standards', async () => {
    const { GET } = await import('@/app/api/flashflag/tests/route');
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.tests).toHaveLength(1);
    expect(json.data.tests[0].id).toBe('t1');
  });
});
