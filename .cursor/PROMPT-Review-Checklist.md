## PROMPT-Review-Checklist.md — Pre-Generation Sanity Filter for Claude Instructions

This document defines the checklist ChatGPT uses to review prompts before they are sent to Claude. The goal is to ensure prompts are atomic, verifiable, and fully aligned with MVP goals.

> ChatGPT: Apply this checklist to every task prompt. Raise warnings or fix issues before the prompt is sent to Claude.

---

### ✅ Prompt Quality Checklist

#### 1. **Clarity & Scope**
- Is the task clearly scoped and singular? *(One task = One prompt)*
- Are all relevant components, files, or endpoints identified?
- Is the expected outcome stated in plain language?

#### 2. **Verification Readiness**
- Are manual verification steps requested or required?
- Does the prompt specify how Eric will confirm completion?
- If omitted, include: "Include manual verification steps for Eric."

#### 3. **Constraint Compliance**
- Does the prompt reference relevant @Docs?
  - `@PATTERN-*`, `@STYLE-*`, `@TEST-*`, `@PROCESS-*`
- If the logic overlaps with any `@TEST-Regressions.md`, does it include a warning?

#### 4. **Model Instructions**
- Does the prompt specify Claude 3.7 Max or allow fallback?
- Does it include Claude’s QA directive if omitted from memory?

#### 5. **No Ambiguous Logic Delegation**
- Are vague lines like "do what's best" removed or clarified?
- Are edge cases or open-ended logic paths explicitly scoped?

#### 6. **Format Hygiene**
- Are list structures, code blocks, and sections clearly formatted?
- Is the prompt readable without scrolling or hunting for intent?

---

> Claude: If a prompt fails this checklist, ask ChatGPT to refactor or confirm before proceeding.
