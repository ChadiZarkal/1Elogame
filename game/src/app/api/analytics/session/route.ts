import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory store for analytics sessions (mock mode)
// In production, this would go to Supabase
declare global {
  // eslint-disable-next-line no-var
  var __analyticsSessions: AnalyticsSessionData[] | undefined;
}

interface AnalyticsSessionData {
  sessionId: string;
  startedAt: number;
  duration: number;
  pageViews: string[];
  gameEntries: { game: string; at: number }[];
  votes: number;
  aiRequests: number;
  choicesBeforeQuit: number;
  category: string | null;
  sex: string | null;
  age: string | null;
  flushedAt: number;
}

if (!globalThis.__analyticsSessions) {
  globalThis.__analyticsSessions = [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const session: AnalyticsSessionData = {
      sessionId: body.sessionId || 'unknown',
      startedAt: body.startedAt || Date.now(),
      duration: body.duration || 0,
      pageViews: body.pageViews || [],
      gameEntries: body.gameEntries || [],
      votes: body.votes || 0,
      aiRequests: body.aiRequests || 0,
      choicesBeforeQuit: body.choicesBeforeQuit || 0,
      category: body.category || null,
      sex: body.sex || null,
      age: body.age || null,
      flushedAt: body.flushedAt || Date.now(),
    };
    
    // Deduplicate by sessionId (update existing)
    const sessions = globalThis.__analyticsSessions!;
    const existingIdx = sessions.findIndex(s => s.sessionId === session.sessionId);
    if (existingIdx >= 0) {
      sessions[existingIdx] = session;
    } else {
      sessions.push(session);
    }
    
    // Keep last 500 sessions
    if (sessions.length > 500) {
      sessions.splice(0, sessions.length - 500);
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET() {
  try {
    const sessions = globalThis.__analyticsSessions || [];
    return NextResponse.json({
      success: true,
      data: { sessions, count: sessions.length },
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
