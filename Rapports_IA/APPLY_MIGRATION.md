# Guide d'Application de la Migration 006

## Migration 006: Ajout des 54 nouveaux métiers/professions (Bureau)

Cette migration ajoute 54 nouveaux éléments à la catégorie "bureau" avec contexte amélio.

**Date**: 22 février 2026
**Fichier**: `supabase/migrations/006_add_professions_bureau.sql`

### Option 1: Via Supabase Studio (Interface Web) - **RECOMMANDÉ**

1. Accédez à: https://app.supabase.com
2. Sélectionnez votre projet
3. Allez à **SQL Editor** → **New Query**
4. Copiez le contenu du fichier `supabase/migrations/006_add_professions_bureau.sql`
5. Collez la requête dans l'éditeur
6. Cliquez **Run** (ou Ctrl+Enter)

**Résultat attendu**: 
```
INSERT 0 54
SELECT 1
```

### Option 2: Via Supabase CLI

```bash
cd game
npx supabase db push
```

Cela appliquera toute migration non appliquée depuis `supabase/migrations/`.

### Option 3: Via Node.js Script (Direct SQL Execution)

```bash
cd game
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const sql = fs.readFileSync('supabase/migrations/006_add_professions_bureau.sql', 'utf8');
  const { error } = await supabase.rpc('sql', { query: sql });
  if (error) console.error('Migration failed:', error);
  else console.log('✅ Migration 006 applied successfully');
})();
"
```

## Changements apportés

### 🌙 Textes améliorés (Arts & Bohème) - IMPORTANT

Les professions créatives ont maintenant du contexte pour mieux expliquer le "red flag":

| Ancienne version | Nouvelle version |
|---|---|
| `Être photographe de mode` | `Être photographe de mode (carrière basée sur le réseau, pas stable)` |
| `Être mannequin` | `Être mannequin (beauté éphémère, consommation émotionnelle)` |
| `Être intermittent du spectacle` | `Être intermittent du spectacle (sans assurance maladie, zéro stabilité)` |
| `Être comédien de stand-up` | `Être comédien de stand-up (rejet constant, trac permanent)` |
| `Être musicien indépendant` | `Être musicien indépendant (galérien avec un rêve)` |

**Total**: 54 éléments ajoutés, organisés en 6 thèmes.

## Vérification

Après migration, vérifiez le nombre total d'éléments dans la catégorie "bureau":

```sql
SELECT categorie, COUNT(*) as count 
FROM elements 
WHERE categorie = 'bureau' 
GROUP BY categorie;
```

Résultat attendu: Entre 60-70 éléments (combien avant + 54 nouveaux).

## Rollback (Si nécessaire)

Si la migration cause un problème:

```sql
DELETE FROM elements 
WHERE categorie = 'bureau' 
AND texte LIKE '%trader%' OR texte LIKE '%TikTokeur%' OR texte LIKE '%DJ en%'
-- ... etc
```

Ou simplement: restaurer depuis un snapshot Supabase antérieur.

---

**Note**: Les changements sont aussi en `src/lib/mockData.ts` pour le mode développement avec `NEXT_PUBLIC_MOCK_MODE=true`.
