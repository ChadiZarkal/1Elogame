import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getRecentSubmissions, saveSubmission } from '@/lib/repositories';
import { getTimeAgo } from '@/lib/formatters';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

  const submissions = await getRecentSubmissions(limit);
  const formatted = submissions.map((s) => ({
    id: s.id,
    text: s.text,
    verdict: s.verdict,
    emoji: s.verdict === 'red' ? '🚩' : '🟢',
    timeAgo: getTimeAgo(s.timestamp),
  }));

  return apiSuccess({ submissions: formatted, total: submissions.length });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { text, verdict } = body;
  const normalizedText = typeof text === 'string' ? text.trim() : '';

  if (!normalizedText) {
    return apiError('VALIDATION_ERROR', 'Text is required', 400);
  }
  if (normalizedText.length > MAX_FLAGORNOT_TEXT_LENGTH) {
    return apiError('VALIDATION_ERROR', `Text too long (max ${MAX_FLAGORNOT_TEXT_LENGTH} characters)`, 400);
  }
  if (!['red', 'green'].includes(verdict)) {
    return apiError('VALIDATION_ERROR', 'Invalid verdict', 400);
  }

  await saveSubmission(normalizedText, verdict);
  return apiSuccess({ saved: true });
}, { rateLimit: 'public' });
