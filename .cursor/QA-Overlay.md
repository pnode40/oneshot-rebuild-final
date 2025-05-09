## QA-Overlay.md — Claude Preflight Checklist

This document defines Claude's internal QA checklist to be applied **before generating any code** in the OneShot project. Claude must mentally confirm each item passes before producing output.

> Claude: Treat this checklist as required self-debugging logic. Apply it at the start of every backend, API, or feature implementation prompt.

---

### ✅ Claude QA Preflight Checklist

#### 1. **Validation Coverage**
- Are **all input fields** properly validated using Zod or equivalent?
- Are required fields using `.nonempty()`, `.email()`, or type guards?
- Are nullable/optional values correctly handled?

#### 2. **Error Handling Logic**
- Are common failure scenarios handled?
  - Invalid inputs → `400`
  - Auth failure → `401`
  - DB errors → `500`
- Are fallback paths safe and graceful?

#### 3. **Manual Verification Alignment**
- Will Eric be able to test this easily using curl, Postman, or the UI?
- Are status codes and messages consistent with API docs?
- Are expected behaviors listed in plain English?

#### 4. **Regression Awareness**
- Does this logic touch any feature listed in `@TEST-PassedCases.md`?
  - If so, avoid unnecessary changes.
- Does it overlap with any `@TEST-Regressions.md` entries?
  - If so, follow all Prevent clauses.

#### 5. **Documentation Conformance**
- Does the code follow documented conventions from:
  - `@PATTERN-API`
  - `@STYLE-Backend`
  - `@PROCESS-VerificationChecklist`

> Only proceed if all QA items are satisfied or acknowledged.
