#!/usr/bin/env node
const SURL = 'https://jcrtkvoxizrfttzerhfp.supabase.co/rest/v1';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnRrdm94aXpyZnR0emVyaGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI0NTk5NiwiZXhwIjoyMDgzODIxOTk2fQ.ztFzjhXB1MLMdQRPtjQliZ4ed_yzMWxW925tagemvuo';
const H    = { 'Authorization': `Bearer ${KEY}`, 'apikey': KEY };

async function main() {
  // Query without justification first
  const url1 = `${SURL}/flagornot_submissions?select=id,text,verdict,gender,created_at&limit=20&order=created_at.desc`;
  const r1 = await fetch(url1, { headers: H });
  const d1 = await r1.json();
  
  if (!Array.isArray(d1)) {
    console.log('Error:', JSON.stringify(d1));
    return;
  }
  
  console.log(`\nTotal rows (recent): ${d1.length}`);
  console.log('Missing gender:', d1.filter(r => !r.gender).length, '/', d1.length);
  console.log('\nSample row:', JSON.stringify(d1[0], null, 2));
  
  // Count all
  const url2 = `${SURL}/flagornot_submissions?select=id&limit=1000`;
  const r2 = await fetch(url2, { headers: H, 'Range': '0-999', 'Range-Unit': 'items' });
  const d2 = await r2.json();
  console.log('\nTotal rows in DB:', Array.isArray(d2) ? d2.length : d2);
  
  // Gender distribution
  const url3 = `${SURL}/flagornot_submissions?select=gender&limit=1000`;
  const r3 = await fetch(url3, { headers: H });
  const d3 = await r3.json();
  if (Array.isArray(d3)) {
    const dist = { homme: 0, femme: 0, autre: 0, null: 0 };
    for (const r of d3) dist[r.gender ?? 'null']++;
    console.log('\nGender distribution:', dist);
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
