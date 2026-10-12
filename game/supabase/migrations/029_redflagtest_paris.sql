-- ===========================================================================
-- 029 — Red Flag Test : le pari du joueur, et ce que chacun parie en moyenne
--
-- Avant la première question, le joueur devine son score. Le pari était gardé
-- dans le navigateur ; il est désormais enregistré avec la partie, pour
-- pouvoir dire au récap ce que les hommes et les femmes parient en moyenne —
-- et à quel score ils finissent vraiment.
--
-- La colonne est facultative : les parties d'avant n'en ont pas, et un joueur
-- peut passer le pari. Une partie de test n'est jamais enregistrée, son pari
-- non plus.
--
-- Aucune autre table n'est touchée.
-- ===========================================================================

ALTER TABLE rft_runs
  ADD COLUMN IF NOT EXISTS pari SMALLINT
  CHECK (pari BETWEEN 0 AND 120);

-- Par sexe, sur les seules parties où le joueur a parié : combien, le pari
-- moyen, et le score moyen qu'ils ont réellement obtenu. C'est le code appelant
-- qui décide si un groupe est assez fourni pour être cité.
CREATE OR REPLACE FUNCTION rft_paris_moyens()
RETURNS TABLE (sexe TEXT, effectif BIGINT, pari_moyen NUMERIC, score_moyen NUMERIC)
LANGUAGE sql STABLE AS $$
  SELECT sex, count(*), avg(pari), avg(score)
    FROM rft_runs
   WHERE pari IS NOT NULL AND sex IS NOT NULL
   GROUP BY sex;
$$;

COMMENT ON FUNCTION rft_paris_moyens IS
  'Pari moyen et score moyen des joueurs ayant parie, par sexe.';
