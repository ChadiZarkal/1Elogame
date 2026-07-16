#!/usr/bin/env node
/**
 * run-ddl-migration.mjs
 * Executes DDL via Supabase pg endpoint (service role)
 * then runs tag UPDATE statements via REST API
 */

const SUPABASE_URL  = 'https://jcrtkvoxizrfttzerhfp.supabase.co';
const SERVICE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnRrdm94aXpyZnR0emVyaGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI0NTk5NiwiZXhwIjoyMDgzODIxOTk2fQ.ztFzjhXB1MLMdQRPtjQliZ4ed_yzMWxW925tagemvuo';

const REST_HEADERS = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey': SERVICE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

async function trySQL(sql, label) {
  // Attempt 1: pgmeta REST endpoint (internal Supabase admin API)
  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    `https://api.supabase.com/v1/projects/jcrtkvoxizrfttzerhfp/database/query`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { ...REST_HEADERS, 'Accept': 'application/json' },
        body: JSON.stringify({ query: sql, sql }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (res.ok) {
        console.log(`   ✓ [${label}] via ${endpoint.replace(SUPABASE_URL, '').replace('https://api.supabase.com', '')}`);
        return { success: true, data };
      }
      console.log(`   ✗ [${label}] ${endpoint.split('/').slice(-2).join('/')}: ${res.status} ${text.substring(0, 100)}`);
    } catch (e) {
      console.log(`   ✗ [${label}] network error: ${e.message.substring(0, 80)}`);
    }
  }
  return { success: false };
}

async function restPatch(filter, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/elements?${filter}`, {
    method: 'PATCH',
    headers: REST_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${await res.text()}`);
  return true;
}

async function restGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: REST_HEADERS });
  if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// Tag rules
const TAG_RULES = [
  { tag: 'metier',     regex: /collegu|boss|chef|manager|reunion|teletravail|patron|employe|travail|boulot|carriere|promotion|poste|bureau|entreprise|startup|freelance|burnout|open.?space/i },
  { tag: 'argent',     regex: /crypto|bitcoin|trader|radin|MLM|dropshipping|patrimoine|impots|fortune|investisseur|fiscali/i },
  { tag: 'numerique',  regex: /TikTok|Instagram|OnlyFans|LinkedIn|Slack|Teams|streamer|gamer|influenceur|YouTube|jeux.vid/i },
  { tag: 'sport',      regex: /muscu|workout|sport|gym|ski|surf|fitness|marathon|trail|coach.sportif|personal.trainer/i },
  { tag: 'nourriture', regex: /manger|bouffe|repas|frigo|micro.?onde|vegan|vegetar|roter|poisson/i },
  { tag: 'emotionnel', regex: /burnout|jaloux|toxique|manipulation|ghoste|narcissique|anxieux|depression|colere/i },
  { tag: 'transport',  regex: /transport|klaxon|atterrissage|avion|feu.vert|poids.lourd|routier/i },
  { tag: 'politique',  regex: /politicien|lobbyi|militant|diplomate|huissier|fonctionnaire/i },
  { tag: 'couple',     regex: /son ex|ses ex|premier date|stalker|sexting|nude|porno|polyamour|relation longue/i },
];

async function main() {
  console.log('═'.repeat(60));
  console.log(' Migration 015 — DDL + Tags');
  console.log('═'.repeat(60) + '\n');

  // ─── 1. Try DDL via SQL endpoints ────────────────────────────────────────
  console.log('[1/4] Attempting DDL via Supabase SQL endpoints...');
  
  const ddlAddColumn = `ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'`;
  const ddlAddIndex  = `CREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags)`;
  const ddlDropConst = `ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check`;
  const ddlAddConst  = `ALTER TABLE elements ADD CONSTRAINT elements_categorie_check CHECK (categorie IN ('sexe', 'quotidien'))`;

  const ddlResults = {
    column: await trySQL(ddlAddColumn, 'ADD COLUMN tags'),
    index:  await trySQL(ddlAddIndex,  'CREATE INDEX'),
    drop:   await trySQL(ddlDropConst, 'DROP CONSTRAINT'),
    add:    await trySQL(ddlAddConst,  'ADD CONSTRAINT'),
  };

  const ddlSuccess = Object.values(ddlResults).every(r => r.success);

  if (!ddlSuccess) {
    console.log('\n⚠️  DDL could not be executed via API (requires Supabase PAT)');
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  PASTE THIS IN SUPABASE SQL EDITOR (just 4 lines):       ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nhttps://supabase.com/dashboard/project/jcrtkvoxizrfttzerhfp/sql/new\n');
    console.log('─'.repeat(60));
    console.log(`ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';`);
    console.log(`CREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags);`);
    console.log(`ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;`);
    console.log(`ALTER TABLE elements ADD CONSTRAINT elements_categorie_check CHECK (categorie IN ('sexe', 'quotidien'));`);
    console.log('─'.repeat(60));
    console.log('\nOnce those run, re-run this script to apply tags.');
    return;
  }

  // ─── 2. Fetch all elements ────────────────────────────────────────────────
  console.log('\n[2/4] Fetching elements to apply tags...');
  let elements = [];
  let from = 0;
  while (true) {
    const page = await restGet(`elements?select=id,texte,tags&order=id.asc&limit=1000&offset=${from}`);
    elements.push(...page);
    if (page.length < 1000) break;
    from += 1000;
  }
  console.log(`   ✓ ${elements.length} elements loaded`);

  // ─── 3. Apply tags ────────────────────────────────────────────────────────
  console.log('\n[3/4] Applying semantic tags...');
  let tagged = 0, skipped = 0;

  for (const el of elements) {
    const existingTags = new Set(Array.isArray(el.tags) ? el.tags : []);
    const newTags = new Set(existingTags);

    for (const rule of TAG_RULES) {
      if (rule.regex.test(el.texte || '')) {
        newTags.add(rule.tag);
      }
    }

    const changed = [...newTags].some(t => !existingTags.has(t));
    if (!changed) { skipped++; continue; }

    try {
      await restPatch(`id=eq.${el.id}`, { tags: [...newTags] });
      tagged++;
    } catch (err) {
      console.error(`   ✗ #${el.id}: ${err.message}`);
    }
  }
  console.log(`   ✓ Tagged: ${tagged}, Skipped (no change): ${skipped}`);

  // ─── 4. Final verification ────────────────────────────────────────────────
  console.log('\n[4/4] Verification...');
  
  const cats  = await restGet(`elements?select=categorie&order=categorie.asc`);
  const catDist = {};
  cats.forEach(e => { catDist[e.categorie] = (catDist[e.categorie] || 0) + 1; });
  
  console.log('\n   Categories:');
  for (const [cat, cnt] of Object.entries(catDist)) {
    const valid = ['sexe', 'quotidien'].includes(cat);
    console.log(`   ${valid ? '✓' : '✗'} ${cat}: ${cnt}`);
  }

  const allTagged = await restGet(`elements?select=id,tags&tags=neq.{}&limit=5`);
  console.log(`\n   Elements with tags (sample): ${JSON.stringify(allTagged.slice(0, 2).map(e => ({ id: e.id.substring(0, 8), tags: e.tags })))}`);

  const invalid = cats.filter(e => !['sexe', 'quotidien'].includes(e.categorie));
  if (invalid.length === 0) {
    console.log('\n✅ Database is clean and ready!');
  } else {
    console.log(`\n⚠️  ${invalid.length} invalid categories remain`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
