#!/usr/bin/env node
/**
 * fix-migration-015.mjs
 *
 * Safe, idempotent migration fixer:
 *  1. Full backup → backup-elements-{ts}.json
 *  2. Diagnose current DB state
 *  3. Fix all invalid-category rows via PATCH
 *  4. Re-apply tags on fixed rows
 *  5. Execute DDL (DROP/ADD constraint) via Supabase Management API or pgmeta
 *  6. Final verification + integrity checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://jcrtkvoxizrfttzerhfp.supabase.co';
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnRrdm94aXpyZnR0emVyaGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI0NTk5NiwiZXhwIjoyMDgzODIxOTk2fQ.ztFzjhXB1MLMdQRPtjQliZ4ed_yzMWxW925tagemvuo';
const PROJECT_REF     = 'jcrtkvoxizrfttzerhfp';

const REST_HEADERS = {
  'Authorization':  `Bearer ${SERVICE_KEY}`,
  'apikey':         SERVICE_KEY,
  'Content-Type':   'application/json',
  'Prefer':         'return=representation',
};

const VALID_CATEGORIES = new Set(['sexe', 'quotidien']);

// ─── Tag regex map (mirrors migration SQL) ────────────────────────────────────
const TAG_RULES = [
  { tag: 'hygiene',    regex: /haleine|brosser les dents|tirer la chasse|crottes de nez|cracher par terre|ongles longs/i },
  { tag: 'argent',     regex: /crypto|bitcoin|trader|radin|addition au centime|investisseur|MLM|dropshipping|patrimoine|fiscali|impôts|fortune/i },
  { tag: 'numerique',  regex: /TikTok|Instagram|OnlyFans|MYM|LinkedIn|Slack|Teams|streamer|gamer|jeux vidéo|influenceur|Intelligence Artificielle|community manager|YouTube|contenu en ligne|Métavers/i },
  { tag: 'sport',      regex: /muscu|workout|sport|gym|ski|surf|fitness|coach sportif|personal trainer|marathon|trail/i },
  { tag: 'nourriture', regex: /manger|bouffe|repas|frigo|micro.onde|vegan|végétar|roter|poisson/i },
  { tag: 'emotionnel', regex: /burnout|jaloux|colère|toxique|manipulation|ghoste|narcissique|anxieux|dépression/i },
  { tag: 'transport',  regex: /transport|klaxon|atterrissage|avion|feu vert|poids lourd|marin pêcheur|routier/i },
  { tag: 'politique',  regex: /politicien|lobbyi|militant|diplomate|huissier|inspecteur des impôts|fonctionnaire/i },
  { tag: 'couple',     regex: /son ex|ses ex|son\/sa partenaire|premier date|premier soir|stalker|ghoste|sexting|nude|porno|chaussettes.*amour|coucher avec|draguer.*(collègu|boss)|relation longue distance|polyamour/i },
];

function computeTags(element) {
  const existing = Array.isArray(element.tags) ? element.tags : [];
  const tags = new Set(existing);

  // Always tag as 'metier' if element was formerly in metiers
  // (We don't know this retroactively unless we check the element content)
  // We'll detect by job-related keywords:
  const METIER_KEYWORDS = /collègu|boss|chef|manager|open.space|réunion|télétravail|burn.?out|startup|bureau|patron|employé|profession|travail|boulot|carrière|ressources humaines|RH|poste|promotion|licencier|licenciement|entretien d'embauche|cv |contrat de travail/i;
  if (METIER_KEYWORDS.test(element.texte || '')) {
    tags.add('metier');
  }

  for (const rule of TAG_RULES) {
    if (rule.regex.test(element.texte || '')) {
      tags.add(rule.tag);
    }
  }

  return [...tags];
}

function determineCategory(element) {
  const texte = (element.texte || '').toLowerCase();
  const isSexualWork = /coucher avec.*(boss|chef)|draguer.*(collègu|boss|chef)/i.test(texte);
  if (element.categorie === 'metiers' && isSexualWork) return 'sexe';
  return 'quotidien';
}

// ─── REST helpers ──────────────────────────────────────────────────────────────
async function restGet(path, rangeFrom = 0, rangeTo = 9999) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      ...REST_HEADERS,
      'Range':      `${rangeFrom}-${rangeTo}`,
      'Range-Unit': 'items',
    },
  });
  if (!res.ok) throw new Error(`GET /${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restPatch(table, filter, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method:  'PATCH',
    headers: REST_HEADERS,
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH /${table}?${filter} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Fetch ALL elements (paginated) ───────────────────────────────────────────
async function fetchAllElements() {
  const all = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const page = await restGet(`elements?select=*&order=id.asc`, from, from + size - 1);
    all.push(...page);
    if (page.length < size) break;
    from += size;
  }
  return all;
}

// ─── Try to execute DDL via pgmeta ────────────────────────────────────────────
async function tryDDL(sql) {
  // Attempt 1: pgmeta internal endpoint
  try {
    const res = await fetch(`${SUPABASE_URL}/pg/query`, {
      method:  'POST',
      headers: { ...REST_HEADERS },
      body:    JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, method: 'pgmeta', data };
    }
  } catch { /* silent */ }

  // Attempt 2: Supabase Management API (needs PAT, may fail)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, method: 'management-api', data };
    }
    const err = await res.text();
    return { success: false, method: 'management-api', error: err };
  } catch (e) {
    return { success: false, method: 'none', error: e.message };
  }
}

// ─── Check if constraint exists ───────────────────────────────────────────────
async function checkConstraintExists() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: REST_HEADERS,
        body: JSON.stringify({
          sql: `SELECT COUNT(*) as cnt FROM pg_constraint WHERE conname = 'elements_categorie_check' AND conrelid = 'elements'::regclass`,
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data?.[0]?.cnt > 0;
    }
  } catch { /* ignore */ }
  return null; // Unknown
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║      Migration 015 - Safe Fixer & Verifier               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── 1. BACKUP ──────────────────────────────────────────────────────────────
  console.log('📦 [1/6] BACKUP - Saving all elements...');
  let allElements;
  try {
    allElements = await fetchAllElements();
  } catch (err) {
    console.error('   ✗ FATAL: Could not fetch elements:', err.message);
    process.exit(1);
  }

  const backupTs = Date.now();
  const backupFile = path.join(__dir, '..', `backup-elements-${backupTs}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({
    backup_time:  new Date(backupTs).toISOString(),
    count:        allElements.length,
    elements:     allElements,
  }, null, 2));
  console.log(`   ✓ ${allElements.length} elements → ${path.basename(backupFile)}`);

  // ── 2. DIAGNOSE ────────────────────────────────────────────────────────────
  console.log('\n🔍 [2/6] DIAGNOSE - Current DB state...');

  const catDist = {};
  for (const el of allElements) {
    const cat = el.categorie ?? '(null)';
    catDist[cat] = (catDist[cat] || 0) + 1;
  }

  console.log('   Category distribution:');
  for (const [cat, cnt] of Object.entries(catDist).sort((a, b) => b[1] - a[1])) {
    const valid = VALID_CATEGORIES.has(cat);
    console.log(`   ${valid ? '  ✓' : '  ⚠'} "${cat}": ${cnt} elements`);
  }

  const invalidElements = allElements.filter(el => !VALID_CATEGORIES.has(el.categorie));
  const taglessCount = allElements.filter(el => !Array.isArray(el.tags) || el.tags.length === 0).length;

  console.log(`\n   ⚠  Invalid categories: ${invalidElements.length} elements`);
  console.log(`   ⚠  Missing tags:        ${taglessCount} elements`);

  if (invalidElements.length === 0) {
    console.log('\n   ✓ No DML fixes needed. Categories are clean.');
  }

  // ── 3. FIX CATEGORIES ─────────────────────────────────────────────────────
  // NOTE: The 'tags' column doesn't exist in production yet (will be added via DDL)
  // We ONLY update 'categorie' here. Tags will be applied by the migration SQL later.
  if (invalidElements.length > 0) {
    console.log('\n🔧 [3/6] FIX - Updating invalid categories (categorie field only)...');
    console.log('   ℹ  Note: "bureau" = workplace (→ quotidien), "lifestyle" = (→ quotidien)');
    let fixed = 0, errors = 0;

    for (const el of invalidElements) {
      // bureau with sexual workplace behavior → sexe, everything else → quotidien
      const isSexualWork = /coucher avec.*(boss|chef)|draguer.*(collègu|boss|chef)/i.test(el.texte || '');
      const newCat = (el.categorie === 'bureau' && isSexualWork) ? 'sexe' : 'quotidien';

      try {
        await restPatch('elements', `id=eq.${el.id}`, {
          categorie:  newCat,
          updated_at: new Date().toISOString(),
        });
        fixed++;
        console.log(`   ✓ #${el.id.substring(0, 8)}: "${el.categorie}" → "${newCat}" | "${(el.texte || '').substring(0, 50)}..."`);
      } catch (err) {
        errors++;
        console.error(`   ✗ #${el.id}: ${err.message}`);
      }
    }

    console.log(`\n   Fixed: ${fixed}/${invalidElements.length}  |  Errors: ${errors}`);
    if (errors > 0) {
      console.error('\n   ✗ Some elements could not be fixed. Aborting DDL step.');
      process.exit(1);
    }
  } else {
    console.log('\n🔧 [3/6] FIX - No invalid categories to fix. ✓');
  }

  // ── 4. TAGS NOTE ──────────────────────────────────────────────────────────
  // Tags column doesn't exist yet - will be created by the DDL migration SQL
  const tagsExist = allElements.some(el => el.tags !== undefined);
  if (!tagsExist) {
    console.log('\n🏷  [4/6] TAGS - Column does not exist yet (will be created in DDL step) ⏳');
  } else {
    const noTagElements = allElements.filter(el => !Array.isArray(el.tags) || el.tags.length === 0);
    if (noTagElements.length > 0) {
      console.log(`\n🏷  [4/6] TAGS - Applying tags to ${noTagElements.length} untagged elements...`);
      let tagged = 0;
      for (const el of noTagElements) {
        const newTags = computeTags(el);
        if (newTags.length === 0) continue;
        try {
          await restPatch('elements', `id=eq.${el.id}`, { tags: newTags });
          tagged++;
        } catch (err) {
          console.error(`   ✗ #${el.id}: ${err.message}`);
        }
      }
      console.log(`   ✓ Tagged ${tagged} elements`);
    } else {
      console.log('\n🏷  [4/6] TAGS - All elements already tagged. ✓');
    }
  }

  // ── 5. DDL - Constraint ────────────────────────────────────────────────────
  console.log('\n🔒 [5/6] DDL - Updating CHECK constraint...');

  const ddlSQL = `
ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;
ALTER TABLE elements ADD CONSTRAINT elements_categorie_check
  CHECK (categorie IN ('sexe', 'quotidien'));
`.trim();

  const ddlResult = await tryDDL(ddlSQL);

  if (ddlResult.success) {
    console.log(`   ✓ Constraint updated via ${ddlResult.method}`);
  } else {
    console.log(`   ⚠  DDL via API not available (${ddlResult.error?.substring(0, 80)})`);
    console.log('\n   ╔══════════════════════════════════════════════════════════╗');
    console.log('   ║  MANUAL ACTION REQUIRED - Run this in Supabase SQL Editor ║');
    console.log('   ╚══════════════════════════════════════════════════════════╝');
    console.log('\n   1. Open: https://supabase.com/dashboard/project/jcrtkvoxizrfttzerhfp/sql/new');
    console.log('\n   2. Paste and run this SQL:');
    console.log('\n   ─────────────────────────────────────────────────────────');
    console.log(`   ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;`);
    console.log(`   ALTER TABLE elements ADD CONSTRAINT elements_categorie_check`);
    console.log(`     CHECK (categorie IN ('sexe', 'quotidien'));`);
    console.log('   ─────────────────────────────────────────────────────────\n');
    console.log('   (The data is already clean - this is ONLY the schema change)');
  }

  // ── 6. VERIFY ─────────────────────────────────────────────────────────────
  console.log('\n✅ [6/6] VERIFY - Final verification...');

  let verifiedElements;
  try {
    verifiedElements = await fetchAllElements();
  } catch (err) {
    console.error('   ✗ Could not re-fetch for verification:', err.message);
    process.exit(1);
  }

  const stillInvalid = verifiedElements.filter(el => !VALID_CATEGORIES.has(el.categorie));
  const finalCatDist = {};
  for (const el of verifiedElements) {
    finalCatDist[el.categorie] = (finalCatDist[el.categorie] || 0) + 1;
  }

  const tagStats = {};
  for (const el of verifiedElements) {
    for (const tag of (el.tags || [])) {
      tagStats[tag] = (tagStats[tag] || 0) + 1;
    }
  }

  console.log('\n   ── Category distribution (final) ──');
  for (const [cat, cnt] of Object.entries(finalCatDist).sort((a, b) => b[1] - a[1])) {
    const valid = VALID_CATEGORIES.has(cat);
    console.log(`   ${valid ? '✓' : '✗'} "${cat}": ${cnt} elements`);
  }

  console.log('\n   ── Tag distribution (final) ──');
  for (const [tag, cnt] of Object.entries(tagStats).sort((a, b) => b[1] - a[1])) {
    console.log(`   • ${tag}: ${cnt}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(62));
  if (stillInvalid.length === 0) {
    console.log(`✅  SUCCESS in ${elapsed}s — Data is clean!`);
    console.log(`   Total elements: ${verifiedElements.length}`);
    console.log(`   Backup saved:   ${path.basename(backupFile)}`);
    if (!ddlResult.success) {
      console.log('\n   ⚠  ONE REMAINING STEP: Run the SQL above in Supabase dashboard');
      console.log('      (data is clean — the constraint step cannot fail now)');
    }
  } else {
    console.log(`✗   FAILED — ${stillInvalid.length} elements still have invalid categories!`);
    console.log('   IDs:', stillInvalid.map(e => `${e.id}:${e.categorie}`).join(', '));
    process.exit(1);
  }
  console.log('═'.repeat(62) + '\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
