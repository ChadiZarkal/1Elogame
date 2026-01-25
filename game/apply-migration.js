#!/usr/bin/env node

/**
 * Script pour appliquer la migration des nouvelles catégories sur Supabase
 * Usage: node apply-migration.js
 */

const SUPABASE_URL = 'https://jcrtkvoxizrfttzerhfp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_7ZAxXacuWO8UXc1BnikJTA_L6aFmGoy';

// Les nouvelles données à insérer
const newElements = [
  // ========================================
  // CATÉGORIE: SEXE & KINKS (🔥) - 30 éléments
  // ========================================
  
  // Relations & Dating
  { texte: "Préférer les relations longues distances", categorie: "sexe", niveau_provocation: 2 },
  { texte: "N'avoir que des plans cul", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Être poly-amoureux", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Ghoster après le premier date", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Stalker les ex sur Instagram", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Ramener quelqu'un chez soi le premier soir", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Demander un date au McDo", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Partager sa localisation H24 avec son/sa partenaire", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Checker le téléphone de son/sa partenaire", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Appeler son ex quand on est bourré", categorie: "sexe", niveau_provocation: 3 },
  
  // Intimité & Préférences
  { texte: "Aimer les pieds", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Avoir un fétiche bizarre", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Faire du sexting avec des inconnus", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Avoir un compte OnlyFans", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Mater du porno en couple", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Utiliser des sex toys", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Faire l'amour avec les chaussettes", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Préférer le matin au soir", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Dire \"je t'aime\" pendant l'acte", categorie: "sexe", niveau_provocation: 2 },
  { texte: "Ne jamais embrasser", categorie: "sexe", niveau_provocation: 3 },
  
  // Kinks & Fantasmes
  { texte: "Aimer être dominé(e)", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Aimer dominer", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Vouloir faire un trio", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Fantasmer sur les uniformes", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Aimer le dirty talk", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Envoyer des nudes", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Demander des nudes", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Rouler des pelles en public", categorie: "sexe", niveau_provocation: 3 },
  { texte: "Faire l'amour dans des lieux publics", categorie: "sexe", niveau_provocation: 4 },
  { texte: "Avoir une sex tape", categorie: "sexe", niveau_provocation: 4 },
  
  // ========================================
  // CATÉGORIE: LIFESTYLE (🎯) - 40 éléments
  // ========================================
  
  // Sport & Fitness
  { texte: "Être un go muscu", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Ne jamais faire de sport", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Poster ses workouts sur Instagram", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Compter ses macros", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Faire du crossfit", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Courir des marathons", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Faire du yoga tous les jours", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Être accro à la salle de sport", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Ne manger que de la whey", categorie: "lifestyle", niveau_provocation: 3 },
  { texte: "Porter des leggings H24", categorie: "lifestyle", niveau_provocation: 2 },
  
  // Tech & Gaming
  { texte: "Être geek hardcore", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Jouer aux jeux vidéo 10h par jour", categorie: "lifestyle", niveau_provocation: 3 },
  { texte: "Être fan d'e-sport", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Avoir un setup gaming RGB", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Streamer sur Twitch", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Coder pendant son temps libre", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Être cryptobro", categorie: "lifestyle", niveau_provocation: 3 },
  { texte: "Investir dans les NFT", categorie: "lifestyle", niveau_provocation: 3 },
  { texte: "Miner de la crypto", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Avoir 10 écrans", categorie: "lifestyle", niveau_provocation: 2 },
  
  // Culture & Loisirs
  { texte: "Être fan d'animés", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Regarder des séries en VO", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Lire des mangas", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Collectionner des figurines", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Aller à des conventions", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Cosplayer", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Regarder uniquement des films d'auteur", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Ne regarder que des blockbusters", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Être accro aux séries Netflix", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Binge-watcher des séries en une nuit", categorie: "lifestyle", niveau_provocation: 2 },
  
  // Musique & Sorties
  { texte: "Écouter du metal", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Écouter de la country", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Être fan de rap français", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "N'écouter que de la techno", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Aller en boîte tous les weekends", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Être DJ", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Jouer de la guitare dans un groupe", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Chanter sous la douche", categorie: "lifestyle", niveau_provocation: 1 },
  { texte: "Faire du karaoké bourré", categorie: "lifestyle", niveau_provocation: 2 },
  { texte: "Aller à tous les festivals", categorie: "lifestyle", niveau_provocation: 2 },
  
  // ========================================
  // CATÉGORIE: QUOTIDIEN (🤷) - 50 éléments
  // ========================================
  
  // Hygiène & Apparence
  { texte: "Avoir les ongles longs", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Porter des Crocs", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Ne jamais se couper les ongles des pieds", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Se laver une fois par semaine", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Réutiliser ses sous-vêtements 3 jours", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Ne jamais se brosser les dents le matin", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Avoir une haleine de chacal", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Porter les mêmes fringues 3 jours", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Ne jamais se parfumer", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Mettre trop de parfum", categorie: "quotidien", niveau_provocation: 2 },
  
  // Comportements sociaux
  { texte: "Parler fort dans les transports", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Mettre sa musique sans écouteurs", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Couper la parole tout le temps", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Ne jamais dire merci", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Ne jamais dire bonjour", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Applaudir à l'atterrissage", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Klaxonner 2 secondes après le feu vert", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Doubler dans les files d'attente", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Manger bruyamment", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Mâcher la bouche ouverte", categorie: "quotidien", niveau_provocation: 3 },
  
  // Habitudes bizarres
  { texte: "Manger ses crottes de nez", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Roter à table", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Péter en public", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Ne jamais tirer la chasse", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Pisser sous la douche", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Parler tout seul", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Parler à ses plantes", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Se gratter les parties intimes en public", categorie: "quotidien", niveau_provocation: 4 },
  { texte: "Renifler ses vêtements pour savoir si c'est propre", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Cracher par terre", categorie: "quotidien", niveau_provocation: 4 },
  
  // Argent & Radinerie
  { texte: "Être radin", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Jamais payer sa tournée", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Diviser l'addition au centime près", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Voler le PQ au resto", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Ramener des trucs du buffet dans son sac", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Négocier chez Décathlon", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Demander une réduction partout", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Ne jamais laisser de pourboire", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Récupérer les échantillons gratuits", categorie: "quotidien", niveau_provocation: 1 },
  { texte: "Frauder dans les transports", categorie: "quotidien", niveau_provocation: 3 },
  
  // Nourriture
  { texte: "Aimer l'ananas sur la pizza", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Manger ses céréales avec de l'eau", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Mettre du ketchup sur tout", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Manger de la mayonnaise à la cuillère", categorie: "quotidien", niveau_provocation: 3 },
  { texte: "Tremper ses frites dans le milkshake", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Manger des pâtes sans sauce", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Mettre du lait avant les céréales", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Manger de la pizza froide au petit-dej", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Finir les assiettes des autres", categorie: "quotidien", niveau_provocation: 2 },
  { texte: "Lécher son assiette", categorie: "quotidien", niveau_provocation: 3 },
  
  // ========================================
  // CATÉGORIE: BUREAU (💼) - 50 éléments
  // ========================================
  
  // Culture d'entreprise
  { texte: "Travailler le dimanche", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Répondre aux emails à 23h", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être en télétravail 100%", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Venir au bureau en pyjama", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Ne jamais prendre de congés", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Poser un RTT le lundi", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être en burnout permanent", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Faire semblant de travailler", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Arriver en retard tous les jours", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Partir à 17h pile", categorie: "bureau", niveau_provocation: 2 },
  
  // Relations professionnelles
  { texte: "Adorer les afterworks", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Éviter tous les afterworks", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Draguer les collègues", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Coucher avec son boss", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Balancer ses collègues", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Voler la bouffe des autres au frigo", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Ne jamais faire le café", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Organiser des pots toutes les semaines", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Critiquer son boss sur Slack", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Ghoster les réunions Teams", categorie: "bureau", niveau_provocation: 2 },
  
  // Ambiance & Productivité
  { texte: "Mettre de la musique sans casque au bureau", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Manger des trucs qui puent au bureau", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Chauffer du poisson au micro-ondes", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Parler fort au téléphone en open space", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Organiser des réunions inutiles", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Envoyer 50 messages Slack par jour", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Ne jamais lire ses emails", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Mettre \"CC\" à toute la boîte", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Procrastiner sur LinkedIn", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Scroller TikTok en réunion", categorie: "bureau", niveau_provocation: 2 },
  
  // Carrière & Ambition
  { texte: "Être en reconversion à 40 ans", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Lancer sa startup", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être freelance galérien", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Faire semblant d'être entrepreneur", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Être influenceur LinkedIn", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Poster des citations motivantes", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être coach en développement personnel", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Vendre des formations bidons", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Faire du MLM", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Être dans la crypto H24", categorie: "bureau", niveau_provocation: 2 },
  
  // Types de jobs
  { texte: "Être policier", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être influenceur", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Être politicien", categorie: "bureau", niveau_provocation: 4 },
  { texte: "Être avocat fiscaliste", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être télévendeur", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Être serveur dans un fast-food", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être agent immobilier", categorie: "bureau", niveau_provocation: 3 },
  { texte: "Être DJ de mariage", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être community manager", categorie: "bureau", niveau_provocation: 2 },
  { texte: "Être recruteur IT", categorie: "bureau", niveau_provocation: 2 },
];

async function applyMigration() {
  console.log('🚀 Début de la migration des catégories vers Supabase...\n');
  console.log(`📊 Total d'éléments à insérer: ${newElements.length}\n`);
  
  try {
    // 1. D'abord, supprimer tous les éléments existants
    console.log('📦 Suppression des anciennes données...');
    
    // Utiliser une condition qui match tout (ou presque)
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/elements?actif=eq.true`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }
    );
    
    // Supprimer aussi les inactifs
    await fetch(
      `${SUPABASE_URL}/rest/v1/elements?actif=eq.false`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }
    );
    
    console.log('✅ Anciennes données supprimées\n');
    
    // 2. Insérer les nouveaux éléments par lots de 20
    console.log('📝 Insertion des nouveaux éléments...');
    
    const batchSize = 20;
    let insertedCount = 0;
    
    for (let i = 0; i < newElements.length; i += batchSize) {
      const batch = newElements.slice(i, i + batchSize);
      
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/elements`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(batch)
        }
      );
      
      if (insertResponse.ok) {
        insertedCount += batch.length;
        const progress = Math.round((insertedCount / newElements.length) * 100);
        console.log(`   📊 Progression: ${insertedCount}/${newElements.length} (${progress}%)`);
      } else {
        const errorText = await insertResponse.text();
        console.error(`❌ Erreur lors de l'insertion du lot ${Math.floor(i / batchSize) + 1}:`, errorText);
      }
    }
    
    // 3. Vérifier le résultat
    console.log('\n🔍 Vérification des données...');
    
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/elements?select=categorie`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      }
    );
    
    if (verifyResponse.ok) {
      const elements = await verifyResponse.json();
      
      // Compter par catégorie
      const counts = {};
      elements.forEach(el => {
        counts[el.categorie] = (counts[el.categorie] || 0) + 1;
      });
      
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║       📊 RÉSUMÉ DE LA MIGRATION         ║');
      console.log('╠════════════════════════════════════════╣');
      
      const categoryInfo = {
        'sexe': { emoji: '🔥', name: 'Sexe & Kinks' },
        'lifestyle': { emoji: '🎯', name: 'Lifestyle' },
        'quotidien': { emoji: '🤷', name: 'Quotidien' },
        'bureau': { emoji: '💼', name: 'Bureau' }
      };
      
      Object.entries(counts).forEach(([cat, count]) => {
        const info = categoryInfo[cat] || { emoji: '❓', name: cat };
        const line = `   ${info.emoji} ${info.name.padEnd(15)} │ ${String(count).padStart(3)} éléments`;
        console.log(line);
      });
      
      console.log('╠════════════════════════════════════════╣');
      console.log(`║   📦 TOTAL: ${String(elements.length).padStart(3)} éléments               ║`);
      console.log('╚════════════════════════════════════════╝');
      
      console.log('\n✅ Migration terminée avec succès !');
      console.log('🎮 Vous pouvez maintenant tester le jeu avec les nouvelles catégories.');
      
    } else {
      console.error('❌ Erreur lors de la vérification:', await verifyResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
applyMigration();
