# 🔌 API Specifications - Red or Green Game

> **Complete API documentation for the system**

---

## 📌 General Information

| Field | Value |
|-------|-------|
| **API Version** | v1 |
| **Base URL** | `https://redorgreen.vercel.app/api` |
| **Format** | JSON |
| **Authentication** | Bearer Token (JWT) - Admin only |
| **Rate Limit** | None (MVP with ~15 users) |

---

## 🔐 Authentication

### Admin Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "adminPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

### Using the Token (Admin Endpoints)
```http
GET /api/admin/elements
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📋 Response Conventions

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 200,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {
        "field": "winnerId",
        "message": "Invalid UUID format"
      }
    ]
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `NOT_FOUND` | 404 | Resource not found |
| `ELEMENT_INACTIVE` | 400 | Element is deactivated |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 📚 Public Endpoints (No Auth Required)

### 🎮 GET /api/duel

Get the next duel for the player.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `seenDuels` | string | No | Comma-separated "id1-id2" pairs (sorted alphabetically) |

**Example Request:**
```http
GET /api/duel?seenDuels=abc-def,ghi-jkl
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "elementA": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "texte": "Être policier",
      "categorie": "metier"
    },
    "elementB": {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "texte": "Aimer les pieds",
      "categorie": "preference"
    }
  }
}
```

**Error Response (404) - All duels exhausted:**
```json
{
  "success": false,
  "error": {
    "code": "ALL_DUELS_SEEN",
    "message": "You've seen all available duels!"
  }
}
```

**Algorithm Notes:**
- 50% chance: ELO-close duels (50-300 point difference)
- 30% chance: Cross-category duels
- 15% chance: Starred duels (if ≥50 stars exist)
- 5% chance: Random selection

---

### 🗳️ POST /api/vote

Record a vote and calculate ELO scores.

**Request Body:**
```json
{
  "winnerId": "550e8400-e29b-41d4-a716-446655440000",
  "loserId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "sexe": "homme",
  "age": "19-22"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| `winnerId` | Required, valid UUID, must be active element |
| `loserId` | Required, valid UUID, must be active element, ≠ winnerId |
| `sexe` | Required, enum: homme, femme, nonbinaire, autre |
| `age` | Required, enum: 16-18, 19-22, 23-26, 27+ |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "winner": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "texte": "Être policier",
      "percentage": 68,
      "participations": 1247
    },
    "loser": {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "texte": "Aimer les pieds",
      "percentage": 32,
      "participations": 983
    },
    "streak": {
      "matched": true,
      "current": 5
    }
  }
}
```

**Percentage Calculation:**
The percentage is calculated using ELO estimation, NOT direct vote counts:
```
percentage = 1 / (1 + 10^((ELO_Loser - ELO_Winner) / 400)) * 100
```

**Streak Logic:**
- `matched: true` if player voted for the element with higher ELO
- `current` is the new streak value (increment if matched, reset to 0 if not)

---

### ⭐ POST /api/feedback

Record star or thumbs feedback on a duel.

**Request Body:**
```json
{
  "elementAId": "550e8400-e29b-41d4-a716-446655440000",
  "elementBId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "type": "star"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| `elementAId` | Required, valid UUID |
| `elementBId` | Required, valid UUID |
| `type` | Required, enum: star, thumbs_up, thumbs_down |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Feedback recorded",
    "newCount": 15
  }
}
```

**Notes:**
- Elements are sorted alphabetically before storing to ensure unique pairs
- No deduplication per session (MVP simplification)

---

### 📊 GET /api/elements

Get all active elements (for preloading on client).

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "texte": "Être policier",
      "categorie": "metier",
      "elo_global": 1150
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "texte": "Aimer les pieds",
      "categorie": "preference",
      "elo_global": 1080
    }
  ],
  "meta": {
    "total": 200
  }
}
```

**Notes:**
- Returns only active elements
- Used at game start to preload all elements client-side
- Enables in-memory duel selection for performance

---

## 🔒 Admin Endpoints (Auth Required)

All admin endpoints require:
```http
Authorization: Bearer <token>
```

---

### 📋 GET /api/admin/elements

List all elements (active and inactive) with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field: elo_global, texte, created_at |
| `order` | string | asc or desc (default: desc) |
| `search` | string | Text search in texte field |
| `categorie` | string | Filter by category |
| `actif` | boolean | Filter by active status |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "texte": "Être policier",
      "categorie": "metier",
      "niveau_provocation": 2,
      "actif": true,
      "elo_global": 1150,
      "nb_participations": 1247,
      "created_at": "2026-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "totalPages": 10
  }
}
```

---

### ➕ POST /api/admin/elements

Create a new element.

**Request Body:**
```json
{
  "texte": "Être médecin",
  "categorie": "metier",
  "niveau_provocation": 1
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| `texte` | Required, unique, 3-200 chars |
| `categorie` | Required, enum: metier, comportement, trait, preference, absurde |
| `niveau_provocation` | Optional, integer 1-4 (default: 2) |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "texte": "Être médecin",
    "categorie": "metier",
    "niveau_provocation": 1,
    "actif": true,
    "elo_global": 1000,
    "elo_homme": 1000,
    "elo_femme": 1000,
    "elo_nonbinaire": 1000,
    "elo_autre": 1000,
    "elo_16_18": 1000,
    "elo_19_22": 1000,
    "elo_23_26": 1000,
    "elo_27plus": 1000,
    "nb_participations": 0,
    "created_at": "2026-01-12T10:00:00Z"
  }
}
```

---

### ✏️ PUT /api/admin/elements/:id

Update an existing element.

**Request Body:**
```json
{
  "texte": "Être médecin urgentiste",
  "categorie": "metier",
  "niveau_provocation": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "texte": "Être médecin urgentiste",
    "updated_at": "2026-01-12T11:00:00Z"
  }
}
```

**Notes:**
- ELO scores are PRESERVED on update
- Only texte, categorie, niveau_provocation can be modified

---

### 🔄 PATCH /api/admin/elements/:id/toggle

Toggle element active/inactive status.

**Request Body:**
```json
{
  "actif": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "actif": false,
    "message": "Element deactivated"
  }
}
```

---

### 📊 GET /api/admin/stats

Get dashboard statistics.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVotes": 15420,
    "activeElements": 198,
    "totalElements": 200,
    "sessions24h": 45,
    "avgDuelsPerSession": 12.5,
    "avgLatencyMs": 85,
    "topRedFlags": [
      {
        "id": "uuid",
        "texte": "Être policier",
        "elo_global": 1250,
        "nb_participations": 1500
      }
    ],
    "topGreenFlags": [
      {
        "id": "uuid",
        "texte": "Être jardinier",
        "elo_global": 750,
        "nb_participations": 1200
      }
    ]
  }
}
```

---

### 🏆 GET /api/admin/rankings

Get detailed ELO rankings with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | redflags or greenflags |
| `limit` | integer | Number of results (default: 10) |
| `categorie` | string | Filter by category |
| `segment` | string | Segment: global, homme, femme, etc. |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "id": "uuid",
      "texte": "Être policier",
      "categorie": "metier",
      "elo_global": 1250,
      "elo_homme": 1180,
      "elo_femme": 1320,
      "nb_participations": 1500
    }
  ]
}
```

---

### ⭐ GET /api/admin/starred-duels

Get the most starred duels.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Number of results (default: 20) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "elementA": {
        "id": "uuid",
        "texte": "Être policier"
      },
      "elementB": {
        "id": "uuid",
        "texte": "Aimer les pieds"
      },
      "stars_count": 45,
      "thumbs_up_count": 120,
      "thumbs_down_count": 5
    }
  ]
}
```

---

### 📤 GET /api/admin/export/elements

Export elements to CSV.

**Response:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="redorgreen_elements_20260112_100000.csv"

id;texte;categorie;elo_global;nb_participations;actif
uuid1;Être policier;metier;1250;1500;true
uuid2;Aimer les pieds;preference;1080;983;true
```

**Notes:**
- Separator: `;` (Excel French compatible)
- Encoding: UTF-8 with BOM
- Filename includes timestamp

---

### � GET /api/admin/export/votes

Export votes to CSV.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `from` | date | Start date (ISO format) |
| `to` | date | End date (ISO format) |

**Response:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="redorgreen_votes_20260112_100000.csv"

id;element_gagnant;element_perdant;sexe;age;created_at
uuid1;Être policier;Aimer les pieds;homme;19-22;2026-01-12T10:00:00Z
```

---

## 🧪 Example Usage

### cURL - Record a Vote
```bash
curl -X POST https://redorgreen.vercel.app/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "winnerId": "550e8400-e29b-41d4-a716-446655440000",
    "loserId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "sexe": "femme",
    "age": "23-26"
  }'
```

### JavaScript (fetch)
```javascript
// Get next duel
const seenDuels = JSON.parse(localStorage.getItem('seenDuels') || '[]');
const response = await fetch(`/api/duel?seenDuels=${seenDuels.join(',')}`);
const { data } = await response.json();

// Record vote
const voteResponse = await fetch('/api/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    winnerId: data.elementA.id,
    loserId: data.elementB.id,
    sexe: profile.sexe,
    age: profile.age
  })
});
```

---

## 📝 API Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 12, 2026 | Initial API specification |

---

🚦 **Note:** API specifications must be updated with each endpoint modification.
