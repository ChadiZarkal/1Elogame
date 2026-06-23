import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/repositories', () => ({
  submitFlashFlagAnswers: vi.fn().mockResolvedValue({
    totalScore: 12,
    maxScore: 30,
    answeredCount: 15,
    timedOutCount: 2,
    riskPercent: 40,
    level: 'watch',
  }),
}));

describe('POST /api/flashflag/session/[code]/submit', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('soumet les reponses et retourne un resume', async () => {
    const { POST } = await import('@/app/api/flashflag/session/[code]/submit/route');

    const req = new NextRequest('http://localhost/api/flashflag/session/ABCD1234/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          {
            questionIndex: 0,
            questionText: 'Q1',
            selectedOption: 'Oui',
            selectedScore: 1,
            timedOut: false,
            timeSpentMs: 1200,
          },
        ],
      }),
    });

    const response = await POST(req, { params: Promise.resolve({ code: 'ABCD1234' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.riskLabel).toBeDefined();
  });

  it('rejette un tableau de reponses vide', async () => {
    const { POST } = await import('@/app/api/flashflag/session/[code]/submit/route');

    const req = new NextRequest('http://localhost/api/flashflag/session/ABCD1234/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [] }),
    });

    const response = await POST(req, { params: Promise.resolve({ code: 'ABCD1234' }) });
    expect(response.status).toBe(400);
  });
});
