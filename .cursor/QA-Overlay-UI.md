## QA-Overlay-UI.md — Claude UI Component Preflight Checklist

---
description: "UI component standards for React + Tailwind in the OneShot frontend"
globs: ["src/components/**", "src/features/**/*.tsx"]
alwaysApply: false
version: "1.0"
owner: "OneShot Team"
---
## Claude Instruction

Before generating any React component code, Claude must:

- Review `@QA-Overlay-UI.md` in full
- Confirm that:
  - Responsive design is respected
  - Testability is included (e.g., `data-testid`, usable props)
  - Accessibility has been considered
- Explain how the above criteria are being met before starting implementation

This document defines Claude's internal self-checklist before generating any **frontend code** in the OneShot system, especially React + Tailwind UI components. Claude must apply this checklist automatically during any session where UI generation is required.

---

### ✅ Claude UI QA Preflight Checklist

#### 1. **Responsiveness**
- Are Tailwind utility classes used correctly for mobile-first layout?
- Does the component render cleanly on small and large viewports?
- Are breakpoint modifiers applied (e.g., `sm:`, `md:`, `lg:`)?

#### 2. **Accessibility (a11y)**
- Are `aria-*` labels, roles, or alt tags present where needed?
- Are buttons, inputs, and links keyboard navigable?
- Is semantic HTML used appropriately (`<label>`, `<button>`, etc.)?

#### 3. **Validation Logic**
- Are form inputs wired to validation logic (Zod, state checks, etc.)?
- Are user errors shown clearly with visual and screenreader feedback?
- Are edge cases handled (e.g., empty fields, invalid URLs)?

#### 4. **Component Structure**
- Is the component reusable and atomic (no hardcoded logic)?
- Are `props` typed clearly and explained?
- Are state and side effects managed correctly (e.g., useEffect, useState)?

#### 5. **Testability**
- Can this component be tested manually with test data?
- Are interactive behaviors testable via devtools or the DOM?

#### 6. **Consistency & Docs**
- Does the styling conform to `@STYLE-Frontend`?
- Does this follow any patterns defined in `@PATTERN-Components`?

> Claude: Only proceed with UI code generation after satisfying this checklist or flagging any known gaps.
