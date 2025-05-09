## PROCESS-RecoveryProtocol.md — OneShot AI System Self-Diagnosis & Repair

This file defines the troubleshooting and self-repair procedures to follow if you suspect any AI system behaviors (QA, test memory, retros, summaries, etc.) are not functioning as expected.

> Eric: You don’t need to remember these steps. If anything feels off, just reference this doc and follow the checklist.

> Claude: If you detect a lapse in protocol, run this recovery checklist automatically and alert Eric.

---

### ⚠️ When to Use This
- Claude skips manual verification steps
- A known bug reappears (regression)
- Docs are not updated after a task
- Weekly summary or retrospective is missing
- Session history is incomplete

---

### 🛠 Recovery Checklist

#### 1. Ask ChatGPT:
> "Was Claude’s QA overlay, retrospective, and memory system followed in this session?"

ChatGPT will evaluate the prompt structure and Claude’s response.

#### 2. Claude: Run Self-Diagnostic Prompt
> “Claude, review the last task. Did you:
> - Apply your QA overlay?
> - Reference `@TEST-*` docs?
> - Log changes to session or decision files?”

If not, rerun the task with corrections.

#### 3. Verify Critical Docs Are Loaded
Make sure these are referenced in your session:
- `@QA-Overlay.md`
- `@QA-Overlay-UI.md`
- `@TEST-PassedCases.md`
- `@TEST-Regressions.md`
- `@DECISION-Log.md`
- `@PROCESS-Retrospective.md`
- `@EXPORT-Summary.md`

#### 4. Run Claude’s Retrospective Prompt Manually
> “Claude, please generate a full retrospective for the last task using `@PROCESS-Retrospective.md`. Include test memory, doc updates, and system impact.”

#### 5. Check `@LOG-DevSession-History.md`
Is the task logged? Are test cases, bugs, or summaries recorded?

#### 6. Reboot Session with Clean Startup
Trigger `Ctrl+Shift+O` to preload full behavior and reinitiate with:
> “Claude, resume from last verified state. Re-apply all behavioral protocols.”

---

### 🧠 Last Resort (Manual Reset)
- Re-open all `@Docs` manually
- Copy/paste a known-good task + verification prompt from history
- Confirm Claude is back in sync with:
> “Claude, confirm all protocol layers are reloaded. Are you operating in full compliance?”

---

This document ensures you never have to troubleshoot from scratch again. Claude and ChatGPT will self-audit against this if any failure is suspected.
