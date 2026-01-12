# 🧪 Test Strategy - Red or Green Game

> **Global testing strategy for the Red or Green Game project**

---

## 📋 Overview

This strategy defines the testing approach to ensure code quality, reliability, and maintainability for the Red or Green Game - a web-based cognitive training game focused on decision-making and rapid response under time pressure.

---

## 🎯 Testing Objectives

| Objective | Description | Target |
|----------|-------------|-------|
| **Coverage** | Percentage of code covered by tests | > 80% |
| **Reliability** | Test success rate | 100% |
| **Speed** | Unit test execution time | < 30s |
| **Detection** | Bugs detected before production | > 95% |
| **Game Logic** | Accuracy of scoring and timing mechanisms | 100% |
| **User Experience** | Response time and visual feedback | < 100ms |

---

## 🔺 Pyramide de Tests

```
                          ╱╲
                         ╱  ╲
                        ╱ E2E╲                  ← 5%
                       ╱──────╲                   Quelques tests
                      ╱        ╲                  Lents, coûteux
                     ╱ Intégrat.╲               ← 15%
                    ╱────────────╲                Modéré
                   ╱              ╲               Temps moyen
                  ╱  Unit Tests    ╲            ← 80%
                 ╱──────────────────╲             Beaucoup
                ╱                    ╲            Rapides, pas cher
               ╱────────────────────────╲
```

### Distribution Recommandée

| Type | Quantité | Temps | Couverture |
|------|----------|-------|------------|
| Unit Tests | 80% | < 10s | Logique métier, utils |
| Integration Tests | 15% | < 2min | APIs, DB, services |
| E2E Tests | 5% | < 10min | Parcours utilisateur critiques |

---

## 📁 Types de Tests

### 1. Unit Tests

**Objective:** Test isolated code units (functions, classes, modules).

```typescript
// Example: Color validation unit test
describe('GameLogic', () => {
  describe('isCorrectChoice', () => {
    it('should return true when color matches word meaning', () => {
      const stimulus = { word: 'RED', color: 'red', meaning: 'red' };
      expect(GameLogic.isCorrectChoice(stimulus, 'red')).toBe(true);
    });

    it('should return false when choosing word color in incongruent case', () => {
      const stimulus = { word: 'RED', color: 'green', meaning: 'red' };
      expect(GameLogic.isCorrectChoice(stimulus, 'green')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(GameLogic.isCorrectChoice(null, 'red')).toBe(false);
      expect(GameLogic.isCorrectChoice(stimulus, null)).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score based on reaction time', () => {
      expect(GameLogic.calculateScore(500, true)).toBe(10);
      expect(GameLogic.calculateScore(1000, true)).toBe(8);
    });

    it('should penalize incorrect answers', () => {
      expect(GameLogic.calculateScore(500, false)).toBe(-5);
    });
  });
});
```

**Characteristics:**
- Isolated (no external dependencies)
- Fast (< 100ms per test)
- Deterministic (same result every execution)
- Mocks for dependencies

### 2. Integration Tests

**Objective:** Test interaction between multiple components.

```typescript
// Example: Game session integration test
describe('GameSession Integration', () => {
  let gameEngine: GameEngine;
  let storage: LocalStorage;

  beforeAll(async () => {
    storage = new LocalStorageMock();
    gameEngine = new GameEngine({ storage });
  });

  afterAll(() => {
    storage.clear();
  });

  it('should complete a full game session', async () => {
    // Start session
    const session = await gameEngine.startSession('practice');
    expect(session.status).toBe('active');

    // Process stimuli
    for (let i = 0; i < 5; i++) {
      const stimulus = gameEngine.getCurrentStimulus();
      const response = await gameEngine.recordResponse('red', 500);
      expect(response.processed).toBe(true);
    }

    // End session
    const results = await gameEngine.endSession();
    expect(results.totalTrials).toBe(5);
    expect(results.saved).toBe(true);
  });
});

  it('should create user and retrieve it', async () => {
    // Create
    const createResponse = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);

    const userId = createResponse.body.id;

    // Retrieve
    const getResponse = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(getResponse.body.email).toBe('test@example.com');
  });
});
```

**Characteristics:**
- Test multiple components together
- Use real browser for DOM interactions
- Slower than unit tests
- Detect integration issues

### 3. End-to-End (E2E) Tests

**Objective:** Test the complete system from user perspective.

```typescript
// Example: E2E test with Playwright
import { test, expect } from '@playwright/test';

test.describe('Red or Green Game - Complete Session Flow', () => {
  test('should complete a practice session successfully', async ({ page }) => {
    // Navigate to game
    await page.goto('/');

    // Start practice mode
    await page.click('button:has-text("Practice Mode")');
    
    // Wait for instructions
    await expect(page.locator('.instructions')).toBeVisible();
    await page.click('button:has-text("Start")');

    // Play 5 trials
    for (let i = 0; i < 5; i++) {
      // Wait for stimulus
      await expect(page.locator('.stimulus-word')).toBeVisible();
      
      // Click red button (example response)
      await page.click('.btn-red');
      
      // Wait for feedback
      await expect(page.locator('.feedback')).toBeVisible();
    }

    // Verify results page
    await expect(page).toHaveURL(/.*\/results/);
    await expect(page.locator('.accuracy')).toBeVisible();
    await expect(page.locator('.reaction-time')).toBeVisible();
  });

  test('should handle timeout correctly', async ({ page }) => {
    await page.goto('/game');
    
    // Wait for stimulus without responding
    await page.waitForTimeout(3000);
    
    // Should show timeout feedback
    await expect(page.locator('.feedback.timeout')).toBeVisible();
  });
});
```

**Characteristics:**
- Test complete user journeys
- Use real browser
- Slowest tests
- Closest to real user experience

### 4. Performance Tests

**Objective:** Verify system meets performance requirements.

```typescript
// Example: Performance test for stimulus display timing
describe('Performance Tests', () => {
  test('stimulus should display within 16ms (60fps)', async () => {
    const startTime = performance.now();
    
    gameEngine.displayStimulus({ word: 'RED', color: 'green' });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(16); // 60fps = ~16ms per frame
  });

  test('response should be recorded within 50ms', async () => {
    const startTime = performance.now();
    
    await gameEngine.recordResponse('red', 500);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(50);
  });
});
```

### 5. Accessibility Tests

**Objective:** Ensure game is accessible to users with disabilities.

```typescript
// Example: Accessibility test with axe-core
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/game');
    
    // Tab to red button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should register response
    await expect(page.locator('.feedback')).toBeVisible();
  });
});
```

---

## 🔧 Testing Tools

### Recommended Stack

| Category | Tool | Usage |
|-----------|-------|-------|
| **Test Runner** | Vitest | Execution of unit & integration tests |
| **Assertions** | Vitest matchers | Verifications |
| **E2E Testing** | Playwright | Browser automation |
| **Coverage** | Vitest coverage | Code coverage reports |
| **Mocking** | Vitest mocks | Dependency isolation |
| **Performance** | Lighthouse | Performance audits |
| **Accessibility** | axe-core | A11y testing |
| **Visual** | Playwright screenshots | Visual regression |

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/e2e.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 📊 Testing Metrics

### KPIs

| Metric | Description | Target |
|----------|-------------|-------|
| **Code Coverage** | % of code tested | > 80% |
| **Branch Coverage** | % of branches tested | > 75% |
| **Test Pass Rate** | % of passing tests | 100% |
| **Test Duration** | Total execution time | < 2min |
| **Flaky Rate** | % of unstable tests | < 1% |
| **Game Logic Accuracy** | Correctness of scoring/timing | 100% |

### Test Dashboard

```markdown
## Red or Green Game - Test Dashboard

### Current Status
✅ Unit Tests: 85/85 passing
✅ Integration: 15/15 passing
✅ E2E: 8/8 passing

### Coverage by Module
| Module | Lines | Branches | Functions |
|--------|-------|----------|-----------|
| game-logic | 95%   | 92%      | 98%       |
| stimulus-gen | 88%   | 85%      | 90%       |
| scoring | 92%   | 88%      | 95%       |
| ui-components | 82%   | 78%      | 85%       |
| storage | 85%   | 80%      | 88%       |

### Trends
- Coverage: ↑ 3% vs last week
- Duration: 45s (target: < 2min)
- Flaky tests: 0
```

---

## 🔄 Test Workflow

### CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📝 Conventions de Nommage

### Fichiers de Test

```
src/
├── services/
│   └── user.service.ts
└── controllers/
    └── user.controller.ts

tests/
├── unit/
│   └── services/
│       └── user.service.test.ts
├── integration/
│   └── api/
│       └── users.api.test.ts
└── e2e/
    └── user-registration.e2e.ts
```

### Descriptions de Test

```typescript
describe('[Module] ClassName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // ...
    });
    
    it('should throw [error] when [invalid condition]', () => {
      // ...
    });
  });
});
```

---

## ✅ Checklist Testing

### Avant Commit

- [ ] Tests unitaires écrits pour le nouveau code
- [ ] Tous les tests existants passent
- [ ] Couverture > 80% sur le nouveau code
- [ ] Pas de tests flaky introduits

### Avant Merge

- [ ] Tests d'intégration si API modifiée
- [ ] Tests E2E si parcours utilisateur modifié
- [ ] Review des tests par un pair

### Avant Release

- [ ] Suite complète de tests passée
- [ ] Tests de performance validés
- [ ] Scan de sécurité clean
- [ ] Tests de régression manuels si nécessaire

---

🧪 **Rappel:** Les tests sont une documentation vivante. Un bon test explique ce que le code fait et comment il doit se comporter.
