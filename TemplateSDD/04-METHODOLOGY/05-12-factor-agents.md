# 🔢 12-Factor Agents

> **Principes pour des agents LLM fiables et maintenables**

---

## 📋 Introduction

Les **12-Factor Agents** est un framework de principes pour construire des agents basés sur des LLM qui soient fiables, maintenables et débuggables. Inspiré des 12-Factor Apps pour les applications cloud-native.

### Origine

Ces principes ont émergé des meilleures pratiques observées dans l'industrie pour le développement d'agents IA production-ready.

---

## 🏗️ Les 12 Facteurs

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         12-FACTOR AGENTS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Natural Language → Structured Output                                 │
│  2. Own Your Prompts                                                     │
│  3. Own Your Context Window                                              │
│  4. Tools Are Just Functions                                             │
│  5. Unify Execution State                                                │
│  6. Launch/Pause/Resume with Simple APIs                                 │
│  7. Contact Humans with Tool Calls                                       │
│  8. Own Your Control Flow                                                │
│  9. Compact Errors into Context                                          │
│  10. Small, Focused Agents                                               │
│  11. Trigger from Anywhere                                               │
│  12. Make Agents Debuggable                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Natural Language → Structured Output

### Principe
> Transformer les entrées en langage naturel en sorties structurées et programmables.

### Pourquoi
- Permet l'intégration avec les systèmes existants
- Facilite la validation et le parsing
- Réduit les ambiguïtés

### Implémentation

```typescript
// ❌ Mauvais: Output non structuré
const response = await llm.complete("Analyse ce code et dis-moi les problèmes");
// Response: "Il y a plusieurs problèmes. D'abord..."

// ✅ Bon: Output structuré
interface CodeAnalysis {
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    line: number;
    message: string;
    suggestion: string;
  }>;
  summary: string;
  score: number;
}

const analysis = await llm.complete<CodeAnalysis>(
  "Analyse ce code et retourne les problèmes au format spécifié",
  { responseFormat: CodeAnalysisSchema }
);
```

### Application SDD
- Les specs sont en Markdown structuré
- Les critères d'acceptance suivent Given-When-Then
- Les tâches ont un format défini

---

## 2️⃣ Own Your Prompts

### Principe
> Gardez le contrôle total sur vos prompts dans votre codebase.

### Pourquoi
- Versionnement avec le code
- Tests possibles
- Pas de dépendance externe

### Implémentation

```typescript
// ❌ Mauvais: Prompt dans un service tiers
const response = await thirdPartyService.runAgent("code-reviewer");

// ✅ Bon: Prompts dans le codebase
// prompts/code-review.ts
export const CODE_REVIEW_PROMPT = `
You are a code reviewer. Analyze the following code and provide feedback.

## Rules:
- Focus on security, performance, and maintainability
- Be constructive
- Suggest specific improvements

## Code to review:
{{code}}

## Output format:
Return a JSON with issues array and summary.
`;

// Usage
const response = await llm.complete(
  CODE_REVIEW_PROMPT.replace('{{code}}', codeToReview)
);
```

### Structure Recommandée

```
prompts/
├── system/
│   ├── agent-identity.md
│   └── base-rules.md
├── tasks/
│   ├── code-review.md
│   ├── bug-fix.md
│   └── feature-impl.md
└── templates/
    ├── error-handling.md
    └── output-format.md
```

---

## 3️⃣ Own Your Context Window

### Principe
> Contrôlez exactement ce qui entre dans la fenêtre de contexte du LLM.

### Pourquoi
- Optimiser l'usage des tokens
- Garantir la pertinence
- Éviter les hallucinations

### Implémentation

```typescript
// Context Builder Pattern
class ContextBuilder {
  private sections: ContextSection[] = [];
  private maxTokens: number;

  constructor(maxTokens: number) {
    this.maxTokens = maxTokens;
  }

  addSection(name: string, content: string, priority: Priority): this {
    this.sections.push({ name, content, priority });
    return this;
  }

  build(): string {
    // Trier par priorité
    this.sections.sort((a, b) => b.priority - a.priority);
    
    let context = '';
    let currentTokens = 0;
    
    for (const section of this.sections) {
      const sectionTokens = this.countTokens(section.content);
      if (currentTokens + sectionTokens <= this.maxTokens) {
        context += `\n## ${section.name}\n${section.content}\n`;
        currentTokens += sectionTokens;
      }
    }
    
    return context;
  }
}

// Usage
const context = new ContextBuilder(8000)
  .addSection('Task', taskSpec, Priority.CRITICAL)
  .addSection('Current File', fileContent, Priority.HIGH)
  .addSection('Related Files', relatedContent, Priority.MEDIUM)
  .addSection('Project Docs', projectDocs, Priority.LOW)
  .build();
```

---

## 4️⃣ Tools Are Just Functions

### Principe
> Les outils de l'agent sont des fonctions typées ordinaires.

### Pourquoi
- Facile à tester unitairement
- Réutilisable
- Débuggable

### Implémentation

```typescript
// Définir les tools comme des fonctions simples
interface Tool<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

const readFileTool: Tool<{ path: string }, string> = {
  name: 'read_file',
  description: 'Read the contents of a file',
  inputSchema: z.object({ path: z.string() }),
  execute: async ({ path }) => {
    return await fs.readFile(path, 'utf-8');
  },
};

const searchCodeTool: Tool<{ query: string }, SearchResult[]> = {
  name: 'search_code',
  description: 'Search for code in the codebase',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    return await codeSearch.search(query);
  },
};

// Les tools peuvent être testés indépendamment
test('readFileTool reads file correctly', async () => {
  const content = await readFileTool.execute({ path: './test.txt' });
  expect(content).toBe('expected content');
});
```

---

## 5️⃣ Unify Execution State

### Principe
> Maintenir un état d'exécution unifié et sérialisable.

### Pourquoi
- Permet pause/resume
- Facilite le debugging
- Permet le recovery

### Implémentation

```typescript
interface AgentState {
  // Identité
  sessionId: string;
  taskId: string;
  
  // État
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  
  // Historique
  messages: Message[];
  toolCalls: ToolCall[];
  
  // Résultats
  outputs: Record<string, unknown>;
  errors: Error[];
  
  // Métadonnées
  startedAt: Date;
  updatedAt: Date;
  tokensUsed: number;
}

class AgentRunner {
  private state: AgentState;

  async checkpoint(): Promise<void> {
    // Sauvegarder l'état
    await this.storage.save(this.state.sessionId, this.state);
  }

  static async resume(sessionId: string): Promise<AgentRunner> {
    const state = await storage.load(sessionId);
    const runner = new AgentRunner();
    runner.state = state;
    runner.state.status = 'running';
    return runner;
  }
}
```

---

## 6️⃣ Launch/Pause/Resume with Simple APIs

### Principe
> Permettre le contrôle du cycle de vie de l'agent via des APIs simples.

### Implémentation

```typescript
class AgentController {
  // Lancer un agent
  async launch(task: Task): Promise<SessionId> {
    const session = await this.createSession(task);
    await this.runner.start(session);
    return session.id;
  }

  // Mettre en pause
  async pause(sessionId: string): Promise<void> {
    const runner = this.getRunner(sessionId);
    await runner.pause();
    await runner.checkpoint();
  }

  // Reprendre
  async resume(sessionId: string): Promise<void> {
    const runner = await AgentRunner.resume(sessionId);
    await runner.continue();
  }

  // Annuler
  async cancel(sessionId: string): Promise<void> {
    const runner = this.getRunner(sessionId);
    await runner.abort();
    await this.cleanup(sessionId);
  }
}

// API REST
app.post('/agents', (req, res) => controller.launch(req.body.task));
app.post('/agents/:id/pause', (req, res) => controller.pause(req.params.id));
app.post('/agents/:id/resume', (req, res) => controller.resume(req.params.id));
app.delete('/agents/:id', (req, res) => controller.cancel(req.params.id));
```

---

## 7️⃣ Contact Humans with Tool Calls

### Principe
> Utiliser les tool calls pour demander l'intervention humaine.

### Pourquoi
- Interface unifiée
- Traçable
- Pausable

### Implémentation

```typescript
const askHumanTool: Tool<AskHumanInput, string> = {
  name: 'ask_human',
  description: 'Ask a human for clarification or approval',
  inputSchema: z.object({
    question: z.string(),
    context: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high']),
  }),
  execute: async ({ question, context, urgency }) => {
    // Pause l'agent
    await agent.pause();
    
    // Notifier l'humain
    await notifications.send({
      type: 'human_input_required',
      question,
      context,
      urgency,
      sessionId: agent.sessionId,
    });
    
    // Attendre la réponse
    const response = await humanInputQueue.waitFor(agent.sessionId);
    
    // Reprendre
    await agent.resume();
    
    return response;
  },
};

// Usage par l'agent
const approval = await askHumanTool.execute({
  question: "Should I delete the deprecated files?",
  context: "Found 15 deprecated files that are no longer referenced.",
  urgency: 'medium',
});
```

---

## 8️⃣ Own Your Control Flow

### Principe
> Implémenter le contrôle de flux dans votre code, pas dans les prompts.

### Pourquoi
- Plus prévisible
- Plus testable
- Plus performant

### Implémentation

```typescript
// ❌ Mauvais: Control flow dans le prompt
const prompt = `
If the code has errors, fix them.
Then if there are tests, run them.
If tests fail, fix and re-run up to 3 times.
Then commit the changes.
`;

// ✅ Bon: Control flow dans le code
async function implementFeature(spec: Spec): Promise<Result> {
  // 1. Analyser la spec
  const analysis = await agent.analyze(spec);
  
  // 2. Implémenter
  const code = await agent.implement(analysis);
  
  // 3. Tester avec retry
  let testResult: TestResult;
  for (let attempt = 0; attempt < 3; attempt++) {
    testResult = await runner.runTests();
    
    if (testResult.passed) break;
    
    // Fix basé sur les erreurs
    await agent.fixErrors(testResult.errors);
  }
  
  if (!testResult.passed) {
    return { status: 'failed', errors: testResult.errors };
  }
  
  // 4. Commit
  await git.commit(spec.title);
  
  return { status: 'success' };
}
```

---

## 9️⃣ Compact Errors into Context

### Principe
> Transformer les erreurs en contexte utile pour l'agent.

### Implémentation

```typescript
interface CompactError {
  type: string;
  message: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  relevantCode?: string;
  suggestedFix?: string;
}

function compactError(error: Error, context: ExecutionContext): CompactError {
  if (error instanceof TypeScriptError) {
    return {
      type: 'TypeScript',
      message: error.message,
      location: {
        file: error.file,
        line: error.line,
        column: error.column,
      },
      relevantCode: getCodeAroundLine(error.file, error.line, 5),
      suggestedFix: getTypescriptSuggestion(error),
    };
  }
  
  if (error instanceof TestError) {
    return {
      type: 'Test Failure',
      message: error.message,
      location: {
        file: error.testFile,
        line: error.failedLine,
      },
      relevantCode: error.failedAssertion,
      suggestedFix: `Expected: ${error.expected}\nReceived: ${error.received}`,
    };
  }
  
  // Fallback générique
  return {
    type: 'Unknown',
    message: error.message,
  };
}

// Usage
try {
  await executeCode();
} catch (error) {
  const compactedError = compactError(error, context);
  
  // Ajouter au contexte de l'agent
  agent.addContext({
    section: 'Error',
    content: JSON.stringify(compactedError, null, 2),
    priority: Priority.CRITICAL,
  });
  
  // L'agent peut maintenant corriger
  await agent.fix(compactedError);
}
```

---

## 🔟 Small, Focused Agents

### Principe
> Préférer plusieurs petits agents spécialisés à un gros agent généraliste.

### Pourquoi
- Prompts plus précis
- Moins d'erreurs
- Plus facile à maintenir

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────────────────────────────────────────────┐     │
│   │                   ORCHESTRATOR                         │     │
│   │   • Route les tâches                                   │     │
│   │   • Coordonne les agents                               │     │
│   │   • Agrège les résultats                               │     │
│   └───────────────────────────┬───────────────────────────┘     │
│                               │                                  │
│         ┌─────────────────────┼─────────────────────┐           │
│         │                     │                     │           │
│         ▼                     ▼                     ▼           │
│   ┌───────────┐         ┌───────────┐         ┌───────────┐     │
│   │  ANALYZER │         │ IMPLEMENTER│        │  REVIEWER  │    │
│   │           │         │           │         │           │     │
│   │• Comprend │         │• Écrit    │         │• Vérifie  │     │
│   │  les specs│         │  le code  │         │  qualité  │     │
│   │• Planifie │         │• Tests    │         │• Security │     │
│   └───────────┘         └───────────┘         └───────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implémentation

```typescript
// Agent spécialisé pour l'analyse
class AnalyzerAgent {
  systemPrompt = "You are a code analyst. Your only job is to...";
  tools = [readFileTool, searchCodeTool];
}

// Agent spécialisé pour l'implémentation
class ImplementerAgent {
  systemPrompt = "You are a code implementer. Your only job is to...";
  tools = [editFileTool, createFileTool, runTestsTool];
}

// Agent spécialisé pour la review
class ReviewerAgent {
  systemPrompt = "You are a code reviewer. Your only job is to...";
  tools = [readFileTool, lintTool, securityScanTool];
}

// Orchestrateur
class Orchestrator {
  async processTask(task: Task): Promise<Result> {
    const analysis = await this.analyzer.analyze(task);
    const implementation = await this.implementer.implement(analysis);
    const review = await this.reviewer.review(implementation);
    
    if (review.approved) {
      return { status: 'success', implementation };
    } else {
      // Boucle de correction
      return this.processTask({
        ...task,
        feedback: review.issues,
      });
    }
  }
}
```

---

## 1️⃣1️⃣ Trigger from Anywhere

### Principe
> Permettre le déclenchement des agents depuis n'importe quelle source.

### Sources de Trigger

```typescript
// Depuis une API
app.post('/agents/trigger', async (req, res) => {
  const result = await orchestrator.processTask(req.body.task);
  res.json(result);
});

// Depuis un webhook Git
app.post('/webhooks/github', async (req, res) => {
  if (req.body.action === 'opened' && req.body.pull_request) {
    await orchestrator.reviewPR(req.body.pull_request);
  }
});

// Depuis un schedule
cron.schedule('0 * * * *', async () => {
  await orchestrator.runScheduledTasks();
});

// Depuis un message Slack
slackApp.message('review', async ({ message }) => {
  await orchestrator.reviewCode(message.text);
});

// Depuis la ligne de commande
if (require.main === module) {
  const task = parseArgs(process.argv);
  orchestrator.processTask(task);
}
```

---

## 1️⃣2️⃣ Make Agents Debuggable

### Principe
> Implémenter une observabilité complète pour le debugging.

### Composants

```typescript
// Logger structuré
const agentLogger = createLogger({
  agent: 'implementer',
  sessionId: session.id,
});

// Tracer les décisions
interface Decision {
  timestamp: Date;
  context: string;
  options: string[];
  choice: string;
  reasoning: string;
}

// Tracer les tool calls
interface ToolTrace {
  timestamp: Date;
  tool: string;
  input: unknown;
  output: unknown;
  duration: number;
  success: boolean;
}

// Replay capability
class AgentDebugger {
  async replay(sessionId: string, upToStep?: number): Promise<void> {
    const traces = await this.loadTraces(sessionId);
    
    for (const trace of traces) {
      if (upToStep && trace.step > upToStep) break;
      
      console.log(`Step ${trace.step}:`);
      console.log(`  Action: ${trace.action}`);
      console.log(`  Input: ${JSON.stringify(trace.input)}`);
      console.log(`  Output: ${JSON.stringify(trace.output)}`);
    }
  }

  async compareRuns(sessionId1: string, sessionId2: string): Promise<Diff> {
    const traces1 = await this.loadTraces(sessionId1);
    const traces2 = await this.loadTraces(sessionId2);
    return this.diffTraces(traces1, traces2);
  }
}
```

### Dashboard de Debug

```markdown
## Agent Debug Dashboard

### Session: abc123

#### Timeline
| Time | Action | Input | Output | Duration |
|------|--------|-------|--------|----------|
| 10:00:01 | read_file | main.ts | [500 chars] | 50ms |
| 10:00:02 | analyze | [code] | [analysis] | 1.2s |
| 10:00:04 | edit_file | [changes] | success | 100ms |

#### Decisions
- 10:00:02: Chose to refactor (vs rewrite) because existing tests cover functionality

#### Errors
- None

#### Token Usage
- Total: 4,532 tokens
- Input: 3,200 tokens
- Output: 1,332 tokens
```

---

## ✅ Checklist 12-Factor Agents

| Factor | Implémenté | Notes |
|--------|-----------|-------|
| 1. Structured Output | [ ] | |
| 2. Own Prompts | [ ] | |
| 3. Own Context Window | [ ] | |
| 4. Tools as Functions | [ ] | |
| 5. Unified State | [ ] | |
| 6. Launch/Pause/Resume | [ ] | |
| 7. Human Contact via Tools | [ ] | |
| 8. Own Control Flow | [ ] | |
| 9. Compact Errors | [ ] | |
| 10. Small Focused Agents | [ ] | |
| 11. Trigger Anywhere | [ ] | |
| 12. Debuggable | [ ] | |

---

🚀 **Rappel:** Ces 12 facteurs ne sont pas des règles absolues mais des principes directeurs. Adaptez-les à votre contexte spécifique.
