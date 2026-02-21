#!/usr/bin/env node

/**
 * Test simple de l'API Flag or Not
 * Usage: node test-api-simple.js
 * 
 * IMPORTANT: Lance d'abord le serveur dev: npm run dev
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🔍 Test de l\'API Flag or Not\n');
  console.log('⚠️  Assure-toi que le serveur dev tourne: npm run dev\n');

  // Test 1: GET - Récupérer les soumissions
  console.log('1️⃣ Test GET /api/flagornot/community');
  console.log('─────────────────────────────────────\n');
  
  try {
    const getResponse = await fetch(`${BASE_URL}/api/flagornot/community?limit=10`);
    
    if (!getResponse.ok) {
      console.error('❌ Erreur HTTP:', getResponse.status, getResponse.statusText);
      const text = await getResponse.text();
      console.error('Réponse:', text);
      console.log('\n💡 Assure-toi que:');
      console.log('  - Le serveur dev tourne sur le port 3000');
      console.log('  - Tu es bien dans le dossier /game');
      return;
    }

    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log('✅ API GET fonctionne!');
      console.log('📊 Nombre de soumissions:', getData.data?.total || 0);
      
      if (getData.data?.submissions && getData.data.submissions.length > 0) {
        console.log('\n📝 Dernières soumissions:');
        getData.data.submissions.slice(0, 5).forEach((sub, i) => {
          console.log(`  ${i + 1}. ${sub.emoji} "${sub.text}" - ${sub.timeAgo}`);
        });
      } else {
        console.log('📝 Aucune soumission pour le moment');
        console.log('💡 C\'est normal si la table vient d\'être créée');
      }
    } else {
      console.error('❌ Réponse API avec succès=false');
      console.error('Réponse complète:', JSON.stringify(getData, null, 2));
    }

  } catch (err) {
    console.error('❌ Erreur lors de l\'appel GET:', err.message);
    console.log('\n💡 Le serveur dev est-il démarré ?');
    console.log('   Lance: npm run dev');
    return;
  }

  // Test 2: POST - Ajouter une soumission
  console.log('\n\n2️⃣ Test POST /api/flagornot/community');
  console.log('─────────────────────────────────────\n');

  const testSubmission = {
    text: `Test automatique du ${new Date().toLocaleString('fr-FR')}`,
    verdict: Math.random() > 0.5 ? 'red' : 'green'
  };

  console.log('📤 Envoi de:', testSubmission);

  try {
    const postResponse = await fetch(`${BASE_URL}/api/flagornot/community`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubmission)
    });

    if (!postResponse.ok) {
      console.error('❌ Erreur HTTP:', postResponse.status);
      const text = await postResponse.text();
      console.error('Réponse:', text);
      return;
    }

    const postData = await postResponse.json();
    
    if (postData.success) {
      console.log('✅ POST fonctionne!');
      console.log('📊 Réponse:', postData);
      
      if (postData.data?.saved === false) {
        console.log('\n⚠️  La soumission n\'a pas été sauvegardée');
        console.log('Raison:', postData.data.reason || 'inconnue');
        
        if (postData.data.reason === 'storage_unavailable') {
          console.log('\n💡 La table n\'existe probablement pas dans Supabase!');
          console.log('Solution:');
          console.log('  1. Va sur https://supabase.com/dashboard');
          console.log('  2. Sélectionne ton projet');
          console.log('  3. Va dans "SQL Editor"');
          console.log('  4. Copie-colle et exécute:');
          console.log('     supabase/migrations/004_flagornot_submissions.sql');
        }
      } else {
        console.log('✅ Soumission enregistrée dans Supabase!');
      }
    } else {
      console.error('❌ Réponse API avec succès=false');
      console.error('Réponse:', JSON.stringify(postData, null, 2));
    }

  } catch (err) {
    console.error('❌ Erreur lors de l\'appel POST:', err.message);
  }

  // Test 3: Vérifier que la soumission apparaît
  console.log('\n\n3️⃣ Vérification: La soumission apparaît-elle ?');
  console.log('─────────────────────────────────────\n');

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Attendre un peu
    
    const verifyResponse = await fetch(`${BASE_URL}/api/flagornot/community?limit=5`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.data?.submissions) {
      const foundTest = verifyData.data.submissions.find(s => 
        s.text.includes('Test automatique')
      );
      
      if (foundTest) {
        console.log('✅ La soumission test apparaît bien dans la liste!');
        console.log('📊', foundTest.emoji, foundTest.text);
      } else {
        console.log('⚠️  La soumission test n\'apparaît pas');
        console.log('Dernières soumissions:');
        verifyData.data.submissions.slice(0, 3).forEach(s => {
          console.log('  -', s.emoji, s.text);
        });
      }
    }
  } catch (err) {
    console.error('❌ Erreur de vérification:', err.message);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ Tests terminés!');
  console.log('═══════════════════════════════════════════════════\n');
}

// Vérifier si le serveur répond avant de lancer les tests
async function checkServer() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 404; // 404 is fine, means server is up
  } catch {
    return false;
  }
}

async function main() {
  const serverUp = await checkServer();
  
  if (!serverUp) {
    console.error('❌ Le serveur dev ne répond pas sur', BASE_URL);
    console.log('\n💡 Lance d\'abord:');
    console.log('   cd /Users/mac-Z27CZERK/elogame20fev/game');
    console.log('   npm run dev');
    console.log('\nPuis relance ce script.');
    process.exit(1);
  }

  await testAPI();
}

main();
