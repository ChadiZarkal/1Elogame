import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Generate mock demographics data for development
function generateMockDemographics() {
  const now = Date.now();
  const dayMs = 86400000;
  
  // Visitor evolution: last 14 days
  const visitorEvolution = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now - (13 - i) * dayMs);
    return {
      date: date.toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 80) + 20 + i * 3,
      votes: Math.floor(Math.random() * 200) + 50 + i * 10,
      aiRequests: Math.floor(Math.random() * 40) + 5,
    };
  });
  
  // Gender breakdown
  const genderBreakdown = {
    homme: Math.floor(Math.random() * 30) + 35,
    femme: Math.floor(Math.random() * 30) + 30,
    autre: Math.floor(Math.random() * 10) + 5,
  };
  
  // Age breakdown
  const ageBreakdown = {
    '16-18': Math.floor(Math.random() * 20) + 18,
    '19-22': Math.floor(Math.random() * 25) + 30,
    '23-26': Math.floor(Math.random() * 20) + 20,
    '27+': Math.floor(Math.random() * 15) + 10,
  };
  
  // Game entries breakdown
  const gameEntries = {
    redflag: Math.floor(Math.random() * 150) + 200,
    flagornot: Math.floor(Math.random() * 80) + 60,
    redflagtest: Math.floor(Math.random() * 100) + 80,
  };
  
  // Time spent per game (average seconds)
  const timePerGame = {
    redflag: Math.floor(Math.random() * 120) + 180,
    flagornot: Math.floor(Math.random() * 60) + 90,
    redflagtest: Math.floor(Math.random() * 90) + 120,
  };
  
  // AI requests per session
  const aiRequestsPerSession = {
    average: parseFloat((Math.random() * 3 + 1.5).toFixed(1)),
    median: parseFloat((Math.random() * 2 + 1).toFixed(1)),
    max: Math.floor(Math.random() * 15) + 5,
  };
  
  // Agreement rate with community
  const agreementRate = parseFloat((Math.random() * 20 + 55).toFixed(1));
  
  // Average choices before quitting
  const avgChoicesBeforeQuit = parseFloat((Math.random() * 6 + 4).toFixed(1));
  
  // Most popular categories
  const categoryPopularity = [
    { category: 'lifestyle', votes: Math.floor(Math.random() * 200) + 300, percentage: 0 },
    { category: 'sexe', votes: Math.floor(Math.random() * 150) + 200, percentage: 0 },
    { category: 'quotidien', votes: Math.floor(Math.random() * 100) + 150, percentage: 0 },
    { category: 'bureau', votes: Math.floor(Math.random() * 80) + 100, percentage: 0 },
  ];
  const totalCatVotes = categoryPopularity.reduce((s, c) => s + c.votes, 0);
  categoryPopularity.forEach(c => { c.percentage = Math.round((c.votes / totalCatVotes) * 100); });
  categoryPopularity.sort((a, b) => b.votes - a.votes);
  
  // Session metrics
  const sessionMetrics = {
    avgDuration: Math.floor(Math.random() * 120) + 180, // seconds
    medianDuration: Math.floor(Math.random() * 60) + 120,
    bounceRate: parseFloat((Math.random() * 20 + 10).toFixed(1)),
    returnRate: parseFloat((Math.random() * 30 + 15).toFixed(1)),
    totalSessions: Math.floor(Math.random() * 300) + 500,
    totalUniqueVisitors: Math.floor(Math.random() * 200) + 300,
  };
  
  // Hourly activity heatmap
  const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    activity: h >= 8 && h <= 23 
      ? Math.floor(Math.random() * 50) + (h >= 18 && h <= 22 ? 60 : 15)
      : Math.floor(Math.random() * 10) + 2,
  }));
  
  return {
    visitorEvolution,
    genderBreakdown,
    ageBreakdown,
    gameEntries,
    timePerGame,
    aiRequestsPerSession,
    agreementRate,
    avgChoicesBeforeQuit,
    categoryPopularity,
    sessionMetrics,
    hourlyActivity,
    generatedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  // Check admin auth
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  // Simple token validation (matches admin login logic)
  if (isMockMode) {
    if (token !== 'mock-admin-token') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
  }
  
  try {
    if (isMockMode) {
      // Use mock demographics data
      const data = generateMockDemographics();
      
      // Also incorporate real analytics sessions if available
      const sessions = globalThis.__analyticsSessions || [];
      if (sessions.length > 0) {
        data.sessionMetrics.totalSessions = Math.max(data.sessionMetrics.totalSessions, sessions.length);
        
        // Calculate real average duration from stored sessions
        const durations = sessions.filter(s => s.duration > 0).map(s => s.duration);
        if (durations.length > 0) {
          data.sessionMetrics.avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        }
        
        // Real gender breakdown from sessions
        const realGender = { homme: 0, femme: 0, autre: 0 };
        sessions.forEach(s => {
          if (s.sex === 'homme') realGender.homme++;
          else if (s.sex === 'femme') realGender.femme++;
          else if (s.sex) realGender.autre++;
        });
        const totalGender = realGender.homme + realGender.femme + realGender.autre;
        if (totalGender >= 3) {
          data.genderBreakdown = realGender;
        }
        
        // Real avg choices before quit
        const choices = sessions.filter(s => s.choicesBeforeQuit > 0).map(s => s.choicesBeforeQuit);
        if (choices.length >= 3) {
          data.avgChoicesBeforeQuit = parseFloat((choices.reduce((a, b) => a + b, 0) / choices.length).toFixed(1));
        }
      }
      
      return NextResponse.json({ success: true, data });
    }
    
    // Production: query Supabase for real analytics
    // TODO: Implement Supabase queries when analytics tables are created
    const data = generateMockDemographics();
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Error fetching demographics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
