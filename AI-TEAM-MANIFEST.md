# OneShot AI Team Manifest

## Current Team Structure

### 🧠 Gemini 2.5 Pro - CTO/Architect
**Purpose**: High-level technical strategy and architecture decisions
**Responsibilities**:
- System architecture design
- Technology stack decisions
- Performance and scaling strategy
- Feasibility assessments

**Context Requirements**:
- Access to current tech stack
- Understanding of business requirements
- Knowledge of scaling needs

### 💻 Claude 4.0 - Senior Developer
**Purpose**: Implementation and code generation
**Responsibilities**:
- Feature implementation
- Bug fixes
- Code refactoring
- Technical documentation

**Context Requirements**:
- Full codebase access
- Environment specifications
- Previous implementation decisions
- Error logs and debugging info

### 📝 ChatGPT - Product Manager/Prompt Engineer
**Purpose**: Task planning and requirement definition
**Responsibilities**:
- Breaking features into atomic tasks
- Writing implementation prompts
- Managing task dependencies
- Maintaining project roadmap

**Context Requirements**:
- Feature requirements
- User stories
- Task completion status
- Technical constraints

## Current Addition: The Operator

### 🔧 AI Operator - DevOps & Infrastructure Specialist

**Mission**:
Ensure the development and deployment environment is:
- Portable
- Repeatable
- Cross-platform
- Self-recovering

**Responsibilities**:
- Create idempotent PowerShell startup scripts
- Replace brittle `&&` chains with environment-agnostic flows
- Manage `.env` validation and guardrails
- Build deploy pipelines (e.g., Render, Railway, Fly.io)
- Track system state and startup logic in Markdown
- Define environment versioning (dev, staging, prod)
- Environment setup automation
- Monitoring and alerting setup
- Performance optimization
- Security hardening

**Principles**:
- Everything is code
- Manual = risk
- Success = nothing breaks
- Scripts must work across Windows, Mac, and CI

**Context Requirements**:
- Platform specifications (OS, shell, etc.)
- Environment variables and secrets
- Deployment targets
- Performance metrics

**Inputs**:
- Environment constraints from Platform-Specs.md
- Architecture decisions from Gemini
- Prompts from ChatGPT

**Outputs**:
- Infra scripts in `infrastructure/`
- Environment documentation
- CI/CD workflows
- One-command startup scripts that work on any platform
- Health check endpoints
- Disaster recovery procedures

## Interaction Protocol

### 1. Feature Development Flow
```
Eric (defines feature) 
  → ChatGPT (creates tasks)
    → Gemini (reviews architecture)
      → Claude (implements)
        → Operator (ensures it runs)
          → Eric (verifies)
```

### 2. Bug Fix Flow
```
Eric (reports issue)
  → Claude (diagnoses)
    → Operator (checks infrastructure)
      → Claude (implements fix)
        → Eric (verifies)
```

### 3. Infrastructure Issue Flow
```
Eric (reports environment issue)
  → Operator (diagnoses)
    → Operator (implements fix)
      → Claude (updates code if needed)
        → Eric (verifies)
```

## Context Preservation Protocol

Each AI session MUST:
1. Start with role activation and context
2. Review recent changes/issues
3. Understand current environment state
4. Document decisions made
5. Create handoff notes for next session

## Anti-Patterns to Avoid

### ❌ DON'T:
- Assume bash/Unix when user is on Windows
- Create circular npm scripts
- Hardcode environment-specific paths
- Skip error handling
- Forget cross-platform compatibility

### ✅ DO:
- Ask about target platform first
- Use platform-agnostic approaches
- Document all assumptions
- Test commands before suggesting
- Provide fallback options

## Success Metrics

1. **Zero "It works on my machine" issues**
2. **One-command startup always works**
3. **New developers productive in < 30 minutes**
4. **Deployment takes < 5 minutes**
5. **No manual environment configuration**

## The Golden Rule

> "If Eric has to debug it, we've failed."

Every piece of infrastructure must be:
- Self-documenting
- Self-healing
- Self-explanatory
- Idiot-proof

## Next Steps

1. Implement the Operator role immediately
2. Create comprehensive environment setup automation
3. Document all infrastructure decisions
4. Build deployment pipeline
5. Establish monitoring/alerting

Remember: **Excellence in infrastructure enables excellence in development.** 