# Migration des Catégories - Janvier 2026

## 📋 Résumé des changements

Refonte complète du système de catégories avec 4 nouvelles catégories thématiques et ~200 nouveaux éléments.

## 🎯 Nouvelles Catégories

### 🔥 Sexe & Kinks
Relations, dating, intimité, préférences sexuelles
- **Exemples**: Ghoster après le premier date, Aimer les pieds, Avoir un compte OnlyFans
- **Nombre d'éléments**: ~50
- **Niveaux de provocation**: 2-5

### 🎯 Lifestyle  
Hobbies, passions, sport, activités
- **Exemples**: Être un go muscu, Être fan d'animés, Être cryptobro, Vivre en van
- **Nombre d'éléments**: ~50
- **Niveaux de provocation**: 1-3

### 🤷 Quotidien
Comportements et habitudes du quotidien
- **Exemples**: Porter des Crocs, Applaudir à l'atterrissage, Être radin, Manger ses crottes de nez
- **Nombre d'éléments**: ~50
- **Niveaux de provocation**: 1-4

### 💼 Bureau
Comportements et attitudes au travail
- **Exemples**: Travailler le dimanche, Adorer les afterworks, Chauffer du poisson au micro-ondes
- **Nombre d'éléments**: ~50  
- **Niveaux de provocation**: 2-4

## 📊 Migration des anciennes catégories

| Ancienne | Nouvelle | Logique |
|----------|----------|---------|
| `comportement` | `sexe` / `quotidien` | Relations → sexe, Autres → quotidien |
| `trait` | `quotidien` | Traits de personnalité → comportements quotidiens |
| `metier` | `bureau` | Métiers et comportements professionnels |
| `preference` | `lifestyle` | Préférences personnelles → style de vie |
| `absurde` | `quotidien` | Comportements bizarres → quotidien |

## 🗂️ Fichiers modifiés

### Configuration
- ✅ `src/config/categories.ts` - Nouvelles catégories
- ✅ `src/types/database.ts` - Types TypeScript
- ✅ `src/lib/validations.ts` - Schémas Zod
- ✅ `src/lib/mockData.ts` - Données de test

### Base de données
- ✅ `supabase/migrations/002_new_categories.sql` - Migration SQL complète

## 🚀 Comment appliquer la migration

### Option 1: Interface Supabase (Recommandé)

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/jcrtkvoxizrfttzerhfp/editor)
2. Ouvrez l'éditeur SQL
3. Copiez le contenu de `supabase/migrations/002_new_categories.sql`
4. Exécutez la requête
5. Vérifiez les résultats dans l'éditeur de table

### Option 2: Script shell

```bash
cd game
chmod +x apply-new-categories.sh
./apply-new-categories.sh
```

### Option 3: psql

```bash
psql postgresql://postgres:[PASSWORD]@db.jcrtkvoxizrfttzerhfp.supabase.co:5432/postgres \
  < supabase/migrations/002_new_categories.sql
```

## ⚠️ ATTENTION

**Cette migration va SUPPRIMER toutes les données actuelles !**

- Les anciens éléments seront perdus
- Les votes et statistiques seront conservés (mais références peuvent être cassées)
- Les scores ELO repartiront à 1000

### Sauvegarde recommandée avant migration

```sql
-- Sauvegarder les éléments actuels
CREATE TABLE elements_backup AS SELECT * FROM elements;

-- Sauvegarder les votes
CREATE TABLE votes_backup AS SELECT * FROM votes;
```

## 📈 Contenu des nouvelles catégories

### Sexe & Kinks (~50 éléments)
- Relations & Dating (10 éléments)
- Intimité & Préférences (10 éléments)  
- Kinks & Fantasmes (10 éléments)
- + 20 éléments supplémentaires

### Lifestyle (~50 éléments)
- Sport & Fitness (10 éléments)
- Tech & Gaming (10 éléments)
- Culture & Loisirs (10 éléments)
- Musique & Sorties (10 éléments)
- Passions diverses (10 éléments)

### Quotidien (~50 éléments)
- Hygiène & Apparence (10 éléments)
- Comportements sociaux (10 éléments)
- Habitudes bizarres (10 éléments)
- Argent & Radinerie (10 éléments)
- Nourriture (10 éléments)

### Bureau (~50 éléments)
- Culture d'entreprise (10 éléments)
- Relations professionnelles (10 éléments)
- Ambiance & Productivité (10 éléments)
- Carrière & Ambition (10 éléments)
- Types de jobs (10 éléments)

## ✅ Tests

Après la migration, vérifiez :

1. **Nombre d'éléments**
```sql
SELECT COUNT(*) as total FROM elements;
-- Devrait retourner ~200
```

2. **Répartition par catégorie**
```sql
SELECT categorie, COUNT(*) as count 
FROM elements 
GROUP BY categorie 
ORDER BY count DESC;
-- Devrait montrer ~50 éléments par catégorie
```

3. **Test dans l'application**
- Chargez `/jeu/jouer`
- Testez le filtre par catégorie
- Vérifiez que les duels s'affichent correctement

## 🎨 UI/UX

Les émojis de catégories sont maintenant :
- 🔥 Sexe & Kinks (rouge)
- 🎯 Lifestyle (violet)
- 🤷 Quotidien (vert)
- 💼 Bureau (bleu)

## 📝 Notes de développement

- Les anciens fichiers de migration restent pour référence
- Le mode mock (`NEXT_PUBLIC_MOCK_MODE=true`) fonctionne avec les nouvelles catégories
- Les types TypeScript sont à jour
- La validation Zod est mise à jour

## 🔄 Rollback

Si besoin de revenir en arrière :

```sql
-- Restaurer depuis la sauvegarde
TRUNCATE TABLE elements CASCADE;
INSERT INTO elements SELECT * FROM elements_backup;

-- Ou réexécuter la migration 001
-- Mais vous perdrez les nouvelles données
```

## 🐛 Problèmes connus

Aucun pour le moment. Si vous rencontrez un problème :
1. Vérifiez les logs de l'application
2. Vérifiez que tous les types sont à jour
3. Redémarrez le serveur Next.js

## 📞 Support

En cas de problème, contactez le développeur ou ouvrez une issue sur GitHub.

---

**Date de migration**: 25 janvier 2026  
**Version**: 2.0.0  
**Statut**: ✅ Prêt pour production
