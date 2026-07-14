-- Migration 015: Reduce to 2 categories (sexe, quotidien) + add tags system
-- Date: 14 juillet 2026
--
-- Changes:
-- 1. Add tags text[] column with GIN index
-- 2. Auto-tag all elements by content pattern
-- 3. Move sexual/romantic metiers elements → sexe
-- 4. Move all remaining metiers elements → quotidien
-- 5. Update CHECK constraint to allow only (sexe, quotidien)

-- ─── Step 1: tags column ───────────────────────────────────────────────────────
ALTER TABLE elements ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS elements_tags_gin ON elements USING GIN(tags);

-- ─── Step 2: Tag existing elements by content ──────────────────────────────────

-- All metiers elements → tag 'metier'
UPDATE elements SET tags = array_append(tags, 'metier') WHERE categorie = 'metiers';

-- Hygiene
UPDATE elements SET tags = array_append(tags, 'hygiene')
WHERE texte ~* 'haleine|brosser les dents|tirer la chasse|crottes de nez|cracher par terre|ongles longs';

-- Money / finance
UPDATE elements SET tags = array_append(tags, 'argent')
WHERE texte ~* 'crypto|bitcoin|trader|radin|addition au centime|investisseur|MLM|dropshipping|patrimoine|fiscali|impôts|fortune';

-- Digital / social media / tech
UPDATE elements SET tags = array_append(tags, 'numerique')
WHERE texte ~* 'TikTok|Instagram|OnlyFans|MYM|LinkedIn|Slack|Teams|streamer|gamer|jeux vidéo|influenceur|Intelligence Artificielle|community manager|YouTube|contenu en ligne|Métavers';

-- Sport / fitness
UPDATE elements SET tags = array_append(tags, 'sport')
WHERE texte ~* 'muscu|workout|sport|gym|ski|surf|fitness|coach sportif|personal trainer|marathon|trail';

-- Food / eating behaviors
UPDATE elements SET tags = array_append(tags, 'nourriture')
WHERE texte ~* 'manger|bouffe|repas|frigo|micro.onde|vegan|végétar|roter|poisson';

-- Emotional maturity
UPDATE elements SET tags = array_append(tags, 'emotionnel')
WHERE texte ~* 'burnout|jaloux|colère|toxique|manipulation|ghoste|narcissique|anxieux|dépression';

-- Transport / road behaviors
UPDATE elements SET tags = array_append(tags, 'transport')
WHERE texte ~* 'transport|klaxon|atterrissage|avion|feu vert|poids lourd|marin pêcheur|routier';

-- Political / social commentary
UPDATE elements SET tags = array_append(tags, 'politique')
WHERE texte ~* 'politicien|lobbyi|militant|diplomate|huissier|inspecteur des impôts|fonctionnaire';

-- Couple / romantic (add to existing sexe + some that cross over)
UPDATE elements SET tags = array_append(tags, 'couple')
WHERE texte ~* 'son ex|ses ex|son/sa partenaire|premier date|premier soir|stalker|ghoste|sexting|nude|porno|chaussettes.*amour|coucher avec|draguer.*(collègu|boss)|relation longue distance|polyamour';

-- ─── Step 3: Move sexual metiers behaviors → sexe ──────────────────────────────
UPDATE elements SET categorie = 'sexe', updated_at = NOW()
WHERE categorie = 'metiers'
AND texte ~* 'coucher avec.*(boss|chef)|draguer.*(collègu|boss|chef)';

-- ─── Step 4: Move all remaining metiers → quotidien ───────────────────────────
UPDATE elements SET categorie = 'quotidien', updated_at = NOW()
WHERE categorie = 'metiers';

-- ─── Step 5: Update CHECK constraint ──────────────────────────────────────────
ALTER TABLE elements DROP CONSTRAINT IF EXISTS elements_categorie_check;
ALTER TABLE elements ADD CONSTRAINT elements_categorie_check
  CHECK (categorie IN ('sexe', 'quotidien'));

-- ─── Verify ────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  remaining_metiers int;
BEGIN
  SELECT COUNT(*) INTO remaining_metiers FROM elements WHERE categorie = 'metiers';
  IF remaining_metiers > 0 THEN
    RAISE EXCEPTION 'Migration 015 FAILED: % elements still have metiers category', remaining_metiers;
  END IF;
  RAISE NOTICE 'Migration 015 OK: 0 metiers elements remain';
END $$;

SELECT categorie, COUNT(*) AS count FROM elements GROUP BY categorie ORDER BY count DESC;
SELECT unnest(tags) AS tag, COUNT(*) AS count
  FROM elements WHERE tags != '{}'
  GROUP BY tag ORDER BY count DESC;
