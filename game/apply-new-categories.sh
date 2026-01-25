#!/bin/bash

# Script pour appliquer les nouvelles catégories à la base Supabase
# Usage: ./apply-new-categories.sh

echo "🔄 Application de la migration des catégories..."
echo ""

# Charger les variables d'environnement
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement manquantes"
    echo "Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local"
    exit 1
fi

echo "📝 Lecture du fichier de migration..."
MIGRATION_FILE="supabase/migrations/002_new_categories.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erreur: Fichier de migration introuvable: $MIGRATION_FILE"
    exit 1
fi

echo "🚀 Exécution de la migration sur Supabase..."
echo ""

# Lire le fichier SQL
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Exécuter via l'API Supabase
# Note: Ceci nécessite que vous ayez configuré l'accès à votre base de données
# Vous devrez peut-être utiliser psql ou l'interface Supabase directement

echo "⚠️  ATTENTION:"
echo "Cette migration va:"
echo "  1. Supprimer TOUTES les données actuelles (TRUNCATE)"
echo "  2. Créer ~200 nouveaux éléments avec les nouvelles catégories"
echo ""
echo "Les nouvelles catégories sont:"
echo "  🔥 Sexe & Kinks"
echo "  🎯 Lifestyle"
echo "  🤷 Quotidien"
echo "  💼 Bureau"
echo ""
read -p "Voulez-vous continuer? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Migration annulée"
    exit 0
fi

echo ""
echo "📋 Instructions pour appliquer la migration:"
echo ""
echo "1. Allez sur: https://supabase.com/dashboard/project/jcrtkvoxizrfttzerhfp/editor"
echo "2. Ouvrez l'éditeur SQL"
echo "3. Copiez-collez le contenu du fichier: $MIGRATION_FILE"
echo "4. Exécutez la requête"
echo ""
echo "Ou utilisez psql:"
echo ""
echo "psql postgresql://postgres:[YOUR-PASSWORD]@db.jcrtkvoxizrfttzerhfp.supabase.co:5432/postgres < $MIGRATION_FILE"
echo ""
echo "✅ Migration préparée!"
