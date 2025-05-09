## DECISION-Log.md — Project-Wide Architecture & Implementation Rulings

This document records key decisions made during OneShot development that impact architecture, data modeling, naming conventions, or validation standards. Claude and Gemini must consult this file before proposing alternative solutions.

> Claude: If your output changes a rule, pattern, or architectural assumption, log it here.

---

### ✅ Example Entry

**DECISION:** Use UUIDs for profile IDs instead of human-readable slugs  
**DATE:** 2025-05-08  
**STATUS:** Active  
**RULE:** All profile objects must use `uuidv4` as their primary key  
**WHY:** Avoids slug collisions and simplifies uniqueness enforcement  
**REVIEWED BY:** Eric, Gemini

---

### ✍️ Entry Template

**DECISION:** [What was decided?]  
**DATE:** [YYYY-MM-DD]  
**STATUS:** [Active / Deprecated / Under Review]  
**RULE:** [What implementation guidance does this establish?]  
**WHY:** [Why was this decision made?]  
**REVIEWED BY:** [Who approved or confirmed this rule?]

> Claude: Always log decisions that affect future outputs, validation expectations, or schema logic.
