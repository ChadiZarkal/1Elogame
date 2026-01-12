# 🔧 Technical Specifications - Red or Green Game

> **Technical specifications document for implementation**

---

## 📌 Document Information

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | ✅ Approved |
| **Last Update** | January 12, 2026 |
| **Author** | AI Architect |
| **Reviewers** | Solo Founder |

---

## 🎯 Objective

This document defines the **technical constraints, architecture, and standards** to respect during implementation. It guides AI agents and developers in their technical choices.

---

## 🏗️ System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Mobile Web App (Next.js 14)                   │    │
│  │            - Profile Form                                │    │
│  │            - Game Interface                              │    │
│  │            - Result Display                              │    │
│  │            - Admin Dashboard                             │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js API Routes)          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  /api/duel  │  │  /api/vote  │  │ /api/admin  │              │
│  │  GET next   │  │  POST vote  │  │  CRUD ops   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase PostgreSQL                         │    │
│  │   - elements table                                       │    │
│  │   - votes table                                          │    │
│  │   - duel_feedback table                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              LocalStorage (Client)                       │    │
│  │   - Profile (sex, age)                                   │    │
│  │   - SeenDuels                                            │    │
│  │   - Streak                                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Main Components

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Frontend | Next.js 14 (App Router) | UI, Game Logic, Admin |
| Backend | Next.js API Routes | REST API, ELO Calculation |
| Database | Supabase PostgreSQL | Elements, Votes, Feedback |
| Cache | LocalStorage | Sessions, SeenDuels, Streak |
| Hosting | Vercel | CDN, Edge Functions |
| State | Zustand | Lightweight client state |

---

## 💻 Technology Stack

### Frontend
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x (strict mode)
State Management: Zustand (lightweight)
Styling: TailwindCSS 3.x
Animations: Framer Motion / CSS Animations (60fps required)
Build Tool: Next.js built-in (Turbopack)
Testing: 
  - Unit: Jest / Vitest
  - E2E: Playwright (if time permits)
Linting: ESLint + Prettier
```

### Backend
```yaml
Runtime: Node.js 20.x (Vercel Edge)
Framework: Next.js 14 API Routes
Language: TypeScript 5.x (strict mode)
ORM: Supabase Client SDK
Validation: Zod
API Style: REST
Authentication: Simple hash comparison (admin only)
```

### Infrastructure
```yaml
Cloud Provider: Vercel (frontend + API) + Supabase (database)
Container: Not needed (serverless)
CI/CD: Vercel GitHub Integration (automatic)
Monitoring: Vercel Analytics (built-in)
Cost: €0 (free tiers)
```

---

## 📁 Project Structure

```
/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── jeu/
│   │   ├── page.tsx               # Profile form
│   │   └── jouer/
│   │       └── page.tsx           # Game interface
│   ├── admin/
│   │   ├── page.tsx               # Admin login
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard
│   │   ├── elements/
│   │   │   └── page.tsx           # Elements CRUD
│   │   └── stats/
│   │       └── page.tsx           # Statistics
│   └── api/
│       ├── duel/
│       │   └── route.ts           # GET next duel
│       ├── vote/
│       │   └── route.ts           # POST vote
│       ├── elements/
│       │   └── route.ts           # CRUD elements (admin)
│       ├── stats/
│       │   └── route.ts           # GET stats (admin)
│       ├── feedback/
│       │   └── route.ts           # POST star/thumbs
│       └── elo/
│           └── update/
│               └── route.ts       # Async ELO update
│
├── components/
│   ├── game/
│   │   ├── ProfileForm.tsx
│   │   ├── DuelInterface.tsx
│   │   ├── ResultDisplay.tsx
│   │   ├── ResultAnimation.tsx
│   │   └── StreakDisplay.tsx
│   ├── admin/
│   │   ├── ElementForm.tsx
│   │   ├── ElementList.tsx
│   │   ├── DashboardCard.tsx
│   │   └── StatsTable.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Loading.tsx
│
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── elo.ts                     # ELO calculations
│   ├── algorithm.ts               # Duel selection
│   ├── session.ts                 # LocalStorage helpers
│   └── utils.ts                   # Utility functions
│
├── stores/
│   └── gameStore.ts               # Zustand store
│
├── types/
│   ├── database.ts                # Supabase types
│   ├── game.ts                    # Game types
│   └── api.ts                     # API types
│
└── public/
    └── favicon.ico
```

---

## 🔐 Security

### Authentication (Admin Only)
| Aspect | Solution |
|--------|----------|
| Method | Email + Password hash comparison |
| Credentials | ADMIN_EMAIL, ADMIN_PASSWORD_HASH env vars |
| Password Hash | bcrypt (cost factor 12) |
| Session | JWT token in httpOnly cookie |
| Expiry | 24 hours |

### Player Security
```yaml
Model: Anonymous (no authentication)
Data: All data is aggregate, no PII
Session: LocalStorage only (client-side)
GDPR: Minimal - anonymous aggregate data only
```

### Security Standards
- [x] HTTPS enforced (Vercel default)
- [x] Input validation on all API endpoints (Zod)
- [x] CORS configured for production domain only
- [x] No user accounts (no password storage for players)
- [x] Admin password hashed with bcrypt
- [x] Environment variables for secrets

---

## 📊 Database Schema

### Table: elements
```sql
CREATE TABLE elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  texte TEXT UNIQUE NOT NULL,
  categorie TEXT NOT NULL CHECK (categorie IN ('metier', 'comportement', 'trait', 'preference', 'absurde')),
  niveau_provocation INTEGER CHECK (niveau_provocation BETWEEN 1 AND 4) DEFAULT 2,
  actif BOOLEAN DEFAULT TRUE,
  
  -- ELO Scores (Global + Segmented)
  elo_global INTEGER DEFAULT 1000,
  elo_homme INTEGER DEFAULT 1000,
  elo_femme INTEGER DEFAULT 1000,
  elo_nonbinaire INTEGER DEFAULT 1000,
  elo_autre INTEGER DEFAULT 1000,
  elo_16_18 INTEGER DEFAULT 1000,
  elo_19_22 INTEGER DEFAULT 1000,
  elo_23_26 INTEGER DEFAULT 1000,
  elo_27plus INTEGER DEFAULT 1000,
  
  -- Statistics
  nb_participations INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_elements_elo_global ON elements(elo_global);
CREATE INDEX idx_elements_actif ON elements(actif);
CREATE INDEX idx_elements_categorie ON elements(categorie);
```

### Table: votes
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_gagnant_id UUID NOT NULL REFERENCES elements(id),
  element_perdant_id UUID NOT NULL REFERENCES elements(id),
  sexe_votant TEXT CHECK (sexe_votant IN ('homme', 'femme', 'nonbinaire', 'autre')),
  age_votant TEXT CHECK (age_votant IN ('16-18', '19-22', '23-26', '27+')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for statistics
CREATE INDEX idx_votes_created ON votes(created_at);
CREATE INDEX idx_votes_gagnant ON votes(element_gagnant_id);
CREATE INDEX idx_votes_perdant ON votes(element_perdant_id);
CREATE INDEX idx_votes_segment ON votes(sexe_votant, age_votant);
```

### Table: duel_feedback
```sql
CREATE TABLE duel_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_a_id UUID NOT NULL REFERENCES elements(id),
  element_b_id UUID NOT NULL REFERENCES elements(id),
  stars_count INTEGER DEFAULT 0,
  thumbs_up_count INTEGER DEFAULT 0,
  thumbs_down_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique pair (sorted to avoid duplicates)
  UNIQUE(element_a_id, element_b_id)
);

CREATE INDEX idx_feedback_stars ON duel_feedback(stars_count DESC);
```

### Schema Conventions
| Convention | Rule |
|------------|------|
| Table naming | snake_case, plural |
| Column naming | snake_case |
| Primary Keys | UUID v4 |
| Timestamps | created_at, updated_at (timezone-aware) |
| Foreign Keys | [table_singular]_id |
| Enums | CHECK constraints (simpler than pg enums) |

---

## 🌐 API Design

### Base Configuration
```yaml
Base URL: /api
Format: JSON
Authentication: JWT (admin only)
Rate Limit: Not needed for MVP (~15 users)
```

### Endpoints

#### GET /api/duel
Get the next duel for the player.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| seenDuels | string | No | Comma-separated "id1-id2" pairs |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "elementA": {
      "id": "uuid",
      "texte": "Être policier",
      "categorie": "metier"
    },
    "elementB": {
      "id": "uuid", 
      "texte": "Aimer les pieds",
      "categorie": "preference"
    }
  }
}
```

#### POST /api/vote
Record a vote and calculate ELO.

**Request Body:**
```json
{
  "winnerId": "uuid",
  "loserId": "uuid",
  "sexe": "homme",
  "age": "19-22"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "winner": {
      "id": "uuid",
      "percentage": 68,
      "participations": 1247
    },
    "loser": {
      "id": "uuid",
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

#### POST /api/feedback
Record star or thumbs feedback.

**Request Body:**
```json
{
  "elementAId": "uuid",
  "elementBId": "uuid",
  "type": "star" | "thumbs_up" | "thumbs_down"
}
```

#### GET /api/elements (Admin)
List all elements with filters.

#### POST /api/elements (Admin)
Create a new element.

#### PUT /api/elements/:id (Admin)
Update an element.

#### DELETE /api/elements/:id (Admin)
Deactivate an element.

#### GET /api/stats (Admin)
Get dashboard statistics.

### Response Format
```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "winnerId",
        "message": "Invalid UUID format"
      }
    ]
  }
}
```

### HTTP Codes
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Client error (validation) |
| 401 | Not authenticated (admin) |
| 404 | Not found |
| 500 | Server error |

---

## ⚡ Performance Requirements

### Critical Metrics (Non-Negotiable)
| Metric | Target | How to Achieve |
|--------|--------|----------------|
| Time between duels | < 200ms | Preloading, in-memory ELO |
| ELO calculation | < 20ms | Simple math, no DB during calc |
| Animation framerate | 60fps | CSS transforms only (GPU) |
| Initial page load | < 2s | Next.js SSG, code splitting |
| Vote API response | < 100ms p95 | Optimized queries, indexes |

### Preloading Strategy
```typescript
// During result display (3-4 seconds), preload next 2 duels
useEffect(() => {
  if (showingResult) {
    preloadNextDuels(2);
  }
}, [showingResult]);

// When player clicks "Next", duel is already ready (0ms)
```

### ELO Calculation (In-Memory)
```typescript
// lib/elo.ts - MUST be < 20ms
export function calculateNewELO(
  winnerELO: number,
  loserELO: number,
  kFactor: number = 32
): { newWinnerELO: number; newLoserELO: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserELO - winnerELO) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  return {
    newWinnerELO: Math.round(winnerELO + kFactor * (1 - expectedWinner)),
    newLoserELO: Math.round(loserELO + kFactor * (0 - expectedLoser))
  };
}

export function estimatePercentage(eloA: number, eloB: number): number {
  const proba = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  return Math.round(proba * 100);
}
```

### Animation (GPU-Accelerated)
```css
/* CORRECT: Use transforms (GPU) */
.winner-zone {
  transition: transform 1.2s ease-out;
  transform: scaleY(1.36);
  will-change: transform;
}

/* WRONG: Never use height/width (causes reflow) */
.winner-zone-bad {
  transition: height 1.2s ease-out; /* DON'T DO THIS */
  height: 68%;
}
```

---

## 📏 Code Standards

### TypeScript/JavaScript
```typescript
// Naming conventions
const CONSTANT_VALUE = 'value';           // SCREAMING_SNAKE_CASE
const variableName = 'value';             // camelCase
function functionName() {}                 // camelCase
class ClassName {}                         // PascalCase
interface InterfaceName {}                // PascalCase
type TypeName = {};                       // PascalCase

// File structure order
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component/Function
// 5. Exports

// Strict mode required
// tsconfig.json: "strict": true
// No 'any' types allowed
```

### Git Conventions
```
Branches:
  main          # Production
  develop       # Development
  feature/*     # New features
  bugfix/*      # Bug fixes

Commits: Conventional Commits
  feat(game): add streak display
  fix(elo): correct calculation formula
  docs: update README
  refactor(api): optimize vote endpoint
```

---

## 🚀 Deployment

### Environments
| Env | URL | Branch | Auto-deploy |
|-----|-----|--------|-------------|
| Production | redorgreen.vercel.app | main | Yes |

### Environment Variables (Vercel)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$12$xxx  # bcrypt hash

# App
NEXT_PUBLIC_APP_URL=https://redorgreen.vercel.app
```

### Deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] Supabase tables created with correct schema
- [ ] 200 elements imported into database
- [ ] Admin password hash generated and stored
- [ ] CORS configured for production domain
- [ ] Test vote flow end-to-end
- [ ] Verify < 200ms performance

---

## 📈 Monitoring

### Vercel Analytics (Built-in)
- Page views
- Response times
- Error rates
- Edge function performance

### Custom Metrics (Admin Dashboard)
| Metric | Source | Display |
|--------|--------|---------|
| Total votes | COUNT(votes) | Dashboard |
| Active elements | COUNT(elements WHERE actif) | Dashboard |
| Sessions (24h) | Estimated from vote timestamps | Dashboard |
| Avg duels/session | Custom calculation | Dashboard |
| Vote latency | API timing logs | Dashboard |

---

## 📝 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 12, 2026 | AI Architect | Complete technical specs |

---

🚦 **Gate:** Technical specifications APPROVED - Ready for implementation.

## ✅ Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Founder | Solo Founder | Jan 12, 2026 | ✅ |
| AI Architect | Claude | Jan 12, 2026 | ✅ |
