# FlashFlag - Plan UX Mobile, Personas et Viralite

## Scope
Ce document couvre uniquement Game 4: FlashFlag.
Objectif: augmenter comprehension, completion, partage et rejouabilite sur mobile.

## Vision produit
FlashFlag doit etre percu comme:
- Un test ultra rapide avant de rencontrer quelqu un.
- Un filtre de valeurs simple a envoyer en message.
- Un mini challenge social partageable entre potes.

## Personas prioritaires

### Persona A - "Dating Safety"
- Profil: 22-34 ans, usage mobile, active sur apps de rencontre.
- Contexte: avant un premier date (bar, chez lui/elle, exterieur).
- Besoin: verifier respect, limites, valeurs sans conversation longue.
- KPI principal: taux de lien partage et taux de completion destinataire.

### Persona B - "Cercle d amis"
- Profil: 18-30 ans, soirees, groupe WhatsApp/Instagram.
- Contexte: lancer un debat rapide et fun.
- Besoin: format court, comparaisons, challenge entre personnes.
- KPI principal: nombre moyen de partages par session terminee.

### Persona C - "Auto-check rapide"
- Profil: utilisateur solo curieux de ses reflexes.
- Contexte: test perso local en 1-2 minutes.
- Besoin: feedback instantane + recap lisible.
- KPI principal: taux de relance d une nouvelle session.

### Persona D - "Admin contenu"
- Profil: createur/admin qui maintient des tests standards.
- Contexte: edition frequente depuis laptop/mobile web.
- Besoin: creation rapide, clartes des contraintes, iteration fluide.
- KPI principal: temps moyen de publication d un test standard.

## Parcours mobile ideal (end-to-end)

1. Entree FlashFlag
- Message court: "test chrono avant de se voir".
- Valeur immediate: comprendre en moins de 5 secondes.

2. Setup
- Profil de la personne evaluee.
- Choix type de test (standard ou perso).
- Templates prets selon contexte (dating, safe night, debat).

3. Lancement
- Choix mode d envoi en dernier (local vs lien) pour clarte.
- CTA mobile sticky pour agir vite sans scroll retour.

4. Partage
- Message pre-rempli copiable en 1 tap.
- Boutons partage natif + WhatsApp.
- Lien copiable separement.

5. Session repondant
- Timer visuel (anneau + barre urgence + etat couleur).
- Reponses gros boutons tactiles.
- Pression temporelle claire sans confusion.

6. Resultat
- Score + niveau + recap.
- CTA de challenge pour renvoyer a une autre personne.

7. Re-engagement
- Relancer une session en 1 tap.
- Encourager comparaison de resultats.

## Frictions detectees et recommandations

### P0 - A executer immediatement
- Intro trop longue -> copy plus courte, fun et orientee usage reel.
- Confusion envoi local/lien -> placer ce choix juste avant lancer.
- Timer peu lisible -> anneau chrono + barre urgence + labels.
- Faible viralite post-resultat -> actions de partage directes.
- Creation test lente -> templates contextuels + ajout question en bas.

### P1 - Sprint suivant
- Ajouter compteur de streak (sessions completees sans abandon).
- Ajouter mode "best of 5 questions" pour usage ultra rapide.
- Ajouter historique local des 5 derniers resultats compares.
- Ajouter confirmation visuelle/haptique plus riche a chaque choix.

### P2 - Evolution strategique
- Challenges asynchrones (duel de scores entre 2 personnes).
- Codes de partage courts memorisables.
- Mini systeme de badges (sans friction d inscription).
- Classement social FlashFlag (opt-in uniquement).

## Instrumentation recommandee (analytics)
Mesurer au minimum:
- `flashflag_opened`
- `flashflag_template_applied`
- `flashflag_mode_selected`
- `flashflag_session_created`
- `flashflag_link_copied`
- `flashflag_message_copied`
- `flashflag_native_shared`
- `flashflag_whatsapp_shared`
- `flashflag_session_started`
- `flashflag_session_completed`
- `flashflag_result_shared`
- `flashflag_retry_clicked`

## KPI cibles (90 jours)
- Completion rate session destinataire >= 65%
- Share rate apres creation de lien >= 55%
- Re-share rate apres resultat >= 30%
- Temps median setup -> session creee <= 55s
- Taux d abandon pendant session <= 20%

## Cadre A/B tests
- Test A: intro courte factuelle vs intro scenario dating.
- Test B: ordre des etapes (type test puis mode) vs (mode puis type test).
- Test C: CTA principal rouge plein vs contraste sombre.
- Test D: anneau timer seul vs anneau + labels urgence.

## Checklist execution

### Deja implemente
- Refonte setup en etapes plus claires.
- Choix local/lien en fin de parcours.
- Timer visuel fort en session.
- Actions de partage resultat et invitation.
- Templates de test perso contextuels.
- Ajout de questions en bas (joueur + admin).

### A planifier ensuite
- Instrumentation complete des events FlashFlag.
- A/B tests automatiques sur copy/CTA.
- Historique local et boucle de comparaison sociale.
- Micro-recompenses de rejouabilite.

## Definition de succes produit
FlashFlag est "pret scale" quand:
- Un nouvel utilisateur comprend la promesse en < 5 secondes.
- Un hote cree et partage un test en < 1 minute.
- Le destinataire complete le test sans confusion.
- Le resultat declenche naturellement un nouveau partage.
