#!/usr/bin/env node

/**
 * Script pour peupler la table flagornot_submissions avec des données de test
 * Usage: node populate-test-data.js
 * 
 * IMPORTANT: Lance d'abord le serveur dev: npm run dev
 */

const BASE_URL = 'http://localhost:3000';

const TEST_SUBMISSIONS = [
  { text: "Il regarde ton téléphone sans demander", verdict: "red" },
  { text: "Elle te dit bonjour chaque matin", verdict: "green" },
  { text: "Il like les photos de son ex", verdict: "red" },
  { text: "Elle se souvient de ton anniversaire", verdict: "green" },
  { text: "Il annule au dernier moment", verdict: "red" },
  { text: "Elle te présente à ses amis", verdict: "green" },
  { text: "Il répond pas pendant 3 jours", verdict: "red" },
  { text: "Elle prend de tes nouvelles", verdict: "green" },
  { text: "Il te ghoste après un date", verdict: "red" },
  { text: "Elle te fait des surprises", verdict: "green" },
  { text: "Il check tes stories en premier", verdict: "green" },
  { text: "Elle te demande ton avis", verdict: "green" },
];

async function populateData() {
  console.log('🌱 Peuplement de la table flagornot_submissions\n');
  console.log(`📊 ${TEST_SUBMISSIONS.length} soumissions à ajouter...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const [index, submission] of TEST_SUBMISSIONS.entries()) {
    try {
      const response = await fetch(`${BASE_URL}/api/flagornot/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.saved) {
        successCount++;
        const emoji = submission.verdict === 'red' ? '🚩' : '🟢';
        console.log(`✅ ${index + 1}/${TEST_SUBMISSIONS.length} ${emoji} "${submission.text}"`);
      } else {
        errorCount++;
        console.log(`⚠️  ${index + 1}/${TEST_SUBMISSIONS.length} Non sauvegardé: "${submission.text}"`);
      }

      // Petit délai pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      errorCount++;
      console.error(`❌ ${index + 1}/${TEST_SUBMISSIONS.length} Erreur: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RÉSULTAT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📊 Total: ${TEST_SUBMISSIONS.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (successCount > 0) {
    console.log('🎉 Données de test ajoutées avec succès!');
    console.log('\n💡 Va maintenant sur http://localhost:3000/flagornot');
    console.log('   pour voir les suggestions communautaires s\'afficher!\n');
  }
}

async function checkServer() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 404;
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

  await populateData();
}

main();
