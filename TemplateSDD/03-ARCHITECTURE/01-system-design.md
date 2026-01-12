# 🏗️ System Design - Red or Green Game

> **Global system architecture**

---

## 📌 Overview

This document describes the high-level system architecture for the Red or Green Game, a viral mobile web party game. The architecture prioritizes **simplicity**, **performance**, and **zero-cost hosting**.

---

## 🎯 Architectural Objectives

| Objective | Description | Priority |
|-----------|-------------|----------|
| **Performance** | <200ms between duels (NON-NEGOTIABLE) | Critical |
| **Simplicity** | Minimal stack, easy to maintain | Critical |
| **Zero Cost** | Free tier hosting only (Supabase + Vercel) | High |
| **Responsiveness** | Mobile-first, all screen sizes | High |
| **Scalability** | Support ~15 concurrent users (party context) | Medium |
| **Maintainability** | Clean code, TypeScript strict | Medium |

---

## 🏛️ Global Architecture

### Simple Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RED OR GREEN GAME - MVP                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐                              ┌─────────────┐      │
│   │   Mobile    │                              │   Mobile    │      │
│   │   Player 1  │                              │   Player N  │      │
│   └──────┬──────┘                              └──────┬──────┘      │
│          │                                            │              │
│          │ HTTPS (Vercel Edge)                        │              │
│          ▼                                            ▼              │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      VERCEL EDGE CDN                         │   │
│   │   • Static Assets (Next.js SSG)                              │   │
│   │   • Edge Caching                                             │   │
│   │   • Automatic HTTPS                                          │   │
│   └────────────────────────────┬────────────────────────────────┘   │
│                                │                                     │
│                                ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   NEXT.JS 14 (App Router)                    │   │
│   │                                                              │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│   │   │   Pages      │  │  Components  │  │  API Routes  │      │   │
│   │   │   /          │  │  DuelCard    │  │  /api/duel   │      │   │
│   │   │   /admin     │  │  VoteButton  │  │  /api/vote   │      │   │
│   │   │              │  │  ResultAnim  │  │  /api/admin  │      │   │
│   │   └──────────────┘  └──────────────┘  └──────────────┘      │   │
│   │                                              │               │   │
│   └──────────────────────────────────────────────┼───────────────┘   │
│                                                  │                   │
│                                                  ▼                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     SUPABASE (Free Tier)                     │   │
│   │                                                              │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│   │   │  PostgreSQL  │  │  Auth (JWT)  │  │  Connection  │      │   │
│   │   │  • elements  │  │  Admin only  │  │   Pooling    │      │   │
│   │   │  • votes     │  │              │  │              │      │   │
│   │   │  • feedback  │  │              │  │              │      │   │
│   │   └──────────────┘  └──────────────┘  └──────────────┘      │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    CLIENT STORAGE                            │   │
│   │                                                              │   │
│   │   localStorage: profile, seenDuels, streak                   │   │
│   │   Memory: preloaded elements (Zustand store)                 │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                         REQUEST FLOW                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   GAME START:                                                          │
│   ┌────────┐      ┌─────────┐      ┌──────────┐      ┌───────────┐   │
│   │ Player │─────▶│ Profile │─────▶│ Preload  │─────▶│  Ready!   │   │
│   │        │      │  Form   │      │ Elements │      │           │   │
│   └────────┘      └─────────┘      └──────────┘      └───────────┘   │
│                       │                 │                              │
│                       ▼                 ▼                              │
│                 LocalStorage      GET /api/elements                    │
│                                   (all active elements)                │
│                                                                        │
│   DUEL FLOW (Critical Path - <200ms):                                  │
│   ┌────────┐      ┌─────────┐      ┌──────────┐      ┌───────────┐   │
│   │ Player │─────▶│  Vote   │─────▶│ POST     │─────▶│  Result   │   │
│   │ Taps   │      │ Capture │      │/api/vote │      │ Animation │   │
│   └────────┘      └─────────┘      └──────────┘      └───────────┘   │
│                       │                 │                 │            │
│                       │                 │                 │            │
│                       ▼                 ▼                 ▼            │
│              In-memory selection   DB Update         Skip on tap       │
│              (no network!)         (async BG)        Next duel ready   │
│                                                                        │
│   ELO UPDATES:                                                         │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │  SYNC (Blocking)              │  ASYNC (Background)            │  │
│   │  • elo_global                 │  • elo_homme, elo_femme...     │  │
│   │  • nb_participations          │  • Age segment ELOs            │  │
│   │  Target: <20ms                │  Target: eventually consistent │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Components

### Frontend (Next.js 14)

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Pages | Next.js App Router | SSG for main page, protected admin |
| Game Components | React 18 + TypeScript | DuelCard, VoteButtons, ResultDisplay |
| State Management | Zustand | Elements cache, current duel, streak |
| Animations | Framer Motion | Result reveals (60fps, GPU-accelerated) |
| Styling | TailwindCSS | Mobile-first responsive design |

### Backend (Next.js API Routes)

| Route | Responsibility | Performance Target |
|-------|----------------|-------------------|
| `GET /api/elements` | Preload all active elements | <500ms (once) |
| `GET /api/duel` | Fallback duel selection | <100ms |
| `POST /api/vote` | Record vote + update ELO | <150ms |
| `POST /api/feedback` | Record star/thumbs | <100ms |
| `GET/POST /api/admin/*` | Admin CRUD operations | <500ms |

### Data Layer

| Component | Technology | Usage |
|-----------|------------|-------|
| Primary DB | Supabase PostgreSQL | Elements, votes, feedback |
| Client Cache | Zustand + Memory | Preloaded elements for duel selection |
| Session Storage | LocalStorage | Profile, seenDuels, streak |
| Auth | Supabase Auth (JWT) | Admin authentication only |

---

## 🔄 Data Flows

### Game Start Flow

```
Player              Browser              Next.js API           Supabase
   │                   │                     │                     │
   │── Open App ──────▶│                     │                     │
   │                   │── Check localStorage │                     │
   │                   │   (profile exists?) │                     │
   │◀── Profile Form ──│                     │                     │
   │                   │                     │                     │
   │── Submit Profile ─▶│                     │                     │
   │                   │── Save to localStorage                     │
   │                   │── GET /api/elements ▶│                     │
   │                   │                     │── SELECT * elements ▶│
   │                   │                     │◀── 200 elements ─────│
   │                   │◀── Elements JSON ───│                     │
   │                   │                     │                     │
   │                   │── Store in Zustand  │                     │
   │                   │── Select first duel │                     │
   │◀── Display Duel ──│   (in-memory)       │                     │
   │                   │                     │                     │
```

### Vote Flow (Critical Path)

```
Player              Browser              Next.js API           Supabase
   │                   │                     │                     │
   │── Tap Element ───▶│                     │                     │
   │                   │── POST /api/vote ──▶│                     │
   │                   │    (fire & forget)  │── INSERT vote ─────▶│
   │                   │                     │── UPDATE elo_global ▶│
   │                   │                     │◀── Success ──────────│
   │                   │                     │                     │
   │                   │                     │── ASYNC: Update     │
   │                   │                     │   segmented ELOs    │
   │                   │◀── VoteResult ──────│                     │
   │◀── Show Animation─│                     │                     │
   │                   │                     │                     │
   │                   │── Select next duel  │                     │
   │                   │   (IN-MEMORY)       │                     │
   │                   │                     │                     │
   │── Tap/Wait ──────▶│                     │                     │
   │◀── Next Duel ─────│                     │                     │
   │                   │   (NO NETWORK!)     │                     │
```

---

## 🎯 Performance Architecture

### Critical Path Optimization

```
┌────────────────────────────────────────────────────────────────────┐
│                    <200ms DUEL TRANSITION                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  TAP → NEXT DUEL                                             │  │
│   │                                                              │  │
│   │  [0ms]     Tap detected                                     │  │
│   │  [0-5ms]   Update localStorage (seenDuels, streak)          │  │
│   │  [5-15ms]  Fire vote API (async, non-blocking)              │  │
│   │  [15-20ms] Select next duel (IN-MEMORY from Zustand)        │  │
│   │  [20-50ms] Render result animation (CSS transform, GPU)     │  │
│   │  [50-100ms] User decides to skip or watch                   │  │
│   │  [100-200ms] Next duel displayed                            │  │
│   │                                                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   KEY OPTIMIZATIONS:                                                │
│   ✓ Elements preloaded at game start                               │
│   ✓ Duel selection is purely client-side (no network)             │
│   ✓ Vote API is fire-and-forget (non-blocking)                    │
│   ✓ Animations use CSS transforms only (GPU-accelerated)          │
│   ✓ Next duel is pre-selected while animation plays               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Duel Selection Algorithm (Client-Side)

```typescript
// Executed in-memory, no network calls
function selectNextDuel(
  elements: Element[],
  seenDuels: Set<string>,
  profile: Profile
): Duel {
  const random = Math.random();
  
  if (random < 0.50) {
    // 50%: ELO-close duels (50-300 points difference)
    return selectEloCloseDuel(elements, seenDuels);
  } else if (random < 0.80) {
    // 30%: Cross-category duels
    return selectCrossCategoryDuel(elements, seenDuels);
  } else if (random < 0.95 && hasStarredDuels()) {
    // 15%: Starred duels (if ≥50 stars exist)
    return selectStarredDuel(elements, seenDuels);
  } else {
    // 5%: Pure random
    return selectRandomDuel(elements, seenDuels);
  }
}
```

---

## 🔐 Security Architecture

### Simplified Security Layers

```
┌─────────────────────────────────────────────────┐
│              Vercel Edge (HTTPS)                │  ← Automatic TLS
├─────────────────────────────────────────────────┤
│              Next.js Middleware                 │  ← Admin route protection
├─────────────────────────────────────────────────┤
│            API Input Validation (Zod)           │  ← Request sanitization
├─────────────────────────────────────────────────┤
│            Supabase Row Level Security          │  ← Admin-only writes
└─────────────────────────────────────────────────┘
```

### Security Principles for MVP

| Principle | Implementation |
|-----------|----------------|
| **No PII** | Only sex/age (anonymous, non-identifying) |
| **HTTPS Only** | Vercel automatic SSL |
| **Input Validation** | Zod schemas on all endpoints |
| **Admin Protection** | JWT + route middleware |
| **SQL Injection** | Supabase parameterized queries |

---

## 📈 Scalability (MVP Context)

### Current Scale

| Metric | Target | Justification |
|--------|--------|---------------|
| Concurrent Users | ~15 | Party game context |
| Total Elements | 200 | Content creation scope |
| Votes/Day | ~2,000 | 15 users × 10 sessions × 13 duels |
| Database Size | <100MB | Free tier sufficient |

### Future Scaling Path (if needed)

```
Phase 1 (MVP)              Phase 2 (Growth)           Phase 3 (Scale)
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Supabase Free    │  →   │ Supabase Pro     │  →   │ Self-hosted PG   │
│ Vercel Hobby     │      │ Vercel Pro       │      │ + Redis cache    │
│ 15 concurrent    │      │ 100+ concurrent  │      │ 1000+ concurrent │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## 🔧 Key Architectural Decisions

| Decision | Choice | Justification |
|----------|--------|---------------|
| Frontend Framework | Next.js 14 | SSG, API routes, Vercel integration |
| State Management | Zustand | Lightweight, simple, good for preloading |
| Database | Supabase PostgreSQL | Free tier, auth included, Vercel edge |
| Hosting | Vercel Hobby | Free, edge CDN, automatic deployments |
| Authentication | Supabase Auth | JWT, admin-only, no user accounts |
| Styling | TailwindCSS | Rapid development, small bundle |
| Animations | Framer Motion | Declarative, 60fps, easy to use |

---

## 📐 Standards and Conventions

### API Conventions

- **Format:** JSON only
- **Errors:** Standardized error response format
- **Naming:** camelCase for JSON, snake_case for DB

### Performance Standards

| Metric | Target | Measurement |
|--------|--------|-------------|
| Duel Transition | <200ms | Lighthouse + manual testing |
| Initial Load | <3s | Lighthouse FCP |
| API Response | <150ms | Vercel analytics |
| Animation | 60fps | Chrome DevTools |

---

## 📚 References

- Technical Specs: `02-SPECIFICATIONS/02-technical-specs.md`
- API Specs: `02-SPECIFICATIONS/03-api-specs.md`
- Data Models: `02-SPECIFICATIONS/04-data-models.md`
- Functional Specs: `02-SPECIFICATIONS/01-functional-specs.md`

---

🚦 **Gate:** System architecture must be validated before implementation begins.
