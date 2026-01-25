-- Migration vers les nouvelles catégories
-- Date: 25 janvier 2026

-- 1. Supprimer les anciennes données
TRUNCATE TABLE elements CASCADE;

-- 2. Insérer les nouveaux éléments avec les nouvelles catégories

INSERT INTO elements (texte, categorie, niveau_provocation) VALUES

-- ========================================
-- CATÉGORIE: SEXE & KINKS (🔥)
-- Relations, dating, intimité, préférences sexuelles
-- ========================================

-- Relations & Dating (niveau 1-2)
('Préférer les relations longues distances', 'sexe', 2),
('N''avoir que des plans cul', 'sexe', 3),
('Être poly-amoureux', 'sexe', 3),
('Ghoster après le premier date', 'sexe', 3),
('Stalker les ex sur Instagram', 'sexe', 2),
('Ramener quelqu''un chez soi le premier soir', 'sexe', 2),
('Demander un date au McDo', 'sexe', 2),
('Partager sa localisation H24 avec son/sa partenaire', 'sexe', 2),
('Checker le téléphone de son/sa partenaire', 'sexe', 3),
('Appeler son ex quand on est bourré', 'sexe', 3),

-- Intimité & Préférences (niveau 2-4)
('Aimer les pieds', 'sexe', 4),
('Avoir un fétiche bizarre', 'sexe', 4),
('Faire du sexting avec des inconnus', 'sexe', 4),
('Avoir un compte OnlyFans', 'sexe', 4),
('Mater du porno en couple', 'sexe', 3),
('Utiliser des sex toys', 'sexe', 3),
('Faire l''amour avec les chaussettes', 'sexe', 2),
('Préférer le matin au soir', 'sexe', 2),
('Dire "je t''aime" pendant l''acte', 'sexe', 2),
('Ne jamais embrasser', 'sexe', 3),

-- Kinks & Fantasmes (niveau 4-5)
('Aimer être dominé(e)', 'sexe', 4),
('Aimer dominer', 'sexe', 4),
('Vouloir faire un trio', 'sexe', 4),
('Fantasmer sur les uniformes', 'sexe', 3),
('Aimer le dirty talk', 'sexe', 3),
('Envoyer des nudes', 'sexe', 4),
('Demander des nudes', 'sexe', 4),
('Rouler des pelles en public', 'sexe', 3),
('Faire l''amour dans des lieux publics', 'sexe', 5),
('Avoir une sex tape', 'sexe', 5),

-- ========================================
-- CATÉGORIE: LIFESTYLE (🎯)
-- Hobbies, passions, sport, activités
-- ========================================

-- Sport & Fitness (niveau 1-2)
('Être un go muscu', 'lifestyle', 2),
('Ne jamais faire de sport', 'lifestyle', 2),
('Poster ses workouts sur Instagram', 'lifestyle', 2),
('Compter ses macros', 'lifestyle', 2),
('Faire du crossfit', 'lifestyle', 2),
('Courir des marathons', 'lifestyle', 2),
('Faire du yoga tous les jours', 'lifestyle', 1),
('Être accro à la salle de sport', 'lifestyle', 2),
('Ne manger que de la whey', 'lifestyle', 3),
('Porter des leggings H24', 'lifestyle', 2),

-- Tech & Gaming (niveau 1-3)
('Être geek hardcore', 'lifestyle', 2),
('Jouer aux jeux vidéo 10h par jour', 'lifestyle', 3),
('Être fan d''e-sport', 'lifestyle', 2),
('Avoir un setup gaming RGB', 'lifestyle', 2),
('Streamer sur Twitch', 'lifestyle', 2),
('Coder pendant son temps libre', 'lifestyle', 1),
('Être cryptobro', 'lifestyle', 3),
('Investir dans les NFT', 'lifestyle', 3),
('Miner de la crypto', 'lifestyle', 2),
('Avoir 10 écrans', 'lifestyle', 2),

-- Culture & Loisirs (niveau 1-2)
('Être fan d''animés', 'lifestyle', 2),
('Regarder des séries en VO', 'lifestyle', 1),
('Lire des mangas', 'lifestyle', 1),
('Collectionner des figurines', 'lifestyle', 2),
('Aller à des conventions', 'lifestyle', 2),
('Cosplayer', 'lifestyle', 2),
('Regarder uniquement des films d''auteur', 'lifestyle', 2),
('Ne regarder que des blockbusters', 'lifestyle', 1),
('Être accro aux séries Netflix', 'lifestyle', 2),
('Binge-watcher des séries en une nuit', 'lifestyle', 2),

-- Musique & Sorties (niveau 1-3)
('Écouter du metal', 'lifestyle', 1),
('Écouter de la country', 'lifestyle', 2),
('Être fan de rap français', 'lifestyle', 1),
('N''écouter que de la techno', 'lifestyle', 2),
('Aller en boîte tous les weekends', 'lifestyle', 2),
('Être DJ', 'lifestyle', 2),
('Jouer de la guitare dans un groupe', 'lifestyle', 1),
('Chanter sous la douche', 'lifestyle', 1),
('Faire du karaoké bourré', 'lifestyle', 2),
('Aller à tous les festivals', 'lifestyle', 2),

-- Passions diverses (niveau 1-3)
('Faire de la photographie', 'lifestyle', 1),
('Dessiner/peindre', 'lifestyle', 1),
('Faire du skateboard à 30 ans', 'lifestyle', 2),
('Collectionner des sneakers', 'lifestyle', 2),
('Être vegan militant', 'lifestyle', 3),
('Faire du bénévolat', 'lifestyle', 1),
('Être dans une asso', 'lifestyle', 1),
('Parler 5 langues', 'lifestyle', 1),
('Voyager 6 mois par an', 'lifestyle', 2),
('Vivre en van', 'lifestyle', 3),

-- ========================================
-- CATÉGORIE: QUOTIDIEN (🤷)
-- Comportements et habitudes du quotidien
-- ========================================

-- Hygiène & Apparence (niveau 1-4)
('Avoir les ongles longs', 'quotidien', 2),
('Porter des Crocs', 'quotidien', 2),
('Ne jamais se couper les ongles des pieds', 'quotidien', 3),
('Se laver une fois par semaine', 'quotidien', 4),
('Réutiliser ses sous-vêtements 3 jours', 'quotidien', 3),
('Ne jamais se brosser les dents le matin', 'quotidien', 3),
('Avoir une haleine de chacal', 'quotidien', 3),
('Porter les mêmes fringues 3 jours', 'quotidien', 2),
('Ne jamais se parfumer', 'quotidien', 2),
('Mettre trop de parfum', 'quotidien', 2),

-- Comportements sociaux (niveau 2-4)
('Parler fort dans les transports', 'quotidien', 3),
('Mettre sa musique sans écouteurs', 'quotidien', 4),
('Couper la parole tout le temps', 'quotidien', 3),
('Ne jamais dire merci', 'quotidien', 3),
('Ne jamais dire bonjour', 'quotidien', 3),
('Applaudir à l''atterrissage', 'quotidien', 2),
('Klaxonner 2 secondes après le feu vert', 'quotidien', 3),
('Doubler dans les files d''attente', 'quotidien', 4),
('Manger bruyamment', 'quotidien', 3),
('Mâcher la bouche ouverte', 'quotidien', 3),

-- Habitudes bizarres (niveau 2-4)
('Manger ses crottes de nez', 'quotidien', 4),
('Roter à table', 'quotidien', 3),
('Péter en public', 'quotidien', 3),
('Ne jamais tirer la chasse', 'quotidien', 4),
('Pisser sous la douche', 'quotidien', 2),
('Parler tout seul', 'quotidien', 2),
('Parler à ses plantes', 'quotidien', 2),
('Se gratter les parties intimes en public', 'quotidien', 4),
('Renifler ses vêtements pour savoir si c''est propre', 'quotidien', 2),
('Cracher par terre', 'quotidien', 4),

-- Argent & Radinerie (niveau 2-3)
('Être radin', 'quotidien', 3),
('Jamais payer sa tournée', 'quotidien', 3),
('Diviser l''addition au centime près', 'quotidien', 2),
('Voler le PQ au resto', 'quotidien', 3),
('Ramener des trucs du buffet dans son sac', 'quotidien', 3),
('Négocier chez Décathlon', 'quotidien', 2),
('Demander une réduction partout', 'quotidien', 2),
('Ne jamais laisser de pourboire', 'quotidien', 2),
('Récupérer les échantillons gratuits', 'quotidien', 1),
('Frauder dans les transports', 'quotidien', 3),

-- Nourriture (niveau 1-3)
('Aimer l''ananas sur la pizza', 'quotidien', 2),
('Manger ses céréales avec de l''eau', 'quotidien', 3),
('Mettre du ketchup sur tout', 'quotidien', 2),
('Manger de la mayonnaise à la cuillère', 'quotidien', 3),
('Tremper ses frites dans le milkshake', 'quotidien', 2),
('Manger des pâtes sans sauce', 'quotidien', 2),
('Mettre du lait avant les céréales', 'quotidien', 2),
('Manger de la pizza froide au petit-dej', 'quotidien', 2),
('Finir les assiettes des autres', 'quotidien', 2),
('Lécher son assiette', 'quotidien', 3),

-- ========================================
-- CATÉGORIE: BUREAU (💼)
-- Comportements et attitudes au travail
-- ========================================

-- Culture d''entreprise (niveau 2-3)
('Travailler le dimanche', 'bureau', 2),
('Répondre aux emails à 23h', 'bureau', 2),
('Être en télétravail 100%', 'bureau', 2),
('Venir au bureau en pyjama', 'bureau', 2),
('Ne jamais prendre de congés', 'bureau', 3),
('Poser un RTT le lundi', 'bureau', 2),
('Être en burnout permanent', 'bureau', 3),
('Faire semblant de travailler', 'bureau', 2),
('Arriver en retard tous les jours', 'bureau', 3),
('Partir à 17h pile', 'bureau', 2),

-- Relations professionnelles (niveau 2-4)
('Adorer les afterworks', 'bureau', 2),
('Éviter tous les afterworks', 'bureau', 2),
('Draguer les collègues', 'bureau', 3),
('Coucher avec son boss', 'bureau', 4),
('Balancer ses collègues', 'bureau', 4),
('Voler la bouffe des autres au frigo', 'bureau', 4),
('Ne jamais faire le café', 'bureau', 2),
('Organiser des pots toutes les semaines', 'bureau', 2),
('Critiquer son boss sur Slack', 'bureau', 3),
('Ghoster les réunions Teams', 'bureau', 2),

-- Ambiance & Productivité (niveau 2-3)
('Mettre de la musique sans casque', 'bureau', 3),
('Manger des trucs qui puent au bureau', 'bureau', 3),
('Chauffer du poisson au micro-ondes', 'bureau', 4),
('Parler fort au téléphone en open space', 'bureau', 3),
('Organiser des réunions inutiles', 'bureau', 3),
('Envoyer 50 messages Slack par jour', 'bureau', 2),
('Ne jamais lire ses emails', 'bureau', 3),
('Mettre "CC" à toute la boîte', 'bureau', 3),
('Procrastiner sur LinkedIn', 'bureau', 2),
('Scroller TikTok en réunion', 'bureau', 2),

-- Carrière & Ambition (niveau 2-3)
('Être en reconversion à 40 ans', 'bureau', 2),
('Lancer sa startup', 'bureau', 2),
('Être freelance galérien', 'bureau', 2),
('Faire semblant d''être entrepreneur', 'bureau', 3),
('Être influenceur LinkedIn', 'bureau', 3),
('Poster des citations motivantes', 'bureau', 2),
('Être coach en développement personnel', 'bureau', 3),
('Vendre des formations bidons', 'bureau', 4),
('Faire du MLM', 'bureau', 4),
('Être dans la crypto H24', 'bureau', 2),

-- Types de jobs (niveau 1-3)
('Être policier', 'bureau', 2),
('Être influenceur', 'bureau', 3),
('Être politicien', 'bureau', 4),
('Être avocat fiscaliste', 'bureau', 2),
('Être télévendeur', 'bureau', 3),
('Être serveur dans un fast-food', 'bureau', 2),
('Être agent immobilier', 'bureau', 3),
('Être DJ de mariage', 'bureau', 2),
('Être community manager', 'bureau', 2),
('Être recruteur IT', 'bureau', 2);

-- Vérifier le nombre d'éléments insérés
SELECT COUNT(*) as total_elements FROM elements;
SELECT categorie, COUNT(*) as count FROM elements GROUP BY categorie ORDER BY count DESC;
