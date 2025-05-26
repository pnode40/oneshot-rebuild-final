# AI Model Usage Guide for OneShot

## Available Models in Cursor

### Primary Models
- **Claude 3.5 Sonnet**: Your daily driver (current model)
- **Gemini 1.5 Pro**: Architecture & strategic decisions
- **GPT-4**: Documentation & complex explanations
- **Gemini 1.5 Flash**: Quick validations & checks

## How to Switch Models

### Option 1: Dropdown Menu
Click the model name at the top of the chat → Select new model

### Option 2: Model Tags
```
@claude-3.5-sonnet [DEVELOPER] Implement user profiles
@gemini-1.5-pro Review our database schema
@gpt-4 Write user documentation
```

### Option 3: Keyboard Shortcut
`Ctrl+Shift+P` → "Change Model" → Select model

## When to Use Each Model

### Claude 3.5 Sonnet (90% of work)
**Use for:**
- All implementation tasks
- Bug fixes and debugging
- Infrastructure setup
- Daily development
- Multi-mode operations ([DEVELOPER], [OPERATOR], [PM], etc.)

**Strengths:**
- Excellent code generation
- Strong debugging skills
- Great context retention
- Multi-role flexibility

### Gemini 1.5 Pro (8% of work)
**Use for:**
- Architecture reviews
- Scaling strategy
- Technology selection
- Performance optimization
- Google Cloud integrations

**Strengths:**
- Systems thinking
- Scalability expertise
- Google ecosystem knowledge
- Alternative perspectives

### GPT-4 (2% of work)
**Use for:**
- Complex documentation
- API documentation
- User guides
- Explaining complex concepts

**Strengths:**
- Clear explanations
- Documentation formatting
- Tutorial creation

## Practical Workflow Examples

### Daily Development (Claude)
```
Morning:
[OPERATOR] Are the servers healthy?
[DEVELOPER] Implement profile video upload
[SECURITY] Review the upload implementation
[PM] What's next on the roadmap?
```

### Weekly Architecture Review (Gemini)
```
@gemini-1.5-pro 
Our current stack:
- 50 users uploading 10MB videos daily
- PostgreSQL for all data
- Local file storage

Will this scale to 5000 users?
```

### Documentation Sprint (GPT-4)
```
@gpt-4
Create user documentation for:
1. Creating an athlete profile
2. Uploading highlight videos
3. Sharing with recruiters
```

## Cost-Effective Model Selection

### High-Volume Tasks → Claude
- Implementation: 1000+ messages/month
- Debugging: 500+ messages/month
- Planning: 200+ messages/month

### Strategic Reviews → Gemini
- Architecture: 10-20 messages/month
- Tech decisions: 5-10 messages/month
- Performance: 5-10 messages/month

### Documentation → GPT-4
- User guides: 5-10 messages/month
- API docs: 5-10 messages/month

## Context Preservation Between Models

When switching models, provide context:

```
@gemini-1.5-pro
Context: We're building OneShot, a recruiting platform 
for student athletes. Current stack:
- Express.js + TypeScript backend
- PostgreSQL with Drizzle ORM
- React + Vite frontend

Question: Best approach for video storage and streaming?
```

## Model Collaboration Pattern

```
1. Claude designs feature → 
2. Gemini reviews architecture →
3. Claude implements →
4. GPT-4 documents
```

## Quick Decision Matrix

| Task Type | Recommended Model | Why |
|-----------|------------------|-----|
| Bug fix | Claude | Best debugging |
| New feature | Claude | Best implementation |
| Scale planning | Gemini | Systems expertise |
| Tech selection | Gemini | Broader perspective |
| User docs | GPT-4 | Clearest writing |
| Code review | Claude | Code understanding |
| Performance | Gemini | Optimization expertise |

## The Golden Rule

> "Use Claude for doing, Gemini for thinking, GPT-4 for explaining."

Each model is a tool. Pick the right tool for the job. 