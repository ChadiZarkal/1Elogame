#!/usr/bin/env node
// check-oracle-db.mjs — Diagnose missing fields in flagornot_submissions

const URL = 'https://jcrtkvoxizrfttzerhfp.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnRrdm94aXpyZnR0emVyaGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI0NTk5NiwiZXhwIjoyMDgzODIxOTk2fQ.ztFzjhXB1MLMdQRPtjQliZ4ed_yzMWxW925tagemvuo';
const H = { 'Authorization': `Bearer ${KEY}`, 'apikey': KEY, 'Range-Unit': 'items', 'Range': '0-999' };

async function get(path) {
  const r = await fetch(`${URL}/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
  return r.json();
}

async function main() {
  const rows = await get('flagornot_submissions?select=id,text,verdict,justification,gender,created_at&order=created_at.desc&limit=200');
  
  console.log(`\n📊 Total rows fetched: ${rows.length}`);
  
  // Analyze missing fields
  const missingJustification = rows.filter(r => !r.justification);
  const missingGender = rows.filter(r => !r.gender);
  const missingBoth = rows.filter(r => !r.justification && !r.gender);
  
  console.log(`\n⚠️  Missing justification: ${missingJustification.length} / ${rows.length}`);
  console.log(`⚠️  Missing gender:         ${missingGender.length} / ${rows.length}`);
  console.log(`⚠️  Missing BOTH:           ${missingBoth.length} / ${rows.length}`);

  // Show pattern over time
  const recentProblematic = rows.filter(r => !r.gender || !r.justification).slice(0, 10);
  console.log('\n📋 Recent problematic rows (no gender OR no justification):');
  for (const r of recentProblematic) {
    console.log(`  [${new Date(r.created_at).toLocaleDateString('fr')}] id=${r.id.substring(0,8)} verdict=${r.verdict} gender=${r.gender ?? 'NULL'} hasJustif=${!!r.justification} text="${r.text?.substring(0, 50)}..."`);
  }

  // Check if any rows have embedded meta in text
  const withEmbeddedMeta = rows.filter(r => r.text?.includes('<<<ORACLE_META>>>'));
  console.log(`\n📦 Rows with embedded meta fallback: ${withEmbeddedMeta.length}`);
  
  // Verdict distribution
  const redCount = rows.filter(r => r.verdict === 'red').length;
  const greenCount = rows.filter(r => r.verdict === 'green').length;
  console.log(`\n🔴 Red: ${redCount}  🟢 Green: ${greenCount}`);
  
  // Gender distribution
  const genderDist = { homme: 0, femme: 0, autre: 0, null: 0 };
  for (const r of rows) {
    genderDist[r.gender ?? 'null']++;
  }
  console.log(`\n👥 Gender distribution:`, genderDist);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
