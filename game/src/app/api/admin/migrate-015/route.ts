/**
 * Admin API: Execute migration 015
 * POST /api/admin/migrate-015
 *
 * Authorization: Admin token required (X-Admin-Token header)
 * Usage: curl -X POST http://localhost:3000/api/admin/migrate-015 \
 *        -H "X-Admin-Token: YOUR_TOKEN"
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // 60 second timeout

// Migration SQL statements
const MIGRATION_STEPS = [
  {
    name: 'Add tags column',
    sql: `ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags);`,
  },
  {
    name: 'Tag metier elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'metier') WHERE categorie = 'metiers';`,
  },
  {
    name: 'Tag hygiene elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'hygiene')
WHERE texte ~* 'haleine|brosser les dents|tirer la chasse|crottes de nez|cracher par terre|ongles longs';`,
  },
  {
    name: 'Tag argent elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'argent')
WHERE texte ~* 'crypto|bitcoin|trader|radin|addition au centime|investisseur|MLM|dropshipping|patrimoine|fiscali|impôts|fortune';`,
  },
  {
    name: 'Tag numerique elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'numerique')
WHERE texte ~* 'TikTok|Instagram|OnlyFans|MYM|LinkedIn|Slack|Teams|streamer|gamer|jeux vidéo|influenceur|Intelligence Artificielle|community manager|YouTube|contenu en ligne|Métavers';`,
  },
  {
    name: 'Tag sport elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'sport')
WHERE texte ~* 'muscu|workout|sport|gym|ski|surf|fitness|coach sportif|personal trainer|marathon|trail';`,
  },
  {
    name: 'Tag nourriture elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'nourriture')
WHERE texte ~* 'manger|bouffe|repas|frigo|micro.onde|vegan|végétar|roter|poisson';`,
  },
  {
    name: 'Tag emotionnel elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'emotionnel')
WHERE texte ~* 'burnout|jaloux|colère|toxique|manipulation|ghoste|narcissique|anxieux|dépression';`,
  },
  {
    name: 'Tag transport elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'transport')
WHERE texte ~* 'transport|klaxon|atterrissage|avion|feu vert|poids lourd|marin pêcheur|routier';`,
  },
  {
    name: 'Tag politique elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'politique')
WHERE texte ~* 'politicien|lobbyi|militant|diplomate|huissier|inspecteur des impôts|fonctionnaire';`,
  },
  {
    name: 'Tag couple elements',
    sql: `UPDATE elements SET tags = array_append(tags, 'couple')
WHERE texte ~* 'son ex|ses ex|son/sa partenaire|premier date|premier soir|stalker|ghoste|sexting|nude|porno|chaussettes.*amour|coucher avec|draguer.*(collègu|boss)|relation longue distance|polyamour';`,
  },
  {
    name: 'Move sexual metiers to sexe',
    sql: `UPDATE elements SET categorie = 'sexe', updated_at = NOW()
WHERE categorie = 'metiers'
AND texte ~* 'coucher avec.*(boss|chef)|draguer.*(collègu|boss|chef)';`,
  },
  {
    name: 'Move remaining metiers to quotidien',
    sql: `UPDATE elements SET categorie = 'quotidien', updated_at = NOW()
WHERE categorie = 'metiers';`,
  },
  {
    name: 'Update CHECK constraint',
    sql: `ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;
ALTER TABLE elements ADD CONSTRAINT elements_categorie_check
  CHECK (categorie IN ('sexe', 'quotidien'));`,
  },
];

export async function POST(request: NextRequest) {
  try {
    // ─── Auth ───────────────────────────────────────────────────────────────
    const adminToken = request.headers.get('X-Admin-Token');
    if (!verifyAdminToken(adminToken)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin token' },
        { status: 401 }
      );
    }

    // ─── Initialize Supabase ─────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Initialize with service role for DDL operations
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // ─── Execute migration steps ─────────────────────────────────────────────
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const step of MIGRATION_STEPS) {
      try {
        console.log(`[Migration 015] Executing: ${step.name}`);

        // Execute raw SQL via RPC fallback or direct query
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: step.sql,
        } as any);

        if (error) {
          // Try alternative approach: use internal API
          throw error;
        }

        results.push({
          step: step.name,
          status: 'success',
          timestamp: new Date().toISOString(),
        });
        successCount++;
        console.log(`✓ ${step.name}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({
          step: step.name,
          status: 'error',
          error: errorMsg,
          timestamp: new Date().toISOString(),
        });
        errorCount++;
        console.error(`✗ ${step.name}: ${errorMsg}`);
      }
    }

    // ─── Verification ───────────────────────────────────────────────────────
    let verificationResults = null;
    try {
      // Check that no metiers remain
      const { data: metierCount } = await supabase
        .from('elements')
        .select('*', { count: 'exact', head: true })
        .eq('categorie', 'metiers');

      // Check category distribution
      const { data: categoryDist } = await supabase
        .rpc('get_category_count') // Function call (if available)
        .catch(() => ({ data: null }));

      verificationResults = {
        remainingMetiers: metierCount || 0,
        categoryDistribution: categoryDist,
      };
    } catch (err) {
      console.warn('Verification query failed (non-blocking):', err);
    }

    // ─── Response ────────────────────────────────────────────────────────────
    const success = errorCount === 0;
    return NextResponse.json(
      {
        status: success ? 'completed' : 'partial',
        message: success
          ? 'Migration 015 executed successfully'
          : `Migration 015 completed with ${errorCount} error(s)`,
        results: {
          totalSteps: MIGRATION_STEPS.length,
          successful: successCount,
          failed: errorCount,
          steps: results,
        },
        verification: verificationResults,
        timestamp: new Date().toISOString(),
      },
      { status: success ? 200 : 207 }
    );
  } catch (err) {
    console.error('[Migration 015] Fatal error:', err);
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
