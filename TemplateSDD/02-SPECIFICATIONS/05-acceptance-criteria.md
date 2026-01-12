# ✅ Acceptance Criteria (BDD) - Red or Green Game

> **Behavior-Driven Development Scenarios in Given-When-Then Format**

---

## 📌 Introduction

This document contains **acceptance criteria** in BDD (Behavior-Driven Development) format. These scenarios serve as:

1. **Contract** between Product and Engineering
2. **Base for automated tests**
3. **Living documentation** of expected behavior
4. **Validation criteria** for AI coding agents

---

## 🎮 Feature: Player Profile Form

```gherkin
Feature: Player Profile Form
  As a player
  I want to provide my sex and age
  So that I can see personalized rankings later

  Background:
    Given I am on the game home page
    And the profile form is displayed

  @smoke
  Scenario: Complete profile with all selections
    When I select "Homme" for sex
    And I select "19-22" for age
    And I click on "C'est parti ! 🚀"
    Then my profile is saved to LocalStorage
    And I am redirected to the game screen
    And the first duel is displayed

  Scenario: Cannot proceed without sex selection
    Given I have selected age "23-26"
    But I have not selected a sex
    Then the "C'est parti !" button is disabled
    And I cannot proceed to the game

  Scenario: Cannot proceed without age selection
    Given I have selected sex "Femme"
    But I have not selected an age
    Then the "C'est parti !" button is disabled

  Scenario: Profile persists in LocalStorage
    When I complete the profile form
    And I navigate away from the page
    And I return to the game
    Then I skip the profile form
    And I am taken directly to the game

  Scenario Outline: All sex options are available
    When I look at the sex options
    Then I see "<option>" as a selectable button

    Examples:
      | option       |
      | Homme        |
      | Femme        |
      | Non-binaire  |
      | Autre        |

  Scenario Outline: All age options are available
    When I look at the age options
    Then I see "<option>" as a selectable button

    Examples:
      | option  |
      | 16-18   |
      | 19-22   |
      | 23-26   |
      | 27+     |
```

---

## 🎯 Feature: Duel Display

```gherkin
Feature: Duel Display Interface
  As a player
  I want to see two elements side by side
  So that I can choose which is the worse red flag

  Background:
    Given I have completed my profile
    And elements are preloaded in memory
    And I am on the game screen

  @smoke
  Scenario: Duel is displayed correctly
    When a new duel is loaded
    Then I see the question "C'est quoi le pire red flag ?"
    And I see element A with its text
    And I see element B with its text
    And I see "VS" between the two elements
    And both elements are tappable

  Scenario: Elements are displayed as cards
    Then each element is displayed in a card format
    And the card shows only the element text
    And the cards fill the available screen space

  Scenario: Visual feedback on tap
    When I tap on element A
    Then element A shows a brief scale animation (press effect)
    And the vote is registered

  Scenario: Cannot vote twice on same duel
    When I tap on element A
    Then the duel cards become disabled
    And I cannot tap on element B
```

---

## 🗳️ Feature: Vote Recording

```gherkin
Feature: Vote Recording and ELO Calculation
  As a player
  I want my vote to be recorded
  So that it contributes to the global rankings

  Background:
    Given I have a valid profile
    And a duel is displayed with Element A (ELO 1100) and Element B (ELO 900)

  @smoke
  Scenario: Vote is recorded in database
    When I tap on Element A as the worse red flag
    Then a vote record is created with:
      | field              | value           |
      | element_gagnant_id | Element A ID    |
      | element_perdant_id | Element B ID    |
      | sexe_votant        | my sex          |
      | age_votant         | my age          |

  Scenario: Global ELO is updated synchronously
    When I vote for Element A
    Then Element A's elo_global increases
    And Element B's elo_global decreases
    And the update happens before showing results

  Scenario: Segmented ELO is updated asynchronously
    When I vote for Element A as a "Homme" aged "19-22"
    Then Element A's elo_homme increases eventually
    And Element A's elo_19_22 increases eventually
    But this does not block the result display

  Scenario: Participation count increases
    Given Element A has 100 participations
    When I vote for Element A
    Then Element A's nb_participations is 101
    And Element B's nb_participations increases by 1

  Scenario: ELO calculation uses K-factor 32
    Given Element A has ELO 1000
    And Element B has ELO 1000
    When I vote for Element A
    Then Element A's new ELO is approximately 1016
    And Element B's new ELO is approximately 984
```

---

## 📊 Feature: Result Display

```gherkin
Feature: Result Display with Animation
  As a player
  I want to see how others voted
  So that I can compare my opinion with the majority

  Background:
    Given I voted on a duel
    And Element A won with 68% (ELO-based estimation)
    And Element B lost with 32%

  @smoke
  Scenario: Result animation displays correctly
    Then I see an animated result overlay
    And the winner element is highlighted
    And I see "68%" prominently displayed
    And I see "Le pire selon 68%"
    And the animation takes approximately 1.2 seconds

  Scenario: Percentage is ELO-based estimation
    Then the percentage shown is calculated from ELO
    And NOT from direct vote counts
    And this ensures consistency from vote 1

  Scenario: Animation uses smooth easing
    Then the animation uses ease-out timing
    And runs at 60fps
    And uses CSS transforms (GPU-accelerated)

  @smoke
  Scenario: Skip animation by tapping
    When I tap anywhere during the animation
    Then the animation completes immediately
    And the next duel is displayed

  Scenario: Next duel appears after animation or tap
    When the result animation completes
    Or I tap to skip
    Then a new duel is displayed
    And the transition takes less than 200ms total
```

---

## 🔥 Feature: Streak System

```gherkin
Feature: Streak System
  As a player
  I want to track my voting streak
  So that I feel engaged and see how aligned I am with others

  Background:
    Given I have completed my profile
    And I am playing the game

  @smoke
  Scenario: Streak increases on matching vote
    Given my current streak is 3
    And Element A has higher ELO than Element B
    When I vote for Element A
    Then my streak increases to 4
    And I see a streak badge with "🔥 4"

  Scenario: Streak resets on non-matching vote
    Given my current streak is 5
    And Element A has lower ELO than Element B
    When I vote for Element A
    Then my streak resets to 0
    And I see "Streak broken!" feedback

  Scenario: Streak is stored in LocalStorage
    Given my streak is 7
    When I refresh the page
    Then my streak is lost (intentional design)
    And starts again from 0

  Scenario: Streak display on result screen
    When the result animation plays
    Then I see my current streak count
    And I see whether I matched the majority

  Scenario: First vote has no prior streak
    Given this is my first vote
    When I vote and match the majority
    Then my streak becomes 1
```

---

## ⭐ Feature: Star Feedback

```gherkin
Feature: Star Feedback for Duels
  As a player
  I want to mark a duel as excellent
  So that the admin knows which pairings are entertaining

  Background:
    Given I am viewing the result screen
    And I see the star button

  @smoke
  Scenario: Give star to a duel
    When I tap the star button ⭐
    Then the duel_feedback record is created or updated
    And stars_count increments by 1
    And I see visual confirmation (star fills in)

  Scenario: Star button is not available before voting
    Given I am viewing a duel before voting
    Then I do not see the star button

  Scenario: Multiple stars from same session allowed (MVP)
    Given I already starred this duel
    When I tap the star button again
    Then stars_count increments again
    And no error is shown (MVP simplification)

  Scenario: Starred duels feed into algorithm
    Given a duel pair has ≥50 stars
    Then this duel appears in the 15% "starred duels" category
    And has higher chance of being shown to other players
```

---

## 👍👎 Feature: Thumbs Feedback

```gherkin
Feature: Thumbs Up/Down Feedback
  As a player
  I want to rate a duel as good or bad
  So that the admin can improve content quality

  Background:
    Given I am viewing the result screen
    And I see the thumbs buttons

  Scenario: Give thumbs up
    When I tap the thumbs up button 👍
    Then thumbs_up_count increments by 1
    And I see visual confirmation

  Scenario: Give thumbs down
    When I tap the thumbs down button 👎
    Then thumbs_down_count increments by 1
    And I see visual confirmation

  Scenario: Can give both thumbs and star
    When I tap the star button
    And I tap the thumbs up button
    Then both feedback types are recorded
```

---

## 🎲 Feature: Duel Selection Algorithm

```gherkin
Feature: Intelligent Duel Selection
  As a player
  I want varied and interesting duels
  So that the game stays engaging

  Background:
    Given 200 elements are active
    And I have seen 0 duels

  @smoke
  Scenario: Duel selection happens in-memory
    When a new duel is needed
    Then the selection happens client-side
    And no network request is made for selection
    And the selection takes less than 20ms

  Scenario: ELO-close duels (50% probability)
    When an ELO-close duel is selected
    Then both elements have ELO difference between 50-300 points
    And this creates more interesting comparisons

  Scenario: Cross-category duels (30% probability)
    When a cross-category duel is selected
    Then Element A is from category X
    And Element B is from category Y (different from X)

  Scenario: Starred duels (15% probability)
    Given a duel pair has ≥50 stars
    When a starred duel is selected
    Then this specific pair is shown

  Scenario: Random duels (5% probability)
    When a random duel is selected
    Then any unseen pair may be chosen

  Scenario: Already seen duels are excluded
    Given I have seen duel "A-B"
    When new duels are selected
    Then duel "A-B" is never shown again
    And duel "B-A" is also excluded (same pair)

  Scenario: All duels seen - game ends
    Given I have seen all possible duel combinations
    When a new duel is requested
    Then I see "Tu as tout vu ! 🎉"
    And I am offered to reset and play again
```

---

## 🔒 Feature: Admin Authentication

```gherkin
Feature: Admin Authentication
  As an admin
  I want to log in securely
  So that I can manage game content

  Background:
    Given an admin account exists with email "admin@redorgreen.app"

  @smoke @security
  Scenario: Successful admin login
    Given I am on the admin login page
    When I enter valid admin credentials
    And I click "Login"
    Then I receive a JWT token
    And I am redirected to the admin dashboard

  Scenario: Failed login with wrong password
    Given I am on the admin login page
    When I enter wrong password
    And I click "Login"
    Then I see "Invalid credentials"
    And no token is issued

  @security
  Scenario: Admin routes are protected
    Given I am not logged in
    When I try to access "/admin/elements"
    Then I am redirected to the login page
    And I see "Authentication required"

  Scenario: Token expiration
    Given my token expires in 24 hours
    When 24 hours pass
    And I try to access admin routes
    Then I am logged out
    And redirected to login
```

---

## 📝 Feature: Admin Element Management

```gherkin
Feature: Admin Element CRUD
  As an admin
  I want to manage game elements
  So that I can add, edit, and deactivate content

  Background:
    Given I am logged in as admin
    And I am on the elements management page

  @smoke
  Scenario: View all elements
    Given 200 elements exist
    When I load the elements page
    Then I see a paginated list of elements
    And each element shows: text, category, ELO, participations

  Scenario: Create new element
    When I click "Add Element"
    And I fill in:
      | field              | value            |
      | texte              | Être pompier     |
      | categorie          | metier           |
      | niveau_provocation | 2                |
    And I click "Save"
    Then the element is created with ELO 1000
    And appears in the elements list

  Scenario: Edit element text
    Given element "Être policier" exists
    When I edit its text to "Être gendarme"
    And I save
    Then the text is updated
    But the ELO scores are preserved

  Scenario: Deactivate element
    Given element "Manger du caca" exists and is active
    When I click "Deactivate"
    Then actif becomes false
    And the element no longer appears in duels
    But ELO data is preserved

  Scenario: Validation on create
    When I try to create an element with empty text
    Then I see error "Text is required"
    And the element is not created
```

---

## 📊 Feature: Admin Dashboard

```gherkin
Feature: Admin Statistics Dashboard
  As an admin
  I want to see game statistics
  So that I can monitor engagement and content performance

  Background:
    Given I am logged in as admin
    And I am on the dashboard

  @smoke
  Scenario: View key metrics
    Then I see total vote count
    And I see active elements count
    And I see average duels per session
    And I see average latency

  Scenario: View top red flags
    Then I see a list of elements with highest ELO
    And they are sorted by elo_global descending

  Scenario: View top green flags
    Then I see a list of elements with lowest ELO
    And they are sorted by elo_global ascending

  Scenario: Export data to CSV
    When I click "Export Elements CSV"
    Then a CSV file is downloaded
    And it contains all element data
    And uses semicolon separator
    And is UTF-8 encoded
```

---

## ⚡ Feature: Performance Requirements

```gherkin
Feature: Performance
  As a player
  I want fast transitions
  So that the game feels responsive and fun

  @smoke @performance
  Scenario: Duel transition under 200ms
    Given I am playing the game
    When I vote on a duel
    Then the next duel appears within 200ms
    And this includes animation skip if tapped

  @performance
  Scenario: Initial load under 3 seconds
    Given I am a new visitor
    When I load the app for the first time
    Then the profile form appears within 3 seconds
    And elements are preloaded in background

  @performance
  Scenario: Vote API response under 150ms
    When I submit a vote
    Then the API responds within 150ms
    And I don't have to wait for the response to see results
```

---

## 📊 Coverage Matrix

| Feature | Scenarios | Automated | Status |
|---------|-----------|-----------|--------|
| Profile Form | 6 | 0 | ⚪ To Do |
| Duel Display | 4 | 0 | ⚪ To Do |
| Vote Recording | 5 | 0 | ⚪ To Do |
| Result Display | 5 | 0 | ⚪ To Do |
| Streak System | 5 | 0 | ⚪ To Do |
| Star Feedback | 4 | 0 | ⚪ To Do |
| Thumbs Feedback | 3 | 0 | ⚪ To Do |
| Duel Selection | 7 | 0 | ⚪ To Do |
| Admin Auth | 4 | 0 | ⚪ To Do |
| Admin CRUD | 5 | 0 | ⚪ To Do |
| Admin Dashboard | 4 | 0 | ⚪ To Do |
| Performance | 3 | 0 | ⚪ To Do |

---

## 🏷️ Tags

| Tag | Description |
|-----|-------------|
| `@smoke` | Critical tests to run on every deployment |
| `@regression` | Complete regression suite |
| `@performance` | Performance tests |
| `@security` | Security tests |
| `@api` | API tests |
| `@ui` | UI tests |
| `@wip` | Work in progress |

---

## 📝 Implementation Notes

### For Automated Tests

1. **Recommended Framework:** Playwright + Jest
2. **Test Structure:**
```typescript
// e2e/game.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('complete profile and see first duel', async ({ page }) => {
    await page.goto('/');
    
    // Select profile options
    await page.click('[data-testid="sex-homme"]');
    await page.click('[data-testid="age-19-22"]');
    await page.click('[data-testid="start-button"]');
    
    // Verify duel is displayed
    await expect(page.locator('[data-testid="duel-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="element-a"]')).toBeVisible();
    await expect(page.locator('[data-testid="element-b"]')).toBeVisible();
  });
});
```

### For AI Coding Agents

When implementing:
1. Read the complete scenario before coding
2. Implement the happy path first
3. Add validations for error cases
4. Verify all "Then" statements are satisfied
5. Test performance requirements with real measurements

---

🚦 **Gate:** Acceptance criteria must be validated before each feature implementation.
