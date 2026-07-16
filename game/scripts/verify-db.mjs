#!/usr/bin/env node
/**
 * verify-db.mjs — Quick verification of current DB state
 */

const URL = 'https://jcrtkvoxizrfttzerhfp.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnRrdm94aXpyZnR0emVyaGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI0NTk5NiwiZXhwIjoyMDgzODIxOTk2fQ.ztFzjhXB1MLMdQRPtjQliZ4ed_yzMWxW925tagemvuo';
const H = { 'Authorization': `Bearer ${KEY}`, 'apikey': KEY, 'Content-Type': 'application/json' };

async function get(path) {
  const r = await fetch(`${URL}/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
  return r.json();
}

async function main() {
  console.log('═'.repeat(55));
  console.log(' DB Verification — Migration 015 Status');
  console.log('═'.repeat(55) + '\n');

  // Category distribution
  const cats = await get('elements?select=categorie&order=categorie.asc');
  const catDist = {};
  cats.forEach(e => { catDist[e.categorie] = (catDist[e.categorie] || 0) + 1; });
  
  console.log('📊 Category Distribution:');
  let totalValid = 0;
  for (const [cat, cnt] of Object.entries(catDist)) {
    const valid = ['sexe', 'quotidien'].includes(cat);
    if (valid) totalValid += cnt;
    console.log(`   ${valid ? '✅' : '❌'} "${cat}": ${cnt}`);
  }
  console.log(`   Total: ${cats.length} elements (${totalValid} valid)\n`);

  // Check if tags column exists
  try {
    const sample = await get('elements?select=id,tags&limit=1');
    const hasTags = sample[0] && 'tags' in sample[0];
    console.log(`🏷  Tags column: ${hasTags ? '✅ EXISTS' : '❌ NOT YET (DDL needed)'}`);
    if (hasTags) {
      const tagged = await get('elements?select=tags&tags=neq.%7B%7D');
      console.log(`   Tagged elements: ${tagged.length}/${cats.length}`);
      const tagStats = {};
      tagged.forEach(e => (e.tags || []).forEach(t => { tagStats[t] = (tagStats[t] || 0) + 1; }));
      console.log('   Tag distribution:');
      for (const [tag, cnt] of Object.entries(tagStats).sort((a, b) => b[1] - a[1])) {
        console.log(`   • ${tag}: ${cnt}`);
      }
    }
  } catch (e) {
    console.log(`🏷  Tags column: ❌ NOT YET — ${e.message.substring(0, 50)}`);
  }

  // Check constraint (can't query this via REST, just summarize)
  const hasInvalid = cats.filter(e => !['sexe', 'quotidien'].includes(e.categorie));
  console.log(`\n🔒 Constraint status: ${hasInvalid.length === 0 ? '✅ Data is clean (constraint safe to add)' : '❌ ' + hasInvalid.length + ' invalid categories remain'}`);

  console.log('\n═'.repeat(55));
  if (hasInvalid.length === 0) {
    console.log('✅ Data is CLEAN. Remaining SQL to run in dashboard:');
    console.log('─'.repeat(55));
    console.log(`ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';`);
    console.log(`CREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags);`);
    console.log(`ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;`);
    console.log(`ALTER TABLE elements ADD CONSTRAINT elements_categorie_check CHECK (categorie IN ('sexe', 'quotidien'));`);
    console.log('─'.repeat(55));
    console.log('\nURL: https://supabase.com/dashboard/project/jcrtkvoxizrfttzerhfp/sql/new');
  }
  console.log('═'.repeat(55) + '\n');
}

main().catch(e => { console.error(e); process.exit(1); });
