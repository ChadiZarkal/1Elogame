#!/usr/bin/env node

/**
 * Execute migration 015: 2 categories + tags system
 * Usage: node scripts/run-migration-015.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE credentials in environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration SQL
const migrationPath = path.join(
  import.meta.url.replace('file:///', '').replace(/scripts[/\\]run-migration-015\.mjs$/, ''),
  'supabase/migrations/015_two_categories_with_tags.sql'
);

console.log('📂 Reading migration from:', migrationPath);
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

// Remove comments and empty lines, split into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`\n✨ Found ${statements.length} SQL statements to execute`);

let executed = 0;
let failed = 0;

// Execute each statement
for (const [i, statement] of statements.entries()) {
  try {
    console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
    
    // Try executing via RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: statement,
    });

    if (error) {
      throw error;
    }

    executed++;
    console.log(`   ✓ Success`);
  } catch (error) {
    failed++;
    console.error(`   ✗ Error:`, error.message);
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`📊 Migration Results:`);
console.log(`   ✓ Executed: ${executed}/${statements.length}`);
console.log(`   ✗ Failed: ${failed}/${statements.length}`);
console.log(`${'═'.repeat(60)}\n`);

if (failed > 0) {
  console.log('⚠️  Some statements failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('✅ Migration 015 completed successfully!');
  console.log('   Categories reduced to 2: sexe, quotidien');
  console.log('   Tags system activated with 11 semantic tags');
  console.log('   All metiers elements reassigned');
  process.exit(0);
}
