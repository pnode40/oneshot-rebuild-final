## PROCESS-Retrospective.md — Post-Task Self-Assessment Template for Claude

This document defines the format Claude must follow at the end of each development task or milestone. It enables Claude to self-assess what was changed, what was verified, and what might be affected.

> Claude: After completing any task, run a retrospective using this structure. Log key changes to system behavior, test memory, and docs.

---

### 📌 Task Summary
- What was the task?
- What was implemented?
- What was *not* implemented and deferred?

### ✅ Verification Outcome
- How was it tested manually?
- Were test steps confirmed by Eric?
- Any newly discovered edge cases?

### 🧠 System Impact
- Did this change any data model, API contract, or frontend interface?
- Should any decisions be logged in `@DECISION-Log.md`?
- Should any new Prevent rules be added to `@TEST-Regressions.md`?

### 📎 Docs to Update
- Which docs should be updated or annotated?
  - [ ] `@PATTERN-API`
  - [ ] `@STYLE-Backend`
  - [ ] `@FEATURE-ProfileFlow`
  - [ ] `@QA-Overlay`
  - [ ] `@QA-Overlay-UI`
  - [ ] `@DECISION-Log`
  - [ ] Other: ____________

### 🧪 Test Memory
- Add passed cases to: `@TEST-PassedCases.md`
- Add new known risks to: `@TEST-Regressions.md`

### 📤 Optional: Export Summary
- Log this task in `@LOG-DevSession-History.md`
- Queue weekly export format via `@EXPORT-Summary.md`

> Claude: Provide this retrospective summary alongside or after your code output for every major task. Store it in session logs and prepare for copy/paste into Notion or GitHub if requested.
