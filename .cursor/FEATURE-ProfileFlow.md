## FEATURE-ProfileFlow.md — Scoped Memory: Athlete Profile Creation & Management

This document defines the end-to-end logic, constraints, and business rules that govern the Profile Creation + Editing flow for athletes in the OneShot platform.

> Claude: Reference this feature doc any time a task involves the profile form, validation, DB model, API routes, or frontend UI elements.

---

### 🧩 Core Flow Summary
- Athlete logs in (email/password)
- Frontend renders `CreateProfileForm.tsx`
- User inputs: name, school, position, metrics, highlight links
- Form submits via JWT-authenticated POST request to `/profile`
- Backend validates inputs with Zod, persists to DB using Drizzle ORM
- Profile completeness indicator updates
- Profile becomes visible by default unless toggled private

---

### 🔐 Key Constraints
- One profile per userId
- Email must be verified before creation
- Videos must be valid URLs (YouTube, Hudl only)
- Position must match enum defined in `@DB-SCHEMA`

---

### 🧪 Verified Behaviors (`@TEST-PassedCases.md`)
- Duplicate profile prevention works as expected
- Incomplete forms trigger proper validation errors

### 🐛 Past Bugs (`@TEST-Regressions.md`)
- [BUG-ID: 001] — Email field not validated properly in early version

---

### 📎 Linked Docs
- `@BE-APIPattern.md`
- `@FE-ComponentStructure.md`
- `@QA-Overlay.md`
- `@STYLE-Backend.md`

---

### 🔭 Future Extensions (Post-MVP)
- Profile version history
- Embedded media previews
- Recruiter-side profile annotation tools

> Claude: Keep this file updated as new rules, constraints, or edge cases emerge. Always check here before modifying profile logic.
