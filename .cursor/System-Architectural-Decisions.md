# 🧠 System Architectural Decisions — OneShot Server (Phase 1)

This document captures the key architectural decisions made during the backend server restoration and stabilization effort (May 2025). It supports traceability, context, and rationale for the new baseline implementation.

---

## ✅ Summary of Key Decisions

| Area                        | Decision                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| Server Structure            | Follow "New Server Plan": Linear index.ts, no global config, per-module dotenv |
| Module Resolution           | Use only relative import paths (no path aliases)                         |
| Environment Variable Loading| Centralize dotenv.config() in index.ts; remove from client.ts            |
| Drizzle ORM Setup           | Standard Drizzle schema + generate/migrate scripts; deprecated custom flows |
| Migrations                  | Rebuild from scratch; commit only aligned, verified migrations           |
| Verification                | Use console-based runtime checks (env var + DB query) as manual verification |
| Directory Cleanup           | Remove legacy test scripts, migrations, and nested configs               |

---

## 📌 Permanent Changes

- **.env loading** is now centralized and must only occur at the top of `server/src/index.ts`.
- The project no longer supports global path aliases. All files must use relative paths like `../utils/log.ts`.
- `server/uploads/` is ignored via `.gitignore` and must never be committed.
- `server/public/upload-test.html` is included for smoke testing only.

---

## 🛠️ Future Considerations

| Topic                  | Recommendation                                              |
|------------------------|--------------------------------------------------------------|
| Drizzle Kit CLI        | Migrate all custom scripts (migrate.ts, validate-migrations) to standard Drizzle CLI usage |
| Auth Strategy          | Ensure Passport.js strategy config is modular and loaded after dotenv |
| Error Handling         | Consider elevating error utils to a reusable `server/src/utils/` pattern |
| CI/CD Integration      | Add .env schema validation during build step (Zod-based)    |
| Config Consistency     | All config files should follow `server/` as canonical location |

---

## 🔍 Verified by

- Eric Patnoudes (Product Owner)
- ChatGPT (Prompt Engineer & Tactical Planner)
- Claude 3.7 (Developer)
- Gemini 2.5 Pro (Architecture Validator)
