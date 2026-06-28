# Flash Flag Sprint

## Objectif

Flash Flag Sprint est un questionnaire chronometre pour evaluer rapidement un profil red flag sans laisser le temps de sur-reflechir.

## Parcours utilisateur

1. L'hote renseigne sexe et age de la personne testee.
2. L'hote choisit un test standard ou cree un test perso (5 a 20 questions).
3. L'hote choisit un mode:
   - Local: passage immediat sur le meme telephone.
   - Lien: partage d'un lien unique vers la session.
4. Le joueur voit un warning clair: chrono actif, pas de retour arriere, timeout = mauvaise reponse.
5. Le questionnaire defile question par question avec anneau chrono + barre d'urgence.
6. Le recap final affiche score total, niveau de risque, detail des reponses et actions de partage.

## Regles de scoring

- Chaque option porte un score `0`, `1` ou `2`.
- En cas de timeout: score force a `0`.
- Score max = `nombre_questions * 2`.
- Pourcentage risque = `total / max * 100`.
- Niveaux:
  - safe: < 40%
  - watch: 40% a 69%
  - alert: >= 70%

## Endpoints

- `GET /api/flashflag/tests`
- `POST /api/flashflag/session`
- `GET /api/flashflag/session/[code]`
- `POST /api/flashflag/session/[code]/start`
- `POST /api/flashflag/session/[code]/submit`

Admin:

- `GET/POST /api/admin/flashflag`
- `GET/PATCH/DELETE /api/admin/flashflag/[id]`

## Stockage

Tables Supabase:

- `flashflag_tests`
- `flashflag_questions`
- `flashflag_options`
- `flashflag_sessions`
- `flashflag_answers`

Migrations:

- `013_flashflag_quiz.sql`
- `014_flashflag_seed_standard.sql`

## Robustesse

- Validation Zod stricte sur create/start/submit.
- Retry collision code session (jusqu'a 10 essais).
- Sauvegarde locale du brouillon test perso sans compte.
- Relecture des resultats via le meme lien de session.
- Templates express cote creation pour accelerer les usages (dating, safe night, debat).
- Partage viral integre (copie message, WhatsApp, partage natif quand disponible).
