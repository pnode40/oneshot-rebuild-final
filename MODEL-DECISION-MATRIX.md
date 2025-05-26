# Model Decision Matrix for OneShot

## When Claude Will Recommend Model Switches

### 🔄 Switch to Gemini When:

#### Architecture & Scale Questions
- "Will this scale to X users?"
- "Should we use Technology A vs B?"
- "How do we handle millions of records?"
- "What's the best cloud provider for this?"

**Claude will say:**
```
🔄 ARCHITECTURE DECISION DETECTED
Switch to Gemini for scaling expertise.
Use this prompt: [ready-to-copy prompt]
```

#### Performance Optimization
- "Why is the system slow?"
- "How do we optimize database queries?"
- "Should we add caching?"
- "Memory usage is too high"

**Claude will say:**
```
🔄 PERFORMANCE ANALYSIS NEEDED
Gemini excels at system optimization.
Use this prompt: [ready-to-copy prompt]
```

#### Technology Selection
- "Which message queue should we use?"
- "SQL vs NoSQL for this feature?"
- "Best video storage solution?"
- "Choosing between frameworks"

**Claude will say:**
```
🔄 TECH SELECTION DECISION
Get Gemini's perspective on options.
Use this prompt: [ready-to-copy prompt]
```

### 📝 Switch to GPT-4 When:

#### Documentation Needs
- "Write user documentation"
- "Create API documentation"
- "Explain this to non-technical users"
- "Create a tutorial"

**Claude will say:**
```
📝 DOCUMENTATION TASK DETECTED
GPT-4 excels at clear explanations.
Use this prompt: [ready-to-copy prompt]
```

### 🚀 Stay with Claude When:

#### All Implementation
- Writing code
- Debugging errors
- Setting up infrastructure
- Building features

#### Problem Solving
- "The server won't start"
- "Getting CORS errors"
- "Database connection failing"
- "How do I implement X?"

#### Planning & Management
- Breaking down features
- Sprint planning
- Task prioritization
- Code reviews

## Decision Flow Chart

```
User Question
    ↓
Is it about scale/architecture?
    YES → Recommend Gemini
    NO ↓
    
Is it about documentation?
    YES → Recommend GPT-4
    NO ↓
    
Is it about comparing technologies?
    YES → Recommend Gemini
    NO ↓
    
Is it implementation/debugging?
    YES → Stay with Claude
```

## Example Interactions

### Scenario 1: Scale Question
**You:** "We're getting 1000 video uploads daily. Will PostgreSQL handle this?"

**Claude:** 
```
🔄 SCALE ANALYSIS NEEDED
━━━━━━━━━━━━━━━━━━━━━━
This requires architecture expertise.
Switch to: Gemini 1.5 Pro

Copy this prompt:
@gemini-1.5-pro
OneShot platform context:
- 1000 daily video uploads (10-50MB each)
- Currently using PostgreSQL for metadata
- Local file storage for videos
- 5000 target users

Question: Will PostgreSQL handle this scale? 
What are the bottlenecks and solutions?
```

### Scenario 2: Implementation
**You:** "Add video upload progress bar"

**Claude:** 
```
[DEVELOPER] I'll implement this directly.
No model switch needed.

[Creates progress bar implementation]
```

### Scenario 3: Documentation
**You:** "Create a guide for athletes on uploading videos"

**Claude:**
```
📝 USER DOCUMENTATION NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━
GPT-4 excels at user-friendly guides.
Switch to: GPT-4

Copy this prompt:
@gpt-4
Create a user guide for OneShot athletes:
- How to upload highlight videos
- Video requirements (format, size, length)
- Tips for best quality
- Troubleshooting common issues

Tone: Friendly, encouraging, simple
Reading level: High school
Include: Screenshots placeholders
```

## Quick Reference

| Your Question Contains | Recommended Model | Why |
|------------------------|-------------------|-----|
| "scale", "million", "growth" | Gemini | Architecture expertise |
| "slow", "optimize", "performance" | Gemini | System optimization |
| "vs", "compare", "choose" | Gemini | Technology evaluation |
| "document", "guide", "explain" | GPT-4 | Clear writing |
| "implement", "build", "fix" | Claude | Implementation |
| "error", "bug", "broken" | Claude | Debugging |
| "plan", "organize", "prioritize" | Claude | Project management |

## The Smart Workflow

1. **Start with Claude** (always)
2. **Claude detects need** for specialized expertise
3. **Claude provides** ready-to-copy prompt
4. **You switch models** with one click
5. **Get answer** from specialist model
6. **Return to Claude** for implementation

This way, you get the best of all models with minimal friction. 