# 📄 Product Requirements Document (PRD) - Red or Green Game

> **Complete product specifications document to guide development**

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Title** | Red or Green Game - MVP |
| **Version** | 1.0 |
| **Author** | AI Architect |
| **Creation Date** | January 10, 2026 |
| **Last Update** | January 12, 2026 |
| **Status** | ✅ Approved |
| **Priority** | P0 (Critical) |

---

## 🎯 Summary

### Problem Statement
> Party games for young adults (16-26) fail to create instant engagement. They require complex setup, tutorials, or accounts, and often don't generate the debates and laughter that make parties memorable.

### Proposed Solution
> A mobile-first web game where players instantly choose between two options which is the biggest "Red Flag". Results show what the majority thinks, using an ELO-based ranking system for meaningful statistics from day one.

### Business Value
> Validate a viral game concept with minimal investment. If successful, the statistical data and engagement patterns provide a foundation for content-driven growth on social media.

---

## 👥 Users and Personas

### Primary Persona
```yaml
Name: Alex - The Party Starter
Description: Young adult who loves bringing energy to parties
Age: 18-24 years old
Context: Student parties, friend gatherings, pre-games
Objectives:
  - Find games that require zero explanation
  - Create memorable moments with friends
  - Have content worth talking about
Frustrations:
  - Games that take too long to set up
  - Boring, predictable content
  - Having to create accounts or download apps
Behaviors:
  - Phone always in hand
  - Shares funny content on social media
  - Short attention span
  - Influenced by group dynamics
```

### Admin Persona
```yaml
Name: Solo Founder
Description: Non-technical founder managing content
Objectives:
  - Easily add/modify game elements
  - View engagement statistics
  - Identify viral content
Needs:
  - Simple, intuitive admin interface
  - Quick content management
  - Exportable statistics for social posts
```

---

## 🎪 User Stories

### Epic 1: Game Experience

#### Story 1.1: Profile Creation
```
As a player
I want to quickly enter my basic profile (sex + age)
So that I can start playing immediately and contribute to segmented statistics

Acceptance Criteria:
- [ ] Two required fields: Sex (4 options) and Age (4 ranges)
- [ ] No email, no account, no password
- [ ] Profile stored in LocalStorage only
- [ ] Form completion in < 30 seconds
- [ ] Single page, clear CTAs

Notes:
- Sex options: Homme, Femme, Non-binaire, Autre
- Age ranges: 16-18, 19-22, 23-26, 27+
```

#### Story 1.2: Play a Duel
```
As a player
I want to see two options displayed clearly on screen
So that I can instantly choose which one is the bigger Red Flag

Acceptance Criteria:
- [ ] Two clickable zones, each 50% of screen height
- [ ] Large, readable text for each element
- [ ] Mobile-first responsive design
- [ ] Click registers vote immediately
- [ ] No confirmation needed

Notes:
- Interface must work for phone passing scenario
- Text must be visible from arm's length
```

#### Story 1.3: See Results
```
As a player
I want to see what percentage of people agree with my choice
So that I can debate with friends and feel part of a community

Acceptance Criteria:
- [ ] Winner zone animates to expand (1.2s, skippable)
- [ ] Both percentages displayed clearly
- [ ] Number of votes per element shown
- [ ] Streak counter visible
- [ ] Auto-advance after 3 seconds OR manual "Next"

Notes:
- Percentages based on ELO estimation, not direct votes
- Animation must be 60fps, GPU-accelerated
```

#### Story 1.4: Continue Playing
```
As a player
I want to play infinite duels without repetition
So that I can keep the game going as long as the party lasts

Acceptance Criteria:
- [ ] Never see the same duel twice in a session
- [ ] Duels preloaded for 0ms transition
- [ ] Clear message when all duels exhausted
- [ ] Option to reset and start fresh

Notes:
- Duel pairs tracked in LocalStorage
- Approximately 19,900 possible combinations (200 elements)
```

#### Story 1.5: Track My Streak
```
As a player
I want to see how many times in a row I agreed with the majority
So that I feel competitive and engaged

Acceptance Criteria:
- [ ] Streak increments when player matches majority (ELO-based)
- [ ] Streak resets to 0 on disagreement
- [ ] Visual feedback: 5+ = 🔥, 10+ = 🔥🔥, 20+ = 🔥🔥🔥
- [ ] Stored in LocalStorage (resets on page refresh)

Notes:
- "Majority" defined by ELO probability, not direct votes
```

### Epic 2: Feedback System

#### Story 2.1: Star a Duel
```
As a player
I want to mark a duel as particularly interesting
So that I can influence which duels appear more often

Acceptance Criteria:
- [ ] Star button visible after result display
- [ ] One star per duel per session
- [ ] Visual confirmation of star action
- [ ] Star count influences duel selection algorithm

Notes:
- Ultra-minimalist design
- No account needed, anonymous tracking
```

#### Story 2.2: Thumbs Feedback
```
As a player
I want to give quick feedback on duel quality
So that admins can identify problematic content

Acceptance Criteria:
- [ ] Thumbs up and thumbs down buttons
- [ ] Anonymous, no account needed
- [ ] Visible in admin stats

Notes:
- Should Have feature, not blocking for MVP
```

### Epic 3: Admin Management

#### Story 3.1: Admin Login
```
As an admin
I want to securely access the admin interface
So that only I can manage the game content

Acceptance Criteria:
- [ ] Simple email + password login
- [ ] Password stored as hash
- [ ] Environment variables for credentials
- [ ] No multi-user, no OAuth

Notes:
- ADMIN_EMAIL and ADMIN_PASSWORD_HASH env vars
```

#### Story 3.2: Manage Elements
```
As an admin
I want to add, edit, and deactivate game elements
So that I can control the game content

Acceptance Criteria:
- [ ] Create element: text, category, provocation level
- [ ] Edit element: modify any field
- [ ] Deactivate: remove from game without deleting data
- [ ] Reactivate: bring back deactivated elements
- [ ] Confirmation popups for destructive actions

Notes:
- ELO scores preserved on edit
- Categories: metier, comportement, trait, preference, absurde
```

#### Story 3.3: View Dashboard
```
As an admin
I want to see key metrics at a glance
So that I can understand how the game is performing

Acceptance Criteria:
- [ ] Total votes count
- [ ] Active elements count
- [ ] Active sessions (last 24h)
- [ ] Average duels per session
- [ ] Average latency (< 200ms target)

Notes:
- Real-time or near real-time data
```

#### Story 3.4: View Rankings
```
As an admin
I want to see which elements are most/least Red Flag
So that I can create viral social content

Acceptance Criteria:
- [ ] Top 10 Red Flags (highest ELO)
- [ ] Top 10 Green Flags (lowest ELO)
- [ ] Filter by category
- [ ] Filter by segment (sex, age) - Should Have

Notes:
- Export to CSV for social posts
```

---

## 🖼️ User Flows

### Flow 1: Core Game Loop

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│   Profile   │────▶│    Duel     │────▶│   Result    │
│    Page     │     │    Form     │     │  Interface  │     │   Display   │
└─────────────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                               │                    │
                                               │    Vote Action     │
                                               │◀───────────────────│
                                               │                    │
                                               │    Next Duel       │
                                               │◀───────────────────│
                                                        ▲
                                                        │ Loop
                                                        └────────────────┘
```

### Flow Description
1. **Landing Page:** Player arrives, sees "Play" button
2. **Profile Form:** Quick 2-field form (sex + age), stored in LocalStorage
3. **Duel Interface:** Two large zones with element text
4. **Vote Action:** Player clicks chosen element
5. **Result Display:** Animation shows winner, percentages, streak
6. **Loop:** Next duel preloaded, continues infinitely

### Edge Cases
| Case | Condition | Expected Behavior |
|------|-----------|-------------------|
| All duels seen | 19,900 combinations exhausted | "You've seen it all!" message + reset option |
| Page refresh | Session cleared | Back to profile form |
| Slow connection | API latency > 500ms | Loading indicator, retry |
| LocalStorage full | > 5MB data | Clear and restart |

---

## 📐 Functional Requirements

### F1: ELO Ranking System
| Attribute | Value |
|-----------|-------|
| **ID** | F1 |
| **Priority** | P0 - Must Have |
| **Complexity** | Medium |

**Description:**
> Every element has an ELO score that evolves based on duel outcomes. This enables meaningful statistics from day one and prediction of outcomes for never-played duel combinations.

**Expected Behavior:**
- All elements start at ELO 1000
- When element A wins vs B: A's ELO increases, B's decreases
- Larger ELO difference = smaller adjustments (expected outcome)
- K-factor = 32 (adjustable)

**ELO Calculation Formula:**
```
Expected = 1 / (1 + 10^((ELO_Opponent - ELO_Self) / 400))
New_ELO = Old_ELO + K * (Actual - Expected)
```

**Edge Cases:**
- First vote on new element: Use default 1000 ELO
- Very high ELO diff (>400): Cap adjustment to prevent runaway

---

### F2: Intelligent Duel Selection
| Attribute | Value |
|-----------|-------|
| **ID** | F2 |
| **Priority** | P0 - Must Have |
| **Complexity** | Medium |

**Description:**
> Algorithm selects duels using a mix of strategies to maximize engagement.

**Distribution:**
- 50%: ELO close (50-300 point difference) → Balanced debates
- 30%: Cross-category → Absurd, viral combinations
- 15%: Starred duels (if ≥50 stars) → Popular content
- 5%: Random → Discovery, new elements

**Dependencies:**
- F1 (ELO System)
- LocalStorage for seen duels tracking

---

### F3: Session Management
| Attribute | Value |
|-----------|-------|
| **ID** | F3 |
| **Priority** | P0 - Must Have |
| **Complexity** | Low |

**Description:**
> Client-side session using LocalStorage only. No server-side sessions.

**Session Data:**
```typescript
{
  profile: { sex: string, age: string },
  seenDuels: string[],  // "id1-id2" format, sorted
  streak: number,
  duelCount: number
}
```

**Behavior:**
- Page refresh = Full reset
- No persistence across sessions
- Max 200 duels tracked before cleanup prompt

---

## 🔒 Non-Functional Requirements

### Performance
| Metric | Target | Measurement |
|--------|--------|-------------|
| Time between duels | < 200ms | Chrome DevTools |
| ELO calculation | < 20ms | Server logs |
| Animation framerate | 60fps | Chrome DevTools |
| Initial load | < 2s | Lighthouse |
| Vote response | < 100ms p95 | APM |

### Security
- [x] Admin authentication: Email + Password (hashed)
- [x] No user accounts: Anonymous only
- [x] Encryption: HTTPS enforced
- [x] CORS: Configured for production domain only

### Compatibility
| Platform | Supported Versions |
|----------|-------------------|
| iOS Safari | 14+ |
| Android Chrome | 90+ |
| Desktop Chrome | 90+ |
| Desktop Firefox | 88+ |
| Desktop Safari | 14+ |

---

## 🎨 Wireframes

### Screen 1: Game Interface (Before Vote)
```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│           ÊTRE POLICIER                │
│                                        │
│              (50%)                     │
│                                        │
├────────────────────────────────────────┤
│                                        │
│                                        │
│          AIMER LES PIEDS               │
│                                        │
│              (50%)                     │
│                                        │
└────────────────────────────────────────┘
```

### Screen 2: Result Display
```
┌────────────────────────────────────────┐
│                                        │
│           ÊTRE POLICIER                │
│           68% 🔴                       │
│           1,247 votes                  │
│              (68%)                     │
│                                        │
├────────────────────────────────────────┤
│          AIMER LES PIEDS               │
│           32% 🟢                       │
│              (32%)                     │
├────────────────────────────────────────┤
│  Streak: 5 🔥    ⭐ Star   👍 👎      │
│          [ Suivant → ]                 │
└────────────────────────────────────────┘
```

**UI Notes:**
- Winner zone expands to match its percentage
- Red color for Red Flag winner, Green for Green Flag
- Star and thumbs are subtle, bottom of screen

---

## 📊 Data and Analytics

### Events to Track (Admin Dashboard)
| Event | Trigger | Properties |
|-------|---------|------------|
| vote_cast | Player votes | element_winner, element_loser, sex, age |
| duel_starred | Player stars duel | element_a, element_b |
| session_start | Profile completed | sex, age |
| session_duels | Session ends | duel_count |

### Success Metrics
| KPI | Baseline | Target | Method |
|-----|----------|--------|--------|
| Duels per session | N/A | > 10 | Admin dashboard |
| Session duration | N/A | > 3 min | Estimated from duel count |
| Star rate | N/A | > 30% of duels | Admin dashboard |
| Streak 5+ rate | N/A | > 40% of sessions | Admin dashboard |
| Vote latency | N/A | < 200ms p95 | Server logs |

---

## 🔗 Integrations and Dependencies

### External Services
| Service | Usage | Documentation |
|---------|-------|---------------|
| Supabase | PostgreSQL database | supabase.com/docs |
| Vercel | Hosting + Serverless | vercel.com/docs |

### No External APIs Required
MVP is self-contained. No third-party integrations needed.

---

## 🚀 Release Plan

### Phase 1: MVP (Must Have) - Week 1-2
- [x] Project setup (Next.js + Supabase)
- [ ] Profile form
- [ ] Game interface
- [ ] Vote + ELO calculation
- [ ] Result display + animation
- [ ] Duel selection algorithm
- [ ] Streak system
- [ ] Admin login
- [ ] Admin CRUD elements
- [ ] Admin basic dashboard
- [ ] 200 elements imported

### Phase 2: Polish (Should Have) - Week 2-3
- [ ] Star feedback system
- [ ] Thumbs feedback
- [ ] Segmented ELO (async)
- [ ] Detailed admin stats
- [ ] CSV exports
- [ ] Back button

### Future Iterations (V2)
- Community content submission
- Social sharing features
- Advanced analytics
- Themed duel modes

---

## ❓ Open Questions

| # | Question | Assigned | Deadline | Answer |
|---|----------|----------|----------|--------|
| 1 | All 200 elements created? | Founder | Week 1 | In progress |
| 2 | Provocation levels defined? | Founder | Week 1 | 1-4 scale |

---

## ✅ Approvals

| Role | Name | Date | Status |
|------|------|------|--------|
| Founder/Sponsor | Solo Founder | Jan 10, 2026 | ✅ Approved |
| AI Architect | Claude | Jan 10, 2026 | ✅ Approved |

---

## 📝 Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 10, 2026 | AI Architect | Complete PRD validated |

---

🚦 **Gate:** PRD APPROVED - Ready for technical specifications.
