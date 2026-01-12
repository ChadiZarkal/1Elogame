# Best Practices & Tips

> **Recueil des meilleures pratiques pour le développement agentique**

---

## 📋 Table des Matières

1. [Rédaction de Spécifications](#rédaction-de-spécifications)
2. [Travail avec les Agents IA](#travail-avec-les-agents-ia)
3. [Code Quality](#code-quality)
4. [Testing](#testing)
5. [Workflow](#workflow)
6. [Communication](#communication)

---

## 📝 Rédaction de Spécifications

### DO ✅

#### Être Précis et Concret
```markdown
# ✅ Bon
L'utilisateur doit pouvoir réinitialiser son mot de passe via un lien 
envoyé par email. Le lien expire après 1 heure et ne peut être utilisé 
qu'une seule fois.

# ❌ Mauvais
L'utilisateur doit pouvoir récupérer son compte.
```

#### Utiliser le Format Given-When-Then
```gherkin
# ✅ Bon
Given un utilisateur avec email "user@example.com" existe
And aucun token de reset n'est actif
When l'utilisateur demande un reset de mot de passe
Then un email avec un lien de reset est envoyé
And le lien expire dans 1 heure

# ❌ Mauvais
Le reset de mot de passe doit fonctionner.
```

#### Spécifier les Edge Cases
```markdown
# ✅ Bon
## Edge Cases
- Email inexistant → Afficher le même message de succès (sécurité)
- Token expiré → Afficher "Lien expiré, demandez un nouveau"
- Token déjà utilisé → Afficher "Lien déjà utilisé"
- Mot de passe identique à l'ancien → Rejeter avec message

# ❌ Mauvais
[Aucune mention des cas limites]
```

#### Inclure des Exemples
```markdown
# ✅ Bon
## Exemples

### Request
POST /api/auth/reset-password
{
  "email": "user@example.com"
}

### Response (Success)
{
  "message": "If the email exists, a reset link has been sent"
}

### Response (Rate Limited)
429 Too Many Requests
{
  "error": "Too many requests. Try again in 5 minutes."
}
```

### DON'T ❌

- ❌ Utiliser des termes vagues ("rapide", "convivial", "simple")
- ❌ Supposer que le lecteur connaît le contexte
- ❌ Écrire des paragraphes denses sans structure
- ❌ Ignorer les cas d'erreur
- ❌ Oublier les contraintes non-fonctionnelles

---

## 🤖 Travail avec les Agents IA

### Prompting Efficace

#### Structure Recommandée
```markdown
# ✅ Bon Prompt

## Contexte
Je travaille sur [projet]. La fonctionnalité [X] doit [faire Y].

## Tâche
Implémente [spécification précise].

## Contraintes
- Utiliser [technologie/pattern]
- Respecter [convention]
- Ne pas modifier [fichiers]

## Critères de Succès
- [ ] Tests passent
- [ ] Lint clean
- [ ] [Autre critère]

## Fichiers Concernés
- src/module/file.ts
- tests/module/file.test.ts
```

#### Anti-Patterns de Prompting
```markdown
# ❌ Mauvais
"Fais-moi une API"

# ❌ Mauvais
"Corrige le bug" (sans détails)

# ❌ Mauvais
"Améliore le code" (trop vague)
```

### Feedback Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                      FEEDBACK LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. Donner une instruction claire                              │
│          │                                                       │
│          ▼                                                       │
│   2. L'agent propose une solution                               │
│          │                                                       │
│          ▼                                                       │
│   3. Reviewer la solution                                       │
│          │                                                       │
│     ┌────┴────┐                                                  │
│     │         │                                                  │
│     ▼         ▼                                                  │
│   OK?       Non OK                                               │
│     │         │                                                  │
│     │         ▼                                                  │
│     │   4. Donner un feedback précis                            │
│     │         │                                                  │
│     │         ▼                                                  │
│     │   "La fonction X ne gère pas le cas Y.                    │
│     │    Ajoute une validation pour Z."                         │
│     │         │                                                  │
│     │         └──────────────────────┐                           │
│     │                                │                           │
│     ▼                                │                           │
│   Accepter                           │                           │
│                                      │                           │
│   ◄──────────────────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Checkpoints Humains

Moments où l'humain DOIT valider:

1. **Avant implémentation** - Valider l'approche proposée
2. **Après changements architecturaux** - Valider le design
3. **Avant merge** - Code review
4. **Avant déploiement** - Validation finale

```markdown
## Checkpoint Request

### What
L'agent propose de [action].

### Why
Pour [raison].

### Impact
- Fichiers modifiés: [liste]
- Risques: [risques identifiés]

### Alternatives Considérées
1. [Alternative 1] - Rejetée car [raison]
2. [Alternative 2] - Possible mais [inconvénient]

### Question
Approuvez-vous cette approche?
- [ ] Oui, proceed
- [ ] Non, use alternative [X]
- [ ] Non, new direction: _______________
```

---

## 💻 Code Quality

### Principes Fondamentaux

#### Single Responsibility
```typescript
// ❌ Mauvais - fait trop de choses
class UserService {
  createUser() { /* ... */ }
  sendEmail() { /* ... */ }
  generateReport() { /* ... */ }
  processPayment() { /* ... */ }
}

// ✅ Bon - une seule responsabilité
class UserService {
  createUser() { /* ... */ }
  updateUser() { /* ... */ }
  deleteUser() { /* ... */ }
}
```

#### DRY (Don't Repeat Yourself)
```typescript
// ❌ Mauvais - duplication
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function checkEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ Bon - une seule fonction réutilisée
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

#### KISS (Keep It Simple)
```typescript
// ❌ Mauvais - over-engineered
class AbstractFactoryBuilderVisitorAdapterProxy { /* ... */ }

// ✅ Bon - simple et direct
function createUser(data: UserInput): User {
  return { id: generateId(), ...data };
}
```

### Naming Conventions

```typescript
// Variables - camelCase, descriptif
const userEmail = 'user@example.com';
const isLoggedIn = true;
const maxRetryAttempts = 3;

// Fonctions - verbe + nom
function getUserById(id: string): User { }
function validatePassword(password: string): boolean { }
function sendWelcomeEmail(user: User): void { }

// Classes - PascalCase, nom
class UserRepository { }
class EmailService { }
class AuthenticationMiddleware { }

// Constantes - SCREAMING_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_TIMEOUT_MS = 30000;

// Types/Interfaces - PascalCase
interface UserCredentials { }
type ValidationResult = { valid: boolean; errors: string[] };
```

### Error Handling

```typescript
// ✅ Bon - erreurs typées et informatives
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(input: unknown): User {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(
      'Invalid input',
      'body',
      'INVALID_INPUT'
    );
  }
  // ...
}

// Caller
try {
  const user = validateUser(input);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      field: error.field,
      code: error.code,
    });
  }
  throw error; // Re-throw unexpected errors
}
```

---

## 🧪 Testing

### Structure AAA

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' };
      const mockRepo = { save: jest.fn().mockResolvedValue({ id: '1', ...userData }) };
      const service = new UserService(mockRepo);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(mockRepo.save).toHaveBeenCalledWith(userData);
    });
  });
});
```

### Test Naming

```typescript
// ✅ Bon - descriptif
it('should return 401 when password is incorrect', () => { });
it('should throw ValidationError when email is empty', () => { });
it('should send welcome email after successful registration', () => { });

// ❌ Mauvais - pas clair
it('test login', () => { });
it('works', () => { });
it('error case', () => { });
```

### Ce Qu'il Faut Tester

| Tester | Ne Pas Tester |
|--------|---------------|
| Logique métier | Libraries tierces |
| Edge cases | Getters/setters simples |
| Error handling | Code framework |
| Integrations | Configuration |
| Comportements critiques | Code généré |

---

## 🔄 Workflow

### Branch Naming

```bash
# Format: type/ticket-description
feature/TASK-123-user-authentication
bugfix/TASK-456-fix-login-error
chore/TASK-789-update-dependencies
refactor/TASK-012-extract-user-service
hotfix/PROD-001-critical-security-fix
```

### Commit Messages

```bash
# Format: type(scope): description

# Features
feat(auth): add JWT refresh token endpoint
feat(users): implement user profile update

# Fixes
fix(auth): handle expired token gracefully
fix(api): correct pagination offset calculation

# Other
docs(readme): update installation instructions
test(auth): add tests for password reset
refactor(users): extract validation logic
chore(deps): update axios to 1.6.0
```

### PR Description

```markdown
## Description
[Résumé des changements]

## Related
- Closes #123
- Related to #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes
- [Change 1]
- [Change 2]

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing done

## Screenshots
[If applicable]

## Checklist
- [ ] Code follows project style
- [ ] Tests pass
- [ ] Docs updated
- [ ] No breaking changes (or documented)
```

---

## 💬 Communication

### Status Updates

```markdown
## Daily Update - [Date]

### ✅ Done
- Completed TASK-123: User authentication
- Fixed bug in password validation

### 🔄 In Progress
- TASK-456: Working on email notifications (60%)

### 🚧 Blockers
- Waiting for API credentials from partner

### 📅 Plan for Tomorrow
- Complete email notifications
- Start on TASK-789
```

### Escalation Template

```markdown
## Escalation: [Title]

### Severity
Critical / High / Medium / Low

### Issue
[Description du problème]

### Impact
[Impact sur le projet/timeline]

### Attempted Solutions
1. [Solution 1] - Result: [...]
2. [Solution 2] - Result: [...]

### Recommended Action
[Ce que vous recommandez]

### Decision Needed By
[Date/Time]

### Stakeholders
- @person1
- @person2
```

---

## 📊 Métriques à Suivre

| Catégorie | Métrique | Cible |
|-----------|----------|-------|
| **Qualité** | Code coverage | > 80% |
| **Qualité** | Bugs in production | < 1/sprint |
| **Vélocité** | Sprint velocity | Stable |
| **Vélocité** | Lead time | < 1 semaine |
| **Collaboration** | PR review time | < 24h |
| **Collaboration** | First-time pass rate | > 80% |

---

🚀 **Rappel:** Ces pratiques sont des guidelines, pas des règles absolues. Adaptez-les à votre contexte.
