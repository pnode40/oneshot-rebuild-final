---
description: "Mandatory documentation requirements for all development work to prevent context loss"
alwaysApply: true
version: "1.0"
owner: "OneShot Team"
---

# Mandatory Documentation Protocol

## Purpose
This rule ensures all development work is properly documented to prevent context loss between sessions and maintain project continuity.

## Required Documentation

### **EVERY SESSION MUST:**

1. **Update DECISION-Log.md** for any strategic or architectural decisions
2. **Update LESSONS.md** for insights, improvements, or process learnings  
3. **Create/Update FEATURE-[Name].md** for any feature implementation
4. **Update relevant existing docs** when modifying systems

### **BEFORE ENDING ANY SESSION:**

Claude must complete this checklist:

- [ ] **Strategic Decisions:** Any architecture, UX, or business logic decisions logged in DECISION-Log.md
- [ ] **Feature Work:** Any new components, services, or significant code changes documented in FEATURE-[Name].md
- [ ] **Process Insights:** Any learnings about what worked/didn't work added to LESSONS.md
- [ ] **Cost Optimization:** Any task delegation decisions recorded per SOP-CostOptimization.md
- [ ] **Blocking Issues:** Any unresolved problems clearly documented with reproduction steps

### **DOCUMENTATION TEMPLATES:**

#### **Decision Entry:**
```markdown
### ✅ [Decision Title]
**DECISION:** [What was decided?]  
**DATE:** 2025-MM-DD  
**STATUS:** Active  
**RULE:** [Implementation guidance]  
**WHY:** [Reasoning]  
**REVIEWED BY:** Eric
```

#### **Feature Documentation:**
```markdown
# FEATURE-[Name].md — [Brief Description]

## Status
- **Implementation:** [Complete/In Progress/Blocked]
- **Priority:** [High/Medium/Low]
- **Strategic Impact:** [Why this matters]

## Components
- **Files:** [List of key files]
- **Features:** [Key capabilities]

## Current Issues
- [Any blocking problems]

## Next Steps  
- [What needs to happen next]
```

#### **Lesson Entry:**
```markdown
## Lesson: [Title]
**Date:** 2025-MM-DD  
**Category:** [Code/Architecture/Process/Documentation]  
**Issue:** [What problem was encountered]  
**Solution:** [How it was resolved]  
**Pattern to Follow:** [Best practice established]  
**Impact:** [How this improves the project]
```

## Enforcement

### **Session Startup:**
- Read existing documentation to understand current state
- Provide session briefing with previous accomplishments and current status

### **During Work:**
- Document decisions as they're made, not at the end
- Update feature docs when implementing changes

### **Session End:**
- Complete documentation checklist
- Verify all work is captured for future sessions

## Quality Standards

### **Documentation Must Be:**
- **Specific:** Include exact file names, decisions, and reasoning
- **Actionable:** Provide clear next steps and implementation guidance  
- **Contextual:** Explain why decisions were made and their strategic impact
- **Current:** Reflect actual implemented state, not planned state

### **Documentation Must NOT Be:**
- **Generic:** Avoid vague descriptions that could apply to any project
- **Incomplete:** Don't document only parts of a feature or decision
- **Outdated:** Keep documentation synchronized with actual code

## Success Metrics
- **Context Continuity:** New sessions start immediately without re-explanation
- **Decision Traceability:** All strategic choices have clear reasoning documented
- **Implementation Accuracy:** Documentation matches actual codebase state
- **Velocity Maintenance:** Documentation doesn't slow development but prevents rework

---

**Violation of this rule constitutes a critical process failure that undermines the entire AI development workflow.** 