# Diagnostic : Captures d'écran automatisées

## Problème
L'agent ne peut pas prendre de captures d'écran de l'application car VS Code Simple Browser ne fournit pas d'API de capture d'écran programmatique.

## Analyse technique

### Pourquoi ça ne fonctionne pas

1. **VS Code Simple Browser** est un navigateur intégré léger (basé sur un webview) qui ne supporte pas les API de capture d'écran natives comme `puppeteer.screenshot()` ou `html2canvas`.

2. **Pas d'accès DOM externe** : L'agent opère dans l'environnement VS Code, pas dans un navigateur headless. Il ne peut pas accéder au DOM rendu de l'application Next.js.

3. **Pas de Puppeteer/Playwright** : Ces outils de capture d'écran nécessitent un navigateur Chromium installé et configuré. L'installation automatique est risquée et non fiable dans un environnement de développement.

4. **Limitations de l'outil `open_simple_browser`** : Cet outil ouvre une URL dans VS Code mais ne retourne pas de buffer d'image ou de data URI.

## Solutions proposées

### Solution 1 : Script Puppeteer dédié (Recommandé)
```bash
npm install -D puppeteer
```
Créer un script `scripts/screenshots.ts` qui :
- Lance l'app Next.js en mode dev
- Ouvre Puppeteer headless
- Navigue vers chaque page
- Prend des captures d'écran
- Les sauvegarde dans `screenshots/`

**Avantages** : Fiable, automatisable en CI/CD
**Inconvénients** : ~300Mo de téléchargement Chromium

### Solution 2 : Playwright (Alternative)
```bash
npm install -D @playwright/test
npx playwright install chromium
```
Même principe que Puppeteer, mais avec une meilleure API et le support multi-navigateur.

### Solution 3 : Capture manuelle via DevTools
1. Ouvre `http://localhost:3000` dans Chrome
2. F12 → Cmd+Shift+P → "Capture full size screenshot"
3. Répéter pour chaque page

### Solution 4 : Script en ligne avec `capture-website-cli`
```bash
npx capture-website-cli http://localhost:3000 --output=screenshots/homepage.png --width=375 --height=812
npx capture-website-cli http://localhost:3000/jeu --output=screenshots/jeu.png --width=375 --height=812
npx capture-website-cli http://localhost:3000/flagornot --output=screenshots/flagornot.png --width=375 --height=812
```

## Recommandation

Pour le moment, la **Solution 3 (capture manuelle)** est la plus pragmatique. Pour automatiser à long terme, intégrer **Playwright** dans le pipeline CI/CD avec un script de screenshots serait l'approche la plus robuste.

## Pages à capturer pour la documentation

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Hub principal avec les 3 jeux |
| Red Flag | `/jeu` | Page profil avec sélection sexe/âge |
| Red Flag Jouer | `/jeu/jouer` | Interface de duel en jeu |
| Flag or Not | `/flagornot` | Interface IA avec input |
| Classement | `/classement` | Leaderboard |
| Admin Login | `/admin` | Page de connexion admin |
| Admin Dashboard | `/admin/dashboard` | Tableau de bord |
| Admin Stats | `/admin/stats` | Statistiques ELO |
| Admin Démographie | `/admin/demographics` | **NOUVEAU** Analytics & démographie |

---

*Rapport généré pour v3.7 — Red Flag Games*
