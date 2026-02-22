-- Migration pour ajouter les nouveaux métiers/professions à la catégorie BUREAU
-- Date: 22 février 2026
-- Ajout de professions dans 5 thèmes principaux

INSERT INTO elements (texte, categorie, niveau_provocation) VALUES

-- ========================================
-- 💸 La "Hustle Culture" & L'Argent
-- (Clivage fort Homme/Femme et Jeune/Ancien)
-- ========================================
('Être trader / Banquier d''affaires', 'bureau', 3),
('Être investisseur en cryptomonnaies (Crypto-bro)', 'bureau', 3),
('Être entrepreneur en dropshipping', 'bureau', 3),
('Être marchand de biens', 'bureau', 3),
('Être lobbyiste', 'bureau', 3),
('Être chasseur de têtes', 'bureau', 2),
('Être conseiller en gestion de patrimoine', 'bureau', 2),
('Être Business Angel (Investisseur)', 'bureau', 2),

-- ========================================
-- 📱 Le Numérique & L'Influence
-- (Clivage générationnel majeur)
-- ========================================
('Être TikTokeur', 'bureau', 3),
('Être streamer / Gamer professionnel', 'bureau', 3),
('Être créateur de contenu sur MYM / OnlyFans', 'bureau', 4),
('Être développeur en Intelligence Artificielle', 'bureau', 2),
('Être expert en cybersécurité (Hacker éthique)', 'bureau', 2),
('Être monteur vidéo pour Youtubeurs', 'bureau', 2),
('Être concepteur de mondes virtuels / Métavers', 'bureau', 2),
('Être testeur de jeux vidéo', 'bureau', 2),

-- ========================================
-- 🌙 La Nuit, les Arts & La Bohème
-- (Clivage sur le mode de vie)
-- ========================================
('Être DJ en boîte de nuit (horaires impossible pour fonder une famille)', 'bureau', 2),
('Être musicien indépendant (galérien avec un rêve)', 'bureau', 2),
('Être tatoueur / Perceur (carrière créative mais précaire)', 'bureau', 2),
('Être barman / Mixologue (salaire de misère + mains baladeuses)', 'bureau', 2),
('Être videur / Agent de sécurité (violence gratuite, bas salaire)', 'bureau', 2),
('Être photographe de mode (carrière basée sur le réseau, pas stable)', 'bureau', 2),
('Être mannequin (beauté éphémère, consommation émotionnelle)', 'bureau', 2),
('Être comédien de stand-up (rejet constant, trac permanent)', 'bureau', 2),
('Être intermittent du spectacle (sans assurance maladie, zéro stabilité)', 'bureau', 2),
('Être écrivain / Romancier à son compte (endettement garanti)', 'bureau', 2),

-- ========================================
-- 🛡️ L'Uniforme, le Danger & Le Physique
-- (Clivage fort Homme/Femme)
-- ========================================
('Être militaire', 'bureau', 2),
('Être pompier', 'bureau', 2),
('Être gardien de prison', 'bureau', 2),
('Être marin pêcheur', 'bureau', 2),
('Être chauffeur de poids lourd', 'bureau', 2),
('Être mécanicien automobile', 'bureau', 2),
('Être ouvrier dans le BTP', 'bureau', 2),
('Être moniteur de ski / de surf', 'bureau', 2),
('Être agriculteur / Éleveur', 'bureau', 2),

-- ========================================
-- 🧘 Croyances, Bien-être "Alternatif" & Lifestyle
-- (Clivage d'ouverture d'esprit)
-- ========================================
('Être astrologue / Tarologue', 'bureau', 3),
('Être naturopathe', 'bureau', 2),
('Être magnétiseur / Guérisseur', 'bureau', 3),
('Être professeur de yoga', 'bureau', 2),
('Être coach sportif / Personal Trainer', 'bureau', 2),
('Être chiropracteur', 'bureau', 2),
('Être conseiller en image / Relookeur', 'bureau', 2),
('Être guide spirituel', 'bureau', 3),
('Être décorateur d''intérieur', 'bureau', 2),
('Être organisateur d''événements (Wedding planner, etc.)', 'bureau', 2),

-- ========================================
-- ⚖️ Prestige, Pouvoir & Contraintes horaires
-- (Clivage sur la disponibilité)
-- ========================================
('Être chirurgien', 'bureau', 2),
('Être avocat pénaliste', 'bureau', 2),
('Être pilote de ligne', 'bureau', 2),
('Être hôtesse de l''air / Steward', 'bureau', 2),
('Être diplomate', 'bureau', 2),
('Être professeur d''université', 'bureau', 2),
('Être huissier de justice (Commissaire de justice)', 'bureau', 2),
('Être inspecteur des impôts', 'bureau', 2),
('Être journaliste d''investigation', 'bureau', 2);

-- Vérifier l'insertion
SELECT categorie, COUNT(*) as count FROM elements WHERE categorie = 'bureau' GROUP BY categorie;
