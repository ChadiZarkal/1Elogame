# 📝 Test Cases - Red or Green Game

> **Standardized format for Red or Green Game test cases**

---

## 📋 Test Case Structure

```markdown
## TC-[ID]: [Descriptive Title]

### Metadata
| Attribute | Value |
|----------|--------|
| **ID** | TC-XXX |
| **Feature** | [Related Feature] |
| **Priority** | Critical / High / Medium / Low |
| **Type** | Unit / Integration / E2E / Performance |
| **Automated** | Yes / No |
| **Preconditions** | [What must be in place] |

### Description
[Description of what the test verifies]

### Steps
| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | [Action] | [Input] | [Output] |
| 2 | [Action] | [Input] | [Output] |

### Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Notes
[Additional information]
```

---

## 🎮 Test Cases: Game Logic

### TC-GAME-001: Congruent Stimulus - Correct Response

| Attribute | Value |
|----------|--------|
| **ID** | TC-GAME-001 |
| **Feature** | Game Logic |
| **Priority** | Critical |
| **Type** | Unit, Integration |
| **Automated** | Yes |
| **Preconditions** | Game session active |

**Description:** Verifies that a correct response to a congruent stimulus is accepted and scored.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Generate congruent stimulus | Word: "RED", Color: red, Meaning: red | Stimulus created |
| 2 | User selects red button | Choice: "red" | Response recorded |
| 3 | Validate response | - | isCorrect = true |
| 4 | Calculate score | RT: 500ms | Score = 10 points |

**Success Criteria:**
- [ ] Response marked as correct
- [ ] Score calculated accurately
- [ ] Reaction time recorded
- [ ] Feedback displayed

```typescript
// BDD Format
describe('Game Logic', () => {
  it('should accept correct response for congruent stimulus', () => {
    const stimulus = { word: 'RED', color: 'red', meaning: 'red' };
    const response = gameLogic.processResponse(stimulus, 'red', 500);
    
    expect(response.isCorrect).toBe(true);
    expect(response.score).toBe(10);
    expect(response.reactionTime).toBe(500);
  });
});
```

---

### TC-GAME-002: Incongruent Stimulus - Meaning Color Response

| Attribute | Value |
|----------|--------|
| **ID** | TC-GAME-002 |
| **Feature** | Game Logic |
| **Priority** | Critical |
| **Type** | Unit, Integration |
| **Automated** | Yes |
| **Preconditions** | Game session active |

**Description:** Verifies that selecting the meaning color (not display color) is correct for incongruent stimuli.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Generate incongruent stimulus | Word: "RED", Color: green, Meaning: red | Stimulus created |
| 2 | User selects red button | Choice: "red" | Response recorded |
| 3 | Validate response | - | isCorrect = true |
| 4 | Calculate score | RT: 800ms | Score = 8 points |

**Success Criteria:**
- [ ] Response marked as correct (meaning color chosen)
- [ ] Display color choice would be incorrect
- [ ] Score calculated with slight time penalty
- [ ] Feedback shows correct response

```typescript
describe('Game Logic - Incongruent', () => {
  it('should accept meaning color for incongruent stimulus', () => {
    const stimulus = { word: 'RED', color: 'green', meaning: 'red' };
    const response = gameLogic.processResponse(stimulus, 'red', 800);
    
    expect(response.isCorrect).toBe(true);
    expect(response.score).toBe(8);
  });
  
  it('should reject display color for incongruent stimulus', () => {
    const stimulus = { word: 'RED', color: 'green', meaning: 'red' };
    const response = gameLogic.processResponse(stimulus, 'green', 800);
    
    expect(response.isCorrect).toBe(false);
    expect(response.score).toBe(-5);
  });
});
```

---

### TC-GAME-003: Timeout Handling

| # | Action | Données | Résultat Attendu |
|---|--------|---------|------------------|
| 1 | POST /auth/login | email: "wrong@email.com", password: "wrong" | 401 Unauthorized |
| 2 | Vérifier message | - | "Invalid credentials" |
| 3 | Vérifier pas de token | - | Aucun JWT |

```gherkin
Feature: User Login
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter "wrong@email.com" in the email field
    And I enter "wrongpassword" in the password field
    And I click the submit button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

---

### TC-GAME-003: Timeout Handling

| Attribute | Value |
|----------|--------|
| **ID** | TC-GAME-003 |
| **Feature** | Game Logic |
| **Priority** | Critical |
| **Type** | Unit, E2E |
| **Automated** | Yes |
| **Preconditions** | Game session active |

**Description:** Verifies that no response within the timeout period is handled correctly.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Display stimulus | Word: "GREEN", Color: green | Stimulus shown |
| 2 | Wait without responding | Timeout: 3000ms | Timer expires |
| 3 | Process timeout | - | Marked as incorrect |
| 4 | Calculate score | RT: 3000ms | Score = -5 points (penalty) |

**Success Criteria:**
- [ ] Timeout detected at 3000ms
- [ ] Response marked as incorrect
- [ ] Penalty applied
- [ ] Next stimulus displayed

---

### TC-GAME-004: Scoring System

| Attribute | Value |
|----------|--------|
| **ID** | TC-GAME-004 |
| **Feature** | Scoring |
| **Priority** | Critical |
| **Type** | Unit |
| **Automated** | Yes |
| **Preconditions** | None |

**Description:** Verifies score calculation based on reaction time.

**Test Data:**

| Reaction Time | Correct | Expected Score |
|---------------|---------|----------------|
| 300ms | Yes | 10 |
| 600ms | Yes | 9 |
| 1000ms | Yes | 8 |
| 1500ms | Yes | 6 |
| 2000ms | Yes | 5 |
| 500ms | No | -5 |
| 1500ms | Timeout | -5 |

```typescript
describe('Score Calculation', () => {
  it.each([
    [300, true, 10],
    [600, true, 9],
    [1000, true, 8],
    [1500, true, 6],
    [2000, true, 5],
    [500, false, -5],
  ])('should return score %d for RT=%dms, correct=%s', (rt, correct, expected) => {
    expect(calculateScore(rt, correct)).toBe(expected);
  });
});
```

---

## 🎯 Test Cases: User Flow (E2E)

### TC-E2E-001: Complete Practice Session

| Attribute | Value |
|----------|--------|
| **ID** | TC-E2E-001 |
| **Feature** | Practice Mode |
| **Priority** | Critical |
| **Type** | E2E |
| **Automated** | Yes |
| **Preconditions** | Application running |

**Description:** Verifies user can complete a full practice session.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Navigate to home page | / | Welcome screen shown |
| 2 | Click "Practice Mode" | - | Instructions displayed |
| 3 | Read instructions | - | "Start" button visible |
| 4 | Click "Start" | - | First stimulus displayed |
| 5 | Complete 5 trials | Responses varies | Progress shown (1/5, 2/5...) |
| 6 | View results | - | Results page with stats |

**Success Criteria:**
- [ ] All 5 stimuli displayed
- [ ] Responses recorded
- [ ] Results show: accuracy, avg RT, score
- [ ] Option to play again visible

```typescript
test('Complete practice session flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Practice Mode")');
  
  await expect(page.locator('.instructions')).toBeVisible();
  await page.click('button:has-text("Start")');
  
  // Complete 5 trials
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.stimulus-word')).toBeVisible();
    await page.click('.btn-red'); // Example response
    await expect(page.locator('.feedback')).toBeVisible();
  }
  
  // Verify results
  await expect(page).toHaveURL(/.*\/results/);
  await expect(page.locator('.accuracy')).toContainText('%');
  await expect(page.locator('.avg-reaction-time')).toContainText('ms');
  await expect(page.locator('.total-score')).toBeVisible();
});
```

---

### TC-E2E-002: Assessment Mode Full Session

| Attribute | Value |
|----------|--------|
| **ID** | TC-E2E-002 |
| **Feature** | Assessment Mode |
| **Priority** | High |
| **Type** | E2E |
| **Automated** | Yes |
| **Preconditions** | Application running |

**Description:** Verifies assessment mode with longer session (20 trials).

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Navigate to home page | / | Welcome screen shown |
| 2 | Click "Assessment Mode" | - | Instructions displayed |
| 3 | Click "Start" | - | First stimulus displayed |
| 4 | Complete 20 trials | Mixed responses | Progress shown (X/20) |
| 5 | View detailed results | - | Full statistics displayed |

**Success Criteria:**
- [ ] 20 stimuli presented
- [ ] Mix of congruent/incongruent
- [ ] Results include: accuracy by type, RT distribution
- [ ] Results saved to localStorage

---

### TC-E2E-003: Settings Configuration

| Attribute | Value |
|----------|--------|
| **ID** | TC-E2E-003 |
| **Feature** | Settings |
| **Priority** | Medium |
| **Type** | E2E |
| **Automated** | Yes |
| **Preconditions** | Application running |

**Description:** Verifies user can modify game settings.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Navigate to home page | / | Welcome screen shown |
| 2 | Click "Settings" | - | Settings panel opens |
| 3 | Change trial count | 10 trials | Value updated |
| 4 | Change timeout | 2000ms | Value updated |
| 5 | Save settings | - | Settings persisted |
| 6 | Start practice | - | Uses new settings |

**Success Criteria:**
- [ ] Settings saved to localStorage
- [ ] Settings applied in next session
- [ ] Default settings available

---

## 🚀 Test Cases: Performance

### TC-PERF-001: Stimulus Display Timing

| Attribute | Value |
|----------|--------|
| **ID** | TC-PERF-001 |
| **Feature** | Performance |
| **Priority** | High |
| **Type** | Performance |
| **Automated** | Yes |
| **Preconditions** | Game running |

**Description:** Verifies stimulus renders within 16ms (60fps target).

**Test Method:**

```typescript
test('Stimulus renders within 16ms', async () => {
  const measurements = [];
  
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    renderStimulus({ word: 'RED', color: 'green' });
    const end = performance.now();
    measurements.push(end - start);
  }
  
  const p95 = percentile(measurements, 95);
  expect(p95).toBeLessThan(16);
});
```

**Success Criteria:**
- [ ] P50 < 10ms
- [ ] P95 < 16ms
- [ ] P99 < 20ms

---

### TC-PERF-002: Response Recording Speed

| Attribute | Value |
|----------|--------|
| **ID** | TC-PERF-002 |
| **Feature** | Performance |
| **Priority** | High |
| **Type** | Performance |
| **Automated** | Yes |

**Description:** Verifies response processing completes within 50ms.

**Success Criteria:**
- [ ] Response recorded < 50ms
- [ ] No UI blocking during processing
- [ ] Smooth feedback transition

---

## ♿ Test Cases: Accessibility

### TC-A11Y-001: Keyboard Navigation

| Attribute | Value |
|----------|--------|
| **ID** | TC-A11Y-001 |
| **Feature** | Accessibility |
| **Priority** | High |
| **Type** | E2E, Accessibility |
| **Automated** | Yes |

**Description:** Verifies game is fully playable with keyboard only.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Tab to "Practice Mode" | Tab key | Button focused |
| 2 | Activate with Enter | Enter | Mode starts |
| 3 | Use arrow keys for response | Left/Right arrows | Response registered |
| 4 | Complete session | - | All accessible |

**Success Criteria:**
- [ ] All interactive elements focusable
- [ ] Visual focus indicators clear
- [ ] Keyboard shortcuts documented
- [ ] No keyboard traps

---

### TC-A11Y-002: Screen Reader Support

| Attribute | Value |
|----------|--------|
| **ID** | TC-A11Y-002 |
| **Feature** | Accessibility |
| **Priority** | Medium |
| **Type** | Accessibility |
| **Automated** | Yes |

**Description:** Verifies game announces important information to screen readers.

**Success Criteria:**
- [ ] Stimulus word announced
- [ ] Feedback announced (correct/incorrect)
- [ ] Score announced
- [ ] ARIA labels present
- [ ] Semantic HTML used

```typescript
test('Screen reader announcements', async ({ page }) => {
  const stimulus = page.locator('[role="alert"][aria-live="polite"]');
  
  await page.click('.btn-red');
  
  await expect(stimulus).toHaveText(/correct|incorrect/i);
});
```

---

## 💾 Test Cases: Data Persistence

### TC-DATA-001: Save Session Results

| Attribute | Value |
|----------|--------|
| **ID** | TC-DATA-001 |
| **Feature** | Data Persistence |
| **Priority** | High |
| **Type** | Integration |
| **Automated** | Yes |

**Description:** Verifies session results are saved to localStorage.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Complete session | 5 trials | Session ends |
| 2 | Check localStorage | - | Data present |
| 3 | Reload page | - | History accessible |
| 4 | View history | - | Past session visible |

**Success Criteria:**
- [ ] Session data saved with timestamp
- [ ] Data includes all trials
- [ ] Data persists across reloads
- [ ] Multiple sessions tracked

---

### TC-DATA-002: Settings Persistence

| Attribute | Value |
|----------|--------|
| **ID** | TC-DATA-002 |
| **Feature** | Settings |
| **Priority** | Medium |
| **Type** | Integration |
| **Automated** | Yes |

**Description:** Verifies settings persist across sessions.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Change settings | Timeout: 2500ms | Settings updated |
| 2 | Save | - | Saved to localStorage |
| 3 | Reload application | - | Page reloads |
| 4 | Check settings | - | Custom values loaded |

**Success Criteria:**
- [ ] Settings saved on change
- [ ] Settings loaded on startup
- [ ] Reset to defaults option works

---

## 🧩 Test Cases: Edge Cases

### TC-EDGE-001: Rapid Clicking

| Attribute | Value |
|----------|--------|
| **ID** | TC-EDGE-001 |
| **Feature** | Input Handling |
| **Priority** | Medium |
| **Type** | E2E |
| **Automated** | Yes |

**Description:** Verifies game handles rapid clicking gracefully.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Display stimulus | - | Stimulus shown |
| 2 | Click multiple times rapidly | 5 clicks in 100ms | Only first click counts |
| 3 | Verify only one response | - | Single response recorded |

**Success Criteria:**
- [ ] Debouncing prevents duplicate responses
- [ ] UI doesn't break
- [ ] Game progresses normally

---

### TC-EDGE-002: Browser Tab Switching

| Attribute | Value |
|----------|--------|
| **ID** | TC-EDGE-002 |
| **Feature** | Session Management |
| **Priority** | Low |
| **Type** | E2E |
| **Automated** | No (Manual) |

**Description:** Verifies game behavior when user switches tabs.

**Steps:**

| # | Action | Data | Expected Result |
|---|--------|---------|------------------|
| 1 | Start session | - | Game active |
| 2 | Switch to another tab | - | Game pauses or continues |
| 3 | Return after timeout | - | Handled gracefully |

**Success Criteria:**
- [ ] Timer behavior documented
- [ ] No crashes
- [ ] User informed of behavior

---

This completes the test cases for the Red or Green Game project, covering game logic, user flows, performance, accessibility, data persistence, and edge cases.

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-AUTH-003 |
| **Feature** | Authentication / Security |
| **Priorité** | High |
| **Type** | Integration |
| **Automatisé** | Oui |
| **Préconditions** | Aucune |

**Description:** Vérifie que le rate limiting bloque après plusieurs tentatives échouées.

**Steps:**

| # | Action | Données | Résultat Attendu |
|---|--------|---------|------------------|
| 1 | Tentative 1 | Invalid creds | 401 |
| 2 | Tentative 2 | Invalid creds | 401 |
| 3 | Tentative 3 | Invalid creds | 401 |
| 4 | Tentative 4 | Invalid creds | 401 |
| 5 | Tentative 5 | Invalid creds | 401 |
| 6 | Tentative 6 | Any creds | 429 Too Many Requests |

```gherkin
Feature: Login Rate Limiting
  Scenario: Block after 5 failed attempts
    Given I am on the login page
    When I attempt to login with invalid credentials 5 times
    And I attempt to login a 6th time
    Then I should receive a "Too many attempts" error
    And I should be blocked for 15 minutes
```

---

## 👤 Cas de Test: Gestion Utilisateurs

### TC-USER-001: Création utilisateur

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-USER-001 |
| **Feature** | User Management |
| **Priorité** | High |
| **Type** | Integration |
| **Automatisé** | Oui |
| **Préconditions** | Authentifié comme Admin |

**Steps:**

| # | Action | Données | Résultat Attendu |
|---|--------|---------|------------------|
| 1 | POST /api/users | { email, name, role } | 201 Created |
| 2 | Vérifier user créé | GET /api/users/:id | User retourné |
| 3 | Vérifier email unique | POST même email | 409 Conflict |

```gherkin
Feature: User Creation
  Scenario: Admin creates a new user
    Given I am authenticated as an admin
    When I create a user with:
      | email    | newuser@example.com |
      | name     | New User            |
      | role     | user                |
    Then the user should be created successfully
    And I should receive the user ID
    
  Scenario: Duplicate email rejected
    Given a user with email "existing@example.com" exists
    When I try to create a user with email "existing@example.com"
    Then I should receive a conflict error
```

---

### TC-USER-002: Mise à jour profil

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-USER-002 |
| **Feature** | User Management |
| **Priorité** | Medium |
| **Type** | Integration |
| **Automatisé** | Oui |
| **Préconditions** | Utilisateur existe |

```gherkin
Feature: Profile Update
  Scenario: User updates their own profile
    Given I am authenticated as "user@example.com"
    When I update my profile with:
      | name     | Updated Name    |
      | avatar   | new-avatar.png  |
    Then my profile should be updated
    And I should see the changes reflected
    
  Scenario: User cannot update another user's profile
    Given I am authenticated as "user1@example.com"
    When I try to update the profile of "user2@example.com"
    Then I should receive a forbidden error
```

---

## 🔌 Cas de Test: API

### TC-API-001: Pagination

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-API-001 |
| **Feature** | API / Pagination |
| **Priorité** | Medium |
| **Type** | Integration |
| **Automatisé** | Oui |

```gherkin
Feature: API Pagination
  Scenario: Get first page of results
    Given there are 50 users in the database
    When I request GET /api/users?page=1&limit=10
    Then I should receive 10 users
    And the response should include:
      | totalCount | 50 |
      | page       | 1  |
      | totalPages | 5  |
      | hasNext    | true |
      
  Scenario: Get last page
    When I request GET /api/users?page=5&limit=10
    Then I should receive 10 users
    And hasNext should be false
    
  Scenario: Page out of range
    When I request GET /api/users?page=10&limit=10
    Then I should receive an empty array
```

---

### TC-API-002: Validation des entrées

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-API-002 |
| **Feature** | API / Validation |
| **Priorité** | High |
| **Type** | Integration |
| **Automatisé** | Oui |

```gherkin
Feature: Input Validation
  Scenario Outline: Reject invalid email formats
    When I POST /api/users with email "<email>"
    Then I should receive a 400 error
    And the error message should mention "email"
    
    Examples:
      | email           |
      | not-an-email    |
      | @nodomain.com   |
      | missing@.com    |
      |                 |
      
  Scenario: Reject password too short
    When I POST /api/users with password "123"
    Then I should receive a 400 error
    And the error should say "Password must be at least 8 characters"
```

---

## ⚡ Cas de Test: Performance

### TC-PERF-001: Temps de réponse API

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-PERF-001 |
| **Feature** | Performance |
| **Priorité** | High |
| **Type** | Performance |
| **Automatisé** | Oui |

**Critères:**

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| GET /api/users | < 50ms | < 200ms | < 500ms |
| POST /api/users | < 100ms | < 300ms | < 800ms |
| GET /api/users/:id | < 30ms | < 100ms | < 300ms |

```javascript
// k6 test
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  thresholds: {
    'http_req_duration{endpoint:users_list}': ['p(95)<200'],
    'http_req_duration{endpoint:user_get}': ['p(95)<100'],
  },
};

export default function () {
  const listRes = http.get(`${BASE_URL}/api/users`, {
    tags: { endpoint: 'users_list' },
  });
  check(listRes, { 'status 200': (r) => r.status === 200 });
}
```

---

### TC-PERF-002: Test de charge

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-PERF-002 |
| **Feature** | Performance / Scalability |
| **Priorité** | Medium |
| **Type** | Performance |
| **Automatisé** | Oui |

**Scénario de charge:**

```
Durée: 10 minutes
VUs: 0 → 100 (ramp up 2min) → 100 (steady 6min) → 0 (ramp down 2min)

Seuils:
- Error rate < 1%
- P95 latency < 500ms
- Throughput > 100 req/s
```

---

## 🔒 Cas de Test: Sécurité

### TC-SEC-001: SQL Injection

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-SEC-001 |
| **Feature** | Security |
| **Priorité** | Critical |
| **Type** | Security |
| **Automatisé** | Oui |

```gherkin
Feature: SQL Injection Prevention
  Scenario Outline: Reject SQL injection attempts
    When I POST /api/users with email "<payload>"
    Then I should receive a 400 error
    And no SQL should be executed
    
    Examples:
      | payload                              |
      | '; DROP TABLE users; --             |
      | ' OR '1'='1                          |
      | admin'--                             |
      | 1; UPDATE users SET role='admin'    |
```

---

### TC-SEC-002: XSS Prevention

| Attribut | Valeur |
|----------|--------|
| **ID** | TC-SEC-002 |
| **Feature** | Security |
| **Priorité** | Critical |
| **Type** | Security |
| **Automatisé** | Oui |

```gherkin
Feature: XSS Prevention
  Scenario: Script tags are escaped in output
    Given I create a user with name "<script>alert('xss')</script>"
    When I view the user's profile page
    Then I should see the escaped text
    And no script should execute
```

---

## 📱 Cas de Test: Edge Cases

### TC-EDGE-001: Gestion des caractères spéciaux

```gherkin
Feature: Special Characters Handling
  Scenario Outline: Accept international names
    When I create a user with name "<name>"
    Then the user should be created successfully
    
    Examples:
      | name              |
      | José García       |
      | 田中太郎          |
      | Müller            |
      | O'Brien           |
      | Jean-Pierre       |
```

### TC-EDGE-002: Limites des champs

```gherkin
Feature: Field Limits
  Scenario: Reject name exceeding max length
    When I create a user with a 500 character name
    Then I should receive a validation error
    
  Scenario: Accept name at max length
    When I create a user with a 100 character name
    Then the user should be created successfully
```

---

## 📊 Matrice de Traçabilité

| Requirement | Test Cases |
|-------------|------------|
| REQ-001: User login | TC-AUTH-001, TC-AUTH-002, TC-AUTH-003 |
| REQ-002: User management | TC-USER-001, TC-USER-002 |
| REQ-003: API pagination | TC-API-001 |
| REQ-004: Input validation | TC-API-002 |
| REQ-005: Performance | TC-PERF-001, TC-PERF-002 |
| REQ-006: Security | TC-SEC-001, TC-SEC-002 |

---

🧪 **Rappel:** Chaque cas de test doit être indépendant et reproductible. Utilisez des fixtures pour les données de test.
