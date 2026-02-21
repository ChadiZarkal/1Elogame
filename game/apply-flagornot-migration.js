#!/usr/bin/env node

/**
 * Script pour appliquer la migration flagornot_submissions sur Supabase
 * Usage: node apply-flagornot-migration.js
 */

const fs = require('fs');
const path = require('path');

// ⚠️ IMPORTANT: Remplace ces valeurs par tes propres credentials Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jcrtkvoxizrfttzerhfp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

async function applyMigration() {
  console.log('🚀 Application de la migration flagornot_submissions...\n');

  // Lire le fichier SQL
  const migrationPath = path.join(__dirname, 'supabase/migrations/004_flagornot_submissions.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Fichier de migration introuvable:', migrationPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Fichier de migration chargé:', migrationPath);
  console.log('📊 Contenu SQL:', sqlContent.length, 'caractères\n');

  // Exécuter la migration via l'API Supabase
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur lors de l\'application de la migration:');
      console.error(error);
      console.log('\n💡 Alternative: Copie le contenu du fichier SQL et applique-le manuellement dans le SQL Editor de Supabase');
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Migration appliquée avec succès!');
    console.log('📊 Résultat:', result);
    
    console.log('\n✨ La table flagornot_submissions est maintenant créée!');
    console.log('🎯 Tu peux vérifier dans le dashboard Supabase > Table Editor');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 MÉTHODE ALTERNATIVE (recommandée):');
    console.log('1. Va sur https://supabase.com/dashboard');
    console.log('2. Sélectionne ton projet');
    console.log('3. Va dans "SQL Editor"');
    console.log('4. Crée une nouvelle query');
    console.log('5. Copie-colle le contenu de:', migrationPath);
    console.log('6. Clique sur "Run" pour exécuter\n');
  }
}

// Vérifier que les credentials sont configurés
if (SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_SERVICE_ROLE_KEY')) {
  console.error('❌ ERREUR: Service role key non configurée!\n');
  console.log('📝 Deux options:\n');
  console.log('Option 1 - Via variables d\'environnement:');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="ta_clé_ici"');
  console.log('  node apply-flagornot-migration.js\n');
  console.log('Option 2 - Manuellement dans le dashboard Supabase (RECOMMANDÉ):');
  console.log('  1. Va sur https://supabase.com/dashboard');
  console.log('  2. Sélectionne ton projet');
  console.log('  3. Va dans "SQL Editor"');
  console.log('  4. Crée une nouvelle query');
  console.log('  5. Copie-colle le contenu de: supabase/migrations/004_flagornot_submissions.sql');
  console.log('  6. Clique sur "Run" ✨\n');
  process.exit(1);
}

applyMigration();
