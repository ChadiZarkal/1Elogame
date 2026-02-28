# 🔍 Brique 1 — SEO & Référencement Naturel

**Priorité globale : 🔴 CRITIQUE**  
**Score de préparation : 6/10**

---

## État des lieux

### ✅ Ce qui est bien fait

| Élément | Détail | Fichier |
|---------|--------|---------|
| Métadonnées complètes | title, description, keywords, Open Graph, Twitter Cards | `layout.tsx` |
| JSON-LD structuré | Schema `WebApplication` avec prix, langue, catégorie | `layout.tsx` |
| Robots.txt | Bloque `/admin/` et `/api/`, autorise le reste | `robots.ts` |
| Sitemap XML | 5 routes principales avec priorités et fréquences | `sitemap.ts` |
| Balise `lang="fr"` | Correctement définie sur `<html>` | `layout.tsx` |
| `metadataBase` configuré | URL canonique de référence | `layout.tsx` |
| `canonical` et `hreflang` | Alternates langue fr-FR | `layout.tsx` |
| Image OG dynamique | Générée via `next/og` edge runtime | `opengraph-image.tsx` |
| Google Site Verification | Prêt via env var | `layout.tsx` |

### ❌ Ce qui manque ou pose problème

---

## 🔴 Problèmes critiques

### 1. Image OG statique absente
- Le fichier `/og-image.png` référencé dans les Twitter Cards **n'existe pas** dans `/public/`
- L'image OG dynamique (`opengraph-image.tsx`) fonctionne pour la route racine, mais les routes enfants héritent du `/og-image.png` statique qui est un 404
- **Impact :** Partages sur réseaux sociaux sans image = taux de clic divisé par 3 minimum

### 2. Sitemap incomplet
- **Routes manquantes :**
  - `/ressources` (page des violentomètres — contenu SEO fort)
  - `/ressources/violentometre` et les 4 autres sous-pages de meters
  - `/redflag` (page d'introduction)
  - `/classement` est présent mais `/ressources` non
- **Impact :** Google ne découvre pas 6+ pages à fort potentiel SEO

### 3. Pas de pages SEO dédiées par mot-clé
- Aucune landing page ciblant :
  - "red flag définition"
  - "green flag couple"
  - "test red flag"
  - "jeu red flag entre amis"
  - "violentomètre en ligne"
  - "consentement test"
- **Impact :** Tout le trafic SEO repose sur la homepage seule

### 4. Contenu textuel SEO quasi absent
- La homepage est un hub de boutons — très peu de texte indexable
- Aucun paragraphe explicatif, aucun H1 textuel visible (juste un logo SVG)
- Le `<img>` du logo a `alt="Red or Green"` au lieu de `alt="Red Flag Games - Le jeu des Red Flags entre amis"`
- **Impact :** Google ne comprend pas bien le sujet de la page

---

## 🟠 Problèmes haute priorité

### 5. Aucune stratégie de contenu / blog
- Pas de section articles ou blog
- Les "ressources" (violentomètre, etc.) sont un excellent contenu SEO mais ne sont pas exploitées :
  - Pas de meta description spécifique par meter
  - Pas de `generateMetadata` sur `/ressources/[slug]`
  - Pas de structured data `FAQPage` ou `Quiz` sur ces pages

### 6. Pas de données structurées spécifiques par page
- Seule la homepage a un JSON-LD (`WebApplication`)
- Il manque :
  - `Game` pour `/jeu`
  - `FAQPage` pour `/ressources`
  - `Quiz` pour `/ressources/[slug]`
  - `BreadcrumbList` pour la navigation

### 7. Aucune stratégie de liens internes
- Navigation limitée : homepage → pages de jeu, mais pas d'interconnexion entre pages de ressources
- Pas de fil d'Ariane (breadcrumbs) pour aider Google à comprendre la structure

### 8. Pas de `generateMetadata` sur les pages enfants
- `/jeu`, `/flagornot`, `/classement`, `/ressources`, `/ressources/[slug]` n'ont **aucune metadata exportée**
- Seul `layout.tsx` racine fournit les meta — toutes les pages ont le même title/description
- **Impact :** Chaque page devrait avoir son propre title et sa description unique

---

## 🟡 Améliorations recommandées

### 9. Les ressources /violentomètre sont un trésor SEO inexploité
- 5 calculateurs interactifs (violentomètre, consentomètre, etc.) = contenu unique
- Potentiel de trafic énorme sur "violentomètre en ligne", "test consentement", etc.
- Aucune optimisation SEO dédiée (pas de H1, pas de meta, pas de structured data)

### 10. Pas de stratégie de backlinks
- Aucun contenu "linkable" (études, infographies, statistiques publiques)
- Le classement public pourrait être une page de référence si bien optimisée

### 11. Performance SEO (Core Web Vitals)
- Le FCP de `/jeu` à 12.86s est un signal très négatif pour Google
- Voir rapport [02-PERFORMANCE.md](02-PERFORMANCE.md) pour le détail

---

## 👀 Analyse par persona

### 🧑‍💼 CEO — Quel impact sur le business ?
> Le SEO est la source de trafic **gratuite** la plus importante. Actuellement, le site capte probablement très peu de trafic organique car :
> - Une seule page est réellement optimisée (homepage)
> - Le contenu textuel est trop mince pour ranker
> - Les ressources (violentomètre) sont un "trésor caché" : des milliers de recherches/mois en France sur ces termes
> - **ROI potentiel :** Un bon SEO sur les 5 meters + landing pages red flag = 5000-20000 visiteurs/mois gratuits

### 👩‍💻 CTO — Quoi implémenter ?
> - `generateMetadata()` sur chaque page — 2h de travail
> - Structured data (JSON-LD) par type de page — 3h
> - Compléter le sitemap — 30min
> - Créer les assets OG manquants — 1h
> - Les pages de ressources ont besoin de Server Components (actuellement `'use client'`) pour le SEO du contenu

### 📈 Growth Hacker — Quelle stratégie ?
> **Quick wins immédiats :**
> 1. Ajouter des meta uniques par page (title + description)
> 2. Créer `/og-image.png` statique comme fallback
> 3. Compléter le sitemap avec les 6 routes manquantes
>
> **Stratégie moyen terme :**
> 4. Landing pages SEO pour chaque mot-clé cible
> 5. Blog avec articles autour des red flags (couple, travail, amitié)
> 6. Optimiser les meters pour le SEO (H1, meta, structured data)
>
> **Mots-clés cibles prioritaires :**
> - "red flag couple" (12K recherches/mois)
> - "violentomètre" (8K recherches/mois)
> - "green flag" (6K recherches/mois)
> - "test red flag" (3K recherches/mois)
> - "jeu red flag" (1.5K recherches/mois)

---

## 📋 Checklist SEO avant lancement

- [ ] Créer `/og-image.png` statique dans `/public/`
- [ ] Ajouter `generateMetadata()` sur `/jeu`, `/flagornot`, `/classement`, `/ressources`, `/ressources/[slug]`
- [ ] Compléter le sitemap avec les 6+ routes manquantes
- [ ] Ajouter des JSON-LD par type de page (`Game`, `FAQPage`, `Quiz`, `BreadcrumbList`)
- [ ] Corriger le `alt` du logo homepage
- [ ] Créer au minimum 3 landing pages SEO pour les mots-clés principaux
- [ ] Vérifier la Google Search Console (indexation, erreurs)
- [ ] Soumettre le sitemap à Google
- [ ] Mettre en place un audit Lighthouse automatisé en CI
