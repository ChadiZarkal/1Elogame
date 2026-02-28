# ♿ Brique 8 — Accessibilité & Conformité Légale

**Priorité globale : 🟠 HAUTE**  
**Score de préparation : 4/10**

---

## Partie 1 — Accessibilité (a11y)

### ✅ Ce qui est bien fait

| Élément | Détail | Fichier |
|---------|--------|---------|
| `lang="fr"` | Langue de la page correctement définie | `layout.tsx` |
| `prefers-reduced-motion` | Animations désactivées si préférence système | `globals.css` + `hooks.ts` |
| `focus-visible` | Outlines visibles pour la navigation clavier | `globals.css` |
| `role="radiogroup"` | Sélection du profil correctement balisée | `ProfileForm.tsx` |
| `aria-checked` | État des boutons radio communiqué | `ProfileForm.tsx` |
| `aria-hidden` | Éléments décoratifs masqués aux lecteurs d'écran | `AnimatedBackground`, ticker |
| `role="status"` + `aria-live="polite"` | Loading spinner accessible | `Loading.tsx`, `Shimmer.tsx` |
| Contraste couleurs | Palette sombre avec texte clair → bon contraste | `globals.css` |
| Touch targets | Boutons suffisamment grands pour le mobile | Général |
| `userScalable: true` | Zoom autorisé (important pour l'accessibilité) | `layout.tsx` |

### ❌ Ce qui manque

| Élément | Impact | Sévérité |
|---------|--------|----------|
| Pas de skip-to-content | Navigation clavier sans raccourci | 🟠 |
| Texte alternatif pauvre sur le logo | `alt="Red or Green"` au lieu du nom du site | 🟡 |
| Pas d'`aria-label` sur tous les boutons icône | Certains boutons n'ont qu'une icône sans texte | 🟡 |
| Pas de gestion de la navigation clavier dans les duels | Tab entre les deux options non optimisé | 🟡 |
| Pas de mode haut contraste | Un seul thème (dark) | 🟡 |
| Pas de déclaration d'accessibilité | Obligatoire en France pour les services publics | 🟡 |

---

## Partie 2 — Conformité légale 🔴

### SITUATION : Aucune page légale n'existe

C'est le point le plus bloquant de cette brique. En France, les obligations légales pour un site web interactif sont strictes :

### Pages légales obligatoires absentes

| Page | Obligation | Sanction possible | Bloquant pub ? |
|------|-----------|-------------------|----------------|
| **Mentions légales** | Loi LCEN (art. 6-III) | 75 000€ d'amende | OUI |
| **Politique de confidentialité** | RGPD (art. 13-14) | 4% du CA ou 20M€ | OUI |
| **CGU** | Code de la consommation | Variable | OUI pour Google Ads |
| **Politique de cookies** | Directive ePrivacy + RGPD | 150 000€ | OUI |
| **Bannière de consentement cookies** | CNIL recommandation | 150 000€ | OUI |

### Détail des obligations

#### 1. Mentions légales (OBLIGATOIRE — Loi LCEN)
Doivent contenir :
- Identité de l'éditeur (nom, prénom ou raison sociale)
- Adresse de l'éditeur
- Numéro de téléphone ou email de contact
- Nom de l'hébergeur (Vercel Inc.)
- Adresse de l'hébergeur
- Directeur de la publication

#### 2. Politique de confidentialité (OBLIGATOIRE — RGPD)
Le site collecte des données personnelles :
- **Sexe et tranche d'âge** via le formulaire de profil → données sensibles (genre)
- **Adresse IP** via le rate limiting
- **Données de session** via analytics (durée, pages vues, événements)
- **Texte libre** via l'Oracle (situations soumises)
- **Données de navigateur** via Vercel Analytics et Speed Insights

Doit contenir :
- Nature des données collectées
- Finalité du traitement
- Base légale (consentement ou intérêt légitime)
- Durée de conservation
- Droits de l'utilisateur (accès, rectification, suppression, portabilité)
- Contact du DPO ou responsable
- Transferts hors UE (Vercel = US → clauses contractuelles)

#### 3. Bannière de consentement cookies (OBLIGATOIRE — CNIL)
Le site utilise :
- `@vercel/analytics` → cookies techniques/analytics
- `@vercel/speed-insights` → cookies techniques
- `localStorage` et `sessionStorage` → données locales
- Futur : Google AdSense → cookies publicitaires

La CNIL exige :
- Bannière avec refus aussi facile que l'acceptation
- Choix granulaire par catégorie
- Pas de cookies non essentiels avant consentement
- Documentation de la liste des cookies

#### 4. Contenu sensible — Avertissements
Les pages "Ressources" traitent de sujets sensibles :
- Violence conjugale (violentomètre)
- Consentement sexuel (consentomètre)
- Inceste (incestomètre)
- Harcèlement
- Discrimination

**Points positifs :** 
- Bouton "Quick Exit" présent
- Numéros d'urgence affichés (17, 3919, 112)
- Données des tests restent locales (pas de transmission)

**Points à vérifier :**
- Avertissement d'âge minimum recommandé (ces sujets ne sont pas adaptés aux enfants)
- Mention que le site n'est pas un outil de diagnostic professionnel

---

## 🟠 RGPD — Points spécifiques

### 5. Transferts de données hors UE
- **Vercel :** Hébergeur américain → serveurs possiblement aux US
  - Nécessite des Clauses Contractuelles Types (CCT) ou équivalent
  - Vercel propose un Data Processing Addendum (DPA)
- **Supabase :** Vérifier la région du projet (EU ou US)
- **Google Gemini :** Données envoyées à Google Cloud → CCT nécessaires
- **OpenAI (fallback) :** Données envoyées à OpenAI (US) → CCT nécessaires

### 6. Durée de conservation des données
- Votes : Conservés indéfiniment → définir une politique (ex: 3 ans)
- Sessions analytics : Conservées indéfiniment → définir une limite
- Situations Oracle : Conservées indéfiniment dans `flagornot_submissions` → définir une limite
- Feedback : Conservé indéfiniment → définir une limite

### 7. Droit à la suppression
- Actuellement, aucun mécanisme n'est accessible pour que l'utilisateur supprime ses données
- Les votes sont anonymes (pas de compte) → difficile d'identifier les données d'un utilisateur
- Les sessions analytics contiennent un `session_id` en localStorage → pas lié à une identité
- **Risque faible** car les données sont pseudonymisées, mais une procédure de contact doit exister

### 8. Mineurs
- Le formulaire profil propose les tranches d'âge incluant potentiellement des mineurs (13-17)
- Les sujets des ressources (violence, sexualité) soulèvent des questions pour les mineurs
- Pas de vérification d'âge → risque réputationnel
- **Recommandation :** Ajouter un avertissement "Ce jeu est destiné aux personnes de 16 ans et plus"

---

## 👀 Analyse par persona

### 🧑‍💼 CEO
> - **BLOQUEUR ABSOLU pour le lancement publicitaire :**
>   - Google Ads/AdSense REFUSE les sites sans mentions légales et politique de confidentialité
>   - Meta Ads (Facebook/Instagram) REFUSE les sites sans politique de confidentialité
>   - La CNIL peut sanctionner sans avertissement pour l'absence de bannière cookies
> - Coût de mise en conformité : 0€ (rédaction personnelle) à 500-2000€ (avocat spécialisé)
> - **Recommandation :** Utiliser un générateur de mentions légales + adapter au contexte

### 👩‍💻 CTO
> - Créer les routes `/mentions-legales`, `/confidentialite`, `/cgu` dans l'app
> - Intégrer une CMP (Consent Management Platform) : `tarteaucitron.js` (gratuit, français)
> - Ajouter un middleware qui bloque les scripts analytics/pub si pas de consentement
> - Créer un composant `<CookieBanner />` dans le layout
> - Ajouter `noindex` sur les pages légales (optionnel mais évite le thin content)

### 📈 Growth Hacker
> - Sans pages légales, **aucune campagne publicitaire ne peut démarrer**
> - Les pages de politique de confidentialité peuvent être un vecteur SEO mineur
> - La CMP doit être non-intrusive pour ne pas impacter le taux de rebond
> - Les avertissements d'âge doivent être discrets mais présents (modal au premier accès)

---

## 📋 Checklist accessibilité & légal avant lancement

### Légal (BLOQUANT)
- [ ] Créer la page Mentions Légales (`/mentions-legales`)
- [ ] Créer la page Politique de Confidentialité (`/confidentialite`)
- [ ] Créer la page CGU (`/cgu`)
- [ ] Intégrer une bannière de consentement cookies (CMP)
- [ ] Vérifier les CCT avec Vercel (DPA signé)
- [ ] Vérifier la région Supabase (EU de préférence)
- [ ] Définir les durées de conservation des données
- [ ] Ajouter un avertissement d'âge (16+ recommandé)
- [ ] Ajouter un disclaimer "pas un outil de diagnostic" sur les meters

### Accessibilité
- [ ] Ajouter un lien "Skip to content" invisible mais focusable
- [ ] Corriger l'`alt` du logo homepage
- [ ] Vérifier que tous les boutons icône-only ont un `aria-label`
- [ ] Tester la navigation clavier complète (Tab, Enter, Escape)
- [ ] Tester avec un lecteur d'écran (VoiceOver sur Mac)
- [ ] Envisager un mode haut contraste (alternance clair/sombre)
