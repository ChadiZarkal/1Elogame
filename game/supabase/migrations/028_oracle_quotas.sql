-- ===========================================================================
-- 028 — L'Oracle : des quotas partagés, et un plafond d'appels à l'IA
--
-- POURQUOI EN BASE
--   Chaque verdict de l'Oracle coûte un appel à Gemini (ou à OpenAI en
--   secours). La seule limite était un compteur en mémoire du serveur ; sur
--   Vercel, chaque instance a la sienne, et la limite repartait de zéro d'une
--   instance à l'autre. Un compteur en base est le même pour toutes.
--
-- CE QUE LA FONCTION DÉCIDE
--   · 'refuse' : cette adresse a dépassé sa limite (minute ou jour) ;
--   · 'local'  : le plafond quotidien d'appels à l'IA est atteint — l'Oracle
--                répond quand même, avec son juge local, qui ne coûte rien ;
--   · 'ia'     : l'appel à l'IA est autorisé.
--
--   Le plafond global est ce qui borne la facture : un spam venu de milliers
--   d'adresses différentes passe les limites par adresse, pas celui-là.
--
-- AUCUNE ADRESSE IP EN CLAIR
--   Le serveur n'envoie qu'une empreinte de l'adresse, et les lignes expirées
--   sont effacées au fil de l'eau.
--
-- Aucune table existante n'est touchée.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS oracle_quotas (
  cle        TEXT        PRIMARY KEY,
  compteur   INTEGER     NOT NULL,
  fin        TIMESTAMPTZ NOT NULL
);

-- Lue et écrite par la fonction seule : RLS actif, aucune politique.
ALTER TABLE oracle_quotas ENABLE ROW LEVEL SECURITY;

-- Incrémente un compteur à fenêtre fixe et rend sa nouvelle valeur.
CREATE OR REPLACE FUNCTION oracle_incrementer(p_cle TEXT, p_fenetre INTERVAL)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO oracle_quotas (cle, compteur, fin)
  VALUES (p_cle, 1, now() + p_fenetre)
  ON CONFLICT (cle) DO UPDATE SET
    compteur = CASE WHEN oracle_quotas.fin < now() THEN 1 ELSE oracle_quotas.compteur + 1 END,
    fin      = CASE WHEN oracle_quotas.fin < now() THEN now() + p_fenetre ELSE oracle_quotas.fin END
  RETURNING compteur;
$$;

CREATE OR REPLACE FUNCTION oracle_consommer(
  p_empreinte    TEXT,
  p_par_minute   INTEGER,
  p_par_jour     INTEGER,
  p_plafond_ia   INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ménage occasionnel : une requête sur cent efface ce qui a expiré.
  IF random() < 0.01 THEN
    DELETE FROM oracle_quotas WHERE fin < now() - INTERVAL '1 hour';
  END IF;

  IF oracle_incrementer('ip-minute:' || p_empreinte, INTERVAL '1 minute') > p_par_minute THEN
    RETURN 'refuse';
  END IF;

  IF oracle_incrementer('ip-jour:' || p_empreinte, INTERVAL '1 day') > p_par_jour THEN
    RETURN 'refuse';
  END IF;

  -- Le plafond se compte sur le jour civil (UTC), pour se lire simplement :
  -- « 500 appels aujourd'hui ».
  IF oracle_incrementer('ia-jour:' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'), INTERVAL '2 days') > p_plafond_ia THEN
    RETURN 'local';
  END IF;

  RETURN 'ia';
END;
$$;

-- Réservées au serveur, qui appelle la base avec la clé service_role.
REVOKE ALL ON FUNCTION oracle_incrementer(TEXT, INTERVAL) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION oracle_consommer(TEXT, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION oracle_consommer(TEXT, INTEGER, INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION oracle_consommer IS
  'Quotas de l''Oracle : refuse (limite par adresse), local (plafond IA du jour atteint), ia.';
