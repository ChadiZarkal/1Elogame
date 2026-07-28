# AdSense — Synthèse exécutive

**Sujet :** refus AdSense pour « Contenu à faible valeur informative » · redorgreen.fr
**Date :** 27 juillet 2026 · **Plan détaillé :** [ADSENSE-PLAN-CONFORMITE.md](ADSENSE-PLAN-CONFORMITE.md)

---

## Le constat

**Le site n'a pas un problème de contenu. Il a un problème de rendu.**

Le contenu existe — 243 comportements classés par 17 723 votes réels, 53 questions d'auto-évaluation sourcées par des institutions, 30 exemples rédigés. Rien de tout cela n'arrive dans le HTML que Google reçoit.

Ce que voit réellement le crawler, page par page :

| Page | Ce que Google reçoit |
|---|---|
| `/jeu/recap` | **0 mot** — page vide |
| `/classement` | **3 mots** — « Chargement du verdict... » |
| `/` (qui porte la publicité) | **~50 à 120 mots** |
| `/guide` | 480 mots — *la seule page correcte du site* |

**22 URL publiques · 16 minces · 1 seule correcte · ~2 000 mots indexables au total**, dont 1 900 sur des pages légales volontairement désindexées.

Un article de blog moyen fait 900 mots. Le site entier en fait le double, réparti sur 22 pages.

---

## Pourquoi

Trois causes techniques, toutes corrigeables :

1. **Des écrans de chargement remplacent le contenu** dans le HTML initial (`/classement` : 961 lignes de code qui servent trois mots).
2. **Le texte est enfermé dans des tiroirs et accordéons fermés par défaut** — présent dans le code, absent du HTML.
3. **Une page est chargée en `ssr: false`** — zéro contenu servi, par construction.

---

## Ce qui aggrave le dossier

| Constat | Portée |
|---|---|
| 🚨 **`/dixmais/admin` est un panneau d'administration public, sans authentification, explorable par les moteurs** | **Faille de sécurité** — hors sujet AdSense, à corriger immédiatement |
| 🚨 **La politique de confidentialité et les CGU décrivent une interface de consentement (TCF) qui n'existe pas** | RGPD + « Déclarations malhonnêtes » du règlement Google |
| **Aucune bannière de consentement**, pour un domaine `.fr` | Violation des règles de consentement UE |
| **Texte caché à visée SEO**, avec le commentaire `Hidden SEO content for search engines` dans le code | **Risque d'action manuelle** |
| **Contenu sexuel** (OnlyFans, nudes, sexting) servi à une audience déclarée **dès 16-18 ans** | **Motif de second refus, distinct du premier** |
| **Script AdSense chargé sur 100 % des routes**, y compris les panneaux d'admin | Critique **si les annonces automatiques sont actives** |
| Pages légales désindexées, accessibles depuis la seule page d'accueil, la confidentialité étant intitulée **« Secret »** | Un examinateur ne peut pas les trouver |

---

## L'atout décisif

Le site détient une donnée que **personne d'autre ne possède** : **17 723 votes**, avec un classement ELO segmenté par genre et par tranche d'âge, montrant des **écarts hommes/femmes allant jusqu'à 270 points** sur un même comportement.

C'est exactement l'« apport d'information » que Google récompense — et c'est incopiable.

⚠️ À l'inverse, **ajouter quelques articles de blog génériques à côté d'un jeu mince ne changerait rien au verdict.** C'est l'erreur classique qui mène au second refus.

---

## Le plan en quatre temps

| Phase | Délai | Contenu | Effort |
|---|---|---|---|
| **🚨 Urgence** | Immédiat | Fermer la faille admin ; cesser les affirmations légales fausses | Faible |
| **0 — Stop** | Jour 0 | Retirer l'unique régie publicitaire, désactiver les annonces automatiques | **~1 h** |
| **1 — Révéler** | Semaine 1 | Rendre visible le contenu déjà écrit ; purger le texte caché ; corriger les canonicals ; déployer la CMP | Moyen — **zéro rédaction** |
| **2 — Construire** | Semaines 2-3 | 10-15 pages bâties sur les données propres ; pages de confiance ; protection des mineurs | Élevé |
| **3 — Étoffer** | Semaine 4 | Contenus piliers, navigation, performance | Moyen |
| **4 — Déposer** | Semaine 5+ | Demande de réexamen | Faible |

**La phase 1 est le meilleur investissement du plan :** elle fait passer le site de ~2 000 à plus de 5 000 mots indexables **sans écrire une seule phrase** — uniquement en montrant ce qui existe déjà.

---

## Le site est-il dénaturé ?

**Non.** Les 4 jeux, leurs règles, le carrousel à swipe, l'identité visuelle et le ton sont **intégralement conservés**. Le jeu reste la première chose que voit un visiteur.

Tout le contenu ajouté se place **sous le jeu** ou sur **de nouvelles pages**. Ce qui change, c'est ce que voit le crawler — c'est-à-dire ce qui est aujourd'hui vide.

---

## Attentes

Compter **environ deux semaines par cycle de réexamen**, et envisager **plusieurs cycles**. C'est la norme, pas un échec. Ne déposer qu'une fois la grille de contrôle du plan détaillé **intégralement verte** — un dépôt prématuré coûte un cycle.

---

## Le test à faire soi-même, en une minute

Désactiver JavaScript dans le navigateur et parcourir le site.
**Ce qui reste à l'écran est exactement ce que voit l'examinateur AdSense.**

Aujourd'hui : page blanche sur `/jeu/recap`, spinner sur `/classement`.
