import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { typedInsert } from '@/lib/supabaseHelpers';
import { sanitizeText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// ═══════════════════════════════════════
// In-memory community store (mock mode)
// Persists across hot reloads via globalThis
// ═══════════════════════════════════════

interface CommunitySubmission {
  id: string;
  text: string;
  verdict: 'red' | 'green';
  timestamp: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __flagornotCommunity: CommunitySubmission[] | undefined;
}

function getCommunityStore(): CommunitySubmission[] {
  if (!globalThis.__flagornotCommunity) {
    globalThis.__flagornotCommunity = [];
  }
  return globalThis.__flagornotCommunity;
}

// ═══════════════════════════════════════
// GET — Fetch recent community submissions
// ═══════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

    if (isMockMode) {
      const store = getCommunityStore();
      const recent = store
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map(({ id, text, verdict, timestamp }) => ({
          id,
          text,
          verdict,
          emoji: verdict === 'red' ? '🚩' : '🟢',
          timeAgo: getTimeAgo(timestamp),
        }));

      return NextResponse.json(createApiSuccess({
        submissions: recent,
        total: store.length,
      }));
    }

    // Production: Supabase
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('flagornot_submissions')
      .select('id, text, verdict, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Table might not exist yet — fall back gracefully
      console.warn('[Community] Supabase error (table may not exist):', error.message);
      return NextResponse.json(createApiSuccess({
        submissions: [],
        total: 0,
      }));
    }

    const submissions = (data || []).map((d: { id: string; text: string; verdict: string; created_at: string }) => ({
      id: d.id,
      text: d.text,
      verdict: d.verdict,
      emoji: d.verdict === 'red' ? '🚩' : '🟢',
      timeAgo: getTimeAgo(new Date(d.created_at).getTime()),
    }));

    return NextResponse.json(createApiSuccess({
      submissions,
      total: submissions.length,
    }));
  } catch (err) {
    console.error('[Community] GET error:', err);
    return NextResponse.json(
      createApiError('SERVER_ERROR', 'Erreur lors du chargement des suggestions'),
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST — Record a new community submission
// ═══════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, verdict } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Text is required'),
        { status: 400 }
      );
    }

    if (!['red', 'green'].includes(verdict)) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid verdict'),
        { status: 400 }
      );
    }

    const sanitized = sanitizeText(text, 280);

    if (isMockMode) {
      const store = getCommunityStore();
      
      // Deduplicate — don't store exact same text twice
      const exists = store.some(s => s.text.toLowerCase() === sanitized.toLowerCase());
      if (!exists) {
        store.unshift({
          id: `community_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          text: sanitized,
          verdict: verdict as 'red' | 'green',
          timestamp: Date.now(),
        });
        // Keep max 200 entries
        if (store.length > 200) {
          store.splice(200);
        }
      }

      return NextResponse.json(createApiSuccess({ saved: true }));
    }

    // Production: Supabase
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const { error } = await typedInsert(supabase, 'flagornot_submissions', {
      text: sanitized,
      verdict,
    });

    if (error) {
      console.warn('[Community] Insert error:', error.message);
      // Don't fail the request if table doesn't exist
      return NextResponse.json(createApiSuccess({ saved: false, reason: 'storage_unavailable' }));
    }

    return NextResponse.json(createApiSuccess({ saved: true }));
  } catch (err) {
    console.error('[Community] POST error:', err);
    return NextResponse.json(
      createApiError('SERVER_ERROR', 'Erreur lors de la sauvegarde'),
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// Utility: Human-readable time ago
// ═══════════════════════════════════════

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'à l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 7)}sem`;
}
