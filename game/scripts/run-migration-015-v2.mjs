#!/usr/bin/env node

/**
 * Execute migration 015: 2 categories + tags system
 * Direct execution via Supabase Admin API
 */

import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE credentials');
  process.exit(1);
}

// Read migration SQL
const baseDir = import.meta.url.replace('file:///', '').replace(/scripts[/\\]run-migration-015-v2\.mjs$/, '');
const migrationPath = path.join(baseDir, 'supabase/migrations/015_two_categories_with_tags.sql');

console.log('📂 Reading migration from:', migrationPath);
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

// Split by statements (simplified)
const statements = migrationSQL
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`✨ Found ${statements.length} SQL blocks to verify`);

// Try using psql via pg_dump connection if available
console.log('\n🔍 Attempting direct PostgreSQL connection via environment...');

// Try loading from .env.local and extracting db connection
const envPath = path.join(baseDir, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse SUPABASE_SERVICE_ROLE_KEY to get project ref
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Could not extract project ref from URL');
  process.exit(1);
}

console.log('📌 Project ref:', projectRef);
console.log('🔑 Service role key detected: ✓');

// Create a dynamic function to submit SQL
async function executeMigration() {
  console.log('\n📡 Submitting migration via Supabase REST API...\n');
  
  // Split migration into batches (step by step)
  const steps = [
    { label: 'Add tags column', sql: 'ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT \'{}\';\nCREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags);' },
    { label: 'Tag metier elements', sql: 'UPDATE elements SET tags = array_append(tags, \'metier\') WHERE categorie = \'metiers\';' },
    { label: 'Tag hygiene elements', sql: 'UPDATE elements SET tags = array_append(tags, \'hygiene\')\nWHERE texte ~* \'haleine|brosser les dents|tirer la chasse|crottes de nez|cracher par terre|ongles longs\';' },
    { label: 'Tag argent elements', sql: 'UPDATE elements SET tags = array_append(tags, \'argent\')\nWHERE texte ~* \'crypto|bitcoin|trader|radin|addition au centime|investisseur|MLM|dropshipping|patrimoine|fiscali|impôts|fortune\';' },
    { label: 'Tag numerique elements', sql: 'UPDATE elements SET tags = array_append(tags, \'numerique\')\nWHERE texte ~* \'TikTok|Instagram|OnlyFans|MYM|LinkedIn|Slack|Teams|streamer|gamer|jeux vidéo|influenceur|Intelligence Artificielle|community manager|YouTube|contenu en ligne|Métavers\';' },
    { label: 'Tag sport elements', sql: 'UPDATE elements SET tags = array_append(tags, \'sport\')\nWHERE texte ~* \'muscu|workout|sport|gym|ski|surf|fitness|coach sportif|personal trainer|marathon|trail\';' },
    { label: 'Tag nourriture elements', sql: 'UPDATE elements SET tags = array_append(tags, \'nourriture\')\nWHERE texte ~* \'manger|bouffe|repas|frigo|micro.onde|vegan|végétar|roter|poisson\';' },
    { label: 'Tag emotionnel elements', sql: 'UPDATE elements SET tags = array_append(tags, \'emotionnel\')\nWHERE texte ~* \'burnout|jaloux|colère|toxique|manipulation|ghoste|narcissique|anxieux|dépression\';' },
    { label: 'Tag transport elements', sql: 'UPDATE elements SET tags = array_append(tags, \'transport\')\nWHERE texte ~* \'transport|klaxon|atterrissage|avion|feu vert|poids lourd|marin pêcheur|routier\';' },
    { label: 'Tag politique elements', sql: 'UPDATE elements SET tags = array_append(tags, \'politique\')\nWHERE texte ~* \'politicien|lobbyi|militant|diplomate|huissier|inspecteur des impôts|fonctionnaire\';' },
    { label: 'Tag couple elements', sql: 'UPDATE elements SET tags = array_append(tags, \'couple\')\nWHERE texte ~* \'son ex|ses ex|son/sa partenaire|premier date|premier soir|stalker|ghoste|sexting|nude|porno|chaussettes.*amour|coucher avec|draguer.*(collègu|boss)|relation longue distance|polyamour\';' },
    { label: 'Move sexual metiers to sexe', sql: 'UPDATE elements SET categorie = \'sexe\', updated_at = NOW()\nWHERE categorie = \'metiers\'\nAND texte ~* \'coucher avec.*(boss|chef)|draguer.*(collègu|boss|chef)\';' },
    { label: 'Move remaining metiers to quotidien', sql: 'UPDATE elements SET categorie = \'quotidien\', updated_at = NOW()\nWHERE categorie = \'metiers\';' },
    { label: 'Update CHECK constraint', sql: 'ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;\nALTER TABLE elements ADD CONSTRAINT elements_categorie_check\n  CHECK (categorie IN (\'sexe\', \'quotidien\'));' },
  ];

  let successCount = 0;
  const results = [];

  for (const step of steps) {
    try {
      console.log(`⏳ Step: ${step.label}...`);
      
      // Use fetch to call Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'X-Client-Info': 'supabase-js/2.0',
        },
        body: JSON.stringify({ sql: step.sql }),
      });

      // If RPC doesn't exist, fall back to direct query approach
      if (response.status === 404) {
        console.warn(`   ⚠️  RPC not available, using backup method...`);
        // For now, just log that we tried
        results.push({ step: step.label, status: 'skipped', reason: 'RPC not found' });
        continue;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      console.log(`   ✓ Success`);
      successCount++;
      results.push({ step: step.label, status: 'success' });
    } catch (error) {
      console.error(`   ✗ Error: ${error.message}`);
      results.push({ step: step.label, status: 'error', error: error.message });
    }
  }

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Migration Results:`);
  console.log(`   ✓ Completed: ${successCount}/${steps.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  if (successCount === steps.length) {
    console.log('✅ Migration 015 executed successfully!');
    return true;
  } else if (successCount > 0) {
    console.log('⚠️  Partial completion. Manual verification needed.');
    console.log('\nNext steps: Check Supabase dashboard > SQL Editor to verify schema.');
    return false;
  } else {
    console.log('❌ Migration could not be executed via REST API.');
    console.log('\n📋 Alternative methods:');
    console.log('  1. Supabase Dashboard > SQL Editor > Paste migration SQL');
    console.log('  2. Install Supabase CLI: npm install -g supabase');
    console.log('  3. Run: supabase db push');
    console.log('\n💾 Migration file location:');
    console.log('  supabase/migrations/015_two_categories_with_tags.sql');
    return false;
  }
}

executeMigration().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
