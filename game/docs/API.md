# 🔌 API Reference — Red Flag Games

## Base URL

```
/api
```

Toutes les routes supportent le **mode mock** via `NEXT_PUBLIC_MOCK_MODE=true` (données en mémoire, pas de Supabase).

---

## Jeu Red Flag

### `GET /api/duel`

Sélectionne une paire d'éléments pour un duel.

**Query params :**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string? | Filtrer par catégorie |
| `seenDuels` | string? | IDs déjà vus (format: "a-b,c-d") |

**Réponse :**
```json
{
  "success": true,
  "data": {
    "elementA": { "id": "uuid", "texte": "...", "categorie": "sexe" },
    "elementB": { "id": "uuid", "texte": "...", "categorie": "lifestyle" }
  }
}
```

### `POST /api/vote`

Enregistre un vote et met à jour les scores ELO.

**Body :**
```json
{
  "winnerId": "uuid",
  "loserId": "uuid",
  "sexe": "homme",
  "age": "19-22"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "winner": { "id": "uuid", "percentage": 65, "participations": 42 },
    "loser": { "id": "uuid", "percentage": 35, "participations": 38 },
    "streak": { "matched": true, "current": 5 }
  }
}
```

### `GET /api/leaderboard`

Récupère le classement des éléments.

**Query params :**
| Param | Type | Description |
|-------|------|-------------|
| `sort` | "desc"\|"asc" | Tri ELO (défaut: desc) |
| `limit` | number? | Nombre max d'éléments |
| `category` | string? | Filtrer par catégorie |

### `POST /api/feedback`

Enregistre un feedback sur un duel (⭐ star, 👍 thumbs_up, 👎 thumbs_down).

**Body :**
```json
{
  "elementAId": "uuid",
  "elementBId": "uuid",
  "type": "star"
}
```

---

## Flag or Not

### `POST /api/flagornot/judge`

Fait juger un texte par l'IA (cascade: Gemini → OpenAI → local).

**Body :**
```json
{
  "text": "Il regarde ton téléphone"
}
```

**Réponse :**
```json
{
  "verdict": "red",
  "justification": "C'est une violation de la vie privée..."
}
```

### `GET/POST /api/flagornot/community`

**GET** : Récupère les soumissions récentes de la communauté.  
**POST** : Enregistre une nouvelle soumission.

---

## Stats & Analytics

### `GET /api/stats/public`

Stats agrégées publiques (total votes, joueurs estimés).

### `POST/GET /api/analytics/session`

Tracking de session (vues de page, entrées de jeu).

---

## Flash Flag Sprint

### `GET /api/flashflag/tests`

Liste des tests standards disponibles.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "uuid",
        "name": "Radar Date Express",
        "description": "...",
        "questionCount": 15
      }
    ]
  }
}
```

### `POST /api/flashflag/session`

Crée une session locale ou partageable par lien.

**Body (standard) :**
```json
{
  "mode": "link",
  "sourceType": "standard",
  "standardTestId": "uuid",
  "subjectSex": "homme",
  "subjectAge": 27
}
```

**Body (custom) :**
```json
{
  "mode": "local",
  "sourceType": "custom",
  "subjectSex": "femme",
  "subjectAge": 25,
  "customTest": {
    "name": "Mon test",
    "description": "10 questions rapides",
    "questions": [
      {
        "text": "Question 1",
        "timeLimitSec": 7,
        "options": [
          { "text": "Option A", "score": 0 },
          { "text": "Option B", "score": 2 }
        ]
      }
    ]
  }
}
```

### `GET /api/flashflag/session/[code]`

Récupère le test, l'état et les résultats associés à la session.

### `POST /api/flashflag/session/[code]/start`

Passe la session à `in_progress`.

### `POST /api/flashflag/session/[code]/submit`

Soumet les réponses et calcule le score final.

---

## Admin

⚠️ Toutes les routes admin nécessitent un token dans le header `Authorization`.

### `POST /api/admin/login`

Authentification admin (bcrypt en prod, "admin" en mock).

### `GET /api/admin/stats`

Statistiques détaillées de l'admin.

### `GET/POST /api/admin/algorithm`

- **GET** : Configuration actuelle de l'algorithme
- **POST** `{ action: "update", config: {...} }` : Mettre à jour
- **POST** `{ action: "reset" }` : Réinitialiser

### `GET/POST /api/admin/elements`

CRUD des éléments de jeu.

### `GET /api/admin/demographics`

Données démographiques des joueurs.
