import { NextRequest, NextResponse } from 'next/server';
import { voteSchema } from '@/lib/validations';
import { calculateNewELO, estimatePercentage, didMatchMajority, getEloFieldForSex, getEloFieldForAge, getKFactor, getParticipationFieldForSex, getParticipationFieldForAge } from '@/lib/elo';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { Element } from '@/types/database';

export const dynamic = 'force-dynamic';

// Check if we're in mock mode
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = voteSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => ({ 
        field: e.path.join('.'), 
        message: e.message 
      }));
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Données de vote invalides', errors),
        { status: 400 }
      );
    }
    
    const { winnerId, loserId, sexe, age } = validation.data;
    
    let winner: Element | undefined;
    let loser: Element | undefined;
    
    if (isMockMode) {
      // Use mock data
      const { getMockElement, updateMockElo, recordMockVote } = await import('@/lib/mockData');
      winner = getMockElement(winnerId);
      loser = getMockElement(loserId);
      
      if (!winner || !loser) {
        return NextResponse.json(
          createApiError('NOT_FOUND', 'Éléments non trouvés'),
          { status: 404 }
        );
      }
      
      // Calculate new ELO scores
      const kFactor = Math.min(getKFactor(winner.nb_participations), getKFactor(loser.nb_participations));
      const { newWinnerELO, newLoserELO } = calculateNewELO(winner.elo_global, loser.elo_global, kFactor);
      
      // Update mock ELO - global
      updateMockElo(winnerId, loserId, newWinnerELO, newLoserELO);
      
      // Update mock ELO - segmented (sex + age)
      const sexField = getEloFieldForSex(sexe) as keyof Element;
      const ageField = getEloFieldForAge(age) as keyof Element;
      
      const { newWinnerELO: newWinnerSexELO, newLoserELO: newLoserSexELO } = calculateNewELO(
        winner[sexField] as number,
        loser[sexField] as number,
        kFactor
      );
      (winner as unknown as Record<string, number>)[sexField as string] = newWinnerSexELO;
      (loser as unknown as Record<string, number>)[sexField as string] = newLoserSexELO;
      
      const { newWinnerELO: newWinnerAgeELO, newLoserELO: newLoserAgeELO } = calculateNewELO(
        winner[ageField] as number,
        loser[ageField] as number,
        kFactor
      );
      (winner as unknown as Record<string, number>)[ageField as string] = newWinnerAgeELO;
      (loser as unknown as Record<string, number>)[ageField as string] = newLoserAgeELO;
      
      // Record mock vote (for seen pairs tracking)
      recordMockVote('mock-session', winnerId, loserId);
      
      // Update participation counts (global + per-segment)
      winner.nb_participations += 1;
      loser.nb_participations += 1;
      
      // Update sex-specific participation counts
      const sexPartField = getParticipationFieldForSex(sexe) as keyof Element;
      (winner as unknown as Record<string, number>)[sexPartField as string] = ((winner[sexPartField] as number) || 0) + 1;
      (loser as unknown as Record<string, number>)[sexPartField as string] = ((loser[sexPartField] as number) || 0) + 1;
      
      // Update age-specific participation counts
      const agePartField = getParticipationFieldForAge(age) as keyof Element;
      (winner as unknown as Record<string, number>)[agePartField as string] = ((winner[agePartField] as number) || 0) + 1;
      (loser as unknown as Record<string, number>)[agePartField as string] = ((loser[agePartField] as number) || 0) + 1;
      
      // Calculate percentages for response
      const winnerPercentage = estimatePercentage(newWinnerELO, newLoserELO);
      const loserPercentage = 100 - winnerPercentage;
      
      // Determine if player matched majority
      const matched = didMatchMajority(winner.elo_global, loser.elo_global);
      
      const endTime = performance.now();
      console.log(`[MOCK] Vote processed in ${Math.round(endTime - startTime)}ms`);
      
      return NextResponse.json(
        createApiSuccess({
          winner: {
            id: winnerId,
            percentage: winnerPercentage,
            participations: winner.nb_participations,
          },
          loser: {
            id: loserId,
            percentage: loserPercentage,
            participations: loser.nb_participations,
          },
          streak: {
            matched,
            current: 0, // Client calculates actual streak
          },
        })
      );
    }
    
    // Production mode: Use Supabase
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    
    // Fetch both elements
    const { data: elementsData, error: fetchError } = await supabase
      .from('elements')
      .select('*')
      .in('id', [winnerId, loserId]);
    
    if (fetchError || !elementsData || elementsData.length !== 2) {
      console.error('Error fetching elements:', fetchError);
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Éléments non trouvés'),
        { status: 404 }
      );
    }
    
    // Cast to Element type
    const elements = elementsData as unknown as Element[];
    winner = elements.find(e => e.id === winnerId);
    loser = elements.find(e => e.id === loserId);
    
    if (!winner || !loser) {
      return NextResponse.json(
        createApiError('NOT_FOUND', 'Éléments non trouvés'),
        { status: 404 }
      );
    }
    
    // Calculate new ELO scores
    const kFactor = Math.min(getKFactor(winner.nb_participations), getKFactor(loser.nb_participations));
    const { newWinnerELO, newLoserELO } = calculateNewELO(winner.elo_global, loser.elo_global, kFactor);
    
    // Calculate segmented ELO updates
    const sexField = getEloFieldForSex(sexe) as keyof Element;
    const ageField = getEloFieldForAge(age) as keyof Element;
    const sexPartField = getParticipationFieldForSex(sexe) as keyof Element;
    const agePartField = getParticipationFieldForAge(age) as keyof Element;
    
    const { newWinnerELO: newWinnerSexELO, newLoserELO: newLoserSexELO } = calculateNewELO(
      winner[sexField] as number,
      loser[sexField] as number,
      kFactor
    );
    
    const { newWinnerELO: newWinnerAgeELO, newLoserELO: newLoserAgeELO } = calculateNewELO(
      winner[ageField] as number,
      loser[ageField] as number,
      kFactor
    );
    
    // Record the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        element_gagnant_id: winnerId,
        element_perdant_id: loserId,
        sexe_votant: sexe,
        age_votant: age,
      } as never);
    
    if (voteError) {
      console.error('Error recording vote:', voteError);
      return NextResponse.json(
        createApiError('DATABASE_ERROR', 'Erreur lors de l\'enregistrement du vote'),
        { status: 500 }
      );
    }
    
    // Update winner ELO scores
    const winnerUpdate = {
      elo_global: newWinnerELO,
      [sexField]: newWinnerSexELO,
      [ageField]: newWinnerAgeELO,
      nb_participations: winner.nb_participations + 1,
      [sexPartField]: ((winner[sexPartField] as number) || 0) + 1,
      [agePartField]: ((winner[agePartField] as number) || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    
    const { error: winnerError } = await supabase
      .from('elements')
      .update(winnerUpdate as never)
      .eq('id', winnerId);
    
    if (winnerError) {
      console.error('Error updating winner:', winnerError);
    }
    
    // Update loser ELO scores
    const loserUpdate = {
      elo_global: newLoserELO,
      [sexField]: newLoserSexELO,
      [ageField]: newLoserAgeELO,
      nb_participations: loser.nb_participations + 1,
      [sexPartField]: ((loser[sexPartField] as number) || 0) + 1,
      [agePartField]: ((loser[agePartField] as number) || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    
    const { error: loserError } = await supabase
      .from('elements')
      .update(loserUpdate as never)
      .eq('id', loserId);
    
    if (loserError) {
      console.error('Error updating loser:', loserError);
    }
    
    // Calculate percentages for response
    const winnerPercentage = estimatePercentage(newWinnerELO, newLoserELO);
    const loserPercentage = 100 - winnerPercentage;
    
    // Determine if player matched majority (the higher ELO element is the "majority" choice)
    const matched = didMatchMajority(winner.elo_global, loser.elo_global);
    
    // Calculate global rankings for both elements
    const { count: winnerRank } = await supabase
      .from('elements')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true)
      .gt('elo_global', newWinnerELO);
    
    const { count: loserRank } = await supabase
      .from('elements')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true)
      .gt('elo_global', newLoserELO);
    
    const { count: totalElements } = await supabase
      .from('elements')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true);
    
    const endTime = performance.now();
    console.log(`Vote processed in ${Math.round(endTime - startTime)}ms`);
    
    return NextResponse.json(
      createApiSuccess({
        winner: {
          id: winnerId,
          percentage: winnerPercentage,
          participations: winner.nb_participations + 1,
          rank: (winnerRank ?? 0) + 1,
          totalElements: totalElements ?? 0,
        },
        loser: {
          id: loserId,
          percentage: loserPercentage,
          participations: loser.nb_participations + 1,
          rank: (loserRank ?? 0) + 1,
          totalElements: totalElements ?? 0,
        },
        streak: {
          matched,
          current: 0, // Client calculates actual streak
        },
      })
    );
  } catch (error) {
    console.error('Error in POST /api/vote:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
