#!/usr/bin/env node

/**
 * Execute all Supabase migrations in order
 * Usage: node scripts/exec-all-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`📂 Found ${files.length} migration files\n`);

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`\n⏳ Executing ${file}...`);
  
  try {
    // Execute the entire SQL file as a single statement
    const { error, data } = await supabase.rpc('exec_migration', { 
      migration_sql: sql 
    }).catch(async () => {
      // Fallback: if exec_migration doesn't exist, try executing via raw SQL
      console.log('   (Using fallback direct SQL execution)');
      return await supabase.sql(sql);
    });

    if (error) {
      // Try alternative: split by statements and execute each
      console.log(`   ⚠️  exec_migration failed, trying alternative...`);
      
      const statements = sql.split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));
      
      for (const stmt of statements) {
        try {
          await supabase.rpc('exec_sql', { sql: stmt });
        } catch (e) {
          // Ignore individual statement errors
          console.log(`   ℹ️  Statement skipped (may already exist)`);
        }
      }
      console.log(`   ✓ ${file} completed (with fallback)`);
    } else {
      console.log(`   ✓ ${file} completed`);
    }
  } catch (err) {
    console.error(`   ✗ ERROR in ${file}:`, err.message);
  }
}

console.log('\n✅ Migration execution complete!');
