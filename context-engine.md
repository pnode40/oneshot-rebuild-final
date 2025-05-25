# 🧱 OneShot Context Engine

**Institutional Memory Core for AI Development System**
*Version 1.0 - May 23, 2025*

---

## 🎯 Purpose

The Context Engine serves as the **persistent memory layer** shared across AI agent sessions, maintaining architectural decisions, development patterns, and institutional knowledge to ensure continuity and learning in the OneShot AI Development System.

---

## 🏗️ Architecture

### Memory Storage Structure

```yaml
context-engine/
├── session-logs/           # Daily development sessions
│   ├── 2025-05-23.md      # Today's session
│   └── YYYY-MM-DD.md      # Historical sessions
├── decisions/             # Architecture decisions
│   ├── database-choice.md
│   ├── auth-strategy.md
│   └── deployment-stack.md
├── patterns/              # Reusable code patterns
│   ├── drizzle-queries.md
│   ├── express-routes.md
│   └── test-patterns.md
├── knowledge/             # Institutional knowledge
│   ├── bug-fixes.md
│   ├── performance-tips.md
│   └── security-guidelines.md
└── state/                 # Current system state
    ├── features.json
    ├── dependencies.json
    └── metrics.json
```

### Confidence Scoring System

Each memory entry includes confidence scores:

```typescript
interface MemoryEntry {
  id: string;
  content: string;
  confidence: 0.1 | 0.5 | 0.8 | 0.9 | 1.0;
  source: 'claude' | 'gemini' | 'gpt4o' | 'eric';
  approved: boolean;
  timestamp: Date;
  tags: string[];
  relations: string[];
}
```

**Confidence Levels:**
- `1.0` - Eric approved, production-verified
- `0.9` - High confidence, tested in staging
- `0.8` - Code reviewed, unit tested
- `0.5` - Implemented but unverified
- `0.1` - Experimental or draft

---

## 🤖 AI Agent Integration

### Claude 4.0 (Autonomous Development Lead)
- **Writes**: Implementation decisions, code patterns, bug fixes
- **Reads**: All approved patterns, previous solutions
- **Confidence**: Creates entries at 0.5-0.8 based on testing

### GPT-4o (System Orchestration Lead)
- **Writes**: Workflow patterns, coordination strategies
- **Reads**: Session logs, current system state
- **Confidence**: Creates entries at 0.8 based on successful coordination

### Gemini (Systems Architect)
- **Writes**: Architecture decisions, scalability patterns
- **Reads**: All high-confidence entries, system metrics
- **Confidence**: Creates entries at 0.9 based on architectural analysis

### Eric (Product Vision & Approval Lead)
- **Writes**: Product decisions, final approvals
- **Reads**: All entries requiring approval
- **Confidence**: Elevates entries to 1.0 upon approval

---

## 📊 Current System State

### ✅ Implemented Features

```json
{
  "authentication": {
    "status": "implemented",
    "confidence": 0.8,
    "components": ["registration", "login", "jwt", "roles"],
    "coverage": "90%"
  },
  "database": {
    "status": "operational",
    "confidence": 0.9,
    "provider": "neon-postgresql",
    "orm": "drizzle",
    "migrations": "functional"
  },
  "testing": {
    "status": "framework-ready",
    "confidence": 0.8,
    "framework": "jest-supertest",
    "coverage": "70%",
    "ci_cd": "github-actions"
  },
  "deployment": {
    "status": "ready",
    "confidence": 0.7,
    "backend": "railway",
    "frontend": "vercel",
    "monitoring": "sentry"
  }
}
```

### 🔧 Development Patterns

**Database Queries (Confidence: 0.9)**
```typescript
// Approved pattern for user lookups
const user = await db.query.users.findFirst({
  where: eq(users.email, email)
});
```

**Route Structure (Confidence: 0.8)**
```typescript
// Approved pattern for protected routes
router.post('/endpoint', 
  authenticateToken, 
  validateRequest(schema), 
  async (req, res) => {
    // Implementation
  }
);
```

**Test Structure (Confidence: 0.8)**
```typescript
// Approved pattern for API tests
describe('Feature Tests', () => {
  beforeEach(async () => {
    await setupTestData();
  });
  
  it('should handle valid input', async () => {
    // Test implementation
  });
});
```

---

## 🎖️ Quality Gates

### Memory Entry Approval Workflow

1. **AI Agent Creates Entry** (Confidence: 0.1-0.8)
2. **Automated Validation** (Syntax, consistency checks)
3. **Integration Testing** (If code-related)
4. **Eric Review** (For high-impact decisions)
5. **Approval & Storage** (Confidence: 1.0)

### Retention Policy

- **High Confidence (0.8+)**: Permanent retention
- **Medium Confidence (0.5-0.7)**: 90-day retention
- **Low Confidence (0.1-0.4)**: 30-day retention
- **Eric Approved (1.0)**: Permanent + backup

---

## 🔄 Session Integration

### Session Start Protocol
1. Load relevant high-confidence patterns
2. Review recent decisions and changes
3. Check for blocking issues or conflicts
4. Initialize context with current system state

### Session End Protocol
1. Capture key decisions made
2. Update confidence scores based on outcomes
3. Log new patterns discovered
4. Update system state metrics

---

## 🚨 Emergency Recovery

### Context Loss Scenarios
- **Partial Loss**: Rebuild from Git history + Eric knowledge
- **Complete Loss**: Bootstrap from Launch Stack + manual review
- **Corruption**: Restore from daily backups + validation

### Backup Strategy
- **Daily**: Full context export to Git
- **Weekly**: Compressed archive to cloud storage
- **Monthly**: Eric-reviewed snapshot for critical decisions

---

## 📈 Success Metrics

- **Memory Utilization**: >80% of patterns reused across sessions
- **Decision Continuity**: <5% decisions require re-evaluation
- **Agent Efficiency**: >90% reduction in context-gathering time
- **Eric Satisfaction**: Approved decisions remain stable >30 days

---

**Next Evolution**: Implement confidence-based pattern suggestions and automated knowledge graph relationships. 