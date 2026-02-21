#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier la table flagornot_submissions
 * Usage: node test-flagornot-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.log('Vérifie que .env.local contient:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 Diagnostic de la table flagornot_submissions\n');
console.log('📊 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable() {
  console.log('\n1️⃣ Test: Lecture de la table...\n');
  
  try {
    const { data, error, count } = await supabase
      .from('flagornot_submissions')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ ERREUR lors de la lecture:', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error.details);
      
      if (error.code === '42P01') {
        console.log('\n💡 La table n\'existe pas encore!');
        console.log('Solutions:');
        console.log('  1. Va sur https://supabase.com/dashboard');
        console.log('  2. Sélectionne ton projet');
        console.log('  3. Va dans "Table Editor"');
        console.log('  4. Vérifie si la table "flagornot_submissions" existe');
        console.log('  5. Si non, va dans "SQL Editor" et exécute le fichier:');
        console.log('     supabase/migrations/004_flagornot_submissions.sql');
      }
      
      return false;
    }

    console.log('✅ Table existe!');
    console.log('📊 Nombre total d\'entrées:', count || 0);
    
    if (data && data.length > 0) {
      console.log('📝 Dernières entrées:');
      data.forEach((entry, i) => {
        console.log(`  ${i + 1}. ${entry.verdict === 'red' ? '🚩' : '🟢'} "${entry.text}" (${new Date(entry.created_at).toLocaleString('fr-FR')})`);
      });
    } else {
      console.log('📝 Aucune entrée pour le moment (c\'est normal si tu viens de créer la table)');
    }

    return true;

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
    return false;
  }
}

async function testInsert() {
  console.log('\n2️⃣ Test: Insertion d\'une entrée test...\n');
  
  const testData = {
    text: `Test automatique ${new Date().toLocaleTimeString('fr-FR')}`,
    verdict: 'green'
  };

  try {
    const { data, error } = await supabase
      .from('flagornot_submissions')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ ERREUR lors de l\'insertion:', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error.details);
      
      if (error.code === '42501') {
        console.log('\n💡 Problème de permissions RLS (Row Level Security)');
        console.log('Vérifie que les policies existent:');
        console.log('  - "Anyone can insert submissions"');
        console.log('  - "Public can read submissions"');
      }
      
      return false;
    }

    console.log('✅ Insertion réussie!');
    console.log('📊 Données insérées:', data);
    return true;

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
    return false;
  }
}

async function testAPI() {
  console.log('\n3️⃣ Test: API Route /api/flagornot/community...\n');
  
  try {
    // Test GET
    console.log('GET /api/flagornot/community...');
    const getResponse = await fetch('http://localhost:3000/api/flagornot/community?limit=5');
    
    if (!getResponse.ok) {
      console.error('❌ Erreur HTTP:', getResponse.status, getResponse.statusText);
      console.log('💡 Assure-toi que le serveur dev tourne: npm run dev');
      return false;
    }

    const getData = await getResponse.json();
    console.log('✅ GET réussie!');
    console.log('📊 Réponse:', JSON.stringify(getData, null, 2));

    // Test POST
    console.log('\nPOST /api/flagornot/community...');
    const postResponse = await fetch('http://localhost:3000/api/flagornot/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Test API ${new Date().toLocaleTimeString('fr-FR')}`,
        verdict: 'red'
      })
    });

    if (!postResponse.ok) {
      console.error('❌ Erreur HTTP:', postResponse.status);
      const errorText = await postResponse.text();
      console.error('Réponse:', errorText);
      return false;
    }

    const postData = await postResponse.json();
    console.log('✅ POST réussie!');
    console.log('📊 Réponse:', JSON.stringify(postData, null, 2));

    return true;

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.log('💡 Le serveur dev est-il démarré ? (npm run dev)');
    return false;
  }
}

async function runDiagnostic() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔬 DIAGNOSTIC COMPLET - Flag or Not Submissions');
  console.log('═══════════════════════════════════════════════════');

  const tableExists = await testTable();
  
  if (!tableExists) {
    console.log('\n⚠️  La table n\'existe pas. Arrêt du diagnostic.');
    console.log('Applique d\'abord la migration SQL.');
    process.exit(1);
  }

  const insertWorks = await testInsert();
  
  if (!insertWorks) {
    console.log('\n⚠️  L\'insertion ne fonctionne pas. Vérifie les policies RLS.');
  }

  const apiWorks = await testAPI();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════════');
  console.log('Table existe:', tableExists ? '✅' : '❌');
  console.log('Insertion fonctionne:', insertWorks ? '✅' : '❌');
  console.log('API fonctionne:', apiWorks ? '✅' : '❌');
  console.log('═══════════════════════════════════════════════════\n');

  if (tableExists && insertWorks && apiWorks) {
    console.log('🎉 Tout fonctionne parfaitement!');
    console.log('Les dernières demandes devraient maintenant s\'afficher sur /flagornot');
  } else {
    console.log('⚠️  Il y a des problèmes à résoudre (voir détails ci-dessus)');
  }
}

runDiagnostic();
