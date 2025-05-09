## SYSTEM-AI-BehaviorMap.md — OneShot Autonomous AI Workflow Map

This document provides a high-level map of automated and prompt-assisted AI behaviors that govern Claude, ChatGPT, and Gemini during OneShot development under the `OPS-MVP-ExecutionProtocol.md`.

> Use this map to understand what happens automatically and what must be triggered manually.

---

### 🎛️ Session Startup (`Ctrl+Shift+O`)
Triggers loading of:
- `@META-README-ForClaude`
- `@META-Doc-Index`
- `@QA-Overlay`
- `@QA-Overlay-UI`
- `@TEST-PassedCases`
- `@TEST-Regressions`
- `@PROCESS-Retrospective`
- `@PROMPT-Review-Checklist`
- `@DECISION-Log`
- `@OPS-MVP-ExecutionProtocol.md`

Claude confirms readiness and awaits Eric’s task.

---

### ⚙️ Task Execution (Manual + Prompt-Assisted)
| Step | Action | Prompt Required? |
|------|--------|------------------|
| 1 | Apply QA Overlay (BE/FE) | ✅ Prompt or Startup |
| 2 | Run prompt quality check (ChatGPT) | ✅ Prompt |
| 3 | Check `@TEST-*` memory | ✅ Prompt or Startup |
| 4 | Reference `@DECISION-Log` if relevant | ✅ Prompt |
| 5 | Generate code with verification steps | ✅ Always |
| 6 | Wait for manual confirmation | ✅ Yes |

---

### ✅ Post-Task Logging (`Ctrl+Shift+L`)
Claude will:
- Log task in `@LOG-DevSession-History.md`
- Run `@PROCESS-Retrospective.md`
- Ask if any docs or tests need updating

---

### 📅 Weekly Summary (`@EXPORT-Summary.md`)
Only triggered if prompted:
> “Claude, generate a weekly summary.”

---

### 🧯 Recovery (`@PROCESS-RecoveryProtocol.md`)
Triggered if:
- Protocols fail
- Known bug repeats
- Docs are clearly out of sync

Claude or ChatGPT will run recovery steps and re-sync the session.

---

This map documents your *manual-first, prompt-assisted AI system*. It ensures stability, clarity, and full control while using the Cursor Docs memory layer to enhance each interaction.
