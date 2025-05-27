## OPS-MVP-ExecutionProtocol.md — OneShot Development System (Simplified Manual Mode)

This document defines the **prompt-assisted**, stable execution protocol for Claude and ChatGPT during OneShot MVP development. It replaces full automation with a predictable, reliable manual trigger system.

> Claude + ChatGPT: Follow this simplified protocol unless explicitly instructed otherwise. Defer doc updates and system logic checks until prompted.

> 🔗 This is now the **official operating procedure** for OneShot development. Link this doc from `@README-for-AI.md` to ensure Claude bootstraps the correct protocol.

---

### 🎯 Goal
Ensure predictable progress on the MVP by minimizing complex automation and maximizing stability, clarity, and human-controlled checkpoints.

---

### 🔁 Session Startup (Use `Ctrl+Shift+O`)
1. Load:
   - `@META-README-ForClaude`
   - `@META-Doc-Index`
   - `@QA-Overlay`
   - `@QA-Overlay-UI`
   - `@TEST-Regressions`
   - `@TEST-PassedCases`
   - `@PROCESS-Retrospective`
   - `@PROMPT-Review-Checklist`
   - `@DECISION-Log`
   - `@OPS-MVP-ExecutionProtocol.md` ← This doc
2. Claude: Confirm context is loaded and ask Eric for the next task.

---

### 🔨 Task Execution Protocol
1. Eric defines an atomic task (e.g. create an endpoint, fix a bug, update a component)
2. ChatGPT creates a prompt scoped to that task and includes:
   - Expected outcome
   - Linked @Docs
   - QA checklist reference ("Claude, apply QA overlay")
3. Claude:
   - Applies backend/UI QA overlay as applicable
   - References test memory if task touches a known area
   - Includes verification steps for Eric
   - Awaits manual confirmation

---

### ✅ Manual Verification & Logging
1. Eric manually tests the result
2. If approved, run: `Ctrl+Shift+L`
3. Claude appends:
   - Entry to `@LOG-DevSession-History`
   - Retrospective to `@PROCESS-Retrospective`
4. Optionally prompt:
   > “Claude, do we need to update any `@Docs`, `@TEST-*`, or `@DECISION-Log`?”

---

### 📅 Optional Weekly Wrap-Up
1. When needed, prompt:
   > “Claude, generate a weekly summary from `@EXPORT-Summary.md`.”
2. Copy/paste to Notion, GitHub, or Slack if desired

---

### 🛠 Recovery Protocol
If behavior seems off:
- Reference `@PROCESS-RecoveryProtocol.md`
- Ask ChatGPT:
  > “Did Claude follow all protocols this session?”
- Reboot session using `Ctrl+Shift+O`

---

## 🔐 Server Architecture Recovery Protocol (Post-May 2025)

Claude must reference these documents before performing any structural edits, refactors, or environment config changes within `server/src/**`:

- `Server-Restore-Checkpoint.md`
- `Server-Restore-Analysis.md`

These documents are located in `.cursor/docs/`.

They include:
- A detailed audit of the failed centralized configuration system
- A rollback decision and endorsed replacement plan
- A validation checklist for testing the new simplified architecture

Claude and Gemini must both load and acknowledge these files prior to modifying any backend architecture logic.

---

This protocol is optimized for **clarity, testability, and reliability**. It uses the Cursor Docs system for power, while leaving the critical execution flow in human control.

> Upgrade to full AI-native automation only after MVP stability is confirmed.
